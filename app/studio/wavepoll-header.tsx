"use client";

import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconHome2, IconWaveSine } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Render the WavePoll header with an app icon, a homepage link, and optional title, subtitle, and back button.
 *
 * Displays "WavePoll" (links to "/") with an optional title beneath it, an optional subtitle below the header,
 * and a "Back to Studio" button when the current path is not "/studio".
 *
 * @param title - Optional secondary title shown under the "WavePoll" heading
 * @param subtitle - Optional subtitle displayed below the header
 * @returns The header as a JSX element
 */
export function WavePollHeader({
  title,
  subtitle
}: {
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const show_back_to_studio = pathname !== "/studio";

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="start" wrap="wrap" gap="sm">
        <Group gap={10}>
          <ThemeIcon size={38} radius="xl" color="indigo">
            <IconWaveSine size={20} />
          </ThemeIcon>
          <div>
            <Text component={Link} href="/" fw={800}>
              WavePoll
            </Text>
            {title && (
              <Text size="sm" c="dimmed">
                {title}
              </Text>
            )}
          </div>
        </Group>

        {show_back_to_studio && (
          <Button
            component={Link}
            href="/studio"
            variant="light"
            color="indigo"
            leftSection={<IconHome2 size={16} />}
          >
            Back to Studio
          </Button>
        )}
      </Group>

      {subtitle && (
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      )}
    </Stack>
  );
}
