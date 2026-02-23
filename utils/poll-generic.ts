import type { PollRow } from "@/lib/db/schema";
import type { Poll } from "@/types";

export function is_poll_ended(
  poll: { end_at: PollRow["end_at"] },
  now = new Date()
): boolean {
  return new Date(poll.end_at) <= now;
}

export function calculate_reactions_count(poll: Poll): number {
  return poll.reaction_breakdown.reduce((sum, r) => sum + r.count, 0);
}
