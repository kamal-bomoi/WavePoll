import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import z from "zod";
import type { VotePayload } from "@/types";
import { nanoid } from "@/utils/nanoid";
import { get_poll } from "@/utils/poll";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route<VotePayload, { poll_id: string }>(
  async ({ body, params, supabase }, req) => {
    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id,type,status,end_at,reaction_emojis,options(id)")
      .eq("id", params.poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (poll.status !== "live")
      throw WavePollError.BadRequest("Only live polls can receive votes.");

    if (poll.end_at && new Date(poll.end_at) <= new Date())
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

    const voter_key = await get_voter_key(req);

    const { error: vote_error } = await supabase.from("votes").insert({
      id: nanoid.id(),
      poll_id: poll.id,
      voter_key,
      option_id: "option_id" in body ? body.option_id : null,
      rating: "rating" in body ? body.rating : null,
      comment: "comment" in body ? body.comment : null
    });

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

    return get_poll(supabase, poll.id);
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
          comment: z.string().trim().min(1)
        })
      ]),
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);

const VOTER_COOKIE_NAME = "wavepoll_voter_key";

async function get_voter_key(req: NextRequest): Promise<string> {
  const cookie_store = await cookies();
  const from_cookie = cookie_store.get(VOTER_COOKIE_NAME)?.value;
  const from_header = req.headers.get("x-wavepoll-voter-key");
  const value = from_cookie || from_header || nanoid();

  cookie_store.set({
    name: VOTER_COOKIE_NAME,
    value,
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
