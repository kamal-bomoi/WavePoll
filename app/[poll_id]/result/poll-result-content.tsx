"use client";

import {
  Button,
  Divider,
  Group,
  Space,
  Stack,
  Text,
  Title
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SharePollButton } from "@/app/[poll_id]/share-poll-button";
import type { Poll } from "@/types";
import { PollEndedAlert } from "../poll-ended-alert";
import { PollTimeRemaining } from "../poll-time-remaining";
import { PollOption } from "./poll-option";

export function PollResultContent({ poll }: { poll: Poll }) {
  const [ended, set_ended] = useState(false);
  const router = useRouter();

  // const has_ended = ended || poll.status === "ended";

  // todo v2: we need to calculate if poll has expired based on the
  //  expires_at property. v1 we had a dedicated status property, we dont
  //  need that in v2
  const has_ended =
    ended || (poll.expires_at && new Date(poll.expires_at) > new Date());

  const total_votes = poll.options.reduce<number>(
    (acc, cur) => acc + cur.votes,
    0
  );

  return (
    <Stack gap="sm">
      {has_ended ? (
        <PollEndedAlert />
      ) : (
        !!poll.expires_at && (
          <PollTimeRemaining
            time={poll.expires_at}
            on_complete={() => set_ended(true)}
          />
        )
      )}

      <Title c="indigo" order={3}>
        {poll.title}
      </Title>
      <Divider color="gray" />

      <Stack gap={12}>
        {poll.options.map((option) => (
          <PollOption key={option.id} option={option} total={total_votes} />
        ))}
      </Stack>

      <Space />
      <Text style={{ alignSelf: "end" }} fw={700} size="sm">
        total votes: {total_votes}
      </Text>
      <Space h="md" />

      <Group justify="space-between" style={{ width: "100%" }}>
        <Button
          color="indigo"
          onClick={() => router.push(`/${poll.id}`)}
          disabled={!!has_ended}
        >
          vote
        </Button>
        <SharePollButton />
      </Group>
    </Stack>
  );
}
