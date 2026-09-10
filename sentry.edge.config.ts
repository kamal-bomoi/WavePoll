import { Sentry } from "@/lib/sentry";

if (process.env.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    enableLogs: true,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        source: "edge"
      };

      return event;
    }
  });
