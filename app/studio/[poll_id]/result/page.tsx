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
import { PollResultContent } from "@/app/studio/[poll_id]/result/poll-result-content";
import { WavePollHeader } from "@/app/studio/wavepoll-header";
import { NewPollButton } from "@/components/new-poll-button";
import { RealtimeIndicator } from "@/components/realtime-indicator";
import { WaveAlert } from "@/components/wave-alert";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { usePollQuery } from "@/hooks/use-poll-query";
import { is_poll_ended } from "@/utils/poll-generic";

export default function ResultPage() {
  const params = useParams<{ poll_id: string }>();
  const [poll_ids] = useLocalPollIds();
  const is_owner_view = !!poll_ids?.includes(params.poll_id);
  const query = usePollQuery(params.poll_id);

  if (query.isLoading)
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

  if (query.data) {
    const show_realtime_indicator =
      query.data.status === "live" && !is_poll_ended(query.data);

    return (
      <div className="wave-page">
        <Container size="md">
          <Paper className="wave-slide-up">
            <Stack gap="sm">
              <WavePollHeader title="Results" />
              {show_realtime_indicator && (
                <Group justify="flex-end">
                  <RealtimeIndicator />
                </Group>
              )}
              <PollResultContent
                poll={query.data}
                is_owner_view={is_owner_view}
              />
              <Group justify="space-between" style={{ width: "100%" }}>
                <Text size="sm" c="dimmed">
                  {`Last updated ${dayjs(query.data.last_voted_at ?? query.data.created_at).fromNow()}`}
                </Text>
                <NewPollButton />
              </Group>
            </Stack>
          </Paper>
        </Container>
      </div>
    );
  }

  return null;
}
