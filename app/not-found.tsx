"use client";

import { Button, Center, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export default function NotFound() {
  return (
    <Center className="wave-page">
      <Stack align="center" gap="xs">
        <Title order={1}>404</Title>
        <Text c="dimmed">This page does not exist.</Text>
        <Button component={Link} href="/" variant="light">
          Back to Studio
        </Button>
      </Stack>
    </Center>
  );
}
