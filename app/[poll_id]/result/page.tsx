import { Container, Group, Paper, Space, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { PollResultContent } from "@/app/[poll_id]/result/poll-result-content";
import { NewPollButton } from "@/components/new-poll-button";
import type { Poll } from "@/types";
import { nanoid } from "@/utils/nanoid";

export default async function PollResultPage({
  searchParams
}: PageProps<"/[poll_id]/result">) {
  await searchParams;

  // todo v2: fetch poll from database
  const poll: Poll = {
    id: nanoid({ length: 8 }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date(2026, 1, 22).toISOString(),
    title: "Some Poll Title",
    options: [
      { id: nanoid(), votes: 0, value: "Value 1" },
      { id: nanoid(), votes: 0, value: "Value 2" }
    ]
  };

  return (
    <Container size="md">
      <Paper
        p="xl"
        shadow="sm"
        radius="md"
        style={{
          marginTop: 60,
          position: "relative",
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        <Stack gap="sm">
          <PollResultContent poll={poll} />

          <Space h="md" />
          <Group justify="space-between" style={{ width: "100%" }}>
            <Text size="sm">
              last updated {dayjs(poll.updated_at).fromNow()}
            </Text>
            <NewPollButton />
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
