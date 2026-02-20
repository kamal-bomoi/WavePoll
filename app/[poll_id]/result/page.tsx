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

export default function ResultPage() {
  const params = useParams<{ poll_id: string }>();
  const [poll_ids] = useLocalPollIds();
  const is_owner_view = !!poll_ids?.includes(params.poll_id);
  const query = useQuery("poll", [params.poll_id], {
    enabled: !!params.poll_id
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
