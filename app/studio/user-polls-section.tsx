import { Divider, Group, Loader, Stack, Text } from "@mantine/core";
import { AbsoluteCenter } from "@/components/absolute-center";
import { WaveAlert } from "@/components/wave-alert";
import { useQuery } from "@/hooks/use-query";
import { UserPollCard } from "./user-poll-card";

export function UserPollsSection() {
  const { data, error, isFetching } = useQuery("polls");

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
          {error && <WaveAlert type="error" message={error} />}
          {!error && !data?.length ? (
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
