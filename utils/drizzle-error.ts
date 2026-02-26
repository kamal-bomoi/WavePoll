import type { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import type { DatabaseError } from "pg";
import { env } from "@/env";
import type { ErrorProps } from "@/types";

/**
 * Create a standardized HTTP 500 response payload from a Drizzle or database error.
 *
 * @param error - The caught error from Drizzle or the database
 * @returns An object with `status` set to 500 and `errors` containing a single `ErrorProps` whose `message` is the original error message when `NODE_ENV` is "development", otherwise "An internal server error occurred."
 */
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
