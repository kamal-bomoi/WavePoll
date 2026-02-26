import "server-only";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type PollDetail, polls_details } from "@/lib/db/schema";
import type { Poll } from "@/types";
import { WavePollError } from "./wave-poll-error";

/**
 * Retrieve a poll by its id and return it as a mapped Poll object.
 *
 * @param poll_id - The poll's unique identifier
 * @returns The mapped Poll corresponding to `poll_id`
 * @throws WavePollError.NotFound if no poll with the given id exists
 */
export async function get_poll(poll_id: string): Promise<Poll> {
  const [row] = await db
    .select()
    .from(polls_details)
    .where(eq(polls_details.id, poll_id))
    .limit(1);

  if (!row) throw WavePollError.NotFound("Poll does not exist.");

  return map_poll(row);
}

/**
 * Fetches polls for the given IDs and converts each database row to a `Poll`.
 *
 * @param poll_ids - Array of poll IDs to retrieve; if empty, the function returns an empty array.
 * @returns An array of `Poll` objects for the matching IDs, ordered by `created_at` descending.
export async function get_polls(poll_ids: string[]): Promise<Poll[]> {
  if (!poll_ids.length) return [];

  const rows = await db
    .select()
    .from(polls_details)
    .where(inArray(polls_details.id, poll_ids))
    .orderBy(desc(polls_details.created_at));

  return rows.map((row) => map_poll(row));
}

/**
 * Retrieve all polls created by a specific owner, including the owner's email.
 *
 * Polls are returned in descending order by creation time.
 *
 * @param owner_id - The ID of the owner whose polls should be fetched
 * @returns An array of `Poll` objects for the given owner ordered by `created_at` descending; each `Poll` includes `owner_email`
 */
export async function get_owner_polls(owner_id: string): Promise<Poll[]> {
  const rows = await db
    .select()
    .from(polls_details)
    .where(eq(polls_details.owner_id, owner_id))
    .orderBy(desc(polls_details.created_at));

  return rows.map((row) => map_poll(row, { include_owner_email: true }));
}

/**
 * Converts a PollDetail database row into a Poll DTO suitable for API responses.
 *
 * @param row - The database row containing poll details.
 * @param options - Mapping options.
 * @param options.include_owner_email - If true, include `owner_email` in the returned Poll.
 * @returns The mapped Poll with `presence` initialized to 0 and `options` normalized to objects containing `id`, `value`, and `votes`.
 */
function map_poll(
  row: PollDetail,
  options: { include_owner_email?: boolean } = {}
): Poll {
  const { owner_id: _owner_id, owner_email, ...poll } = row;

  return {
    ...poll,
    ...(options.include_owner_email ? { owner_email } : {}),
    presence: 0,
    options: poll.options.map((option) => ({
      id: option.id,
      value: option.value,
      votes: option.votes
    }))
  };
}
