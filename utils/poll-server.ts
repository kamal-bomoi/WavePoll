import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type PollDetail, polls_details } from "@/lib/db/schema";
import type { Poll } from "@/types";
import { WavePollError } from "./wave-poll-error";

export async function get_poll(poll_id: string): Promise<Poll> {
  const [row] = await db
    .select()
    .from(polls_details)
    .where(eq(polls_details.id, poll_id))
    .limit(1);

  if (!row) throw WavePollError.NotFound("Poll does not exist.");

  return map_poll(row);
}

export async function get_polls(poll_ids: string[]): Promise<Poll[]> {
  if (!poll_ids.length) return [];

  const rows = await db
    .select()
    .from(polls_details)
    .where(inArray(polls_details.id, poll_ids))
    .orderBy(desc(polls_details.created_at));

  return rows.map(map_poll);
}

export async function get_owner_polls(owner_id: string): Promise<Poll[]> {
  const rows = await db
    .select()
    .from(polls_details)
    .where(eq(polls_details.owner_id, owner_id))
    .orderBy(desc(polls_details.created_at));

  return rows.map(map_poll);
}

function map_poll(row: PollDetail): Poll {
  const { owner_id: _owner_id, ...poll } = row;

  return {
    ...poll,
    presence: 0,
    options: poll.options.map((option) => ({
      id: option.id,
      value: option.value,
      votes: option.votes
    }))
  };
}
