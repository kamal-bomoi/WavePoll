import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { polls } from "@/lib/db/schema";
import { emit_poll_presence } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { IndicatePresenceSchema, PollIdSchema } from "@/lib/schemas";
import {
  PRESENCE_HEARTBEAT_TTL_SECONDS,
  PRESENCE_TIMEOUT_MS
} from "@/utils/constants";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route(
  async ({ body, params }) => {
    if (body.action === "join") {
      const poll = await db.query.polls.findFirst({
        columns: { id: true },
        where: eq(polls.id, params.poll_id)
      });

      if (!poll) throw WavePollError.NotFound("Poll does not exist.");
    }

    const now = Date.now();
    const timeout_score = now - PRESENCE_TIMEOUT_MS;
    const key = presence_key(params.poll_id);

    const pipeline = redis.pipeline();

    pipeline.zremrangebyscore(key, 0, timeout_score);

    if (body.action === "join" || body.action === "heartbeat")
      pipeline.zadd(key, { score: now, member: body.viewer_id });

    if (body.action === "leave") pipeline.zrem(key, body.viewer_id);

    pipeline.expire(key, PRESENCE_HEARTBEAT_TTL_SECONDS);
    pipeline.zcard(key);

    const results = await pipeline.exec();
    const presence = Number(results.at(-1) ?? 0);

    await emit_poll_presence(params.poll_id, presence);

    return { presence };
  },
  {
    schema: {
      params: PollIdSchema,
      body: IndicatePresenceSchema
    }
  }
);

function presence_key(poll_id: string): string {
  return `poll:presence:${poll_id}`;
}
