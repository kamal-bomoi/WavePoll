import * as Sentry from "@sentry/nextjs";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import type { RequireAtLeastOne } from "type-fest";
import { ZodError, type ZodType } from "zod";
import { env } from "@/env";
import type { ErrorProps } from "@/types";
import { drizzle_error_handler } from "./drizzle-error";
import { WavePollError } from "./wave-poll-error";

export interface RouteContext {
  params?: Promise<Record<string, string>>;
}

interface Context<TBody, TParams, TQuery> {
  body: TBody;
  params: TParams;
  query: TQuery;
}

type TypedRouteHandler<TBody, TParams, TQuery> = (
  context: Context<TBody, TParams, TQuery>,
  req: NextRequest
) => any;

export interface RouteOptions<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>
> {
  status?:
    | 200
    | 201
    | 204
    | 400
    | 401
    | 403
    | 404
    | 409
    | 422
    | 429
    | 500
    | 503;
  schema?: RequireAtLeastOne<{
    body?: ZodType<TBody>;
    params?: ZodType<TParams>;
    query?: ZodType<TQuery>;
  }>;
  headers?: HeadersInit;
}

/**
 * Wraps a typed route handler with request parsing, optional per-segment Zod validation, response status/headers handling, and centralized error translation/reporting.
 *
 * @param handler - The user-defined route handler invoked with a composed { body, params, query } context and the original request.
 * @param options - Optional route configuration (status, per-segment Zod schemas, additional response headers).
 * @returns A Next.js-compatible route handler function that accepts a NextRequest and RouteContext and returns a NextResponse or Response.
 */
export function route<
  TBody = unknown,
  TParams extends Record<string, string> = Record<string, string>,
  TQuery extends Record<string, string> = Record<string, string>
>(
  handler: TypedRouteHandler<TBody, TParams, TQuery>,
  options?: RouteOptions<TBody, TParams, TQuery>
): (req: NextRequest, ctx: RouteContext) => Promise<NextResponse | Response> {
  return async (req, ctx) => {
    try {
      let body: TBody;
      let params: TParams;
      let query: TQuery;

      if (options?.schema) {
        const result = await validate(req, ctx, options);

        if (!result.ok)
          return NextResponse.json<{ errors: ErrorProps[] }>(
            { errors: result.errors },
            { status: 422 }
          );

        body = result.values.body;
        params = result.values.params;
        query = result.values.query;
      } else {
        const has_body = ["POST", "PUT", "PATCH", "DELETE"].includes(
          req.method
        );

        if (has_body) {
          try {
            body = (await req.json()) as TBody;
          } catch {
            throw WavePollError.UnprocessableEntity("Invalid JSON body.");
          }
        } else body = {} as TBody;

        params = (ctx.params ? await ctx.params : {}) as TParams;
        query = Object.fromEntries(
          req.nextUrl.searchParams.entries()
        ) as TQuery;
      }

      const context: Context<TBody, TParams, TQuery> = {
        body,
        params,
        query
      };

      const response = await handler(context, req);

      const status = options?.status ?? 200;

      if (status === 204)
        return new Response(null, { status, headers: options?.headers });

      return NextResponse.json(response, { status, headers: options?.headers });
    } catch (e) {
      const error = e as Error;

      if (error instanceof WavePollError)
        return NextResponse.json<{ errors: ErrorProps[] }>(
          { errors: error.serialize() },
          { status: error.status }
        );

      if (error instanceof ZodError)
        return NextResponse.json<{ errors: ErrorProps[] }>(
          { errors: WavePollError.Zod(error).serialize() },
          { status: 422 }
        );

      if (env.NODE_ENV === "development") console.log(error);

      Sentry.withScope((scope) => {
        scope.setTag("layer", "route");
        scope.setExtra("url", req.url);
        scope.setExtra("method", req.method);

        Sentry.captureException(error);
      });

      if (error instanceof DrizzleError || error instanceof DrizzleQueryError) {
        const { status, errors } = drizzle_error_handler(error);

        return NextResponse.json<{ errors: ErrorProps[] }>(
          { errors },
          { status }
        );
      }

      return NextResponse.json<{ errors: ErrorProps[] }>(
        {
          errors: [
            {
              message:
                process.env.NODE_ENV === "development"
                  ? error.message
                  : "An internal server error occurred"
            }
          ]
        },
        { status: 500 }
      );
    }
  };
}

type Segment = "body" | "params" | "query";

type SegmentValidationResult<T> =
  | { segment: Segment; value: T }
  | { segment: Segment; error: ZodError };

type ValidationResult<TBody, TParams, TQuery> =
  | { ok: false; errors: ErrorProps[] }
  | { ok: true; values: { body: TBody; params: TParams; query: TQuery } };

/**
 * Validate and parse the request's body, route params, and query string against optional per-segment Zod schemas.
 *
 * If the request method typically carries a body (POST, PUT, PATCH, DELETE), attempts to parse JSON and fails with a WavePollError.UnprocessableEntity on invalid JSON. For each segment (body, params, query), runs schema validation when a corresponding schema is provided and aggregates all Zod validation issues into a single error list.
 *
 * @param req - The incoming Next.js request to validate (used for body JSON and URL query extraction)
 * @param ctx - Route context providing route params (may be a promise)
 * @param options - Optional route options containing per-segment Zod schemas
 * @returns `{ ok: true, values: { body, params, query } }` when all provided schemas pass validation; `{ ok: false, errors }` when one or more segments contain validation issues (errors include message, dot-delimited path, and source segment)
 */
async function validate<
  TBody,
  TParams extends Record<string, string>,
  TQuery extends Record<string, string>
>(
  req: NextRequest,
  ctx: RouteContext,
  options?: RouteOptions<TBody, TParams, TQuery>
): Promise<ValidationResult<TBody, TParams, TQuery>> {
  const has_body = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);

  let raw_body: unknown = {};
  if (has_body) {
    try {
      raw_body = await req.json();
    } catch {
      throw WavePollError.UnprocessableEntity("Invalid JSON body.");
    }
  }

  const raw_params = ctx.params ? await ctx.params : {};
  const raw_query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const results = await Promise.all([
    validate_segment("body", options?.schema?.body, raw_body),
    validate_segment("params", options?.schema?.params, raw_params),
    validate_segment("query", options?.schema?.query, raw_query)
  ]);

  const errors: ErrorProps[] = [];

  let body = {} as TBody;
  let params = {} as TParams;
  let query = {} as TQuery;

  for (const result of results)
    if ("error" in result)
      errors.push(
        ...result.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
          source: result.segment
        }))
      );
    else if ("value" in result) {
      if (result.segment === "body") body = result.value as TBody;
      if (result.segment === "params") params = result.value as TParams;
      if (result.segment === "query") query = result.value as TQuery;
    }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    values: {
      body,
      params,
      query
    }
  };
}

/**
 * Validate a single request segment against an optional Zod schema.
 *
 * @param segment - The segment being validated (`"body" | "params" | "query"`).
 * @param schema - Optional Zod schema to parse and validate `data` against.
 * @param data - Raw input for the segment to validate.
 * @returns An object containing the original `segment` and either `value` with the parsed result or `error` with the `ZodError`.
 * @throws Re-throws any non-Zod error thrown during schema parsing.
 */
async function validate_segment<T>(
  segment: Segment,
  schema: ZodType<T> | undefined,
  data: unknown
): Promise<SegmentValidationResult<T>> {
  if (!schema) return { segment, value: data as T };

  try {
    const value = await schema.parseAsync(data);

    return { segment, value };
  } catch (error) {
    if (error instanceof ZodError) return { segment, error };

    throw error;
  }
}
