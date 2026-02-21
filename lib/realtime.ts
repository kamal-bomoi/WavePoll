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
    }) as unknown as z.ZodType<PollResponse>
  }
};

export const realtime = new Realtime({ schema, redis });

export async function emit_poll_updated(poll: Poll): Promise<void> {
  try {
    await realtime.channel(`poll:${poll.id}`).emit("poll.updated", poll);
  } catch (error) {
    if (env.NODE_ENV === "development") console.error(error);
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
  }
}
