import { z } from "zod";
import { emit_poll_presence } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import {
  PRESENCE_HEARTBEAT_TTL_SECONDS,
  PRESENCE_TIMEOUT_MS
} from "@/utils/constants";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route<
  { action: "join" | "heartbeat" | "leave"; viewer_id: string },
  { poll_id: string }
>(
  async ({ body, params, supabase }) => {
    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id")
      .eq("id", params.poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

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
      params: z.object({
        poll_id: z.string()
      }),
      body: z.object({
        action: z.enum(["join", "heartbeat", "leave"]),
        viewer_id: z.string().trim().min(1)
      })
    }
  }
);

function presence_key(poll_id: string): string {
  return `poll:presence:${poll_id}`;
}
