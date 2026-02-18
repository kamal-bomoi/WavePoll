"use client";

import { Alert, Button, Center, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Center className="wave-page">
      <Stack maw={560} w="100%" gap="md">
        <Title order={2}>Something went wrong</Title>
        <Alert
          color="red"
          icon={<IconAlertTriangle size={16} />}
          variant="light"
        >
          <Text size="sm">
            {error.message ?? "Unexpected application error."}
          </Text>
        </Alert>
        <Button onClick={reset}>Try again</Button>
      </Stack>
    </Center>
  );
}
