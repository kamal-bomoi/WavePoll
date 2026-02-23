"use client";

import { Button, Code, Stack, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconClipboard } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function EmbedSnippet({ poll_id }: { poll_id: string }) {
  const clipboard = useClipboard({ timeout: 1500 });
  const [snippet, set_snippet] = useState("");

  useEffect(() => {
    set_snippet(
      `<iframe src="${window.location.origin}/embed/${poll_id}" title="WavePoll" width="500" height="400" style="border:0;border-radius:16px;overflow:hidden;"></iframe>`
    );
  }, [poll_id]);

  return (
    <Stack gap="xs">
      <Text size="sm" fw={600}>
        Embed
      </Text>
      <Code block>{snippet}</Code>
      <Button
        leftSection={<IconClipboard size={16} />}
        variant="light"
        onClick={() => clipboard.copy(snippet)}
      >
        {clipboard.copied ? "Snippet copied" : "Copy embed snippet"}
      </Button>
    </Stack>
  );
}
