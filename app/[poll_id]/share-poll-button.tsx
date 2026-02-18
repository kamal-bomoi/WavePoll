import { Button } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconShare } from "@tabler/icons-react";

export function SharePollButton({ disabled }: { disabled?: boolean }) {
  const clipboard = useClipboard({ timeout: 1500 });

  return (
    <Button
      color="indigo"
      variant="light"
      leftSection={<IconShare size={16} />}
      disabled={disabled}
      onClick={() => {
        clipboard.copy(window.location.href);
      }}
    >
      {clipboard.copied ? "Copied link" : "Share"}
    </Button>
  );
}
