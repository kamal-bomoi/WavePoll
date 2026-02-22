import * as Sentry from "@sentry/nextjs";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { waitUntil } from "@vercel/functions";
import { env } from "@/env";
import { send_poll_ended_summary_email } from "@/lib/email";
import { is_qstash_signature_configured } from "@/lib/qstash";
import { emit_poll_ended } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { Supabase } from "@/lib/supabase/client";
import type { Poll } from "@/types";
import { get_poll, is_poll_ended } from "@/utils/poll";

const IDEMPOTENCY_TTL_SECONDS = 60 * 60 * 24 * 30;

async function handler(
  req: Request,
  context: { params: Promise<{ poll_id: string }> }
) {
  const { poll_id } = await context.params;
  const supabase = Supabase();

  try {
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

    let next_poll: Poll;

    try {
      await redis.expire(lock_key, IDEMPOTENCY_TTL_SECONDS);

      next_poll = await get_poll(supabase, poll.id);

      await emit_poll_ended(next_poll);
    } catch (inner_error) {
      await redis.del(lock_key);

      throw inner_error;
    }

    if (next_poll.owner_email && env.RESEND_API_KEY)
      waitUntil(send_poll_ended_summary_email(next_poll));

    return Response.json({ ok: true });
  } catch (outer_error) {
    Sentry.withScope((scope) => {
      scope.setTag("layer", "default");
      scope.setExtra("url", req.url);
      scope.setExtra("method", req.method);
      scope.setExtra("handler", "qstash_poll_end");

      Sentry.captureException(outer_error);
    });

    throw outer_error;
  }
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
