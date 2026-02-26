"use client";

import { Button, Center, Stack } from "@mantine/core";
import { WaveAlert } from "@/components/wave-alert";

/**
 * Render an error page that displays an error message and a "Try again" button.
 *
 * @param error - Error object whose message is shown; if `error.message` is falsy the component displays "Unexpected application error."
 * @param reset - Callback invoked when the user clicks the "Try again" button
 * @returns A JSX.Element containing a centered layout with the error message and a retry button
 */
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
