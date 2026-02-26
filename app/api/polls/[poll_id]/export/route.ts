import * as Sentry from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { and, desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/lib/db/client";
import { options, polls, reactions, votes } from "@/lib/db/schema";
import { redis } from "@/lib/redis";
import { assert_owner } from "@/lib/session";
import { is_poll_ended } from "@/utils/poll-generic";
import { WavePollError } from "@/utils/wave-poll-error";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "@wavepoll/ratelimit:csv_export"
});

/**
 * Generate and return a CSV export of a poll's results after the poll has ended, enforcing ownership and per-client rate limits.
 *
 * @param req - The incoming NextRequest for the export route
 * @param ctx - Route context containing `params` with `poll_id`
 * @returns A NextResponse containing the CSV payload as an attachment (Content-Type: text/csv) on success; on failure returns a JSON error response with an appropriate HTTP status code.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ poll_id: string }> }
) {
  try {
    const { poll_id } = await ctx.params;

    const ip = get_client_ip(req);

    if (!ip)
      throw WavePollError.BadRequest("Unable to determine client IP address.");

    await ratelimit(poll_id, ip);

    const poll = await db.query.polls.findFirst({
      columns: {
        id: true,
        owner_id: true,
        title: true,
        type: true,
        end_at: true
      },
      where: eq(polls.id, poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    await assert_owner(poll.owner_id);

    if (!is_poll_ended(poll))
      throw WavePollError.BadRequest(
        "CSV export is only available after poll ends."
      );

    const [vote_rows, option_rows] = await Promise.all([
      db
        .select({
          id: votes.id,
          created_at: votes.created_at,
          option_id: votes.option_id,
          rating: votes.rating,
          comment: votes.comment,
          reaction: reactions.emoji
        })
        .from(votes)
        .leftJoin(
          reactions,
          and(
            eq(reactions.poll_id, votes.poll_id),
            eq(reactions.anon_id, votes.anon_id)
          )
        )
        .where(eq(votes.poll_id, poll.id))
        .orderBy(desc(votes.created_at)),
      db
        .select({ id: options.id, value: options.value })
        .from(options)
        .where(eq(options.poll_id, poll.id))
    ]);

    const option_by_id = new Map(
      option_rows.map((option) => [option.id, option.value])
    );

    const headers = [
      "poll_title",
      "poll_type",
      "created_at",
      "option_value",
      "rating",
      "comment",
      "reaction"
    ];

    const rows = vote_rows.map((vote) => [
      poll.title,
      poll.type,
      vote.created_at.toISOString(),
      vote.option_id ? (option_by_id.get(vote.option_id) ?? "") : "",
      vote.rating?.toString() ?? "",
      vote.comment ?? "",
      vote.reaction ?? ""
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escape_csv).join(","))
      .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${poll.id}-results.csv"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (e) {
    const error = e as Error;

    if (error instanceof WavePollError)
      return NextResponse.json(
        { errors: error.serialize() },
        { status: error.status }
      );

    if (env.NODE_ENV === "development") console.log(error);

    Sentry.withScope((scope) => {
      scope.setTag("layer", "default");
      scope.setExtra("url", req.url);
      scope.setExtra("method", req.method);

      Sentry.captureException(error);
    });

    return NextResponse.json(
      {
        errors: [
          {
            message:
              env.NODE_ENV === "development"
                ? error.message
                : "An internal server error occurred."
          }
        ]
      },
      { status: 500 }
    );
  }
}

/**
 * Enforces a per-poll, per-IP rate limit for CSV export requests.
 *
 * @param poll_id - The poll identifier used to scope the rate limit
 * @param ip - The requester's IP address used to scope the rate limit
 * @throws WavePollError When the rate limit is exceeded (status 429) with a message indicating how many seconds to wait before retrying
 */
async function ratelimit(poll_id: string, ip: string): Promise<void> {
  const identifier = `${poll_id}:${ip}`;
  const limit = await limiter.limit(identifier);

  if (!limit.success) {
    const retry_after_seconds = Math.max(
      1,
      Math.ceil((limit.reset - Date.now()) / 1000)
    );

    throw new WavePollError(
      429,
      `Too many CSV export requests. Try again in ${retry_after_seconds} seconds.`
    );
  }
}

/**
 * Extracts the client's IP address from common proxy headers on the request.
 *
 * Checks headers in this order: `cf-connecting-ip`, `x-real-ip`, then the first entry of `x-forwarded-for`.
 *
 * @returns The client's IP address as a string, or `null` if no suitable header is present.
 */
function get_client_ip(req: NextRequest): string | null {
  const cf_connecting_ip = req.headers.get("cf-connecting-ip");
  if (cf_connecting_ip) return cf_connecting_ip;

  const x_real_ip = req.headers.get("x-real-ip");
  if (x_real_ip) return x_real_ip;

  const x_forwarded_for = req.headers.get("x-forwarded-for");
  if (x_forwarded_for) {
    const [first] = x_forwarded_for.split(",");
    return first?.trim() || null;
  }

  return null;
}

/**
 * Escapes a string for safe inclusion in a CSV cell, neutralizing potential spreadsheet formulas.
 *
 * @param value - The input string to escape
 * @returns The input wrapped in double quotes with internal double quotes doubled; if the input begins with `=`, `+`, `-`, `@`, a tab, or a carriage return, a leading single quote is prefixed to neutralize formulas
 */
function escape_csv(value: string): string {
  const neutralized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  const escaped = neutralized.replaceAll('"', '""');

  return `"${escaped}"`;
}
