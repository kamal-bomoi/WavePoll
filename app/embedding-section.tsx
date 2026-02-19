import { Button, Code, Divider, Stack } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconLink } from "@tabler/icons-react";

const snippet = `<iframe src="/embed/wave-launch" title="WavePoll" width="100%" height="560" style="border:0;border-radius:16px;overflow:hidden;"></iframe>`;

export function EmbeddingSection() {
  const clipboard = useClipboard({ timeout: 1500 });

  return (
    <Stack gap="md">
      <Divider label="Embedding" />
      <Code block>{snippet}</Code>
      <Button
        leftSection={<IconLink size={16} />}
        variant="light"
        onClick={clipboard.copy}
      >
        {clipboard.copied ? "Snippet copied" : "Copy embed snippet"}
      </Button>
    </Stack>
  );
}
