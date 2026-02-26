"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "../styles.css";
import {
  Button,
  ColorSchemeScript,
  Container,
  MantineProvider,
  Stack,
  Text,
  Title
} from "@mantine/core";
import * as Sentry from "@sentry/nextjs";
import { IconRefresh } from "@tabler/icons-react";
import { useEffect } from "react";
import { theme } from "@/mantine/theme";

/**
 * Render a full-page error UI and report the provided error to Sentry.
 *
 * Displays an "Application error" title, a brief explanatory message, and a
 * "Reload view" button that invokes the provided `reset` callback.
 *
 * @param error - The error instance to report; may include an optional `digest` property. This error is captured with Sentry on render.
 * @param reset - Callback invoked when the user clicks the "Reload view" button.
 * @returns The rendered HTML structure for a global error page suitable for use as a Next.js client component.
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <div className="wave-page">
            <Container size="sm">
              <Stack gap="md">
                <Title order={1}>Application error</Title>
                <Text c="dimmed">
                  An unexpected error occurred. Try refreshing the page or
                  contact us if the problem persists.
                </Text>
                <Button leftSection={<IconRefresh size={16} />} onClick={reset}>
                  Reload view
                </Button>
              </Stack>
            </Container>
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}
