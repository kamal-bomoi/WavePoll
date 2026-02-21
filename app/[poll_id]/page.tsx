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
import { NewPollButton } from "@/components/new-poll-button";
import { WaveAlert } from "@/components/wave-alert";
import { WavePollHeader } from "@/components/wavepoll-header";
import { useQuery } from "@/hooks/use-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";
import { VoteForm } from "./vote-form";

export default function VotePollPage() {
  const params = useParams<{ poll_id: string }>();
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
              <WavePollHeader title="Voting room" />
              <Group justify="space-between">
                <Badge color="indigo" variant="light">
                  {query.data.status}
                </Badge>
                <Group gap={6}>
                  <ThemeIcon size="sm" variant="light" color="indigo">
                    <IconUsers size={14} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    {query.data.presence} viewing
                  </Text>
                </Group>
              </Group>

              <Title order={2}>{query.data.title}</Title>
              <Text c="dimmed">{query.data.description}</Text>

              <VoteForm poll={query.data} />

              <Group justify="space-between" pt={8}>
                <Text size="sm" c="dimmed">
                  Created {dayjs(query.data.created_at).fromNow()}
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
