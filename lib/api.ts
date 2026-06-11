// HTTP helpers keeping route handlers thin and error shapes consistent:
// { error: { code, message, details? } } for every failure.

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorBody } from "./types";

export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
};

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function jsonError(
  code: ErrorCode,
  message: string,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status: STATUS_BY_CODE[code] },
  );
}

/**
 * Wraps a route handler body: ApiError and ZodError become consistent JSON
 * error responses; anything else becomes a 500.
 */
export async function handleApi<T>(
  fn: () => Promise<NextResponse<T>>,
): Promise<NextResponse<T> | NextResponse<ApiErrorBody>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonError(err.code, err.message, err.details);
    }
    if (err instanceof ZodError) {
      return jsonError("VALIDATION", "Invalid input", err.issues);
    }
    console.error(err);
    return jsonError("INTERNAL", "Something went wrong");
  }
}

/** Parses a JSON body, treating malformed JSON as a validation failure. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError("VALIDATION", "Request body must be valid JSON");
  }
}
