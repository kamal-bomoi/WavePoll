import "server-only";
import { Client } from "@upstash/qstash";
import { env } from "@/env";
import type { Poll } from "@/types";

const qstash = env.QSTASH_TOKEN
  ? new Client({
      token: env.QSTASH_TOKEN
    })
  : null;

export async function schedule_poll_end(poll: Poll) {
  if (!qstash) return;

  const not_before = Math.floor(new Date(poll.end_at).getTime() / 1000);

  if (!Number.isFinite(not_before)) return;

  try {
    await qstash.publishJSON<{ poll_id: string }>({
      url: `${env.APP_BASE_URL}/api/polls/${poll.id}/end`,
      body: {
        poll_id: poll.id
      },
      notBefore: not_before,
      deduplicationId: `poll-ended:${poll.id}`
    });
  } catch {}
}

export function is_qstash_signature_configured(): boolean {
  return !!(env.QSTASH_CURRENT_SIGNING_KEY && env.QSTASH_NEXT_SIGNING_KEY);
}
