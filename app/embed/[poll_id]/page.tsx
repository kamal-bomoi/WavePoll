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
import { PollOption } from "@/app/studio/[poll_id]/result/poll-option";
import { VoteForm } from "@/app/studio/[poll_id]/vote-form";
import { RealtimeIndicator } from "@/components/realtime-indicator";
import { WaveAlert } from "@/components/wave-alert";
import { useQuery } from "@/hooks/use-query";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";

/**
 * Render an embeddable poll page showing poll metadata, results, and a voting form.
 *
 * Subscribes to real-time poll events to refresh displayed poll data; handles loading,
 * error, and empty states and conditionally renders results UI by poll type.
 *
 * @returns The rendered embed poll UI as a JSX.Element
 */
export default function EmbedPollPage() {
  const params = useParams<{ poll_id: string }>();
  const update_query = useUpdateQuery();
  const query = useQuery("poll", [params.poll_id], {
    enabled: !!params.poll_id
  });

  useRealtime({
    channels: [`poll:${params.poll_id}`],
    events: ["poll.updated", "poll.ended"],
    enabled: !!query.data?.id,
    onData({ event, data }) {
      if (!query.data?.id) return;

      if (event === "poll.updated" || event === "poll.ended") {
        if (data.id !== query.data.id) return;

        update_query<Poll>(queries.poll.key(query.data.id), (draft) => {
          Object.assign(draft, data);
        });
      }
    }
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
  const show_realtime_indicator =
    poll.status === "live" && !is_poll_ended(poll);

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

        <Stack gap={8}>
          <Group justify="space-between">
            <Group gap={8}>
              <Badge variant="light" color="indigo">
                Results
              </Badge>
              {show_realtime_indicator && <RealtimeIndicator />}
            </Group>
            <Text size="sm" c="dimmed">
              {poll.total_votes} votes
            </Text>
          </Group>

          {(poll.type === "single" || poll.type === "image") && (
            <Stack gap={8}>
              {poll.options.map((option) => (
                <PollOption
                  key={option.id}
                  option={option}
                  total={poll.total_votes}
                  is_image={poll.type === "image"}
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

        <Divider />
        <VoteForm poll={poll} mode="embed" />
      </Stack>
    </Paper>
  );
}
