import * as Sentry from "@sentry/nextjs";

/**
 * Load and apply the Sentry configuration that matches the current NEXT_RUNTIME.
 *
 * Dynamically imports the runtime-specific Sentry configuration module:
 * - imports ./sentry.server.config when NEXT_RUNTIME is "nodejs"
 * - imports ./sentry.edge.config when NEXT_RUNTIME is "edge"
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs")
    await import("./sentry.server.config");

  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

export const onRequestError = Sentry.captureRequestError;
