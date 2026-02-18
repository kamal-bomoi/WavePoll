import {
  Box,
  Container,
  Divider,
  Group,
  Paper,
  Space,
  Stack,
  Text,
  Title
} from "@mantine/core";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { NewPollButton } from "@/components/new-poll-button";
import type { Poll } from "@/types";
import { nanoid } from "@/utils/nanoid";
import { VotePollForm } from "./vote-poll-form";

export default async function VotePollPage({
  searchParams
}: PageProps<"/[poll_id]">) {
  await searchParams;

  // todo v2: fetch poll from database
  const poll: Poll = {
    id: nanoid({ length: 8 }),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    expires_at: new Date(2026, 1, 22).toISOString(),
    title: "Some Poll Title",
    options: []
  };

  if (!poll) notFound();

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
        <Stack gap="xs">
          <Box>
            <Title c="indigo" ta="center" order={3}>
              vote
            </Title>
            <Divider color="dark" />
          </Box>

          <VotePollForm poll={poll} />

          <Space />
          <Group justify="space-between">
            <Text size="sm" c="indigo" fw={500}>
              created {dayjs(poll.created_at).fromNow()}
            </Text>
            <NewPollButton />
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
