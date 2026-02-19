import type { Poll, PollStatus, PollType, PollWithOptions } from "@/types";

export function topoll(row: PollWithOptions): Poll {
  return {
    id: row.id,
    title: row.title,
    type: row.type as PollType,
    status: row.status as PollStatus,
    description: row.description,
    owner_email: row.owner_email,
    end_at: row.end_at,
    reaction_emojis: row.reaction_emojis,
    presence: 0,
    reactions_count: 0,
    text_responses_count: 0,
    total_votes: 0,
    embed_url: `/embed/${row.id}`,
    created_at: row.created_at,
    updated_at: row.updated_at,
    options: (row.options ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((option) => ({
        id: option.id,
        label: option.value,
        votes: 0,
        trend: []
      }))
  };
}
