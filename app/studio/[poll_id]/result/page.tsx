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

/**
 * Render the poll results page for the poll identified by the `poll_id` route parameter.
 *
 * Renders a centered loader while the poll is loading, an error alert if the query fails, or the results layout when data is available. The results layout includes a header, an optional realtime indicator when the poll is live and not ended, the poll results content (with owner view detection), a last-updated timestamp, and a button to create a new poll.
 *
 * @returns The page's JSX element: either a loading view, an error view, or the poll results layout with header, realtime indicator (when applicable), results content, last-updated time, and a new-poll button.
 */
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
