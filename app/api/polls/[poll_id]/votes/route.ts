import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import z from "zod";
import { env } from "@/env";
import { emit_poll_new_comment, emit_poll_updated } from "@/lib/realtime";
import type { PollResponse, VotePayload } from "@/types";
import { MAX_TEXT_RESPONSE_LENGTH } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";
import { get_poll, is_poll_ended } from "@/utils/poll";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route<VotePayload, { poll_id: string }>(
  async ({ body, params, supabase }) => {
    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id,type,status,end_at,reaction_emojis,options(id)")
      .eq("id", params.poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (poll.status !== "live")
      throw WavePollError.BadRequest("Only live polls can receive votes.");

    if (is_poll_ended(poll))
      throw WavePollError.BadRequest("This poll has already ended.");

    if (poll.type === "single") {
      if (!("option_id" in body))
        throw WavePollError.UnprocessableEntity("Option is required.");

      const option_ids = (poll.options ?? []).map((option) => option.id);

      if (!option_ids.includes(body.option_id))
        throw WavePollError.UnprocessableEntity(
          "Selected option does not belong to this poll."
        );
    }

    if (poll.type === "rating" && !("rating" in body))
      throw WavePollError.UnprocessableEntity("Rating is required.");

    if (poll.type === "text" && !("comment" in body))
      throw WavePollError.UnprocessableEntity("Comment is required.");

    if (body.reaction) {
      if (!Array.isArray(poll.reaction_emojis))
        throw WavePollError.UnprocessableEntity(
          "Reactions are not enabled for this poll."
        );

      if (!poll.reaction_emojis.includes(body.reaction))
        throw WavePollError.UnprocessableEntity("Invalid reaction emoji.");
    }

    const voter_key = await get_voter_key();

    const { data: vote, error: vote_error } = await supabase
      .from("votes")
      .insert({
        id: nanoid.id(),
        poll_id: poll.id,
        voter_key,
        option_id: "option_id" in body ? body.option_id : null,
        rating: "rating" in body ? body.rating : null,
        comment: "comment" in body ? body.comment : null
      })
      .select("id,option_id,rating,comment,created_at")
      .single<PollResponse>();

    if (vote_error) {
      if (is_unique_violation(vote_error))
        throw WavePollError.Conflict("You have already voted on this poll.");

      throw vote_error;
    }

    if (body.reaction) {
      const { error: reaction_error } = await supabase
        .from("reactions")
        .insert({
          id: nanoid.id(),
          poll_id: poll.id,
          voter_key,
          emoji: body.reaction
        });

      if (reaction_error) {
        if (is_unique_violation(reaction_error))
          throw WavePollError.Conflict(
            "You have already reacted on this poll."
          );

        throw reaction_error;
      }
    }

    const next_poll = await get_poll(supabase, poll.id);

    await Promise.all([
      emit_poll_updated(next_poll),
      poll.type === "text" && !!vote.comment
        ? emit_poll_new_comment(poll.id, vote)
        : Promise.resolve()
    ]);

    return next_poll;
  },
  {
    status: 201,
    schema: {
      body: z.union([
        z.object({
          reaction: z.string().trim().min(1).nullish(),
          option_id: z.string().trim().min(1)
        }),
        z.object({
          reaction: z.string().trim().min(1).nullish(),
          rating: z.number().int().min(1).max(5)
        }),
        z.object({
          reaction: z.string().trim().min(1).nullish(),
          comment: z
            .string()
            .trim()
            .min(1)
            .max(
              MAX_TEXT_RESPONSE_LENGTH,
              `Comment must be at most ${MAX_TEXT_RESPONSE_LENGTH} characters.`
            )
        })
      ]),
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);

const VOTER_COOKIE_NAME = "wavepoll_voter_key";

async function get_voter_key(): Promise<string> {
  const cookie_store = await cookies();
  const from_cookie = cookie_store.get(VOTER_COOKIE_NAME)?.value;
  const signed = extract_signed_voter_key(from_cookie);

  if (from_cookie && !signed)
    throw WavePollError.BadRequest("Invalid session. Please retry.");

  const value = signed ?? nanoid();

  cookie_store.set({
    name: VOTER_COOKIE_NAME,
    value: to_signed_voter_key(value),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10
  });

  return value;
}

function is_unique_violation(error: { code?: string }) {
  return error.code === "23505";
}

function to_signed_voter_key(voter_key: string): string {
  return `${voter_key}.${sign(voter_key)}`;
}

function extract_signed_voter_key(value: string | undefined): string | null {
  if (!value) return null;

  const separator_index = value.lastIndexOf(".");

  if (separator_index <= 0 || separator_index === value.length - 1) return null;

  const voter_key = value.slice(0, separator_index);
  const signature = value.slice(separator_index + 1);
  const expected_signature = sign(voter_key);

  if (!safe_equal(signature, expected_signature)) return null;

  return voter_key;
}

function sign(value: string): string {
  return createHmac("sha256", env.COOKIE_SECRET)
    .update(value)
    .digest("base64url");
}

function safe_equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) return false;

  return timingSafeEqual(left, right);
}
