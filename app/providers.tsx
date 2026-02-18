"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { MantineProvider } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { query_client } from "@/lib/query-client";
import { theme } from "@/mantine/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const client = query_client();

  if (!mounted) return null;

  return (
    <QueryClientProvider client={client}>
      <MantineProvider theme={theme}>
        <ProgressProvider
          height="3px"
          color="var(--mantine-primary-color-filled)"
          options={{ showSpinner: false }}
          shallowRouting
        >
          {children}
        </ProgressProvider>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
