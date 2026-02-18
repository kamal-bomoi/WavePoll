"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Code,
  Container,
  Divider,
  Group,
  Paper,
  SegmentedControl,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import {
  IconDeviceFloppy,
  IconLink,
  IconMail,
  IconMessage,
  IconPlus,
  IconRocket,
  IconTrash
} from "@tabler/icons-react";
import dayjs from "dayjs";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WavePollHeader } from "@/components/wavepoll-header";
import { mock_polls } from "@/lib/mock-polls";
import type { PollLifecycle, PollType } from "@/types";
import { nanoid } from "@/utils/nanoid";

const type_options: { label: string; value: PollType }[] = [
  { label: "Single", value: "single" },
  { label: "Multiple", value: "multiple" },
  { label: "Rating", value: "rating" },
  { label: "Text", value: "text" }
];

const lifecycle_options: { label: string; value: PollLifecycle }[] = [
  { label: "Draft", value: "draft" },
  { label: "Live", value: "live" }
];

const CREATED_POLLS_STORAGE_KEY = "wavepoll.created_poll_ids";
const MAX_REACTION_EMOJIS = 8;
const AVAILABLE_REACTIONS = [
  "\u{1F44F}",
  "\u{1F525}",
  "\u{1F4A1}",
  "\u{1F680}",
  "\u2764\uFE0F",
  "\u{1F389}",
  "\u{1F44D}",
  "\u{1F64C}",
  "\u{1F31F}",
  "\u{1F3AF}"
] as const;

