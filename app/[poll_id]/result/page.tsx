"use client";

import {
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { PollResultContent } from "@/app/[poll_id]/result/poll-result-content";
import { NewPollButton } from "@/components/new-poll-button";
import { WaveAlert } from "@/components/wave-alert";
import { WavePollHeader } from "@/components/wavepoll-header";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { useQuery } from "@/hooks/use-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";

export default function ResultPage() {
  const params = useParams<{ poll_id: string }>();
  const [poll_ids] = useLocalPollIds();
  const is_owner_view = !!poll_ids?.includes(params.poll_id);
  const update_query = useUpdateQuery();
  const query = useQuery("poll", [params.poll_id], {
    enabled: !!params.poll_id
  });

  useRealtime({
    channels: [`poll:${params.poll_id}`],
    events: ["poll.updated"],
    enabled: !!query.data?.id,
    onData({ data }) {
      if (data.id !== params.poll_id) return;

      update_query<Poll>(queries.poll.key(params.poll_id), (draft) => {
        Object.assign(draft, data);
      });
    }
  });

  if (query.isFetching)
    return (
      <Center className="wave-page">
        <Stack align="center" gap="sm">
          <Loader color="indigo" size="md" />
        </Stack>
      </Center>
    );

  if (query.error)
    return (
      <Container size="md" className="wave-page">
        <WaveAlert type="error" message={query.error} />
      </Container>
    );

  if (query.data)
    return (
      <div className="wave-page">
        <Container size="md">
          <Paper className="wave-slide-up">
            <Stack gap="sm">
              <WavePollHeader title="Results" />
              <PollResultContent
                poll={query.data}
                is_owner_view={is_owner_view}
              />
              <Group justify="space-between" style={{ width: "100%" }}>
                <Text size="sm" c="dimmed">
                  Last updated {dayjs(query.data.updated_at).fromNow()}
                </Text>
                <NewPollButton />
              </Group>
            </Stack>
          </Paper>
        </Container>
      </div>
    );

  return null;
}
