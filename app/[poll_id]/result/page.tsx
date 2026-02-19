"use client";

import { Container, Group, Paper, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { PollResultContent } from "@/app/[poll_id]/result/poll-result-content";
import { NewPollButton } from "@/components/new-poll-button";
import { WavePollHeader } from "@/components/wavepoll-header";
import { useQuery } from "@/hooks/use-query";

export default async function PollResultPage() {
  const params = useParams<{ poll_id: string }>();
  const query = useQuery("poll", [params.poll_id], {
    enabled: !!params.poll_id
  });

  return (
    <div className="wave-page">
      <Container size="md">
        <Paper className="wave-slide-up">
          <Stack gap="sm">
            <WavePollHeader title="Results" />
            {query.data && <PollResultContent poll={query.data} />}
            <Group justify="space-between" style={{ width: "100%" }}>
              <Text size="sm" c="dimmed">
                Last updated{" "}
                {query.data ? dayjs(query.data.updated_at).fromNow() : "-"}
              </Text>
              <NewPollButton />
            </Group>
          </Stack>
        </Paper>
      </Container>
    </div>
  );
}
