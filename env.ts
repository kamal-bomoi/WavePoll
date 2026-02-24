import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .startsWith("postgres://")
      .or(z.string().startsWith("postgresql://")),
    COOKIE_SECRET: z.string().min(32),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    APP_BASE_URL: z.url(),
    QSTASH_URL: z.url().optional(),
    QSTASH_TOKEN: z.string().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.email().optional(),
    R2_ENDPOINT: z.string(),
    R2_BUCKET: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional()
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    NEXT_PUBLIC_R2_URL: z.url()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    APP_BASE_URL: process.env.APP_BASE_URL,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_R2_URL: process.env.NEXT_PUBLIC_R2_URL,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT
  },
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development")
  },
  emptyStringAsUndefined: true
});
