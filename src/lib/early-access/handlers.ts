import type { NextRequest } from "next/server";
import {
  getTrustedClientIp,
  isAllowedRequestOrigin,
  jsonError,
  jsonOk,
  postSignedToAppsScript,
  readBoundedJsonBody,
} from "@/lib/api-guard";
import { getAllowedOrigins, getEarlyAccessConfig, isEarlyAccessEnabled } from "@/lib/early-access/config";
import { createSignedEnvelope } from "@/lib/early-access/hmac";
import {
  consentWithdrawSchema,
  earlyAccessRequestSchema,
  toFieldErrors,
} from "@/lib/early-access/schema";
import {
  checkEmailRateLimit,
  checkIpRateLimit,
  type RateLimitWindowRunner,
} from "@/lib/early-access/upstash-limit";

const MIN_BROWSER_FILL_MS = 1500;
const APPS_SCRIPT_TIMEOUT_MS = 7_000;

export interface HandlerDeps {
  ipLimiter?: RateLimitWindowRunner;
  emailLimiter?: RateLimitWindowRunner;
}

export async function processEarlyAccessRegistration(req: NextRequest, deps: HandlerDeps = {}) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return jsonError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const allowedOrigins = getAllowedOrigins();
  if (!isAllowedRequestOrigin(req, allowedOrigins)) {
    return jsonError(403, "FORBIDDEN", "Requests from this origin are not allowed.");
  }

  if (!isEarlyAccessEnabled()) {
    return jsonError(
      503,
      "EARLY_ACCESS_DISABLED",
      "Early-access registration is not open yet. Nothing was saved.",
    );
  }

  const cfg = getEarlyAccessConfig();
  if (!cfg) {
    return jsonError(
      503,
      "NOT_CONFIGURED",
      "Registration service is temporarily unavailable. Nothing was saved.",
    );
  }

  const clientIp = getTrustedClientIp(req);
  const ipLimit = await checkIpRateLimit(cfg, clientIp, deps.ipLimiter);
  if (ipLimit.kind === "unavailable") {
    return jsonError(
      503,
      "RATE_LIMIT_UNAVAILABLE",
      "Registration service is temporarily unavailable. Nothing was saved.",
    );
  }
  if (ipLimit.kind === "limited") {
    return jsonError(
      429,
      "RATE_LIMITED",
      "Too many registration attempts. Please try again in a few minutes.",
      { retryAfterSec: ipLimit.retryAfterSec },
      { "Retry-After": String(ipLimit.retryAfterSec) },
    );
  }

  const bodyRes = await readBoundedJsonBody(req, 4096);
  if (bodyRes.kind === "too-large") {
    return jsonError(413, "PAYLOAD_TOO_LARGE", "Request payload exceeds the maximum allowed size.");
  }
  if (bodyRes.kind === "invalid-json") {
    return jsonError(400, "BAD_REQUEST", "We could not read that JSON request. Please try again.");
  }

  // Silently absorb honeypot spam without disclosing errors or invoking Apps Script
  if (typeof bodyRes.data.honeypot === "string" && bodyRes.data.honeypot.trim().length > 0) {
    return jsonOk(200, { status: "accepted", message: "Submission processed." });
  }

  const parsed = earlyAccessRequestSchema.safeParse(bodyRes.data);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", {
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  if (parsed.data.startedAt && Date.now() - parsed.data.startedAt < MIN_BROWSER_FILL_MS) {
    return jsonError(429, "TOO_FAST", "Please take a moment before submitting the form.");
  }

  const emailLimit = await checkEmailRateLimit(cfg, parsed.data.email, deps.emailLimiter);
  if (emailLimit.kind === "unavailable") {
    return jsonError(
      503,
      "RATE_LIMIT_UNAVAILABLE",
      "Registration service is temporarily unavailable. Nothing was saved.",
    );
  }
  if (emailLimit.kind === "limited") {
    return jsonError(
      429,
      "RATE_LIMITED",
      "Too many attempts for this email address. Please try again later.",
      { retryAfterSec: emailLimit.retryAfterSec },
      { "Retry-After": String(emailLimit.retryAfterSec) },
    );
  }

  const envelope = createSignedEnvelope(
    {
      action: "register",
      name: parsed.data.name,
      email: parsed.data.email,
      userType: parsed.data.userType,
      city: parsed.data.city ?? "",
      consent: true,
      marketingConsent: parsed.data.marketingConsent,
      source: "staymate-website",
    },
    cfg.hmacSecret,
  );

  const upstream = await postSignedToAppsScript(cfg.appsScriptUrl, envelope, APPS_SCRIPT_TIMEOUT_MS);

  if (upstream.kind === "timeout") {
    return jsonError(
      504,
      "UPSTREAM_TIMEOUT",
      "The registration service took too long to respond. Please check again shortly — nothing duplicate will be created.",
    );
  }
  if (upstream.kind === "network-error" || upstream.kind === "invalid-response") {
    return jsonError(
      502,
      "UPSTREAM_UNAVAILABLE",
      "We could not reach the registration service. Nothing was saved — please try again shortly.",
    );
  }

  const up = upstream.body;
  if (up.ok === true && up.status === "duplicate") {
    return jsonOk(200, {
      status: "duplicate",
      message: "This email is already registered with StayMate.",
    });
  }
  if (up.ok === true && up.status === "registered") {
    return jsonOk(201, {
      status: "registered",
      message: "You're on the list! Your StayMate early-access registration has been successfully received.",
    });
  }

  if (up.code === "VALIDATION_ERROR") {
    return jsonError(400, "VALIDATION_ERROR", "Please check your details and try again.");
  }
  if (up.code === "SERVICE_BUSY") {
    return jsonError(503, "SERVICE_BUSY", "The service is busy right now. Please try again in a moment.");
  }

  return jsonError(
    502,
    "UPSTREAM_ERROR",
    "We could not complete your registration right now. Please try again later.",
  );
}

