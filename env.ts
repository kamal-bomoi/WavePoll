import process from "node:process";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string(),
    COOKIE_SECRET: z.string().min(32),
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string()
  },
  client: {},
  runtimeEnv: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN
  },
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development")
  },
  emptyStringAsUndefined: true
});
