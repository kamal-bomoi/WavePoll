import { Container, Paper, Stack, Text } from "@mantine/core";
import { VotePollForm } from "@/app/[poll_id]/vote-poll-form";
import type { Poll } from "@/types";

export default async function EmbedPollPage({ poll }: { poll: Poll }) {
  return (
    <Container size="sm" py="md">
      <Paper p="md" radius="md" withBorder>
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Embedded via iframe
          </Text>
          <VotePollForm poll={poll} />
        </Stack>
      </Paper>
    </Container>
  );
}
