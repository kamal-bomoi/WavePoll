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
import { usePollQuery } from "@/hooks/use-poll-query";
import { useQuery } from "@/hooks/use-query";
import { is_poll_ended } from "@/utils/poll-generic";

export default function ResultPage() {
  const params = useParams<{ poll_id: string }>();
  const poll_query = usePollQuery(params.poll_id);
  const owner_polls_query = useQuery("polls");

  if (poll_query.isLoading)
    return (
      <Center className="wave-page">
        <Stack align="center" gap="sm">
          <Loader color="indigo" size="md" />
        </Stack>
      </Center>
    );

  if (poll_query.error)
    return (
      <Container size="md" className="wave-page">
        <WaveAlert type="error" message={poll_query.error} />
      </Container>
    );

  if (!poll_query.data) return null;

  const is_owner_view =
    owner_polls_query.data?.some((poll) => poll.id === params.poll_id) ?? false;

  const show_realtime_indicator =
    poll_query.data.status === "live" && !is_poll_ended(poll_query.data);

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
              poll={poll_query.data}
              is_owner_view={is_owner_view}
            />
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text size="sm" c="dimmed">
                {`Last updated ${dayjs(poll_query.data.last_voted_at ?? poll_query.data.created_at).fromNow()}`}
              </Text>
              <NewPollButton />
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
