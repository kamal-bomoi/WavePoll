import { Container, Group, Paper, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { PollResultContent } from "@/app/[poll_id]/result/poll-result-content";
import { NewPollButton } from "@/components/new-poll-button";
import { WavePollHeader } from "@/components/wavepoll-header";
import { get_mock_poll } from "@/lib/mock-polls";

export default async function PollResultPage({
  params
}: PageProps<"/[poll_id]/result">) {
  const { poll_id } = await params;
  const poll = get_mock_poll(poll_id);

  if (!poll) notFound();

  return (
    <div className="wave-page">
      <Container size="md">
        <Paper className="wave-slide-up">
          <Stack gap="sm">
            <WavePollHeader title="Results" />
            <PollResultContent poll={poll} />
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text size="sm" c="dimmed">
                Last updated {dayjs(poll.updated_at).fromNow()}
              </Text>
              <NewPollButton />
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
