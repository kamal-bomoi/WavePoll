import type { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import type { DatabaseError } from "pg";
import { env } from "@/env";
import type { ErrorProps } from "@/types";

export function drizzle_error_handler(
  error: DrizzleError | DrizzleQueryError | DatabaseError
): { status: number; errors: ErrorProps[] } {
  return {
    status: 500,
    errors: [
      {
        message:
          env.NODE_ENV === "development"
            ? error.message
            : "An internal server error occurred."
      }
    ]
  };
}
