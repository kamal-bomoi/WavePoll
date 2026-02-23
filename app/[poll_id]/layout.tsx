"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocalHistoryPollIds } from "@/hooks/use-local-history-poll-ids";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { usePollPresence } from "@/hooks/use-poll-presence";
import { usePollQuery } from "@/hooks/use-poll-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";

export default function PollLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ poll_id: string }>();
  const query = usePollQuery(params.poll_id);
  const [created_poll_ids] = useLocalPollIds();
  const [, set_history_poll_ids] = useLocalHistoryPollIds();
  const update_query = useUpdateQuery();

  usePollPresence(query.data?.id);

  // biome-ignore lint/correctness/useExhaustiveDependencies: set_history_poll_ids is a stable setter
  useEffect(() => {
    const poll_id = query.data?.id;

    if (!poll_id) return;

    const is_owned = created_poll_ids?.includes(poll_id);

    set_history_poll_ids((previous) => {
      const next = [...(previous ?? [])];

      if (is_owned) return next.filter((id) => id !== poll_id);

      return [poll_id, ...next.filter((id) => id !== poll_id)].slice(0, 100);
    });
  }, [created_poll_ids, query.data?.id]);

  useRealtime({
    channels: [`poll:${params.poll_id}`],
    events: ["poll.updated", "poll.presence", "poll.ended"],
    enabled: !!query.data?.id,
    onData({ event, data }) {
      if (!query.data?.id) return;

      if (event === "poll.updated") {
        if (data.id !== query.data.id) return;

        update_query<Poll>(queries.poll.key(query.data.id), (draft) => {
          Object.assign(draft, data);
        });
      }

      if (event === "poll.presence") {
        if (data.poll_id !== query.data.id) return;

        update_query<Poll>(queries.poll.key(query.data.id), (draft) => {
          draft.presence = data.presence;
        });
      }

      if (event === "poll.ended") {
        if (data.id !== query.data.id) return;

        update_query<Poll>(queries.poll.key(query.data.id), (draft) => {
          Object.assign(draft, data);
        });
      }
    }
  });

  return <>{children}</>;
}
