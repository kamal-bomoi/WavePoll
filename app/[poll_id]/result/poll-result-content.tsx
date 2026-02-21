"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { IconChartBar, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SharePollButton } from "@/app/[poll_id]/share-poll-button";
import { usePollEndState } from "@/hooks/use-poll-end-state";
import type { Poll } from "@/types";
import { ExportCSVButton } from "../export-csv-button";
import { PollEndedAlert } from "../poll-ended-alert";
import { PollTimeRemaining } from "../poll-time-remaining";
import { EmbedSnippet } from "./embed-snippet";
import { PollOption } from "./poll-option";
import { StatCard } from "./stat-card";
import { TextResponses } from "./text-responses";

export function PollResultContent({
  poll,
  is_owner_view
}: {
  poll: Poll;
  is_owner_view: boolean;
}) {
  const router = useRouter();
  const [has_ended, end] = usePollEndState(poll);
  const total_votes = poll.options.reduce<number>(
    (acc, cur) => acc + cur.votes,
    0
  );
  const participation = Math.min(
    100,
    Math.round((poll.total_votes / Math.max(poll.presence, 1)) * 100)
  );

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Badge color="indigo" variant="light">
          Live analytics
        </Badge>
        <Group gap={8}>
          <IconUser size={14} />
          <Text size="sm">{poll.presence || "-"} viewers</Text>
        </Group>
      </Group>

      {has_ended ? (
        <PollEndedAlert />
      ) : (
        <PollTimeRemaining time={poll.end_at} on_complete={end} />
      )}

      <Title order={2}>{poll.title}</Title>
      <Text c="dimmed">{poll.description}</Text>
      <Divider />

      {!!poll.options.length && (
        <Stack gap={10}>
          {poll.options.map((option) => (
            <PollOption key={option.id} option={option} total={total_votes} />
          ))}
        </Stack>
      )}

      {poll.type === "rating" && (
        <StatCard
          label="Average rating"
          value={
            typeof poll.rating_average === "number"
              ? `${poll.rating_average.toFixed(1)} / 5`
              : "-"
          }
        />
      )}

      {poll.type === "text" && (
        <Stack gap={8}>
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Responses
            </Text>
            <Badge size="sm" variant="light" color="indigo">
              {poll.text_responses_count}
            </Badge>
          </Group>

          <TextResponses poll={poll} is_owner_view={is_owner_view} />
        </Stack>
      )}

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatCard label="Total votes" value={poll.total_votes} />
        <StatCard label="Participation" value={`${participation}%`} />
        {!!poll.reaction_emojis?.length && (
          <StatCard label="Reactions" value={poll.reactions_count} />
        )}
      </SimpleGrid>

      {!!poll.reaction_emojis?.length && (
        <Stack gap={8}>
          <Text size="sm" fw={600}>
            Reaction breakdown
          </Text>
          <Group gap={8}>
            {poll.reaction_breakdown.map((reaction) => (
              <Badge
                key={reaction.emoji}
                variant="light"
                size="lg"
                color="indigo"
              >
                {reaction.emoji} {reaction.count}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}

      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm" fw={600}>
            Realtime ingestion progress
          </Text>
          <Text size="sm" c="dimmed">
            92%
          </Text>
        </Group>
        <Progress color="indigo" value={92} radius="xl" size="lg" animated />
      </Stack>

      <EmbedSnippet poll_id={poll.id} />

      <Group justify="space-between" pt={4} wrap="wrap" gap="sm">
        <Group wrap="wrap">
          <Button
            leftSection={<IconChartBar size={16} />}
            onClick={() => router.push(`/${poll.id}`)}
            variant="outline"
          >
            Go to vote
          </Button>
          <SharePollButton />
        </Group>
        <ExportCSVButton poll={poll} has_ended={has_ended} />
      </Group>
    </Stack>
  );
}
