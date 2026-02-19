import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Stack,
  Text
} from "@mantine/core";
import Link from "next/link";
import { useEffect } from "react";
import { AbsoluteCenter } from "@/components/absolute-center";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { useQuery } from "@/hooks/use-query";

export function UserPollsSection() {
  const [poll_ids, set_poll_ids] = useLocalPollIds();
  const { data, isSuccess, isFetching } = useQuery(
    "polls",
    [poll_ids as string[]],
    {
      enabled: !!poll_ids
    }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (isSuccess && !!data) set_poll_ids(data.map((poll) => poll.id));
  }, [isSuccess, data]);

  return (
    <Stack gap="md">
      <Divider label="Your polls" />
      <Stack gap={8}>
        {isFetching && (
          <AbsoluteCenter>
            <Group align="cen">
              <Loader color="indigo" size="sm" />
              <Text c="dimmed" size="sm">
                Loading your polls...
              </Text>
            </Group>
          </AbsoluteCenter>
        )}

        <Stack gap="lg">
          {!!data &&
            data.map((poll) => (
              <Group key={poll.id} justify="space-between" wrap="wrap" gap="xs">
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
                    <Text size="xs" c="dimmed">
                      {format_end_at(poll.end_at)}
                    </Text>
                  </Group>
                </Box>
                <Button
                  component={Link}
                  size="xs"
                  variant="subtle"
                  href={`/${poll.id}` as any}
                >
                  Open
                </Button>
              </Group>
            ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

function format_end_at(value: string | null | undefined): string {
  if (!value) return "No end time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No end time";

  return `Ends ${date.toLocaleString()}`;
}
