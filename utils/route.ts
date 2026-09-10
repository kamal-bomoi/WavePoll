import * as Sentry from "@sentry/nextjs";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodType, type z } from "zod";
import { env } from "@/env";
import type { ErrorProps } from "@/types";
import { BODY_METHODS, DEFAULT_MAX_BODY_BYTES } from "./constants";
import { drizzle_error_handler } from "./drizzle-error";
import { nanoid } from "./nanoid";
import { WavePollError } from "./wave-poll-error";

type MaybeZodSchema = ZodType | undefined;

type InferZod<T extends MaybeZodSchema> = T extends ZodType
  ? z.infer<T>
  : unknown;

interface Schema<
  TBody extends MaybeZodSchema = undefined,
  TParams extends MaybeZodSchema = undefined,
  TQuery extends MaybeZodSchema = undefined
> {
  body?: TBody;
  params?: TParams;
  query?: TQuery;
}

interface Context<
  TBody extends MaybeZodSchema,
  TParams extends MaybeZodSchema,
  TQuery extends MaybeZodSchema
> {
  body: InferZod<TBody>;
  params: InferZod<TParams>;
  query: InferZod<TQuery>;
  request_id: string;
}

type HandlerFn<
  TBody extends MaybeZodSchema,
  TParams extends MaybeZodSchema,
  TQuery extends MaybeZodSchema,
  TResult = unknown
> = (context: Context<TBody, TParams, TQuery>, req: NextRequest) => TResult;

interface RouteOptions<
  TBody extends MaybeZodSchema = undefined,
  TParams extends MaybeZodSchema = undefined,
  TQuery extends MaybeZodSchema = undefined
> {
  schema?: Schema<TBody, TParams, TQuery>;
  status?: 200 | 201 | 204 | 400 | 404 | 422 | 500;
}

interface RouteContext {
  params?: Promise<Record<string, string>>;
}

type NextApiHandler = (
  req: NextRequest,
  ctx: RouteContext
) => Response | Promise<Response>;

export function route<
  TBody extends MaybeZodSchema = undefined,
  TParams extends MaybeZodSchema = undefined,
  TQuery extends MaybeZodSchema = undefined,
  TResult = unknown
>(
  handler: HandlerFn<TBody, TParams, TQuery, TResult>,
  options: RouteOptions<TBody, TParams, TQuery> = {}
): NextApiHandler {
  return async (req, ctx) => {
    const request_id = nanoid({ length: 16 });

    try {
      const content_length = req.headers.get("content-length");

      if (content_length && Number(content_length) > DEFAULT_MAX_BODY_BYTES)
        return NextResponse.json(
          { errors: [{ message: "Payload too large." }] },
          { status: 413 }
        );

      const has_body = BODY_METHODS.has(req.method.toUpperCase());

      const [raw_body, raw_params] = await Promise.all([
        has_body ? parse_json_body(req) : Promise.resolve(undefined),
        ctx.params ?? Promise.resolve({})
      ]);
      const raw_query = Object.fromEntries(req.nextUrl.searchParams.entries());

      let body: InferZod<TBody>;
      let params: InferZod<TParams>;
      let query: InferZod<TQuery>;

      if (options.schema) {
        const [body_result, params_result, query_result] = await Promise.all([
          validate_segment("body", options.schema.body, raw_body),
          validate_segment("params", options.schema.params, raw_params),
          validate_segment("query", options.schema.query, raw_query)
        ]);

        const errors: { message: string; path?: string; source: string }[] = [];

        for (const result of [body_result, params_result, query_result]) {
          if (!result.ok) {
            errors.push(
              ...result.issues.map((issue) => ({
                message: issue.message,
                path: issue.path?.join(".") || undefined,
                source: result.segment
              }))
            );
          }
        }

        if (errors.length > 0)
          return NextResponse.json({ errors }, { status: 422 });

        body = (
          body_result.ok ? body_result.value : raw_body
        ) as InferZod<TBody>;
        params = (
          params_result.ok ? params_result.value : raw_params
        ) as InferZod<TParams>;
        query = (
          query_result.ok ? query_result.value : raw_query
        ) as InferZod<TQuery>;
      } else {
        body = raw_body as InferZod<TBody>;
        params = raw_params as InferZod<TParams>;
        query = raw_query as InferZod<TQuery>;
      }

      const context: Context<TBody, TParams, TQuery> = {
        body,
        params,
        query,
        request_id
      };

      const response = await handler(context, req);

      if (response instanceof Response) return response;

      const status = options.status ?? 200;

      if (status === 204) return new Response(null, { status });

      return NextResponse.json(response ?? { ok: true }, { status });
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

        return NextResponse.json({ request_id, errors }, { status });
      }

      return NextResponse.json(
        {
          request_id,
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

async function parse_json_body(req: NextRequest): Promise<unknown> {
  const raw = await req.text();

  if (raw.trim() === "") return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    throw WavePollError.UnprocessableEntity("Invalid JSON body.");
  }
}

type Segment = "body" | "params" | "query";

type SegmentValidationResult<T> =
  | { segment: Segment; ok: true; value: T }
  | { segment: Segment; ok: false; issues: z.core.$ZodIssue[] };

async function validate_segment<T>(
  segment: Segment,
  schema: ZodType<T> | undefined,
  input: unknown
): Promise<SegmentValidationResult<T>> {
  if (!schema) return { segment, ok: true, value: input as T };

  const result = await schema.safeParseAsync(input);

  if (result.success) return { segment, ok: true, value: result.data };

  return { segment, ok: false, issues: result.error.issues };
}
