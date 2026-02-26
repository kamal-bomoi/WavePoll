import { Badge, Box, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { SharePollButton } from "@/app/studio/share-poll-button";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";

/**
 * Renders a compact card summarizing a poll for the studio history list.
 *
 * Displays the poll title, optional single-line description, status and type badges,
 * a localized end/ended timestamp, and actions to share or open the poll.
 *
 * @param poll - The poll object to display (provides title, description, status, type, end_at, id)
 * @returns A JSX element containing the styled poll summary card
 */
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
              {format_end_status(new Date(poll.end_at), has_ended)}
            </Text>
          </Group>
        </Box>

        <Group gap={8} wrap="wrap">
          <SharePollButton url={`/studio/${poll.id}`} size="compact-sm" />
          <Button
            component={Link}
            size="compact-sm"
            variant="subtle"
            leftSection={<IconEye size={14} />}
            href={`/studio/${poll.id}` as any}
          >
            Open
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}

/**
 * Produces a localized end-status label for a poll's end date.
 *
 * @param value - The poll's end date/time
 * @param has_ended - Whether the poll has already ended
 * @returns A string prefixed with "Ended" if `has_ended` is true or "Ends" otherwise, followed by `value` formatted for en-US (medium date, short time)
 */
function format_end_status(value: Date, has_ended: boolean): string {
  const label = has_ended ? "Ended" : "Ends";

  return `${label} ${value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  })}`;
}
