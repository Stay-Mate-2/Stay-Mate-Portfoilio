import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE as methodDelete, GET as methodGet, POST as routePost } from "./route";
import { POST as routeUnsubscribePost } from "./unsubscribe/route";
import { getEarlyAccessConfig, isEarlyAccessEnabled } from "@/lib/early-access/config";
import { processConsentWithdrawal, processEarlyAccessRegistration } from "@/lib/early-access/handlers";
import { createSignedEnvelope } from "@/lib/early-access/hmac";
import { checkIpRateLimit, type RateLimitWindowRunner } from "@/lib/early-access/upstash-limit";

const VALID_ORIGIN = "https://stay-mate-portfoilio.vercel.app";
const VALID_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbTestDeployment123/exec";
const VALID_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64 hex chars (256+ bits)
const VALID_REDIS_URL = "https://us1-test-redis.upstash.io";
const VALID_REDIS_TOKEN = "AXtestToken1234567890";

interface SentMail {
  to: string;
  subject: string;
  body: string;
  htmlBody: string;
  name?: string;
}

/**
 * Loads the real `google-apps-script/Code.gs` inside an isolated VM backed by
 * Node.js crypto for HMAC verification and in-memory Google Workspace service doubles.
 */
function createAppsScriptHarness(opts: { failUserEmail?: boolean; failAdminEmail?: boolean; lockBusy?: boolean; quota?: number } = {}) {
  const code = fs.readFileSync(path.resolve(process.cwd(), "google-apps-script/Code.gs"), "utf8");

  const props = new Map<string, string>([
    ["SPREADSHEET_ID", "sheet-id-123"],
    ["ADMIN_EMAIL", "admin@staymate.test"],
    ["SHARED_SECRET", VALID_SECRET],
  ]);
  const cacheMap = new Map<string, string>();
  const logs: string[] = [];
  const sentEmails: SentMail[] = [];
  const sheets = new Map<string, { rows: unknown[][]; frozenRows: number; formats: Record<string, string> }>();
  let remainingQuota = opts.quota ?? 100;
  let lockBusy = opts.lockBusy ?? false;
  let failUserEmail = opts.failUserEmail ?? false;
  let failAdminEmail = opts.failAdminEmail ?? false;
  let lockHeld = false;

  function ensureSheet(name: string) {
    let s = sheets.get(name);
    if (!s) {
      s = { rows: [], frozenRows: 0, formats: {} };
      sheets.set(name, s);
    }
    return s;
  }

  function makeRange(sheetObj: { rows: unknown[][]; formats: Record<string, string> }, row: number, col: number, numRows: number, numCols: number) {
    return {
      getValues() {
        const out: unknown[][] = [];
        for (let r = 0; r < numRows; r++) {
          const rowArr: unknown[] = [];
          const src = sheetObj.rows[row - 1 + r] ?? [];
          for (let c = 0; c < numCols; c++) {
            rowArr.push(src[col - 1 + c] ?? "");
          }
          out.push(rowArr);
        }
        return out;
      },
      setValues(values: unknown[][]) {
        for (let r = 0; r < numRows; r++) {
          const targetIdx = row - 1 + r;
          while (sheetObj.rows.length <= targetIdx) sheetObj.rows.push([]);
          const destRow = sheetObj.rows[targetIdx]!;
          const srcRow = values[r] ?? [];
          for (let c = 0; c < numCols; c++) {
            destRow[col - 1 + c] = srcRow[c];
          }
        }
        return this;
      },
      setValue(val: unknown) {
        return this.setValues([[val]]);
      },
      setNumberFormat(fmt: string) {
        sheetObj.formats[`R${row}C${col}:${numRows}x${numCols}`] = fmt;
        return this;
      },
      setBackground() {
        return this;
      },
      setFontColor() {
        return this;
      },
      setFontWeight() {
        return this;
      },
      setVerticalAlignment() {
        return this;
      },
    };
  }

  const sandbox = {
    Math,
    Date,
    Number,
    String,
    Boolean,
    Array,
    Object,
    JSON,
    RegExp,
    Error,
    isFinite,
    Logger: {
      log(msg: string) {
        logs.push(String(msg));
      },
    },
    PropertiesService: {
      getScriptProperties() {
        return {
          getProperty(key: string) {
            return props.get(key) ?? null;
          },
        };
      },
    },
    CacheService: {
      getScriptCache() {
        return {
          get(key: string) {
            return cacheMap.get(key) ?? null;
          },
          put(key: string, val: string) {
            cacheMap.set(key, val);
          },
        };
      },
    },
    LockService: {
      getScriptLock() {
        return {
          tryLock() {
            if (lockBusy || lockHeld) return false;
            lockHeld = true;
            return true;
          },
          releaseLock() {
            lockHeld = false;
          },
        };
      },
    },
    SpreadsheetApp: {
      openById(id: string) {
        if (id !== "sheet-id-123") throw new Error("Spreadsheet not found");
        return {
          getName: () => "StayMate_Early_Access_Database",
          getSheetByName(name: string) {
            const s = sheets.get(name);
            if (!s) return null;
            return {
              getName: () => name,
              getLastRow: () => s.rows.length,
              setFrozenRows: (n: number) => {
                s.frozenRows = n;
              },
              setRowHeight: () => undefined,
              getRange: (r: number, c: number, nr = 1, nc = 1) => makeRange(s, r, c, nr, nc),
            };
          },
          insertSheet(name: string) {
            ensureSheet(name);
            return this.getSheetByName(name);
          },
        };
      },
      flush() {
        /* no-op */
      },
    },
    MailApp: {
      getRemainingDailyQuota: () => remainingQuota,
      sendEmail(msg: SentMail) {
        if (msg.to === "admin@staymate.test" && failAdminEmail) {
          throw new Error("Admin MailApp delivery failure");
        }
        if (msg.to !== "admin@staymate.test" && failUserEmail) {
          throw new Error("User MailApp delivery failure");
        }
        remainingQuota -= 1;
        sentEmails.push(msg);
      },
    },
    Utilities: {
      Charset: { UTF_8: "utf8" },
      computeHmacSha256Signature(value: string, key: string) {
        const digest = crypto.createHmac("sha256", Buffer.from(key, "utf8")).update(value, "utf8").digest();
        // Match Java signed byte[] (-128..127)
        return Array.from(digest).map((b) => (b > 127 ? b - 256 : b));
      },
      getUuid: () => crypto.randomUUID(),
      sleep: () => undefined,
    },
    ContentService: {
      MimeType: { JSON: "application/json" },
      createTextOutput(content: string) {
        return {
          _content: content,
          setMimeType() {
            return this;
          },
          getContent() {
            return this._content;
          },
        };
      },
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);

  return {
    doGet: () => JSON.parse(vm.runInContext("doGet().getContent()", sandbox) as string),
    doPostRaw(raw: string) {
      (sandbox as Record<string, unknown>).__raw = raw;
      const out = vm.runInContext("doPost({ postData: { contents: __raw } }).getContent()", sandbox) as string;
      return JSON.parse(out) as Record<string, unknown>;
    },
    initializeDatabase: () => vm.runInContext("initializeDatabase()", sandbox),
    retryFailedEmails: () => vm.runInContext("retryFailedEmails()", sandbox),
    getRegistrations: () => sheets.get("Registrations")?.rows ?? [],
    getFrozenRows: () => sheets.get("Registrations")?.frozenRows ?? 0,
    getSentEmails: () => sentEmails,
    getLogs: () => logs,
    setFlags(next: { failUserEmail?: boolean; failAdminEmail?: boolean; lockBusy?: boolean; quota?: number }) {
      if (next.failUserEmail !== undefined) failUserEmail = next.failUserEmail;
      if (next.failAdminEmail !== undefined) failAdminEmail = next.failAdminEmail;
      if (next.lockBusy !== undefined) lockBusy = next.lockBusy;
      if (next.quota !== undefined) remainingQuota = next.quota;
    },
  };
}

function makeAllowLimiter(): RateLimitWindowRunner {
  return {
    limit: vi.fn(async () => ({ success: true, reset: Date.now() + 60_000 })),
  };
}

function enableValidEnv() {
  process.env.EARLY_ACCESS_ENABLED = "true";
  process.env.STAYMATE_APPS_SCRIPT_URL = VALID_APPS_SCRIPT_URL;
  process.env.STAYMATE_HMAC_SECRET = VALID_SECRET;
  process.env.STAYMATE_ALLOWED_ORIGIN = VALID_ORIGIN;
  process.env.UPSTASH_REDIS_REST_URL = VALID_REDIS_URL;
  process.env.UPSTASH_REDIS_REST_TOKEN = VALID_REDIS_TOKEN;
}

function makeApiReq(
  body: unknown,
  opts: {
    url?: string;
    origin?: string | null;
    host?: string;
    contentType?: string;
    secFetchSite?: string;
    ip?: string;
    contentLength?: string;
  } = {},
) {
  const headers: Record<string, string> = {
    "content-type": opts.contentType ?? "application/json",
    host: opts.host ?? "stay-mate-portfoilio.vercel.app",
    "x-vercel-forwarded-for": opts.ip ?? "198.51.100.42",
  };
  if (opts.origin !== null) {
    headers.origin = opts.origin ?? VALID_ORIGIN;
  }
  if (opts.secFetchSite) {
    headers["sec-fetch-site"] = opts.secFetchSite;
  }
  if (opts.contentLength) {
    headers["content-length"] = opts.contentLength;
  }
  return new NextRequest(opts.url ?? `${VALID_ORIGIN}/api/early-access`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function validBody(patch: Record<string, unknown> = {}) {
  return {
    name: "Example User",
    email: "Example.User@Example.com",
    userType: "Student",
    city: "Indore",
    consent: true,
    honeypot: "",
    ...patch,
  };
}

describe("Early Access Config & Fail-Closed Guards", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it("defaults EARLY_ACCESS_ENABLED strictly to false", () => {
    delete process.env.EARLY_ACCESS_ENABLED;
    expect(isEarlyAccessEnabled()).toBe(false);
    process.env.EARLY_ACCESS_ENABLED = "false";
    expect(isEarlyAccessEnabled()).toBe(false);
    process.env.EARLY_ACCESS_ENABLED = "true";
    expect(isEarlyAccessEnabled()).toBe(true);
  });

  it("rejects missing secrets or non-script.google.com URLs", () => {
    enableValidEnv();
    process.env.STAYMATE_HMAC_SECRET = "too-short";
    expect(getEarlyAccessConfig()).toBeNull();

    enableValidEnv();
    process.env.STAYMATE_APPS_SCRIPT_URL = "https://evil.example/exec";
    expect(getEarlyAccessConfig()).toBeNull();

    enableValidEnv();
    delete process.env.UPSTASH_REDIS_REST_URL;
    expect(getEarlyAccessConfig()).toBeNull();
  });

  it("fails closed when Upstash Redis config is missing, throws, or times out", async () => {
    expect(await checkIpRateLimit(null, "1.2.3.4")).toEqual({ kind: "unavailable", reason: "MISSING_CONFIG" });

    const cfg = { upstashUrl: VALID_REDIS_URL, upstashToken: VALID_REDIS_TOKEN, hmacSecret: VALID_SECRET };
    const timeoutRunner: RateLimitWindowRunner = {
      limit: async () => ({ success: true, reset: Date.now(), reason: "timeout" }),
    };
    expect(await checkIpRateLimit(cfg, "1.2.3.4", timeoutRunner)).toEqual({
      kind: "unavailable",
      reason: "TIMEOUT",
    });

    const throwingRunner: RateLimitWindowRunner = {
      limit: async () => {
        throw new Error("Redis socket down");
      },
    };
    expect(await checkIpRateLimit(cfg, "1.2.3.4", throwingRunner)).toEqual({
      kind: "unavailable",
      reason: "REDIS_ERROR",
    });
  });
});

describe("StayMate Vercel Backend + Google Apps Script Integration (All 25 Security & Functional Scenarios)", () => {
  const saved = { ...process.env };
  let gas: ReturnType<typeof createAppsScriptHarness>;

  beforeEach(() => {
    enableValidEnv();
    gas = createAppsScriptHarness();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL, init?: RequestInit) => {
        const resObj = gas.doPostRaw(String(init?.body ?? ""));
        return new Response(JSON.stringify(resObj), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
  });

  afterEach(() => {
    process.env = { ...saved };
    vi.restoreAllMocks();
  });

  it("rejects non-POST HTTP methods cleanly with 405", async () => {
    expect(methodGet().status).toBe(405);
    expect(methodDelete().status).toBe(405);
    expect(gas.doGet().code).toBe("METHOD_NOT_ALLOWED");
  });

  it("1. handles valid registration end-to-end with HMAC, initializes sheet, saves row, sends both emails without leaking PII in logs", async () => {
    const res = await processEarlyAccessRegistration(makeApiReq(validBody({ marketingConsent: true })), {
      ipLimiter: makeAllowLimiter(),
      emailLimiter: makeAllowLimiter(),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.status).toBe("registered");
    expect(json.message).toBe("You're on the list! Your StayMate early-access registration has been successfully received.");

    const rows = gas.getRegistrations();
    expect(rows.length).toBe(2); // header + 1 record
    expect(gas.getFrozenRows()).toBe(1);
    expect(rows[0]).toEqual([
      "Registration_ID",
      "Full_Name",
      "Email",
      "User_Type",
      "Preferred_City",
      "Marketing_Consent",
      "Consent_Timestamp",
      "Registered_At",
      "Registration_Status",
      "Confirmation_Email_Status",
      "Admin_Notification_Status",
      "Source",
    ]);
    const rec = rows[1]!;
    expect(String(rec[0])).toMatch(/^SM-[A-Z0-9]{10}$/);
    expect(rec[1]).toBe("Example User");
    expect(rec[2]).toBe("example.user@example.com");
    expect(rec[3]).toBe("Student");
    expect(rec[4]).toBe("Indore");
    expect(rec[5]).toBe(true);
    expect(String(rec[6])).toBeTruthy();
    expect(rec[8]).toBe("REGISTERED");
    expect(rec[9]).toBe("SENT");
    expect(rec[10]).toBe("SENT");
    expect(rec[11]).toBe("staymate-website");

    expect(gas.getSentEmails().length).toBe(2);
    expect(gas.getSentEmails()[0]?.to).toBe("example.user@example.com");
    expect(gas.getSentEmails()[1]?.to).toBe("admin@staymate.test");
    expect(gas.getLogs().join("\n")).not.toContain("example.user@example.com");
    expect(gas.getLogs().join("\n")).not.toContain("Example User");
  });

  it("separates transactional confirmation from marketing consent when marketingConsent is omitted", async () => {
    const res = await processEarlyAccessRegistration(makeApiReq(validBody()), {
      ipLimiter: makeAllowLimiter(),
      emailLimiter: makeAllowLimiter(),
    });
    expect(res.status).toBe(201);
    const rec = gas.getRegistrations()[1]!;
    expect(rec[5]).toBe(false);
    expect(rec[6]).toBe("");
    expect(gas.getSentEmails()[0]?.htmlBody).toContain("Transactional confirmation only");
  });

  it("2-6. rejects invalid email, missing name, invalid category, missing consent, and invalid consent type", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };

    const invalidEmail = await processEarlyAccessRegistration(makeApiReq(validBody({ email: "not-an-email" })), deps);
    expect(invalidEmail.status).toBe(400);

    const missingName = await processEarlyAccessRegistration(makeApiReq(validBody({ name: "" })), deps);
    expect(missingName.status).toBe(400);

    const invalidCategory = await processEarlyAccessRegistration(makeApiReq(validBody({ userType: "Admin" })), deps);
    expect(invalidCategory.status).toBe(400);

    const missingConsent = await processEarlyAccessRegistration(makeApiReq(validBody({ consent: false })), deps);
    expect(missingConsent.status).toBe(400);

    const invalidConsentType = await processEarlyAccessRegistration(makeApiReq(validBody({ consent: "true" })), deps);
    expect(invalidConsentType.status).toBe(400);
  });

  it("7. accepts optional empty or omitted city cleanly", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    const omitted = { name: "Asha Verma", email: "asha@example.com", userType: "Working Professional", consent: true, honeypot: "" };
    const res = await processEarlyAccessRegistration(makeApiReq(omitted), deps);
    expect(res.status).toBe(201);
    expect(gas.getRegistrations()[1]?.[4]).toBe("");
  });

  it("8. detects duplicate emails case-insensitively and sends NO duplicate email or duplicate row", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    await processEarlyAccessRegistration(makeApiReq(validBody({ email: "Duplicate@Example.com" })), deps);
    expect(gas.getSentEmails().length).toBe(2);

    const second = await processEarlyAccessRegistration(makeApiReq(validBody({ email: "  duplicate@example.com " })), deps);
    expect(second.status).toBe(200);
    const json = await second.json();
    expect(json.ok).toBe(true);
    expect(json.status).toBe("duplicate");
    expect(json.message).toBe("This email is already registered with StayMate.");
    expect(gas.getRegistrations().length).toBe(2);
    expect(gas.getSentEmails().length).toBe(2);
  });

  it("9-11. verifies HMAC signature, rejects tampered signatures, expired timestamps, future skew, and replayed nonces", () => {
    const basePayload = { action: "register", name: "Neha Singh", email: "neha@example.com", userType: "Property Owner", consent: true };

    const env = createSignedEnvelope(basePayload, VALID_SECRET);
    const tampered = { ...env, signature: "0".repeat(64) };
    expect(gas.doPostRaw(JSON.stringify(tampered)).code).toBe("INVALID_SIGNATURE");

    const oldEnv = createSignedEnvelope(basePayload, VALID_SECRET, { timestamp: String(Date.now() - 10 * 60 * 1000) });
    expect(gas.doPostRaw(JSON.stringify(oldEnv)).code).toBe("REQUEST_EXPIRED");

    const futureEnv = createSignedEnvelope(basePayload, VALID_SECRET, { timestamp: String(Date.now() + 120 * 1000) });
    expect(gas.doPostRaw(JSON.stringify(futureEnv)).code).toBe("INVALID_FUTURE_TIMESTAMP");

    const freshEnv = createSignedEnvelope(basePayload, VALID_SECRET);
    expect(gas.doPostRaw(JSON.stringify(freshEnv)).status).toBe("registered");
    expect(gas.doPostRaw(JSON.stringify(freshEnv)).code).toBe("REPLAYED_NONCE");
  });

  it("12. rejects missing origin, mismatched origin, and cross-site Sec-Fetch-Site requests", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    const r1 = await processEarlyAccessRegistration(makeApiReq(validBody(), { origin: "https://evil.example" }), deps);
    expect(r1.status).toBe(403);
    const r2 = await processEarlyAccessRegistration(makeApiReq(validBody(), { origin: null }), deps);
    expect(r2.status).toBe(403);
    const r3 = await processEarlyAccessRegistration(makeApiReq(validBody(), { secFetchSite: "cross-site" }), deps);
    expect(r3.status).toBe(403);
  });

  it("13. silently absorbs honeypot submissions without calling Apps Script", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await processEarlyAccessRegistration(makeApiReq(validBody({ honeypot: "http://spam.example" })), {
      ipLimiter: makeAllowLimiter(),
      emailLimiter: makeAllowLimiter(),
    });
    expect(res.status).toBe(200);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(gas.getRegistrations().length).toBe(0);
  });

  it("14. enforces distributed rate limits and returns Retry-After 429", async () => {
    const blockedLimiter: RateLimitWindowRunner = {
      limit: async () => ({ success: false, reset: Date.now() + 30_000 }),
    };
    const r = await processEarlyAccessRegistration(makeApiReq(validBody()), {
      ipLimiter: blockedLimiter,
      emailLimiter: makeAllowLimiter(),
    });
    expect(r.status).toBe(429);
    expect(r.headers.get("retry-after")).toBeTruthy();
  });

  it("15-16. fails closed cleanly when secrets or Redis env variables are missing (using actual route)", async () => {
    delete process.env.STAYMATE_HMAC_SECRET;
    const missingSecret = await routePost(makeApiReq(validBody()));
    expect(missingSecret.status).toBe(503);

    enableValidEnv();
    delete process.env.UPSTASH_REDIS_REST_URL;
    const missingRedis = await routePost(makeApiReq(validBody()));
    expect(missingRedis.status).toBe(503);
  });

  it("17-18. handles Apps Script timeout (504) and upstream failure (502) safely without exposing secrets", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };

    const timeoutErr = new Error("Aborted");
    timeoutErr.name = "TimeoutError";
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw timeoutErr;
    }));
    const rTimeout = await processEarlyAccessRegistration(makeApiReq(validBody()), deps);
    expect(rTimeout.status).toBe(504);

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("ECONNRESET");
    }));
    const rNet = await processEarlyAccessRegistration(makeApiReq(validBody()), deps);
    expect(rNet.status).toBe(502);
  });

  it("19-20. preserves saved registration rows when user or admin email fails, and admin retry only resends failed emails", async () => {
    gas.setFlags({ failUserEmail: true });
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    const r1 = await processEarlyAccessRegistration(makeApiReq(validBody({ email: "userfail@example.com" })), deps);
    expect(r1.status).toBe(201);
    expect(gas.getRegistrations().length).toBe(2);
    expect(gas.getRegistrations()[1]?.[9]).toBe("FAILED");
    expect(gas.getRegistrations()[1]?.[10]).toBe("SENT");

    // Admin retry recovers ONLY the failed user confirmation email without duplicating admin email
    gas.setFlags({ failUserEmail: false });
    const retryRes = gas.retryFailedEmails() as { sent: number };
    expect(retryRes.sent).toBe(1);
    expect(gas.getRegistrations()[1]?.[9]).toBe("SENT");

    // Admin email failure case
    gas.setFlags({ failAdminEmail: true });
    const r2 = await processEarlyAccessRegistration(makeApiReq(validBody({ email: "adminfail@example.com" })), deps);
    expect(r2.status).toBe(201);
    expect(gas.getRegistrations()[2]?.[9]).toBe("SENT");
    expect(gas.getRegistrations()[2]?.[10]).toBe("FAILED");
  });

  it("21. handles concurrent lock contention safely via LockService", () => {
    gas.setFlags({ lockBusy: true });
    const env = createSignedEnvelope(
      { action: "register", name: "Riya", email: "riya@example.com", userType: "Student", consent: true },
      VALID_SECRET,
    );
    const res = gas.doPostRaw(JSON.stringify(env));
    expect(res.code).toBe("SERVICE_BUSY");
  });

  it("22. blocks submissions with 503 when EARLY_ACCESS_ENABLED=false without invoking Redis or Apps Script", async () => {
    process.env.EARLY_ACCESS_ENABLED = "false";
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await routePost(makeApiReq(validBody()));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("EARLY_ACCESS_DISABLED");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("23-24. blocks malicious HTML and formula injection at Vercel API AND neutralizes/escapes them inside Code.gs", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    const xssRes = await processEarlyAccessRegistration(
      makeApiReq(validBody({ name: "<script>alert(1)</script>" })),
      deps,
    );
    expect(xssRes.status).toBe(400);

    const formulaRes = await processEarlyAccessRegistration(
      makeApiReq(validBody({ city: "=CMD|'/C calc'!A0" })),
      deps,
    );
    expect(formulaRes.status).toBe(400);

    // Direct Apps Script defense-in-depth test
    const directEnv = createSignedEnvelope(
      {
        action: "register",
        name: "<img src=x onerror=alert(1)>",
        email: "defense@example.com",
        userType: "Student",
        city: "=HYPERLINK(\"http://evil\",\"click\")",
        consent: true,
      },
      VALID_SECRET,
    );
    const directOut = gas.doPostRaw(JSON.stringify(directEnv));
    expect(directOut.status).toBe("registered");
    expect(gas.getRegistrations()[1]?.[4]).toBe("'=HYPERLINK(\"http://evil\",\"click\")");
    expect(gas.getSentEmails()[0]?.htmlBody).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(gas.getSentEmails()[0]?.htmlBody).not.toContain("<img src=x");
  });

  it("25. rejects oversized payloads (> 4096 bytes) cleanly with 413 PAYLOAD_TOO_LARGE", async () => {
    const hugeBody = JSON.stringify({ ...validBody(), extra: "x".repeat(5000) });
    const res = await processEarlyAccessRegistration(makeApiReq(hugeBody), {
      ipLimiter: makeAllowLimiter(),
      emailLimiter: makeAllowLimiter(),
    });
    expect(res.status).toBe(413);
    expect((await res.json()).code).toBe("PAYLOAD_TOO_LARGE");
  });

  it("supports operational non-enumerating marketing consent withdrawal via /api/early-access/unsubscribe", async () => {
    const deps = { ipLimiter: makeAllowLimiter(), emailLimiter: makeAllowLimiter() };
    await processEarlyAccessRegistration(
      makeApiReq(validBody({ email: "withdraw@example.com", marketingConsent: true })),
      deps,
    );
    expect(gas.getRegistrations()[1]?.[5]).toBe(true);

    const unsubKnown = await processConsentWithdrawal(
      makeApiReq({ email: "withdraw@example.com" }, { url: `${VALID_ORIGIN}/api/early-access/unsubscribe` }),
      deps,
    );
    expect(unsubKnown.status).toBe(200);
    expect(gas.getRegistrations()[1]?.[5]).toBe(false);
    expect(String(gas.getRegistrations()[1]?.[6])).toContain("Withdrawn ");

    const unsubUnknown = await processConsentWithdrawal(
      makeApiReq({ email: "nobody@example.com" }, { url: `${VALID_ORIGIN}/api/early-access/unsubscribe` }),
      deps,
    );
    expect(unsubUnknown.status).toBe(200);
    expect(await routeUnsubscribePost(makeApiReq({ email: "a@b.co" }, { origin: "https://evil.example" }))).toHaveProperty("status", 403);
  });
});
