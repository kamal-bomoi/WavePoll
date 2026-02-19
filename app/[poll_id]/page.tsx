import {
  Badge,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import { notFound } from "next/navigation";
import { NewPollButton } from "@/components/new-poll-button";
import { WavePollHeader } from "@/components/wavepoll-header";
import { Supabase } from "@/lib/supabase/client";
import type { PollWithOptions } from "@/types";
import { topoll } from "@/utils/poll";
import { VotePollForm } from "./vote-poll-form";

export default async function VotePollPage({
  params
}: PageProps<"/[poll_id]">) {
  const { poll_id } = await params;
  const supabase = Supabase();

  const { data, error } = await supabase
    .from("polls")
    .select("*, options(id,value,created_at)")
    .eq("id", poll_id)
    .single<PollWithOptions>();

  if (error) throw new Error("Failed to fetch poll.");

  if (!data) notFound();

  const poll = topoll(data);

  return (
    <div className="wave-page">
      <Container size="md">
        <Paper className="wave-slide-up">
          <Stack gap="sm">
            <WavePollHeader title="Voting room" />
            <Group justify="space-between">
              <Badge color="indigo" variant="light">
                {poll.status}
              </Badge>
              <Group gap={6}>
                <ThemeIcon size="sm" variant="light" color="indigo">
                  <IconUsers size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {poll.presence} viewing
                </Text>
              </Group>
            </Group>

            <Title order={2}>{poll.title}</Title>
            <Text c="dimmed">{poll.description}</Text>

            <VotePollForm poll={poll} />

            <Group justify="space-between" pt={8}>
              <Text size="sm" c="dimmed">
                Created {dayjs(poll.created_at).fromNow()}
              </Text>
              <NewPollButton />
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
