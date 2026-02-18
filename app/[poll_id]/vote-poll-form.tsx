"use client";

import { Button, Group, Radio, Space, Stack } from "@mantine/core";
import { IconArrowBigUp } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import type { ApiError, Poll, VotePollPayload } from "@/types";
import { PollTimeRemaining } from "./poll-time-remaining";
import { SharePollButton } from "./share-poll-button";

export function VotePollForm({ poll }: { poll: Poll }) {
  const [value, set_value] = useState<string>();
  const [ended, set_ended] = useState(false);
  const router = useRouter();
  const mutation = useMutation<
    { poll: Poll; vid: string },
    ApiError,
    VotePollPayload
  >({
    mutationFn: async (variables) =>
      (
        await api.patch<{ poll: Poll; vid: string }>(
          `/polls/${poll.id}`,
          variables
        )
      ).data
  });

  return (
    <Stack gap="xs">
      {!!poll.expires_at && (
        <PollTimeRemaining
          time={poll.expires_at}
          on_complete={() => set_ended(true)}
        />
      )}

      <Radio.Group
        label={poll.title}
        value={value}
        onChange={set_value}
        withAsterisk
      >
        <Stack gap={12}>
          {poll.options.map((option) => (
            <Radio
              key={option.id}
              value={option.id}
              label={option.value}
              disabled={ended}
            />
          ))}
        </Stack>
      </Radio.Group>
      <Space />

      <Group justify="space-between">
        <Button
          color="indigo"
          onClick={() => {
            if (!value) return;

            mutation.mutate(
              { option_id: value },
              {
                onSuccess: () => {
                  // todo: for v1 we update our tanstack query cache here
                }
              }
            );
          }}
          loading={mutation.isPending}
          disabled={mutation.isPending || ended}
          leftSection={<IconArrowBigUp />}
        >
          vote
        </Button>
        <SharePollButton disabled={ended} />
        <Button
          color="indigo"
          variant="outline"
          onClick={() => router.push(`/${poll.id}/result` as any)}
        >
          result
        </Button>
      </Group>
    </Stack>
  );
}
