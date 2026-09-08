"use client";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status: number };

export async function api<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: body?.error ?? `Request failed (${res.status})`,
      };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, status: 0, error: "Network error — please check your connection" };
  }
}
