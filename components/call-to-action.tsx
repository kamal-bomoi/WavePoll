"use client";

import { Button, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export function CallToAction() {
  return (
    <section>
      <Paper withBorder radius="xl" p="xl" shadow="sm">
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
