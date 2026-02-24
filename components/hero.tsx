"use client";

import { Button, Grid, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconChecks } from "@tabler/icons-react";
import Link from "next/link";

export function Hero() {
  // const sample_poll_href = process.env.NEXT_PUBLIC_SAMPLE_POLL_ID
  //   ? `/app/${process.env.NEXT_PUBLIC_SAMPLE_POLL_ID}`
  //   : "/app";

  return (
    <Paper
      withBorder
      radius="xl"
      p={{ base: "lg", md: "xl" }}
      style={{
        background:
          "linear-gradient(155deg, var(--mantine-color-indigo-0) 0%, var(--mantine-color-blue-0) 52%, var(--mantine-color-slate-0) 100%)"
      }}
    >
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 12 }}>
          <Stack gap="md">
            <Title order={1} style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
              Polls that feel alive while people vote
            </Title>
            <Text c="dimmed" maw={620}>
              WavePoll is your full polling workflow in one place: creation,
              live participation, embeddable polls, rich results, and export.
            </Text>
            <Group gap="lg" wrap="wrap">
              <Group gap={6}>
                <IconChecks size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" c="dimmed">
                  No account required
                </Text>
              </Group>
              <Group gap={6}>
                <IconChecks size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" c="dimmed">
                  Realtime updates
                </Text>
              </Group>
              <Group gap={6}>
                <IconChecks size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" c="dimmed">
                  Embeddable polls
                </Text>
              </Group>
            </Group>

            <Group gap="sm" wrap="wrap">
              <Button
                component={Link}
                href="/app"
                color="indigo"
                size="md"
                rightSection={<IconArrowRight size={16} />}
              >
                Create Poll
              </Button>
              {/* <Button
                component="a"
                href={sample_poll_href}
                variant="light"
                color="indigo"
                size="md"
              >
                View sample poll
              </Button> */}
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
