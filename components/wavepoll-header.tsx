"use client";

import { Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconHome2, IconWaveSine } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function WavePollHeader({
  title,
  subtitle
}: {
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  const show_back_to_studio = pathname !== "/app";

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="start" wrap="wrap" gap="sm">
        <Group gap={10}>
          <ThemeIcon size={38} radius="xl" color="indigo">
            <IconWaveSine size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800}>WavePoll</Text>
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
            href="/app"
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
