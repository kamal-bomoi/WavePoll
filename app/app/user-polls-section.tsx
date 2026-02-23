import { Divider, Group, Loader, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { AbsoluteCenter } from "@/components/absolute-center";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { useQuery } from "@/hooks/use-query";
import { UserPollCard } from "./user-poll-card";

export function UserPollsSection() {
  const [poll_ids, set_poll_ids] = useLocalPollIds();
  const { data, isFetching } = useQuery("polls", [poll_ids as string[]], {
    enabled: !!poll_ids
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: set_poll_ids is a stable state setter
  useEffect(() => {
    if (data) set_poll_ids(data.map((poll) => poll.id));
  }, [data]);

  return (
    <Stack gap="md">
      <Divider label="Your polls" />
      <Stack gap={8}>
        {isFetching && (
          <AbsoluteCenter>
            <Group align="center">
              <Loader color="indigo" size="sm" type="dots" />
              <Text c="dimmed" size="sm">
                Loading your polls...
              </Text>
            </Group>
          </AbsoluteCenter>
        )}
        <Stack gap="lg">
          {data && !data?.length ? (
            <Text c="dimmed" size="sm" ta="center">
              You haven't created any polls yet.
            </Text>
          ) : (
            data?.map((poll) => <UserPollCard key={poll.id} poll={poll} />)
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