function read_created_poll_ids(): string[] {
  try {
    const raw = localStorage.getItem(CREATED_POLLS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function write_created_poll_ids(ids: string[]) {
  localStorage.setItem(CREATED_POLLS_STORAGE_KEY, JSON.stringify(ids));
}

export default function CreatePollPage() {
  const clipboard = useClipboard({ timeout: 1500 });
  const [created_poll_ids, set_created_poll_ids] = useState<string[]>([]);

  useEffect(() => {
    set_created_poll_ids(read_created_poll_ids());
  }, []);

  const form = useForm({
    initialValues: {
      owner_email: "",
      title: "What should we ship next in WavePoll?",
      description:
        "This is a UI-only preview using dummy data. Supabase wiring comes next.",
      type: "single" as PollType,
      lifecycle: "draft" as PollLifecycle,
      options: ["Native reactions", "Embeddable widgets", "Realtime analytics"],
      start_at: new Date(),
      end_at: dayjs().add(2, "hour").toDate(),
      reactions_enabled: true,
      reaction_emojis: [
        "\u{1F44F}",
        "\u{1F525}",
        "\u{1F4A1}",
        "\u{1F680}",
        "\u2764\uFE0F"
      ]
    }
  });

  const embed_snippet = `<iframe src="/embed/wave-launch" title="WavePoll" width="100%" height="560" style="border:0;border-radius:16px;overflow:hidden;"></iframe>`;
  const known_polls_by_id = useMemo(
    () => new Map(mock_polls.map((poll) => [poll.id, poll])),
    []
  );

  const user_polls = useMemo(
    () =>
      created_poll_ids.map((id) => ({
        id,
        poll: known_polls_by_id.get(id)
      })),
    [created_poll_ids, known_polls_by_id]
  );
  const can_create = !!form.values.title.trim();

  function toggle_reaction_emoji(emoji: string) {
    const selected = form.values.reaction_emojis as string[];
    if (selected.includes(emoji)) {
      form.setFieldValue(
        "reaction_emojis",
        selected.filter((value) => value !== emoji)
      );
      return;
    }
    if (selected.length >= MAX_REACTION_EMOJIS) return;
    form.setFieldValue("reaction_emojis", [...selected, emoji]);
  }

  function on_save_draft() {
    const confirmed = window.confirm(
      "Save this poll as a draft? You can publish it later."
    );
    if (!confirmed) return;

    const draft_id = `local-${nanoid({ length: 8 })}`;
    const ids = [draft_id, ...read_created_poll_ids()].slice(0, 100);
    write_created_poll_ids(ids);
    set_created_poll_ids(ids);
  }

  function on_publish_live() {
    const confirmed = window.confirm(
      "Publish this poll live now? Participants will be able to vote immediately."
    );
    if (!confirmed) return;

    const live_id = `local-live-${nanoid({ length: 8 })}`;
    const ids = [live_id, ...read_created_poll_ids()].slice(0, 100);
    write_created_poll_ids(ids);
    set_created_poll_ids(ids);
    form.setFieldValue("lifecycle", "live");
  }

  return (
    <div className="wave-page">
      <Container size="lg">
        <Stack gap="lg" className="wave-slide-up">
          <Stack gap="sm">
            <WavePollHeader />
            <Group justify="space-between" align="end" wrap="wrap" gap="sm">
              <Title order={1} style={{ maxWidth: 760 }}>
                Build premium polls
              </Title>
              <Group wrap="wrap">
                <Button
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={on_save_draft}
                  disabled={!can_create}
                >
                  Save draft
                </Button>
                <Button
                  leftSection={<IconRocket size={16} />}
                  color="indigo"
                  variant="light"
                  onClick={on_publish_live}
                  disabled={!can_create}
                >
                  Publish live
                </Button>
              </Group>
            </Group>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Paper>
              <Stack gap="md">
                <Title order={3}>Poll setup</Title>
                <TextInput
                  label="Title"
                  required
                  {...form.getInputProps("title")}
                />
                <Textarea
                  label="Description"
                  minRows={3}
                  maxRows={6}
                  {...form.getInputProps("description")}
                />
                <TextInput
                  label="Notification email (optional)"
                  placeholder="you@example.com"
                  type="email"
                  leftSection={<IconMail size={16} />}
                  {...form.getInputProps("owner_email")}
                />
                <Text size="xs" c="dimmed" mt={-6}>
                  If provided, we will send a summary email when this poll ends.
                </Text>
                <SegmentedControl
                  fullWidth
                  data={type_options}
                  {...form.getInputProps("type")}
                />
                <Select
                  label="Lifecycle"
                  data={lifecycle_options}
                  {...form.getInputProps("lifecycle")}
                />
                <Text size="xs" c="dimmed" mt={-6}>
                  Ended is system-managed when end time passes.
                </Text>
                <Text size="xs" c="dimmed" mt={-6}>
                  Choose lifecycle = live and click Publish live. Choose draft
                  and click Save draft.
                </Text>

                {(form.values.type === "single" ||
                  form.values.type === "multiple") && (
                  <Stack gap={10}>
                    <Group justify="space-between">
                      <Text fw={600} size="sm">
                        Options
                      </Text>
                      <ActionIcon
                        variant="light"
                        color="indigo"
                        onClick={() =>
                          form.insertListItem("options", "New option")
                        }
                      >
                        <IconPlus size={16} />
                      </ActionIcon>
                    </Group>
                    {form.values.options.map((_, index) => (
                      <Group key={`option-${index}`} wrap="nowrap" align="end">
                        <TextInput
                          style={{ flex: 1 }}
                          placeholder={`Option ${index + 1}`}
                          {...form.getInputProps(`options.${index}`)}
                        />
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          disabled={form.values.options.length < 3}
                          onClick={() => form.removeListItem("options", index)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    <Checkbox
                      label="Allow selecting more than one option"
                      checked={form.values.type === "multiple"}
                      readOnly
                    />
                  </Stack>
                )}

                {form.values.type === "rating" && (
                  <Slider
                    labelAlwaysOn
                    min={1}
                    max={5}
                    step={1}
                    value={5}
                    marks={[1, 2, 3, 4, 5].map((value) => ({
                      value,
                      label: `${value}`
                    }))}
                  />
                )}

                {form.values.type === "text" && (
                  <Card withBorder radius="md" bg="gray.0">
                    <Group>
                      <IconMessage size={16} />
                      <Text size="sm">
                        Audience can submit one short comment each.
                      </Text>
                    </Group>
                  </Card>
                )}

                <Divider label="Schedule" />
                <DateTimePicker
                  label="Start time"
                  valueFormat="MMM D, YYYY h:mm A"
                  {...form.getInputProps("start_at")}
                />
                <DateTimePicker
                  label="End time"
                  valueFormat="MMM D, YYYY h:mm A"
                  {...form.getInputProps("end_at")}
                />
              </Stack>
            </Paper>

            <Paper>
              <Stack gap="md">
                <Title order={3}>Live behavior + protections</Title>
                <Switch
                  checked={form.values.reactions_enabled}
                  label="Enable live emoji reactions"
                  {...form.getInputProps("reactions_enabled")}
                />
                <Stack gap={8}>
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={600}>
                      Reaction emojis
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(form.values.reaction_emojis as string[]).length}/
                      {MAX_REACTION_EMOJIS}
                    </Text>
                  </Group>
                  <Group gap={8} wrap="wrap">
                    {AVAILABLE_REACTIONS.map((emoji) => {
                      const selected = (
                        form.values.reaction_emojis as string[]
                      ).includes(emoji);

                      return (
                        <Button
                          key={emoji}
                          size="compact-md"
                          variant={selected ? "filled" : "light"}
                          disabled={!form.values.reactions_enabled}
                          onClick={() => toggle_reaction_emoji(emoji)}
                        >
                          {emoji}
                        </Button>
                      );
                    })}
                  </Group>
                  <Text size="xs" c="dimmed">
                    Pick up to {MAX_REACTION_EMOJIS}. These will appear in the
                    live poll.
                  </Text>
                </Stack>

                <Divider label="Embedding" />
                <Code block>{embed_snippet}</Code>
                <Button
                  leftSection={<IconLink size={16} />}
                  variant="light"
                  onClick={() => clipboard.copy(embed_snippet)}
                >
                  {clipboard.copied ? "Snippet copied" : "Copy embed snippet"}
                </Button>

                <Divider label="Your polls" />
                <Stack gap={8}>
                  {user_polls.length === 0 && (
                    <Text c="dimmed" size="sm">
                      No saved polls yet. Click Save draft to store a local poll
                      ID.
                    </Text>
                  )}
                  {user_polls.map(({ id, poll }) => (
                    <Group
                      key={id}
                      justify="space-between"
                      wrap="wrap"
                      gap="xs"
                    >
                      <Box>
                        <Text size="sm" fw={600}>
                          {poll?.title ?? "Pending Supabase sync"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {id}
                        </Text>
                      </Box>
                      {poll ? (
                        <Button
                          component={Link}
                          size="xs"
                          variant="subtle"
                          href={`/${poll.id}` as any}
                        >
                          Open
                        </Button>
                      ) : (
                        <Badge size="sm" color="gray" variant="light">
                          ID only
                        </Badge>
                      )}
                    </Group>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  );
}
