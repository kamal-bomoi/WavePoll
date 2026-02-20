import { useState } from "react";
import type { Poll } from "@/types";

export function usePollEndState(
  poll: Poll
): [has_ended: boolean, end: () => void] {
  const [ended, set_ended] = useState(false);

  const has_ended =
    ended || (!!poll.end_at && new Date(poll.end_at) <= new Date());

  return [has_ended, () => set_ended(true)];
}
