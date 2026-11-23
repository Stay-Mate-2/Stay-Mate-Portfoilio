import crypto from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitConfig {
  upstashUrl: string;
  upstashToken: string;
  hmacSecret: string;
}

export type RateLimitDecision =
  | { kind: "allowed" }
  | { kind: "limited"; retryAfterSec: number }
  | { kind: "unavailable"; reason: "MISSING_CONFIG" | "REDIS_ERROR" | "TIMEOUT" };

export interface RateLimitWindowRunner {
  limit(identifier: string): Promise<{ success: boolean; reset: number; reason?: string }>;
}

const clientCache = new Map<string, { ip: Ratelimit; email: Ratelimit }>();

function getLimiters(url: string, token: string) {
  const cacheKey = `${url}::${crypto.createHash("sha256").update(token).digest("hex").slice(0, 16)}`;
  const existing = clientCache.get(cacheKey);
  if (existing) return existing;

  const redis = new Redis({ url, token });
  // Ephemeral Maps cache only already-blocked IDs per warm instance so spam floods do not burn Upstash free-tier daily quota.
  const ip = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    prefix: "staymate:ea:ip",
    ephemeralCache: new Map<string, number>(),
    timeout: 1500,
  });
  const email = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "staymate:ea:email",
    ephemeralCache: new Map<string, number>(),
    timeout: 1500,
  });

  const pair = { ip, email };
  if (clientCache.size > 8) clientCache.clear();
  clientCache.set(cacheKey, pair);
  return pair;
}

/**
 * Keyed one-way identifier hash so neither raw IPs nor raw email addresses
 * are persisted inside Redis keys.
 */
export function hashRateLimitKey(secret: string, scope: "ip" | "email", value: string): string {
  return crypto
    .createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(`${scope}:${value}`, "utf8")
    .digest("hex")
    .slice(0, 32);
}

async function runFailClosedLimit(
  runner: RateLimitWindowRunner,
  hashedId: string,
): Promise<RateLimitDecision> {
  try {
    const res = await runner.limit(hashedId);
    // Upstash Ratelimit fails open on network timeout by returning reason="timeout";
    // we enforce strict fail-closed behavior here.
    if (res.reason === "timeout") {
      return { kind: "unavailable", reason: "TIMEOUT" };
    }
    if (!res.success) {
      const retryAfterSec = Math.max(1, Math.ceil((res.reset - Date.now()) / 1000));
      return { kind: "limited", retryAfterSec };
    }
    return { kind: "allowed" };
  } catch {
    return { kind: "unavailable", reason: "REDIS_ERROR" };
  }
}

export async function checkIpRateLimit(
  cfg: RateLimitConfig | null,
  clientIp: string,
  runnerOverride?: RateLimitWindowRunner,
): Promise<RateLimitDecision> {
  if (!cfg || !cfg.upstashUrl || !cfg.upstashToken || cfg.hmacSecret.length < 32) {
    return { kind: "unavailable", reason: "MISSING_CONFIG" };
  }
  const hashed = hashRateLimitKey(cfg.hmacSecret, "ip", clientIp || "unknown");
  const runner = runnerOverride ?? getLimiters(cfg.upstashUrl, cfg.upstashToken).ip;
  return runFailClosedLimit(runner, hashed);
}

export async function checkEmailRateLimit(
  cfg: RateLimitConfig | null,
  normalizedEmail: string,
  runnerOverride?: RateLimitWindowRunner,
): Promise<RateLimitDecision> {
  if (!cfg || !cfg.upstashUrl || !cfg.upstashToken || cfg.hmacSecret.length < 32) {
    return { kind: "unavailable", reason: "MISSING_CONFIG" };
  }
  const hashed = hashRateLimitKey(cfg.hmacSecret, "email", normalizedEmail);
  const runner = runnerOverride ?? getLimiters(cfg.upstashUrl, cfg.upstashToken).email;
  return runFailClosedLimit(runner, hashed);
}
