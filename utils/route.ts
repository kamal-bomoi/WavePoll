import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import type { RequireAtLeastOne } from "type-fest";
import { ZodError, type ZodType } from "zod";
import { env } from "@/env";
import { Supabase } from "@/lib/supabase/client";
import type { ErrorProps } from "@/types";
import { WavePollError } from "./wave-poll-error";

export interface RouteContext {
  params?: Promise<Record<string, string>>;
}

type TypedRouteHandler<TBody, TParams, TQuery> = (
  context: {
    body: TBody;
    params: TParams;
    query: TQuery;
    supabase: ReturnType<typeof Supabase>;
  },
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
        const has_body = ["POST", "PUT", "PATCH"].includes(req.method);

        if (has_body) {
          try {
            body = (await req.json()) as TBody;
          } catch {
            return NextResponse.json<{ errors: ErrorProps[] }>(
              { errors: [{ message: "Invalid JSON in request body" }] },
              { status: 422 }
            );
          }
        } else {
          body = {} as TBody;
        }
        params = (ctx.params ? await ctx.params : {}) as TParams;
        query = Object.fromEntries(
          req.nextUrl.searchParams.entries()
        ) as TQuery;
      }
      const context = { body, params, query, supabase: Supabase() };

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

async function validate<
  TBody,
  TParams extends Record<string, string>,
  TQuery extends Record<string, string>
>(
  req: NextRequest,
  ctx: RouteContext,
  options?: RouteOptions<TBody, TParams, TQuery>
): Promise<ValidationResult<TBody, TParams, TQuery>> {
  const has_body = ["POST", "PUT", "PATCH"].includes(req.method);

  let raw_body: unknown = {};
  if (has_body) {
    try {
      raw_body = await req.json();
    } catch {
      return {
        ok: false,
        errors: [{ message: "Invalid JSON in request body", source: "body" }]
      };
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
