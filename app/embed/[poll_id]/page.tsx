import { Container, Paper, Stack, Text } from "@mantine/core";
import { notFound } from "next/navigation";
import { VotePollForm } from "@/app/[poll_id]/vote-poll-form";
import { get_mock_poll } from "@/lib/mock-polls";

export default async function EmbedPollPage({
  params
}: {
  params: Promise<{ poll_id: string }>;
}) {
  const { poll_id } = await params;
  const poll = get_mock_poll(poll_id);

  if (!poll) notFound();

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
