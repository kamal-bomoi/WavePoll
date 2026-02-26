import * as Sentry from "@sentry/nextjs";
import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { env } from "@/env";
import type { Poll, Vote } from "@/types";
import { redis } from "./redis";

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

const schema = {
  poll: {
    updated: z.looseObject({
      id: z.string()
    }) as unknown as z.ZodType<Poll>,
    new_comment: z.looseObject({
      id: z.string(),
      comment: z.string()
    }) as unknown as z.ZodType<Vote>,
    presence: z.object({
      poll_id: z.string(),
      presence: z.number().int().nonnegative()
    }),
    ended: z.looseObject({
      id: z.string()
    }) as unknown as z.ZodType<Poll>
  }
};

export const realtime = new Realtime({ schema, redis });

/**
 * Publishes a "poll.updated" realtime event for the given poll.
 *
 * @param poll - The poll object to publish; emitted on the channel `poll:<poll.id>`
 */
export async function emit_poll_updated(poll: Poll): Promise<void> {
  try {
    await realtime.channel(`poll:${poll.id}`).emit("poll.updated", poll);
  } catch (error) {
    if (env.NODE_ENV === "development") console.error(error);

    Sentry.captureException(error, {
      tags: { emitter: "poll.updated" },
      extra: {
        poll_id: poll.id
      }
    });
  }
}

/**
 * Publishes a `poll.new_comment` realtime event to the channel for the specified poll with the provided vote payload.
 *
 * @param poll_id - The identifier of the poll to which the new comment belongs
 * @param vote - The vote/comment payload to emit
 */
export async function emit_poll_new_comment(
  poll_id: string,
  vote: Vote
): Promise<void> {
  try {
    await realtime.channel(`poll:${poll_id}`).emit("poll.new_comment", vote);
  } catch (error) {
    if (env.NODE_ENV === "development") console.error(error);

    Sentry.captureException(error, {
      tags: { emitter: "poll.new_comment" },
      extra: {
        poll_id
      }
    });
  }
}

/**
 * Publishes the current presence count for a poll to its realtime channel.
 *
 * @param poll_id - The poll's identifier used to select the channel (e.g., `poll:<poll_id>`).
 * @param presence - The current presence count for the poll (integer greater than or equal to 0).
 */
export async function emit_poll_presence(
  poll_id: string,
  presence: number
): Promise<void> {
  try {
    await realtime.channel(`poll:${poll_id}`).emit("poll.presence", {
      poll_id,
      presence
    });
  } catch (error) {
    if (env.NODE_ENV === "development") console.error(error);

    Sentry.captureException(error, {
      tags: { emitter: "poll.presence" },
      extra: {
        poll_id
      }
    });
  }
}

/**
 * Broadcasts a "poll.ended" realtime event for the given poll on its channel.
 *
 * @param poll - The poll object to emit as the event payload; its `id` is used to select the channel.
 */
export async function emit_poll_ended(poll: Poll): Promise<void> {
  try {
    await realtime.channel(`poll:${poll.id}`).emit("poll.ended", poll);
  } catch (error) {
    if (env.NODE_ENV === "development") console.error(error);

    Sentry.captureException(error, {
      tags: { emitter: "poll.ended" },
      extra: {
        poll_id: poll.id
      }
    });
  }
}
