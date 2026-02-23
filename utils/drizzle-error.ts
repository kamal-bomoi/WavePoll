import { DrizzleError, type DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import { env } from "@/env";
import type { ErrorProps } from "@/types";

export function drizzle_error_handler(
  error: DrizzleError | DrizzleQueryError | DatabaseError
): { status: number; errors: ErrorProps[] } {
  if (error.cause && error.cause instanceof DatabaseError)
    return postgres_error_handler(error.cause);

  if (error instanceof DatabaseError) return postgres_error_handler(error);

  if (error instanceof DrizzleError)
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

function postgres_error_handler(db_error: DatabaseError): {
  status: number;
  errors: ErrorProps[];
} {
  const code = db_error.code;

  switch (code) {
    case "08006":
    case "ECONNREFUSED":
      return {
        status: 503,
        errors: [
          {
            message:
              "Database service temporarily unavailable. Please try again."
          }
        ]
      };

    case "40001":
      return {
        status: 409,
        errors: [
          {
            message: "Request conflict detected. Please try again."
          }
        ]
      };

    default:
      return {
        status: 500,
        errors: [
          {
            message: "An internal server error occurred."
          }
        ]
      };
  }
}
