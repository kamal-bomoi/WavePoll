"use client";

import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { IconChartBar, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SharePollButton } from "@/app/studio/share-poll-button";
import { usePollEndState } from "@/hooks/use-poll-end-state";
import type { Poll } from "@/types";
import { calculate_reactions_count } from "@/utils/poll-generic";
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
  const participation =
    poll.presence > 0
      ? Math.min(
          100,
          Math.round((poll.total_votes / Math.max(poll.presence, 1)) * 100)
        )
      : null;

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

      {!!poll.options.length && poll.type !== "image" && (
        <Stack gap={10}>
          {poll.options.map((option) => (
            <PollOption key={option.id} option={option} total={total_votes} />
          ))}
        </Stack>
      )}

      {!!poll.options.length && poll.type === "image" && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {poll.options.map((option) => (
            <Card key={option.id} withBorder radius="md" p="sm">
              <PollOption option={option} total={total_votes} is_image />
            </Card>
          ))}
        </SimpleGrid>
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

      <SimpleGrid cols={{ base: 1, sm: poll.reaction_emojis?.length ? 3 : 2 }}>
        <StatCard label="Total votes" value={poll.total_votes} />
        <StatCard
          label="Participation"
          value={participation ? `${participation}%` : "-"}
        />

        {!!poll.reaction_emojis?.length && (
          <StatCard label="Reactions" value={calculate_reactions_count(poll)} />
        )}
      </SimpleGrid>

      {!!poll.reaction_emojis?.length && !!poll.reaction_breakdown.length && (
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

      <EmbedSnippet poll_id={poll.id} />

      <Group justify="space-between" pt={4} wrap="wrap" gap="sm">
        <Group wrap="wrap">
          <Button
            leftSection={<IconChartBar size={16} />}
            onClick={() => router.push(`/studio/${poll.id}`)}
            variant="outline"
          >
            Go to vote
          </Button>
          <SharePollButton />
        </Group>
        <ExportCSVButton
          poll={poll}
          has_ended={has_ended}
          is_owner_view={is_owner_view}
        />
      </Group>
    </Stack>
  );
}
