import { Button, type MantineSize } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconShare } from "@tabler/icons-react";

export function SharePollButton({
  disabled,
  url,
  size
}: {
  disabled?: boolean;
  url?: string;
  size?: MantineSize | `compact-${MantineSize}`;
}) {
  const clipboard = useClipboard({ timeout: 1500 });

  return (
    <Button
      color="indigo"
      size={size}
      variant="light"
      leftSection={<IconShare size={16} />}
      disabled={disabled}
      onClick={() => {
        const href = url
          ? new URL(url, window.location.origin).toString()
          : window.location.href;
        clipboard.copy(href);
      }}
    >
      {clipboard.copied ? "Copied link" : "Share"}
    </Button>
  );
}
