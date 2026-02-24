"use client";

import {
  Badge,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { WavePollHeader } from "@/app/app/wavepoll-header";
import { NewPollButton } from "@/components/new-poll-button";
import { RealtimeIndicator } from "@/components/realtime-indicator";
import { WaveAlert } from "@/components/wave-alert";
import { usePollQuery } from "@/hooks/use-poll-query";
import { is_poll_ended } from "@/utils/poll-generic";
import { VoteForm } from "./vote-form";

export default function VotePollPage() {
  const params = useParams<{ poll_id: string }>();
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
              <WavePollHeader title="Voting room" />
              <Group justify="space-between">
                <Group gap={8}>
                  <Badge color="indigo" variant="light">
                    {query.data.status}
                  </Badge>
                  {show_realtime_indicator && <RealtimeIndicator />}
                </Group>
                <Group gap={6}>
                  <ThemeIcon size="sm" variant="light" color="indigo">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    {query.data.presence || "-"} viewing
                  </Text>
                </Group>
              </Group>

              <Title order={2}>{query.data.title}</Title>
              <Text c="dimmed">{query.data.description}</Text>

              <VoteForm poll={query.data} />

              <Group justify="space-between" pt={8}>
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
