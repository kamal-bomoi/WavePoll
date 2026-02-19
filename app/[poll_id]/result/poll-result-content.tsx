"use client";

import {
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { IconChartBar, IconDownload, IconUser } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { SharePollButton } from "@/app/[poll_id]/share-poll-button";
import type { Poll } from "@/types";
import { PollEndedAlert } from "../poll-ended-alert";
import { PollTimeRemaining } from "../poll-time-remaining";
import { PollOption } from "./poll-option";

function download_csv(poll: Poll) {
  const rows = [
    ["option", "votes"],
    ...poll.options.map((option) => [option.value, `${option.votes}`])
  ];
  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `${poll.id}-breakdown.csv`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function PollResultContent({ poll }: { poll: Poll }) {
  const router = useRouter();
  const has_ended = !!poll.end_at && new Date(poll.end_at) <= new Date();

  const total_votes = poll.options.reduce<number>((acc, cur) => acc + cur.votes, 0);
  const participation = Math.round((total_votes / Math.max(poll.presence, 1)) * 100);

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Badge color="indigo" variant="light">
          Live analytics
        </Badge>
        <Group gap={8}>
          <IconUser size={14} />
          <Text size="sm">{poll.presence} viewers</Text>
        </Group>
      </Group>

      {has_ended ? <PollEndedAlert /> : !!poll.end_at && <PollTimeRemaining time={poll.end_at} on_complete={() => null} />}

      <Title order={2}>{poll.title}</Title>
      <Text c="dimmed">{poll.description}</Text>
      <Divider />

      {poll.options.length > 0 && (
        <Stack gap={10}>
          {poll.options.map((option) => (
            <PollOption key={option.id} option={option} total={total_votes} />
          ))}
        </Stack>
      )}

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Paper withBorder radius="md" p="md">
          <Text size="xs" c="dimmed">
            Total votes
          </Text>
          <Title order={3}>{poll.total_votes}</Title>
        </Paper>
        <Paper withBorder radius="md" p="md">
          <Text size="xs" c="dimmed">
            Participation
          </Text>
          <Title order={3}>{participation}%</Title>
        </Paper>
        <Paper withBorder radius="md" p="md">
          <Text size="xs" c="dimmed">
            Reactions
          </Text>
          <Title order={3}>{poll.reactions_count}</Title>
        </Paper>
      </SimpleGrid>

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

      <Group justify="space-between" pt={4} wrap="wrap" gap="sm">
        <Group wrap="wrap">
          <Button
            leftSection={<IconChartBar size={16} />}
            onClick={() => router.push(`/${poll.id}` as any)}
            variant="outline"
          >
            Back to vote
          </Button>
          <SharePollButton />
        </Group>
        <Button
          variant="subtle"
          leftSection={<IconDownload size={16} />}
          onClick={() => download_csv(poll)}
        >
          Export CSV
        </Button>
      </Group>
    </Stack>
  );
}
