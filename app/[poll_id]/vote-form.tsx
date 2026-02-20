import {
  Button,
  Group,
  Radio,
  Rating,
  Stack,
  Text,
  Textarea
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WaveAlert } from "@/components/wave-alert";
import { useMutation } from "@/hooks/use-mutation";
import { usePollEndState } from "@/hooks/use-poll-end-state";
import type { Poll, VotePayload } from "@/types";
import { MAX_TEXT_RESPONSE_LENGTH } from "@/utils/constants";
import { PollEndedAlert } from "./poll-ended-alert";
import { PollTimeRemaining } from "./poll-time-remaining";
import { SharePollButton } from "./share-poll-button";

export function VoteForm({
  poll,
  mode = "default"
}: {
  poll: Poll;
  mode?: "default" | "embed";
}) {
  const router = useRouter();
  const [option_id, set_option_id] = useState<string | null>(null);
  const [rating, set_rating] = useState<number>(0);
  const [comment, set_comment] = useState("");
  const [reaction, set_reaction] = useState<string | null>(null);
  const mutation = useMutation("vote");
  const [has_ended, end] = usePollEndState(poll);

  const has_voted = mutation.isSuccess;
  const reactions_enabled = Array.isArray(poll.reaction_emojis);
  const reaction_options = poll.reaction_emojis ?? [];
  const can_submit =
    !has_ended &&
    !has_voted &&
    ((poll.type === "single" && !!option_id) ||
      (poll.type === "rating" && rating > 0) ||
      (poll.type === "text" &&
        comment.trim().length > 2 &&
        comment.trim().length <= MAX_TEXT_RESPONSE_LENGTH));

  function vote() {
    if (!can_submit || mutation.isPending) return;

    const payload = (
      poll.type === "single"
        ? { option_id, reaction }
        : poll.type === "rating"
          ? { rating, reaction }
          : { comment: comment.trim(), reaction }
    ) as VotePayload;

    mutation.mutate({
      poll_id: poll.id,
      payload
    });
  }

  return (
    <Stack gap="md" mt={8}>
      {!has_ended && !!poll.end_at && (
        <PollTimeRemaining time={poll.end_at} on_complete={end} />
      )}

      {has_ended && <PollEndedAlert />}

      {poll.type === "single" && (
        <Radio.Group value={option_id} onChange={set_option_id}>
          <Stack gap={10}>
            {poll.options.map((option) => (
              <Radio
                key={option.id}
                value={option.id}
                label={option.value}
                disabled={has_ended || has_voted || mutation.isPending}
              />
            ))}
          </Stack>
        </Radio.Group>
      )}

      {poll.type === "rating" && (
        <Group>
          <Rating
            value={rating}
            onChange={set_rating}
            count={5}
            size="xl"
            readOnly={has_ended || has_voted || mutation.isPending}
          />
          <Text c="dimmed" size="sm">
            {rating > 0 ? `${rating}/5` : "Select a score"}
          </Text>
        </Group>
      )}

      {poll.type === "text" && (
        <Stack gap={6}>
          <Textarea
            minRows={4}
            maxRows={6}
            maxLength={MAX_TEXT_RESPONSE_LENGTH}
            placeholder="Share your suggestion..."
            value={comment}
            onChange={(event) => set_comment(event.currentTarget.value)}
            disabled={has_ended || has_voted || mutation.isPending}
          />
          <Text size="xs" c="dimmed">
            {comment.length}/{MAX_TEXT_RESPONSE_LENGTH}
          </Text>
        </Stack>
      )}

      {reactions_enabled && (
        <Group gap={8} wrap="wrap">
          {reaction_options.map((emoji) => (
            <Button
              key={emoji}
              disabled={has_voted}
              size="compact-md"
              variant={reaction === emoji ? "filled" : "light"}
              onClick={() =>
                set_reaction((current) => (current === emoji ? null : emoji))
              }
            >
              {emoji}
            </Button>
          ))}
          <Text size="sm" c="dimmed">
            {poll.reactions_count + (reaction ? 1 : 0)} reactions
          </Text>
        </Group>
      )}

      {has_voted && <WaveAlert type="success" message="Vote submitted." />}

      {mode === "embed" ? (
        <Group>
          <Button
            disabled={!can_submit}
            loading={mutation.isPending}
            onClick={vote}
          >
            Submit vote
          </Button>
        </Group>
      ) : (
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Group wrap="wrap">
            <Button
              disabled={!can_submit}
              loading={mutation.isPending}
              onClick={vote}
            >
              Submit vote
            </Button>
            <SharePollButton disabled={has_ended} />
          </Group>

          <Group wrap="wrap">
            <Button
              variant="outline"
              color="indigo"
              onClick={() => router.push(`/${poll.id}/result`)}
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
      )}
    </Stack>
  );
}

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
