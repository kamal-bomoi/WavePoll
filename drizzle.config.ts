import process from "node:process";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV === "production")
  dotenv.config({ path: ".env.production" });
else if (process.env.NODE_ENV === "development")
  dotenv.config({ path: ".env.local" });
else
  throw new Error(
    `Invalid NODE_ENV: ${process.env.NODE_ENV}. Expected 'production' or 'development', got ${process.env.NODE_ENV}.`
  );

if (!process.env.DATABASE_URL)
  throw new Error(`'DATABASE_URL' is not defined.`);

export default defineConfig({
  out: "./migrations",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL
  },
  migrations: {
    table: "drizzle_migrations"
  },
  strict: process.env.NODE_ENV === "production",
  verbose: true,
  casing: "snake_case"
});
