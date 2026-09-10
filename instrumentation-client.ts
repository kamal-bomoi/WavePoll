import { Sentry } from "@/lib/sentry";

if (process.env.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true
      }),
      Sentry.browserTracingIntegration()
    ],
    beforeSend(event) {
      if (
        event.exception?.values?.some(
          (e) =>
            e.value?.includes("Non-Error promise rejection captured with") ||
            e.value?.includes("Object Not Found Matching Id")
        )
      )
        return null;

      event.tags = {
        ...event.tags,
        source: "client"
      };

      return event;
    }
  });

export function onRouterTransitionStart(
  url: string,
  type: "push" | "replace" | "traverse"
) {
  Sentry.captureRouterTransitionStart(url, type);
}
