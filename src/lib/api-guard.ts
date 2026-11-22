import { NextResponse, type NextRequest } from "next/server";

/** Best-effort client IP. On Vercel `x-real-ip` / `x-forwarded-for` are set by the platform edge. */
export function getClientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || "unknown").slice(0, 64);
}

/**
 * CSRF / cross-site abuse guard: browsers always send `Origin` on cross-site POSTs.
 * A request whose Origin host differs from the Host header is rejected.
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl) — still subject to every other check
  try {
    const rawHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    const host = rawHost?.split(",")[0]?.trim();
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: false, code, message, ...extra },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function jsonOk(extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: true, ...extra }, { headers: { "Cache-Control": "no-store" } });
}

/** Reads and parses a small JSON body; returns `null` when invalid or oversized. */
export async function readJsonBody(req: NextRequest, maxBytes = 4096): Promise<Record<string, unknown> | null> {
  const type = req.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) return null;
  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export interface BackendConfig {
  baseUrl: string;
  key: string;
}

/** Server-only backend configuration. Returns `null` when not (safely) configured. */
export function getBackendConfig(): BackendConfig | null {
  const raw = process.env.WAITLIST_API_URL?.trim();
  const key = process.env.WAITLIST_INGEST_KEY?.trim();
  if (!raw || !key || key.length < 32) return null;
  try {
    const url = new URL(raw);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) return null;
    return { baseUrl: url.origin, key };
  } catch {
    return null;
  }
}

export type BackendResult =
  | { kind: "response"; status: number; body: unknown }
  | { kind: "network-error" };

export async function postToBackend(
  cfg: BackendConfig,
  path: string,
  payload: unknown,
  clientIp: string,
): Promise<BackendResult> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Waitlist-Key": cfg.key,
    };
    if (clientIp && clientIp !== "unknown") {
      headers["X-Client-IP"] = clientIp;
    }
    const res = await fetch(`${cfg.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* non-JSON upstream body */
    }
    return { kind: "response", status: res.status, body };
  } catch {
    return { kind: "network-error" };
  }
}
