import * as Sentry from "@sentry/nextjs";
import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { redis } from "@/lib/redis";
import { Supabase } from "@/lib/supabase/client";
import { is_poll_ended } from "@/utils/poll";
import { WavePollError } from "@/utils/wave-poll-error";

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "1 h"),
  prefix: "@wavepoll/ratelimit:csv_export"
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ poll_id: string }> }
) {
  try {
    const { poll_id } = await ctx.params;

    const requester_ip = get_requester_ip(req);

    if (requester_ip) await ratelimit(poll_id, requester_ip);

    const supabase = Supabase();

    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id,title,type,end_at")
      .eq("id", poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (!is_poll_ended(poll))
      throw WavePollError.BadRequest(
        "CSV export is only available after poll ends."
      );

    const [
      { data: votes, error: votes_error },
      { data: options, error: options_error },
      { data: reactions, error: reactions_error }
    ] = await Promise.all([
      supabase
        .from("votes")
        .select("id,created_at,voter_key,option_id,rating,comment")
        .eq("poll_id", poll.id)
        .order("created_at", { ascending: false }),
      supabase.from("options").select("id,value").eq("poll_id", poll.id),
      supabase
        .from("reactions")
        .select("voter_key,emoji")
        .eq("poll_id", poll.id)
    ]);

    if (votes_error) throw votes_error;
    if (options_error) throw options_error;
    if (reactions_error) throw reactions_error;

    const option_by_id = new Map(
      (options ?? []).map((option) => [option.id, option.value])
    );
    const reaction_by_voter_key = new Map(
      (reactions ?? []).map((reaction) => [reaction.voter_key, reaction.emoji])
    );

    const headers = [
      "poll_id",
      "poll_title",
      "poll_type",
      "vote_id",
      "created_at",
      "voter_key",
      "option_id",
      "option_value",
      "rating",
      "comment",
      "reaction"
    ];

    const rows = (votes ?? []).map((vote) => [
      poll.id,
      poll.title,
      poll.type,
      vote.id,
      vote.created_at,
      vote.voter_key,
      vote.option_id ?? "",
      vote.option_id ? (option_by_id.get(vote.option_id) ?? "") : "",
      vote.rating?.toString() ?? "",
      vote.comment ?? "",
      reaction_by_voter_key.get(vote.voter_key) ?? ""
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

function get_requester_ip(req: NextRequest): string | null {
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

function escape_csv(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}
