import { Divider, Group, Loader, Stack, Text } from "@mantine/core";
import { AbsoluteCenter } from "@/components/absolute-center";
import { WaveAlert } from "@/components/wave-alert";
import { useQuery } from "@/hooks/use-query";
import { UserPollCard } from "./user-poll-card";

/**
 * Renders the user's polls section with a header, loading state, error handling, empty-state message, and a list of polls.
 *
 * @returns A React element containing a "Your polls" divider, a centered loading indicator while polls are being fetched, an error alert if fetching fails, a centered message when there are no polls, or a list of UserPollCard components for each poll.
 */
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