export async function processConsentWithdrawal(req: NextRequest, deps: HandlerDeps = {}) {
  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    return jsonError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }

  const allowedOrigins = getAllowedOrigins();
  if (!isAllowedRequestOrigin(req, allowedOrigins)) {
    return jsonError(403, "FORBIDDEN", "Requests from this origin are not allowed.");
  }

  if (!isEarlyAccessEnabled()) {
    return jsonError(
      503,
      "EARLY_ACCESS_DISABLED",
      "Early-access registration is not open yet. No records exist to update.",
    );
  }

  const cfg = getEarlyAccessConfig();
  if (!cfg) {
    return jsonError(
      503,
      "NOT_CONFIGURED",
      "This service is temporarily unavailable. Please try again later.",
    );
  }

  const clientIp = getTrustedClientIp(req);
  const ipLimit = await checkIpRateLimit(cfg, clientIp, deps.ipLimiter);
  if (ipLimit.kind === "unavailable") {
    return jsonError(503, "RATE_LIMIT_UNAVAILABLE", "Service temporarily unavailable.");
  }
  if (ipLimit.kind === "limited") {
    return jsonError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please try again later.",
      { retryAfterSec: ipLimit.retryAfterSec },
      { "Retry-After": String(ipLimit.retryAfterSec) },
    );
  }

  const bodyRes = await readBoundedJsonBody(req, 2048);
  if (bodyRes.kind === "too-large") {
    return jsonError(413, "PAYLOAD_TOO_LARGE", "Request payload too large.");
  }
  if (bodyRes.kind === "invalid-json") {
    return jsonError(400, "BAD_REQUEST", "Invalid JSON payload.");
  }

  if (typeof bodyRes.data.honeypot === "string" && bodyRes.data.honeypot.trim().length > 0) {
    return jsonOk(200, { status: "processed" });
  }

  const parsed = consentWithdrawSchema.safeParse(bodyRes.data);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Please enter a valid email address.", {
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  const envelope = createSignedEnvelope(
    {
      action: "withdraw_consent",
      email: parsed.data.email,
    },
    cfg.hmacSecret,
  );

  const upstream = await postSignedToAppsScript(cfg.appsScriptUrl, envelope, APPS_SCRIPT_TIMEOUT_MS);
  if (upstream.kind === "timeout") {
    return jsonError(504, "UPSTREAM_TIMEOUT", "Request timed out. Please try again shortly.");
  }
  if (upstream.kind !== "ok" || upstream.body.ok !== true) {
    return jsonError(502, "UPSTREAM_UNAVAILABLE", "Could not complete request. Please try again later.");
  }

  // Strictly non-enumerating response whether email existed or not
  return jsonOk(200, {
    status: "processed",
    message: "If that email is on the list, marketing consent has been withdrawn.",
  });
}
