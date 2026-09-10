import { Sentry } from "@/lib/sentry";

if (process.env.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] })
    ],
    beforeSend(event) {
      event.tags = {
        ...event.tags,
        source: "server"
      };

      return event;
    }
  });
