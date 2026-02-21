import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { env } from "@/env";
import { is_qstash_signature_configured } from "@/lib/qstash";
import { emit_poll_ended } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { Supabase } from "@/lib/supabase/client";
import { get_poll, is_poll_ended } from "@/utils/poll";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 30;

async function handler(
  _request: Request,
  context: { params: Promise<{ poll_id: string }> }
) {
  const { poll_id } = await context.params;
  const supabase = Supabase();

  const { data: poll, error } = await supabase
    .from("polls")
    .select("id,end_at")
    .eq("id", poll_id)
    .maybeSingle();

  if (error)
    return Response.json(
      { errors: [{ message: "An internal server error occurred." }] },
      { status: 500 }
    );

  if (!poll) return Response.json({ ok: true });

  if (!is_poll_ended(poll)) return Response.json({ ok: true });

  const lock_key = `poll:ended:emitted:${poll.id}`;
  const created = await redis.setnx(lock_key, "1");

  if (!created) return Response.json({ ok: true });

  try {
    await redis.expire(lock_key, IDEMPOTENCY_TTL_SECONDS);

    const next_poll = await get_poll(supabase, poll.id);

    await emit_poll_ended(next_poll);
  } catch (error) {
    await redis.del(lock_key);
    throw error;
  }

  return Response.json({ ok: true });
}

export const POST = is_qstash_signature_configured()
  ? verifySignatureAppRouter(handler, {
      currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
      nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY
    })
  : async function qstash_not_configured() {
      return Response.json(
        { errors: [{ message: "QStash signature keys are not configured." }] },
        { status: 503 }
      );
    };
