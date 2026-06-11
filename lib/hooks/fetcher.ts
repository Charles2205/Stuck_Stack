import type { ApiErrorBody } from "../types";

export class FetchError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

async function parseError(res: Response): Promise<FetchError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // non-JSON error body
  }
  return new FetchError(
    body?.error?.message ?? `Request failed (${res.status})`,
    body?.error?.code ?? "INTERNAL",
    res.status,
  );
}

export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}

export async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await parseError(res);
  return res.json() as Promise<T>;
}
