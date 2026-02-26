import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import Link from "next/link";
import { SharePollButton } from "@/app/studio/share-poll-button";
import type { Poll } from "@/types";
import { is_poll_ended } from "@/utils/poll-generic";
import { DeletePollButton } from "./delete-poll-button";
import { EditPollButton } from "./edit-poll-button";

/**
 * Renders a card summarizing a poll with its title, optional description, status and type badges, end time, and action controls.
 *
 * @param poll - The poll object to display.
 * @returns A UI card element showing poll details and action buttons (edit, delete, share, open); the edit action is shown only for polls with status `"draft"` that have not ended.
 */
export function UserPollCard({ poll }: { poll: Poll }) {
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

        <Flex gap={8} align="center" wrap="wrap">
          <Group gap={8} wrap="wrap">
            {poll.status === "draft" && !has_ended && (
              <EditPollButton poll_id={poll.id} />
            )}

            <DeletePollButton poll={poll} />
          </Group>

          <Group gap={8} wrap="wrap">
            <SharePollButton url={`/studio/${poll.id}`} size="compact-sm" />
            <Button
              component={Link}
              size="compact-sm"
              variant="subtle"
              leftSection={<IconEye size={14} />}
              href={`/studio/${poll.id}/result` as any}
            >
              Open
            </Button>
          </Group>
        </Flex>
      </Stack>
    </Paper>
  );
}

/**
 * Produces a localized end-time label prefixed with "Ended" or "Ends".
 *
 * @param value - The end date/time to format.
 * @param has_ended - Whether the item has already ended.
 * @returns A string like `Ends Mar 5, 2026, 3:30 PM` or `Ended Mar 5, 2026, 3:30 PM` formatted for en-US.
 */
function format_end_status(value: Date, has_ended: boolean): string {
  const label = has_ended ? "Ended" : "Ends";

  return `${label} ${value.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  })}`;
}
