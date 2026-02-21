import { useState } from "react";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll";

export function usePollEndState(
  poll: Poll
): [has_ended: boolean, end: () => void] {
  const [ended, set_ended] = useState(false);

  const has_ended = ended || is_poll_ended(poll);

  return [has_ended, () => set_ended(true)];
}
