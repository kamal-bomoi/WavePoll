"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocalHistoryPollIds } from "@/hooks/use-local-history-poll-ids";
import { usePollPresence } from "@/hooks/use-poll-presence";
import { usePollQuery } from "@/hooks/use-poll-query";
import { useQuery } from "@/hooks/use-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";

/**
 * Layout wrapper that tracks a poll's presence, maintains recent non-owned poll history, and subscribes to realtime poll updates.
 *
 * Subscribes to poll-specific realtime events and updates the local query cache on "poll.updated" and "poll.ended", updates presence on "poll.presence", and maintains a capped history of recent poll IDs (excluding polls owned by the current user).
 *
 * @param children - Child routes or content to render within this layout
 * @returns The provided `children` rendered inside a fragment
 */
export default function PollLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ poll_id: string }>();
  const poll_query = usePollQuery(params.poll_id);
  const own_polls_query = useQuery("polls");
  const [, set_history_poll_ids] = useLocalHistoryPollIds();
  const update_query = useUpdateQuery();

  usePollPresence(poll_query.data?.id);

  // biome-ignore lint/correctness/useExhaustiveDependencies: set_history_poll_ids is a stable setter
  useEffect(() => {
    const poll_id = poll_query.data?.id;

    if (!poll_id || own_polls_query.isPending) return;

    const is_owned =
      own_polls_query.data?.some((poll) => poll.id === poll_id) ?? false;

    set_history_poll_ids((previous) => {
      const next = [...(previous ?? [])];

      if (is_owned) return next.filter((id) => id !== poll_id);

      return [poll_id, ...next.filter((id) => id !== poll_id)].slice(0, 100);
    });
  }, [own_polls_query.data, own_polls_query.isPending, poll_query.data?.id]);

  useRealtime({
    channels: [`poll:${params.poll_id}`],
    events: ["poll.updated", "poll.presence", "poll.ended"],
    enabled: !!poll_query.data?.id,
    onData({ event, data }) {
      if (!poll_query.data?.id) return;

      if (event === "poll.updated") {
        if (data.id !== poll_query.data.id) return;

        update_query<Poll>(queries.poll.key(poll_query.data.id), (draft) => {
          Object.assign(draft, data);
        });
      }

      if (event === "poll.presence") {
        if (data.poll_id !== poll_query.data.id) return;

        update_query<Poll>(queries.poll.key(poll_query.data.id), (draft) => {
          draft.presence = data.presence;
        });
      }

      if (event === "poll.ended") {
        if (data.id !== poll_query.data.id) return;

        update_query<Poll>(queries.poll.key(poll_query.data.id), (draft) => {
          Object.assign(draft, data);
        });
      }
    }
  });

  return <>{children}</>;
}
