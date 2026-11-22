import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as registerPost } from "./route";
import { POST as unsubscribePost } from "./unsubscribe/route";
import { getBackendConfig } from "@/lib/api-guard";

const VALID_KEY = "a".repeat(32);

let ipSeq = 1;
function uniqueIp() {
  ipSeq += 1;
  return `198.51.100.${ipSeq}`;
}

function makeReq(
  url: string,
  body: unknown,
  opts: { ip?: string; origin?: string; host?: string; contentType?: string } = {},
) {
  const ip = opts.ip ?? uniqueIp();
  const headers: Record<string, string> = {
    "content-type": opts.contentType ?? "application/json",
    host: opts.host ?? "staymate.test",
    "x-real-ip": ip,
  };
  if (opts.origin !== undefined) headers.origin = opts.origin;
  return new NextRequest(url, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: "Asha Verma",
    email: "asha@example.com",
    category: "student",
    city: "Indore",
    consent: true,
    startedAt: Date.now() - 10_000,
    ...overrides,
  };
}

describe("getBackendConfig", () => {
  const oldEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...oldEnv };
  });

  it("rejects insecure http URLs for non-localhost hosts", () => {
    process.env.WAITLIST_API_URL = "http://api.staymate.example";
    process.env.WAITLIST_INGEST_KEY = VALID_KEY;
    expect(getBackendConfig()).toBeNull();
  });

  it("accepts http for localhost and https for remote hosts", () => {
    process.env.WAITLIST_API_URL = "http://127.0.0.1:4000/ignored";
    process.env.WAITLIST_INGEST_KEY = VALID_KEY;
    expect(getBackendConfig()).toEqual({ baseUrl: "http://127.0.0.1:4000", key: VALID_KEY });

    process.env.WAITLIST_API_URL = "https://api.staymate.example/";
    expect(getBackendConfig()).toEqual({ baseUrl: "https://api.staymate.example", key: VALID_KEY });
  });

  it("rejects short ingest keys", () => {
    process.env.WAITLIST_API_URL = "https://api.staymate.example";
    process.env.WAITLIST_INGEST_KEY = "short";
    expect(getBackendConfig()).toBeNull();
  });
});

describe("POST /api/waitlist", () => {
  const oldEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.WAITLIST_API_URL;
    delete process.env.WAITLIST_INGEST_KEY;
  });

  afterEach(() => {
    process.env = { ...oldEnv };
    vi.restoreAllMocks();
  });

  it("rejects cross-origin requests", async () => {
    const res = await registerPost(
      makeReq("https://staymate.test/api/waitlist", validPayload(), {
        origin: "https://evil.example",
        host: "staymate.test",
      }),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("FORBIDDEN");
  });

  it("returns 400 validation errors for invalid input", async () => {
    const res = await registerPost(
      makeReq("https://staymate.test/api/waitlist", validPayload({ email: "bad", consent: false })),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(json.fieldErrors.email).toBeTruthy();
    expect(json.fieldErrors.consent).toBeTruthy();
  });

  it("silently absorbs honeypot spam without calling upstream", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await registerPost(
      makeReq("https://staymate.test/api/waitlist", { ...validPayload(), company: "Spam LLC" }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects impossibly fast bot submissions", async () => {
    const res = await registerPost(
      makeReq("https://staymate.test/api/waitlist", validPayload({ startedAt: Date.now() - 100 })),
    );
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("TOO_FAST");
  });

  it("returns 503 NOT_CONFIGURED when backend is not configured (never fakes success)", async () => {
    const res = await registerPost(makeReq("https://staymate.test/api/waitlist", validPayload()));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.code).toBe("NOT_CONFIGURED");
  });

  it("proxies valid submissions to backend with server-only X-Waitlist-Key and X-Client-IP", async () => {
    process.env.WAITLIST_API_URL = "https://api.staymate.example";
    process.env.WAITLIST_INGEST_KEY = VALID_KEY;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const ip = uniqueIp();
    const res = await registerPost(
      makeReq("https://staymate.test/api/waitlist", validPayload(), {
        ip,
        origin: "https://staymate.test",
        host: "staymate.test",
      }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.staymate.example/v1/waitlist");
    expect((init?.headers as Record<string, string>)["X-Waitlist-Key"]).toBe(VALID_KEY);
    expect((init?.headers as Record<string, string>)["X-Client-IP"]).toBe(ip);
  });

  it("enforces rate limiting per IP", async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i += 1) {
      const r = await registerPost(makeReq("https://staymate.test/api/waitlist", validPayload(), { ip }));
      expect(r.status).toBe(503);
    }
    const limited = await registerPost(makeReq("https://staymate.test/api/waitlist", validPayload(), { ip }));
    expect(limited.status).toBe(429);
    expect((await limited.json()).code).toBe("RATE_LIMITED");
  });
});

describe("POST /api/waitlist/unsubscribe", () => {
  const oldEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...oldEnv };
    vi.restoreAllMocks();
  });

  it("returns 503 when unconfigured and forwards when configured", async () => {
    delete process.env.WAITLIST_API_URL;
    delete process.env.WAITLIST_INGEST_KEY;
    const unconfigured = await unsubscribePost(
      makeReq("https://staymate.test/api/waitlist/unsubscribe", { email: "asha@example.com" }),
    );
    expect(unconfigured.status).toBe(503);

    process.env.WAITLIST_API_URL = "https://api.staymate.example";
    process.env.WAITLIST_INGEST_KEY = VALID_KEY;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const okRes = await unsubscribePost(
      makeReq("https://staymate.test/api/waitlist/unsubscribe", { email: "asha@example.com" }),
    );
    expect(okRes.status).toBe(200);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.staymate.example/v1/waitlist/unsubscribe");
  });
});
