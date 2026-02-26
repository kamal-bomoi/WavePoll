import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/lib/db/client";
import { polls, reactions, votes } from "@/lib/db/schema";
import { emit_poll_new_comment, emit_poll_updated } from "@/lib/realtime";
import { get_or_set_anon_id } from "@/lib/session";
import type { Vote, VotePayload } from "@/types";
import { MAX_TEXT_RESPONSE_LENGTH } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";
import { is_poll_ended } from "@/utils/poll-generic";
import { get_poll } from "@/utils/poll-server";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route<VotePayload, { poll_id: string }>(
  async ({ body, params }) => {
    const poll = await db.query.polls.findFirst({
      columns: {
        id: true,
        type: true,
        status: true,
        end_at: true,
        reaction_emojis: true
      },
      with: { options: { columns: { id: true } } },
      where: eq(polls.id, params.poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (poll.status !== "live")
      throw WavePollError.BadRequest("Only live polls can receive votes.");

    if (is_poll_ended(poll))
      throw WavePollError.BadRequest("This poll has already ended.");

    if (poll.type === "single" || poll.type === "image") {
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

    const anon_id = await get_or_set_anon_id();

    let vote: Vote;

    try {
      vote = await db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(votes)
          .values({
            id: nanoid.id(),
            poll_id: poll.id,
            anon_id,
            option_id: "option_id" in body ? body.option_id : null,
            rating: "rating" in body ? body.rating : null,
            comment: "comment" in body ? body.comment : null
          })
          .returning({
            id: votes.id,
            option_id: votes.option_id,
            rating: votes.rating,
            comment: votes.comment,
            created_at: votes.created_at
          });

        if (!inserted)
          throw WavePollError.InternalServerError("Failed to insert vote.");

        if (body.reaction)
          await tx.insert(reactions).values({
            id: nanoid.id(),
            poll_id: poll.id,
            anon_id,
            emoji: body.reaction
          });

        return inserted;
      });
    } catch (e) {
      if (is_unique_violation(e))
        throw WavePollError.Conflict("You have already voted on this poll.");

      throw e;
    }

    const next_poll = await get_poll(poll.id);

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

/**
 * Detects whether a thrown value represents a Postgres unique constraint violation.
 *
 * @param error - The value (typically an Error) to inspect for a database error code.
 * @returns `true` if the error's causal object has code `"23505"`, `false` otherwise.
 */
function is_unique_violation(error: unknown) {
  return (
    error instanceof Error &&
    error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause &&
    error.cause.code === "23505"
  );
}
