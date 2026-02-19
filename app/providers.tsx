"use client";

import { ProgressProvider } from "@bprogress/next/app";
import { MantineProvider } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import dayjs from "dayjs";
import relative_time from "dayjs/plugin/relativeTime";
import { Toaster } from "sonner";
import { query_client } from "@/lib/query-client";
import { theme } from "@/mantine/theme";

dayjs.extend(relative_time);

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
          <Toaster
            position="top-right"
            expand
            richColors={false}
            toastOptions={{
              style: {
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(79, 70, 229, 0.22)",
                color: "#0f172a",
                backdropFilter: "blur(6px)"
              }
            }}
          />
        </ProgressProvider>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
