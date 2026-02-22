import * as Sentry from "@sentry/nextjs";
import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { env } from "@/env";
import type { Poll, PollResponse } from "@/types";
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
    }) as unknown as z.ZodType<PollResponse>,
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

export async function emit_poll_new_comment(
  poll_id: string,
  response: PollResponse
): Promise<void> {
  try {
    await realtime
      .channel(`poll:${poll_id}`)
      .emit("poll.new_comment", response);
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
