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
import { IconRefresh } from "@tabler/icons-react";
import { theme } from "@/mantine/theme";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
