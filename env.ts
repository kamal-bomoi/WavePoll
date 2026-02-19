import process from "node:process";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_URL: z.url(),
    SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string()
  },
  client: {},
  runtimeEnv: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NODE_ENV: process.env.NODE_ENV
  },
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development")
  },
  emptyStringAsUndefined: true
});
