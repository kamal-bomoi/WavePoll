import { Button, Group, Loader, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { AbsoluteCenter } from "@/components/absolute-center";
import { useLocalHistoryPollIds } from "@/hooks/use-local-history-poll-ids";
import { useQuery } from "@/hooks/use-query";
import { HistoryPollCard } from "./history-poll-card";

export function HistoryPollsSection() {
  const [history_ids, set_history_ids] = useLocalHistoryPollIds();
  const { data, isFetching } = useQuery(
    "history_polls",
    [history_ids as string[]],
    {
      enabled: !!history_ids?.length
    }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: set_history_ids is a stable state setter
  useEffect(() => {
    if (data) set_history_ids(data.map((poll) => poll.id));
  }, [data]);

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text fw={600} size="sm">
          History
        </Text>
        <Button
          size="compact-xs"
          variant="subtle"
          color="gray"
          disabled={!history_ids?.length}
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to clear your poll history?"
              )
            )
              set_history_ids([]);
          }}
        >
          Clear history
        </Button>
      </Group>
      <Stack gap={8}>
        {isFetching && (
          <AbsoluteCenter>
            <Group align="center">
              <Loader color="indigo" size="sm" type="dots" />
              <Text c="dimmed" size="sm">
                Loading poll history...
              </Text>
            </Group>
          </AbsoluteCenter>
        )}

        <Stack gap="lg">
          {!history_ids?.length ? (
            <Text c="dimmed" size="sm" ta="center">
              No recent poll history yet.
            </Text>
          ) : data && !data.length ? (
            <Text c="dimmed" size="sm" ta="center">
              No recent poll history yet.
            </Text>
          ) : (
            data?.map((poll) => <HistoryPollCard key={poll.id} poll={poll} />)
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
