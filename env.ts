import { createEnv } from "@t3-oss/env-nextjs";
import { isServer } from "@tanstack/react-query";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .startsWith("postgres://")
      .or(z.string().startsWith("postgresql://"))
      .optional(),
    DATABASE_HOST: z.string().optional(),
    DATABASE_PORT: z.coerce.number().int().positive().optional(),
    DATABASE_NAME: z.string().optional(),
    DATABASE_USER: z.string().optional(),
    DATABASE_PASSWORD: z.string().optional(),
    DATABASE_CA_CERT: z.string().optional(),
    DATABASE_TLS_REJECT_UNAUTHORIZED: z.coerce.boolean().optional(),
    COOKIE_SECRET: z.string().min(32),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    APP_BASE_URL: z.url(),
    QSTASH_TOKEN: z.string().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.email().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    S3_ENDPOINT: z.string(),
    S3_BUCKET: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_REGION: z.string().optional()
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    NEXT_PUBLIC_S3_URL: z.url(),
    NEXT_PUBLIC_SAMPLE_POLL_ID: z.string().min(1).optional()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_CA_CERT: process.env.DATABASE_CA_CERT,
    DATABASE_TLS_REJECT_UNAUTHORIZED:
      process.env.DATABASE_TLS_REJECT_UNAUTHORIZED,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    APP_BASE_URL: process.env.APP_BASE_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_REGION: process.env.S3_REGION,
    NEXT_PUBLIC_S3_URL: process.env.NEXT_PUBLIC_S3_URL,
    NEXT_PUBLIC_SAMPLE_POLL_ID: process.env.NEXT_PUBLIC_SAMPLE_POLL_ID
  },
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development")
  },
  emptyStringAsUndefined: true
});

if (isServer) {
  const has_url = !!env.DATABASE_URL;
  const has_individual = !!(
    env.DATABASE_HOST &&
    env.DATABASE_PORT &&
    env.DATABASE_NAME &&
    env.DATABASE_USER &&
    env.DATABASE_PASSWORD
  );

  if (!has_url && !has_individual)
    throw new Error(
      "Either DATABASE_URL or all of DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD must be provided"
    );
}
