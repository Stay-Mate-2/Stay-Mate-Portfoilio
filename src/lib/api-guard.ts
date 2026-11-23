import { NextResponse, type NextRequest } from "next/server";
import type { HmacEnvelope } from "@/lib/early-access/hmac";

/**
 * Extracts client IP strictly from trusted platform edge proxy headers (`x-vercel-forwarded-for`,
 * overwritten by Vercel's edge, or `x-real-ip`), avoiding untrusted client-supplied IP chains.
 */
export function getTrustedClientIp(req: NextRequest): string {
  const vercelIp = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp.slice(0, 64);

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);

  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (forwarded || "unknown").slice(0, 64);
}

/**
 * Validates same-origin browser requests strictly against `STAYMATE_ALLOWED_ORIGIN`
 * (or host fallback when `STAYMATE_ALLOWED_ORIGIN` is empty and feature flag is off)
 * and blocks cross-site Sec-Fetch-Site requests.
 */
export function isAllowedRequestOrigin(req: NextRequest, allowedOrigins: string[]): boolean {
  const fetchSite = req.headers.get("sec-fetch-site")?.trim().toLowerCase();
  if (fetchSite === "cross-site") return false;

  const origin = req.headers.get("origin")?.trim();
  if (!origin) return false;

  let parsedOrigin: string;
  try {
    parsedOrigin = new URL(origin).origin;
  } catch {
    return false;
  }

  if (allowedOrigins.length > 0) {
    return allowedOrigins.includes(parsedOrigin);
  }

  // Fallback host check only rejects obvious cross-origin mismatches when allowlist is absent
  const rawHost = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const host = rawHost?.split(",")[0]?.trim();
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  return NextResponse.json(
    { ok: false, code, message, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...headers,
      },
    },
  );
}

export function jsonOk(status = 200, extra?: Record<string, unknown>) {
  return NextResponse.json(
    { ok: true, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export function jsonMethodNotAllowed() {
  return jsonError(
    405,
    "METHOD_NOT_ALLOWED",
    "Method not allowed.",
    undefined,
    { Allow: "POST" },
  );
}

export type BodyReadResult =
  | { kind: "ok"; data: Record<string, unknown> }
  | { kind: "too-large" }
  | { kind: "invalid-json" };

/**
 * Streams request body with strict byte cap (`maxBytes`) before JSON parsing
 * so oversized chunked payloads cannot exhaust serverless memory.
 */
export async function readBoundedJsonBody(req: NextRequest, maxBytes = 4096): Promise<BodyReadResult> {
  const lenHeader = req.headers.get("content-length");
  if (lenHeader) {
    const declared = Number(lenHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return { kind: "too-large" };
    }
  }

  let text = "";
  if (req.body) {
    const reader = req.body.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    let totalBytes = 0;

    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        totalBytes += chunk.value.byteLength;
        if (totalBytes > maxBytes) {
          await reader.cancel().catch(() => undefined);
          return { kind: "too-large" };
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
      text += decoder.decode();
    } catch {
      return { kind: "invalid-json" };
    }
  } else {
    text = await req.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) {
      return { kind: "too-large" };
    }
  }

  if (!text.trim()) return { kind: "invalid-json" };

  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { kind: "invalid-json" };
    }
    return { kind: "ok", data: parsed as Record<string, unknown> };
  } catch {
    return { kind: "invalid-json" };
  }
}

export interface AppsScriptResponsePayload {
  ok?: boolean;
  status?: string;
  code?: string;
  message?: string;
}

export type AppsScriptCallResult =
  | { kind: "ok"; body: AppsScriptResponsePayload }
  | { kind: "timeout" }
  | { kind: "network-error" }
  | { kind: "invalid-response" };

/**
 * Posts an HMAC-SHA256 signed envelope to Google Apps Script Web App (/exec).
 * Note: Google Apps Script issues a 302 redirect after executing doPost() to serve output;
 * `redirect: "follow"` is required for Node fetch to retrieve the JSON body.
 */
export async function postSignedToAppsScript(
  appsScriptUrl: string,
  envelope: HmacEnvelope,
  timeoutMs = 10_000,
): Promise<AppsScriptCallResult> {
  try {
    const res = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      return { kind: "network-error" };
    }

    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      return { kind: "invalid-response" };
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { kind: "invalid-response" };
    }

    return { kind: "ok", body: body as AppsScriptResponsePayload };
  } catch (err) {
    if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return { kind: "timeout" };
    }
    return { kind: "network-error" };
  }
}
