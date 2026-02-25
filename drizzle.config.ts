import process from "node:process";
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV === "development")
  dotenv.config({ path: ".env.development.local" });

const dev = process.env.NODE_ENV === "development";

const has_url = !!process.env.DATABASE_URL;
const has_individual = !!(
  process.env.DATABASE_HOST &&
  process.env.DATABASE_PORT &&
  process.env.DATABASE_NAME &&
  process.env.DATABASE_USER &&
  process.env.DATABASE_PASSWORD
);

if (!has_url && !has_individual)
  throw new Error(
    "Either DATABASE_URL or all of DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD must be provided"
  );

const credentials = has_url
  ? { url: process.env.DATABASE_URL! }
  : {
      host: process.env.DATABASE_HOST!,
      port: Number(process.env.DATABASE_PORT!),
      database: process.env.DATABASE_NAME!,
      user: process.env.DATABASE_USER!,
      password: process.env.DATABASE_PASSWORD!,
      ssl: dev
        ? undefined
        : {
            ...(process.env.DATABASE_CA_CERT && {
              ca: process.env.DATABASE_CA_CERT
            }),
            ...(process.env.DATABASE_TLS_REJECT_UNAUTHORIZED && {
              rejectUnauthorized:
                process.env.DATABASE_TLS_REJECT_UNAUTHORIZED !== "true"
            })
          }
    };

export default defineConfig({
  out: "./migrations",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: credentials,
  migrations: {
    table: "drizzle_migrations"
  },
  strict: process.env.NODE_ENV === "production",
  verbose: true,
  casing: "snake_case"
});
