"use client";

import { Button, Center, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

/**
 * Render a 404 page with a link back to the Studio.
 *
 * @returns A React element displaying a "404" heading, a dimmed message indicating the page does not exist, and a button that navigates to `/studio`.
 */
export default function NotFound() {
  return (
    <Center className="wave-page">
      <Stack align="center" gap="xs">
        <Title order={1}>404</Title>
        <Text c="dimmed">This page does not exist.</Text>
        <Button component={Link} href="/studio" variant="light">
          Back to Studio
        </Button>
      </Stack>
    </Center>
  );
}
