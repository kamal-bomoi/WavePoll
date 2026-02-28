import "server-only";
import * as Sentry from "@sentry/nextjs";
import { Client } from "@upstash/qstash";
import { env } from "@/env";
import type { Poll } from "@/types";

const qstash = env.QSTASH_TOKEN
  ? new Client({
      token: env.QSTASH_TOKEN
    })
  : null;

export async function schedule_poll_end(poll: Poll): Promise<void> {
  if (!qstash) return;

  const not_before = Math.floor(new Date(poll.end_at).getTime() / 1000);

  if (!Number.isFinite(not_before))
    return void Sentry.captureMessage(
      "Invalid poll end_at for QStash scheduling",
      {
        level: "error",
        tags: { handler: "schedule_poll_end" },
        extra: { poll_id: poll.id, end_at: poll.end_at }
      }
    );

  try {
    await qstash.publishJSON<{ poll_id: string }>({
      url: `${env.APP_BASE_URL}/api/polls/${poll.id}/end`,
      body: {
        poll_id: poll.id
      },
      notBefore: not_before,
      deduplicationId: `poll-ended:${poll.id}`,
      retryDelay: "min(300000, pow(2, retried) * 15000)"
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { handler: "schedule_poll_end" },
      extra: {
        poll_id: poll.id
      }
    });
  }
}

export function is_qstash_signature_configured(): boolean {
  return !!(env.QSTASH_CURRENT_SIGNING_KEY && env.QSTASH_NEXT_SIGNING_KEY);
}
