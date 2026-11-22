import type { NextRequest } from "next/server";
import { getBackendConfig, getClientIp, isSameOrigin, jsonError, jsonOk, postToBackend, readJsonBody } from "@/lib/api-guard";
import { createRateLimiter } from "@/lib/rate-limit";
import { toFieldErrors, unsubscribeRequestSchema } from "@/lib/waitlist-schema";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/** Withdraw consent for product updates. Always answers the same way for known/unknown emails. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError(403, "FORBIDDEN", "Cross-site requests are not allowed.");

  const ip = getClientIp(req);
  const rl = limiter.check(ip);
  if (!rl.allowed) {
    return jsonError(429, "RATE_LIMITED", "Too many attempts. Please try again in a few minutes.", {
      retryAfterSec: rl.retryAfterSec,
    });
  }

  const body = await readJsonBody(req);
  if (!body) return jsonError(400, "BAD_REQUEST", "We couldn't read that request. Please refresh and try again.");
  if (typeof body.company === "string" && body.company.length > 0) return jsonOk();

  const parsed = unsubscribeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Please enter a valid email address.", {
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  const cfg = getBackendConfig();
  if (!cfg) {
    return jsonError(503, "NOT_CONFIGURED", "This service isn't available yet. No registrations exist to change.");
  }

  const result = await postToBackend(cfg, "/v1/waitlist/unsubscribe", { email: parsed.data.email }, ip);
  if (result.kind === "network-error") {
    return jsonError(502, "UPSTREAM_UNAVAILABLE", "We couldn't reach the service. Please try again shortly.");
  }
  if (result.status >= 200 && result.status < 300) return jsonOk();
  if (result.status === 429) return jsonError(429, "RATE_LIMITED", "Too many attempts. Please try again in a few minutes.");
  if (result.status === 400) return jsonError(400, "VALIDATION_ERROR", "Please enter a valid email address.");
  return jsonError(502, "UPSTREAM_ERROR", "Something went wrong. Please try again later.");
}
