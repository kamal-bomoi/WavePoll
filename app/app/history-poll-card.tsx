import { Badge, Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { SharePollButton } from "@/app/app/share-poll-button";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";

export function HistoryPollCard({ poll }: { poll: Poll }) {
  const has_ended = is_poll_ended(poll);

  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap="md">
        <Box>
          <Text size="sm" fw={600}>
            {poll.title}
          </Text>
          {!!poll.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {poll.description}
            </Text>
          )}
          <Group gap={6}>
            <Badge size="xs" variant="light" color="indigo">
              {poll.status}
            </Badge>
            <Badge size="xs" variant="outline" color="gray">
              {poll.type}
            </Badge>
            <Text size="xs" c={has_ended ? "red" : "dimmed"}>
              {format_end_status(poll.end_at, has_ended)}
            </Text>
          </Group>
        </Box>

        <Group gap={8} wrap="wrap">
          <SharePollButton url={`/${poll.id}`} size="compact-sm" />
          <Button
            component={Link}
            size="compact-sm"
            variant="subtle"
            leftSection={<IconEye size={14} />}
            href={`/app/${poll.id}` as any}
          >
            Open
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

function format_end_status(value: Date, has_ended: boolean): string {
  const label = has_ended ? "Ended" : "Ends";

  return `${label} ${value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  })}`;
}
