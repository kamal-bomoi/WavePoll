import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/env";
import {
  options,
  options_relations,
  poll_status,
  poll_type,
  polls,
  polls_details,
  polls_relations,
  reactions,
  reactions_relations,
  votes,
  votes_relations
} from "@/lib/db/schema";

const schema = {
  poll_type,
  poll_status,
  polls,
  options,
  votes,
  reactions,
  polls_details,
  polls_relations,
  options_relations,
  votes_relations,
  reactions_relations
};

const local =
  env.DATABASE_URL?.includes("localhost") ||
  env.DATABASE_URL?.includes("127.0.0.1") ||
  env.DATABASE_HOST?.includes("localhost") ||
  env.DATABASE_HOST?.includes("127.0.0.1");

const pool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      max: local ? 1 : undefined
    })
  : new Pool({
      host: env.DATABASE_HOST!,
      port: env.DATABASE_PORT!,
      database: env.DATABASE_NAME!,
      user: env.DATABASE_USER!,
      password: env.DATABASE_PASSWORD!,
      max: local ? 1 : undefined,
      ssl: local
        ? undefined
        : {
            ...(env.DATABASE_TLS_REJECT_UNAUTHORIZED !== undefined && {
              rejectUnauthorized: env.DATABASE_TLS_REJECT_UNAUTHORIZED
            }),
            ...(env.DATABASE_CA_CERT && { ca: env.DATABASE_CA_CERT })
          }
    });

export const db = drizzle({
  client: pool,
  schema
});
