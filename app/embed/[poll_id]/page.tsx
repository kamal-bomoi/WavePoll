"use client";

import {
  Badge,
  Center,
  Divider,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconWaveSine } from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { PollOption } from "@/app/app/[poll_id]/result/poll-option";
import { VoteForm } from "@/app/app/[poll_id]/vote-form";
import { WaveAlert } from "@/components/wave-alert";
import { useQuery } from "@/hooks/use-query";

export default function EmbedPollPage() {
  const params = useParams<{ poll_id: string }>();
  const query = useQuery("poll", [params.poll_id], {
    enabled: !!params.poll_id
  });

  if (query.isLoading)
    return (
      <Center p="md">
        <Loader color="indigo" size="sm" />
      </Center>
    );

  if (query.error) return <WaveAlert type="error" message={query.error} />;

  if (!query.data) return null;

  const poll = query.data;

  return (
    <Paper p="md" radius="md" withBorder>
      <Stack gap="md">
        <Group gap={10}>
          <ThemeIcon size={34} radius="xl" color="indigo">
            <IconWaveSine size={18} />
          </ThemeIcon>
          <Text fw={800}>WavePoll</Text>
        </Group>
        <Title order={4}>{poll.title}</Title>
        {!!poll.description && (
          <Text c="dimmed" size="sm">
            {poll.description}
          </Text>
        )}
        <VoteForm poll={poll} mode="embed" />
        <Divider />
        <Stack gap={8}>
          <Group justify="space-between">
            <Badge variant="light" color="indigo">
              Results
            </Badge>
            <Text size="sm" c="dimmed">
              {poll.total_votes} votes
            </Text>
          </Group>

          {poll.type === "single" && (
            <Stack gap={8}>
              {poll.options.map((option) => (
                <PollOption
                  key={option.id}
                  option={option}
                  total={poll.total_votes}
                />
              ))}
            </Stack>
          )}

          {poll.type === "rating" && (
            <Text size="sm">
              Average rating:{" "}
              <b>
                {typeof poll.rating_average === "number"
                  ? `${poll.rating_average.toFixed(1)} / 5`
                  : "-"}
              </b>
            </Text>
          )}

          {poll.type === "text" && (
            <Text size="sm">
              Text responses: <b>{poll.text_responses_count}</b>
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
