"use client";

// Tiny client-side fetch helper. Routes return { ok, data } | { ok, error }.
export interface ApiOk<T> { ok: true; data: T }
export interface ApiErr { ok: false; error: string; issues?: unknown }
export type ApiResult<T> = ApiOk<T> | ApiErr;

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const res = await fetch(path, { method: "GET", cache: "no-store" });
  return safeJson<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return safeJson<T>(res);
}

async function safeJson<T>(res: Response): Promise<ApiResult<T>> {
  try {
    const json = (await res.json()) as ApiResult<T>;
    return json;
  } catch {
    return { ok: false, error: `Bad response (${res.status})` };
  }
}
