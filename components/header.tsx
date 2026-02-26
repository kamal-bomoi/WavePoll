"use client";

import { Button, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconArrowRight, IconWaveSine } from "@tabler/icons-react";
import Link from "next/link";

/**
 * Render the application header with brand and studio navigation.
 *
 * The header displays a themed wave icon and a bold "WavePoll" link to the root on the left, and an "Open Studio" button linking to /studio on the right.
 *
 * @returns The header JSX element containing the brand (icon + "WavePoll" link) and the "Open Studio" navigation button.
 */
export function Header() {
  return (
    <Paper withBorder radius="xl" p="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap={10}>
          <ThemeIcon size={38} radius="xl" color="indigo">
            <IconWaveSine size={20} />
          </ThemeIcon>
          <Text component={Link} href="/" fw={800}>
            WavePoll
          </Text>
        </Group>

        <Group gap="sm">
          <Button
            component={Link}
            href="/studio"
            color="indigo"
            rightSection={<IconArrowRight size={16} />}
          >
            Open Studio
          </Button>
        </Group>
      </Group>
    </Paper>
  );
}
