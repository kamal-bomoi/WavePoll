"use client";

import { Button, Center, Stack } from "@mantine/core";
import { WaveAlert } from "@/components/wave-alert";

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
        <WaveAlert
          type="error"
          message={error.message ?? "Unexpected application error."}
        />
        <Button onClick={reset}>Try again</Button>
      </Stack>
    </Center>
  );
}
