"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { usePollPresence } from "@/hooks/use-poll-presence";
import { usePollQuery } from "@/hooks/use-poll-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";

export default function PollLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ poll_id: string }>();
  const query = usePollQuery(params.poll_id);
  const update_query = useUpdateQuery();

  usePollPresence(query.data?.id);

  useRealtime({
    channels: [`poll:${query.data?.id}`],
    events: ["poll.updated", "poll.presence"],
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
    }
  });

  return <>{children}</>;
}
