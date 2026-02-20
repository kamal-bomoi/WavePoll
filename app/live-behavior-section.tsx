import {
  ActionIcon,
  Badge,
  Group,
  Popover,
  Stack,
  Switch,
  Text,
  Title
} from "@mantine/core";
import { IconMoodPlus, IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";
import type { StudioForm } from "@/app/page";
import { MAX_REACTION_EMOJIS } from "@/utils/constants";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false
});

export function LiveBehaviorSection({ form }: { form: StudioForm }) {
  const emojis = form.values.reaction_emojis;
  const reactions_enabled = Array.isArray(emojis);
  const selected_emojis = emojis ?? [];

  function toggle_reactions(enabled: boolean) {
    form.setFieldValue("reaction_emojis", enabled ? ["\u{1F44D}"] : undefined);
  }

  function add_emoji(emoji: string) {
    if (selected_emojis.includes(emoji)) return;
    if (selected_emojis.length >= MAX_REACTION_EMOJIS) return;

    form.setFieldValue("reaction_emojis", [...selected_emojis, emoji]);
  }

  function remove_emoji(emoji: string) {
    const next = selected_emojis.filter((value) => value !== emoji);

    form.setFieldValue("reaction_emojis", next.length > 0 ? next : undefined);
  }

  return (
    <Stack gap="md">
      <Title order={3}>Live behavior</Title>
      <Switch
        checked={reactions_enabled}
        label="Enable live emoji reactions"
        onChange={(event) => toggle_reactions(event.currentTarget.checked)}
      />
      {reactions_enabled && (
        <Stack gap={8}>
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600}>
              Reaction emojis
            </Text>
            <Group gap={8}>
              <Text size="xs" c="dimmed">
                {selected_emojis.length}/{MAX_REACTION_EMOJIS}
              </Text>
              <Popover
                width={320}
                position="bottom-end"
                withArrow
                shadow="md"
                disabled={selected_emojis.length >= MAX_REACTION_EMOJIS}
              >
                <Popover.Target>
                  <ActionIcon
                    variant="light"
                    color="indigo"
                    disabled={selected_emojis.length >= MAX_REACTION_EMOJIS}
                    aria-label="Add reaction emoji"
                  >
                    <IconMoodPlus size={16} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                  <EmojiPicker
                    width="100%"
                    lazyLoadEmojis
                    onEmojiClick={(emoji_data) => add_emoji(emoji_data.emoji)}
                  />
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Group>
          <Group gap={8} wrap="wrap">
            {selected_emojis.map((emoji) => (
              <Badge
                key={emoji}
                size="lg"
                variant="light"
                color="indigo"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="gray"
                    variant="transparent"
                    onClick={() => remove_emoji(emoji)}
                    aria-label={`Remove ${emoji}`}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                }
              >
                {emoji}
              </Badge>
            ))}
          </Group>
          <Text size="xs" c="dimmed">
            Pick up to {MAX_REACTION_EMOJIS}. Add custom emojis with the picker.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
