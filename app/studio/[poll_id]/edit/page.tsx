"use client";

import { Center, Container, Loader, Stack } from "@mantine/core";
import { useParams } from "next/navigation";
import { EditPollView } from "@/app/studio/[poll_id]/edit-poll-view";
import { WaveAlert } from "@/components/wave-alert";
import { usePollQuery } from "@/hooks/use-poll-query";
import { useQuery } from "@/hooks/use-query";

export default function EditPollPage() {
  const params = useParams<{ poll_id: string }>();
  const poll_query = usePollQuery(params.poll_id);
  const owner_polls_query = useQuery("polls");
  const owner_poll = owner_polls_query.data?.find(
    (poll) => poll.id === params.poll_id
  );

  if (poll_query.isLoading || owner_polls_query.isLoading)
    return (
      <Center className="wave-page">
        <Stack align="center" gap="sm">
          <Loader color="indigo" size="md" />
        </Stack>
      </Center>
    );

  if (poll_query.error || owner_polls_query.error)
    return (
      <Container size="md" className="wave-page">
        <WaveAlert
          type="error"
          message={
            owner_polls_query.error ??
            poll_query.error ??
            "An unexpected error occurred."
          }
        />
      </Container>
    );

  if (!poll_query.data) return null;

  return (
    <div className="wave-page">
      <Container size="lg">
        <EditPollView
          poll={poll_query.data}
          is_owner_view={!!owner_poll}
          initial_owner_email={owner_poll?.owner_email ?? null}
        />
      </Container>
    </div>
  );
}
