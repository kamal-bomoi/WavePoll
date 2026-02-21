import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { Supabase } from "@/lib/supabase/client";
import { WavePollError } from "@/utils/wave-poll-error";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ poll_id: string }> }
) {
  try {
    const { poll_id } = await ctx.params;
    const supabase = Supabase();

    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id,title,type,end_at")
      .eq("id", poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (!poll.end_at || new Date(poll.end_at) > new Date())
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

    if (env.NODE_ENV === "development") console.log(error);

    if (error instanceof WavePollError)
      return NextResponse.json(
        { errors: error.serialize() },
        { status: error.status }
      );

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

function escape_csv(value: string): string {
  const escaped = value.replaceAll('"', '""');
  return `"${escaped}"`;
}
