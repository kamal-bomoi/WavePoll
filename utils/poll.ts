import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/lib/supabase/types";
import type { Poll } from "@/types";
import { WavePollError } from "./wave-poll-error";

type PollWithDetailsRow = Tables<"polls_with_details">;

type OptionWithVotesRow = {
  id: string;
  poll_id: string;
  value: string;
  created_at: string;
  votes: number;
};

export function is_poll_ended(
  poll: { end_at: string },
  now = new Date()
): boolean {
  return new Date(poll.end_at) <= now;
}

export async function get_poll(
  supabase: SupabaseClient<Database>,
  poll_id: string
): Promise<Poll> {
  const { data: row, error } = await supabase
    .from("polls_with_details")
    .select("*")
    .eq("id", poll_id)
    .maybeSingle();

  if (error) throw error;

  if (!row) throw WavePollError.NotFound("Poll does not exist.");

  const poll = map_poll(row);

  if (poll.reaction_emojis?.length) {
    const { data: reactions, error: reactions_error } = await supabase
      .from("reactions")
      .select("emoji")
      .eq("poll_id", poll.id);

    if (reactions_error) throw reactions_error;

    poll.reaction_breakdown = build_reaction_breakdown({
      enabled: poll.reaction_emojis,
      reactions: reactions.map((reaction) => reaction.emoji)
    });
  }

  return poll;
}

export async function get_polls(
  supabase: SupabaseClient<Database>,
  poll_ids: string[]
): Promise<Poll[]> {
  if (!poll_ids.length) return [];

  const { data: rows, error } = await supabase
    .from("polls_with_details")
    .select("*")
    .in("id", poll_ids)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return rows.map(map_poll);
}

function map_poll(row: PollWithDetailsRow): Poll {
  if (
    !row.id ||
    !row.title ||
    !row.type ||
    !row.status ||
    !row.end_at ||
    !row.created_at ||
    !row.updated_at
  )
    throw WavePollError.InternalServerError("Invalid poll projection row.");

  const options = parse_options(row.options);

  return {
    id: row.id,
    title: row.title,
    type: row.type as Poll["type"],
    status: row.status as Poll["status"],
    description: row.description,
    owner_email: row.owner_email,
    end_at: row.end_at,
    reaction_emojis: row.reaction_emojis,
    created_at: row.created_at,
    updated_at: row.updated_at,
    total_votes: row.total_votes ?? 0,
    text_responses_count: row.text_responses_count ?? 0,
    reactions_count: row.reactions_count ?? 0,
    rating_average: row.rating_average ?? undefined,
    reaction_breakdown: build_reaction_breakdown({
      enabled: row.reaction_emojis ?? [],
      reactions: []
    }),
    presence: row.presence ?? 0,
    options: options
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((option) => ({
        id: option.id,
        value: option.value,
        votes: option.votes,
        trend: []
      }))
  };
}

function build_reaction_breakdown({
  enabled,
  reactions
}: {
  enabled: string[];
  reactions: string[];
}) {
  const counts = new Map<string, number>(enabled.map((emoji) => [emoji, 0]));

  for (const emoji of reactions)
    counts.set(emoji, (counts.get(emoji) ?? 0) + 1);

  return Array.from(counts.entries()).map(([emoji, count]) => ({
    emoji,
    count
  }));
}

function parse_options(value: Json | null): OptionWithVotesRow[] {
  if (!Array.isArray(value)) return [];

  const options: OptionWithVotesRow[] = [];

  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const option = item as Record<string, unknown>;

    if (
      typeof option.id === "string" &&
      typeof option.poll_id === "string" &&
      typeof option.value === "string" &&
      typeof option.created_at === "string"
    )
      options.push({
        id: option.id,
        poll_id: option.poll_id,
        value: option.value,
        created_at: option.created_at,
        votes: typeof option.votes === "number" ? option.votes : 0
      });
  }

  return options;
}
