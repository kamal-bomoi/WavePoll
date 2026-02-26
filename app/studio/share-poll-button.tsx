import { Button, type MantineSize } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconShare } from "@tabler/icons-react";

/**
 * Render a share button that copies a poll URL to the clipboard.
 *
 * If `url` is provided it is resolved against the current origin and copied;
 * otherwise the current page URL is copied. While the clipboard reports a copy,
 * the button label temporarily shows "Copied link".
 *
 * @param url - Optional relative or absolute URL to share; resolved against window.location.origin when relative
 * @param size - Button size or a `compact-<size>` variant passed through to the Mantine Button
 * @returns The Button element which copies the resolved URL to the clipboard and updates its label to "Copied link" after copying
 */
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
