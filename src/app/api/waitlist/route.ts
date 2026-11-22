import type { NextRequest } from "next/server";
import { getBackendConfig, getClientIp, isSameOrigin, jsonError, jsonOk, postToBackend, readJsonBody } from "@/lib/api-guard";
import { createRateLimiter } from "@/lib/rate-limit";
import { toFieldErrors, waitlistRequestSchema } from "@/lib/waitlist-schema";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });
const MIN_FILL_MS = 2500;

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

  // Spam trap: bots fill hidden fields. Drop silently — no data is stored or forwarded.
  if (typeof body.company === "string" && body.company.length > 0) return jsonOk();

  const parsed = waitlistRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION_ERROR", "Please check the highlighted fields.", {
      fieldErrors: toFieldErrors(parsed.error),
    });
  }

  const { startedAt, name, email, category, city, consent } = parsed.data;
  if (!startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    return jsonError(429, "TOO_FAST", "That was quick! Please take a moment and submit again.");
  }

  const cfg = getBackendConfig();
  if (!cfg) {
    return jsonError(
      503,
      "NOT_CONFIGURED",
      "Early-access registration isn't open yet. Please check back soon — nothing was saved.",
    );
  }

  const result = await postToBackend(cfg, "/v1/waitlist", { name, email, category, city, consent }, ip);

  if (result.kind === "network-error") {
    return jsonError(502, "UPSTREAM_UNAVAILABLE", "We couldn't reach the registration service. Nothing was saved — please try again shortly.");
  }
  if (result.status >= 200 && result.status < 300) return jsonOk();
  if (result.status === 429) return jsonError(429, "RATE_LIMITED", "Too many attempts. Please try again in a few minutes.");
  if (result.status === 400) return jsonError(400, "VALIDATION_ERROR", "Please check your details and try again.");
  if (result.status === 503) {
    return jsonError(503, "NOT_CONFIGURED", "Early-access registration isn't open yet. Please check back soon — nothing was saved.");
  }
  return jsonError(502, "UPSTREAM_ERROR", "Something went wrong on our side. Nothing was saved — please try again later.");
}
