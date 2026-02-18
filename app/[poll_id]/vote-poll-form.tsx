"use client";

import {
  Alert,
  Button,
  Checkbox,
  Group,
  Radio,
  Rating,
  Stack,
  Text,
  Textarea
} from "@mantine/core";
import { IconDownload, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Poll } from "@/types";
import { PollEndedAlert } from "./poll-ended-alert";
import { PollTimeRemaining } from "./poll-time-remaining";
import { SharePollButton } from "./share-poll-button";

function download_csv(poll: Poll) {
  const headers = ["poll_id", "title", "type", "total_votes"];
  const line = [poll.id, `"${poll.title}"`, poll.type, `${poll.total_votes}`];
  const csv = `${headers.join(",")}\n${line.join(",")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = `${poll.id}-results.csv`;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function VotePollForm({ poll }: { poll: Poll }) {
  const [single_choice, set_single_choice] = useState<string | null>(null);
  const [multiple_choices, set_multiple_choices] = useState<string[]>([]);
  const [rating, set_rating] = useState<number>(0);
  const [comment, set_comment] = useState("");
  const [ended, set_ended] = useState(false);
  const [voted, set_voted] = useState(false);
  const [reaction, set_reaction] = useState<string | null>(null);
  const router = useRouter();

  const has_time_ended = useMemo(
    () => !!poll.end_at && new Date(poll.end_at) <= new Date(),
    [poll.end_at]
  );
  const has_ended = ended || has_time_ended || poll.lifecycle === "ended";

  const can_submit = useMemo(() => {
    if (has_ended) return false;
    if (poll.type === "single") return !!single_choice;
    if (poll.type === "multiple") return multiple_choices.length > 0;
    if (poll.type === "rating") return rating > 0;
    if (poll.type === "text") return comment.trim().length > 2;
    return false;
  }, [
    comment,
    has_ended,
    multiple_choices.length,
    poll.type,
    rating,
    single_choice
  ]);
  const reactions_enabled = Array.isArray(poll.reaction_emojis);
  const reaction_options = poll.reaction_emojis ?? [];

  return (
    <Stack gap="md" mt={8}>
      {!has_ended && !!poll.end_at && (
        <PollTimeRemaining
          time={poll.end_at}
          on_complete={() => set_ended(true)}
        />
      )}

      {has_ended && <PollEndedAlert />}

      {poll.type === "single" && (
        <Radio.Group value={single_choice} onChange={set_single_choice}>
          <Stack gap={10}>
            {poll.options.map((option) => (
              <Radio
                key={option.id}
                value={option.id}
                label={option.label}
                disabled={has_ended || voted}
              />
            ))}
          </Stack>
        </Radio.Group>
      )}

      {poll.type === "multiple" && (
        <Stack gap={10}>
          {poll.options.map((option) => (
            <Checkbox
              key={option.id}
              label={option.label}
              checked={multiple_choices.includes(option.id)}
              disabled={has_ended || voted}
              onChange={(event) => {
                if (event.currentTarget.checked) {
                  set_multiple_choices((current) => [...current, option.id]);
                  return;
                }
                set_multiple_choices((current) =>
                  current.filter((value) => value !== option.id)
                );
              }}
            />
          ))}
        </Stack>
      )}

      {poll.type === "rating" && (
        <Group>
          <Rating
            value={rating}
            onChange={set_rating}
            count={5}
            size="xl"
            readOnly={has_ended || voted}
          />
          <Text c="dimmed" size="sm">
            {rating > 0 ? `${rating}/5` : "Select a score"}
          </Text>
        </Group>
      )}

      {poll.type === "text" && (
        <Textarea
          minRows={4}
          maxRows={6}
          placeholder="Share your suggestion..."
          value={comment}
          onChange={(event) => set_comment(event.currentTarget.value)}
          disabled={has_ended || voted}
        />
      )}

      {reactions_enabled && (
        <Group gap={8} wrap="wrap">
          {reaction_options.map((emoji) => (
            <Button
              key={emoji}
              size="compact-md"
              variant={reaction === emoji ? "filled" : "light"}
              onClick={() => set_reaction(emoji)}
            >
              {emoji}
            </Button>
          ))}
          <Text size="sm" c="dimmed">
            {poll.reactions_count + (reaction ? 1 : 0)} reactions
          </Text>
        </Group>
      )}

      {voted && (
        <Alert color="lime" variant="light" icon={<IconSparkles size={16} />}>
          Vote submitted. In v2 backend phase this will sync through Supabase
          Realtime.
        </Alert>
      )}

      <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
        <Group wrap="wrap">
          <Button
            disabled={!can_submit || voted}
            onClick={() => set_voted(true)}
          >
            Submit vote
          </Button>
          <SharePollButton disabled={has_ended} />
        </Group>

        <Group wrap="wrap">
          <Button
            variant="outline"
            color="indigo"
            onClick={() => router.push(`/${poll.id}/result` as any)}
          >
            View results
          </Button>
          <Button
            variant="subtle"
            leftSection={<IconDownload size={16} />}
            onClick={() => download_csv(poll)}
          >
            Export CSV
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
