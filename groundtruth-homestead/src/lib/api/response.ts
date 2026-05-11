import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; issues?: unknown };

export function ok<T>(data: T, status = 200): NextResponse<ApiResult<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(
  message: string,
  status = 400,
  issues?: unknown,
): NextResponse<ApiResult<never>> {
  return NextResponse.json({ ok: false, error: message, issues }, { status });
}

export async function parseJsonBody<T>(
  req: Request,
  schema: ZodSchema<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse<ApiResult<never>> }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { ok: false, response: fail("Invalid JSON body", 400) };
  }
  try {
    const parsed = schema.parse(body);
    return { ok: true, data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        response: fail("Validation failed", 422, err.issues),
      };
    }
    return { ok: false, response: fail("Invalid request", 400) };
  }
}
