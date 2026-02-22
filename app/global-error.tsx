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
// biome-ignore lint/suspicious/noShadowRestrictedNames: <>
import type Error from "next/error";
import { useEffect } from "react";
import { theme } from "@/mantine/theme";

export default function GlobalError({
  error,
  reset
}: {
  error: Error;
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
                  contact if the problem persists.
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
