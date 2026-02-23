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

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max:
    env.DATABASE_URL.includes("localhost") ||
    env.DATABASE_URL.includes("127.0.0.1")
      ? 1
      : undefined
});

export const db = drizzle({
  client: pool,
  schema
});
