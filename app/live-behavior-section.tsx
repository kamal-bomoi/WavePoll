import { Button, Group, Stack, Switch, Text, Title } from "@mantine/core";
import type { StudioForm } from "@/app/page";
import { AVAILABLE_REACTIONS, MAX_REACTION_EMOJIS } from "@/utils/constants";

export function LiveBehaviorSection({ form }: { form: StudioForm }) {
  const emojis = form.values.reaction_emojis;
  const reactions_enabled = Array.isArray(emojis);
  const selected_emojis = emojis ?? [];

  function toggle_reactions(enabled: boolean) {
    form.setFieldValue(
      "reaction_emojis",
      enabled ? [...AVAILABLE_REACTIONS].slice(0, 5) : undefined
    );
  }

  function toggle_emoji(emoji: string) {
    if (selected_emojis.includes(emoji))
      form.setFieldValue(
        "reaction_emojis",
        selected_emojis.filter((e) => e !== emoji)
      );
    else if (selected_emojis.length < MAX_REACTION_EMOJIS)
      form.setFieldValue("reaction_emojis", [...selected_emojis, emoji]);
  }

  return (
    <Stack gap="md">
      <Title order={3}>Live behavior</Title>
      <Switch
        checked={reactions_enabled}
        label="Enable live emoji reactions"
        onChange={(e) => toggle_reactions(e.currentTarget.checked)}
      />
      {reactions_enabled && (
        <Stack gap={8}>
          <Group justify="space-between" align="center">
            <Text size="sm" fw={600}>
              Reaction emojis
            </Text>
            <Text size="xs" c="dimmed">
              {selected_emojis.length}/{MAX_REACTION_EMOJIS}
            </Text>
          </Group>
          <Group gap={8} wrap="wrap">
            {AVAILABLE_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                size="compact-md"
                variant={selected_emojis.includes(emoji) ? "filled" : "light"}
                onClick={() => toggle_emoji(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </Group>
          <Text size="xs" c="dimmed">
            Pick up to {MAX_REACTION_EMOJIS}. These will appear in the live
            poll.
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
