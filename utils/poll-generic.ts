import type { PollRow } from "@/lib/db/schema";
import type { Poll } from "@/types";

/**
 * Determines whether a poll's configured end time is at or before a reference time.
 *
 * @param poll - Object containing the poll's `end_at` timestamp
 * @param now - Reference time to compare against; used to determine if the poll has ended
 * @returns `true` if the poll's `end_at` is less than or equal to `now`, `false` otherwise
 */
export function is_poll_ended(
  poll: { end_at: PollRow["end_at"] },
  now = new Date()
): boolean {
  return new Date(poll.end_at) <= now;
}

/**
 * Compute the total number of reactions recorded for a poll.
 *
 * @param poll - The poll whose `reaction_breakdown` entries' `count` fields will be summed
 * @returns The sum of all `count` values from `poll.reaction_breakdown`
 */
export function calculate_reactions_count(poll: Poll): number {
  return poll.reaction_breakdown.reduce((sum, r) => sum + r.count, 0);
}
