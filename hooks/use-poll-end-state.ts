import { useCallback, useEffect, useState } from "react";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";

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
