import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/lib/db/client";
import type { PollStatus } from "@/lib/db/schema";
import { polls } from "@/lib/db/schema";
import { emit_poll_updated } from "@/lib/realtime";
import { is_poll_ended } from "@/utils/poll-generic";
import { get_poll } from "@/utils/poll-server";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const GET = route<undefined, { poll_id: string }>(
  async ({ params }) => {
    return get_poll(params.poll_id);
  },
  {
    schema: {
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);

export const PATCH = route<{ status: PollStatus }, { poll_id: string }>(
  async ({ params, body }) => {
    const poll = await db.query.polls.findFirst({
      columns: { id: true, status: true, end_at: true },
      where: eq(polls.id, params.poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (poll.status === body.status) return get_poll(poll.id);

    const has_ended = is_poll_ended(poll);

    if (body.status === "live" && has_ended)
      throw WavePollError.BadRequest(
        "Cannot publish a poll with an end time in the past."
      );

    if (body.status === "draft" && has_ended)
      throw WavePollError.BadRequest("Cannot unpublish a poll that has ended.");

    await db
      .update(polls)
      .set({ status: body.status })
      .where(eq(polls.id, poll.id));

    const next_poll = await get_poll(poll.id);

    await emit_poll_updated(next_poll);

    return next_poll;
  },
  {
    schema: {
      params: z.object({
        poll_id: z.string()
      }),
      body: z.object({
        status: z.enum(["draft", "live"])
      })
    }
  }
);

export const DELETE = route<undefined, { poll_id: string }>(
  async ({ params }) => {
    const result = await db
      .delete(polls)
      .where(eq(polls.id, params.poll_id))
      .returning({ id: polls.id });

    if (!result.length) throw WavePollError.NotFound("Poll does not exist.");

    return null;
  },
  {
    status: 204,
    schema: {
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);
