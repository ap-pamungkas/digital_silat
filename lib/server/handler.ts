import { NextResponse } from "next/server";
import type { z } from "zod";
import { toPublicMessage, toStatus } from "./errors";
import { toValidationError } from "./validate";

export type RouteContext<TParams> = { params: Promise<TParams> };

export type RouteResult<T> = { data: T; status?: number } | Response;

export type RouteHandler<TParams, TResult> = (
  request: Request,
  context: RouteContext<TParams>
) => Promise<RouteResult<TResult>>;

export function withRouteHandler<TParams, TResult>(
  handler: RouteHandler<TParams, TResult>
) {
  return async (request: Request, context: RouteContext<TParams>): Promise<Response> => {
    try {
      const result = await handler(request, context);
      if (result instanceof Response) return result;
      return NextResponse.json(result.data, { status: result.status ?? 200 });
    } catch (error: unknown) {
      const status = toStatus(error);
      if (status >= 500) {
        console.error(`[api] ${request.method} ${request.url} gagal:`, error);
      }
      return NextResponse.json({ error: toPublicMessage(error, status) }, { status });
    }
  };
}

export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw toValidationError(new Error());
  }
}

export async function parseBody<TSchema extends z.ZodType>(
  schema: TSchema,
  request: Request
): Promise<z.infer<TSchema>> {
  const body = await parseJson(request);
  return schema.parse(body);
}

export function actionError(failure: { status: number; error: string }): Error {
  const error = new Error(failure.error) as Error & { status: number };
  error.status = failure.status;
  return error;
}