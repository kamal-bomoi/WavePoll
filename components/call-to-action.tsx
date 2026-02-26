"use client";

import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

/**
 * Render a call-to-action card prompting users to open the Studio.
 *
 * Displays a styled Paper containing a centered title, descriptive text, and a button
 * that navigates to the "/studio" route.
 *
 * @returns A React element containing the call-to-action UI
 */
export function CallToAction() {
  return (
    <section>
      <Paper
        withBorder
        radius="xl"
        p="xl"
        style={{
          background:
            "linear-gradient(160deg, var(--mantine-color-slate-0) 0%, var(--mantine-color-indigo-0) 100%)"
        }}
      >
        <Stack gap="md" align="center">
          <Title order={2} ta="center">
            Start building your next poll now
          </Title>
          <Text c="dimmed" ta="center" maw={640}>
            No signup needed. Open the studio, publish your poll, and watch
            participation in realtime.
          </Text>
          <Button
            component={Link}
            href="/studio"
            color="indigo"
            size="md"
            rightSection={<IconArrowRight size={16} />}
          >
            Go to Studio
          </Button>
        </Stack>
      </Paper>
    </section>
  );
}
