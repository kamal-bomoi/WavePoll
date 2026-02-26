import { useCallback, useEffect, useState } from "react";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";

/**
 * Tracks whether a poll has ended and provides a way to mark it ended.
 *
 * The hook treats the poll as ended if either the poll is externally considered ended or the returned `end` function has been called. When `poll.id` changes, the internal ended flag is reset.
 *
 * @param poll - The poll to observe; its `id` is used to reset the internal ended state when it changes.
 * @returns A tuple where the first element is `true` if the poll has ended, `false` otherwise; the second element is a function that marks the poll as ended.
 */
export function usePollEndState(
  poll: Poll
): [has_ended: boolean, end: () => void] {
  const [ended, set_ended] = useState(false);

  const has_ended = ended || is_poll_ended(poll);

  // biome-ignore lint/correctness/useExhaustiveDependencies: _
  useEffect(() => {
    set_ended(false);
  }, [poll.id]);

  const end = useCallback(() => set_ended(true), []);

  return [has_ended, end];
}
