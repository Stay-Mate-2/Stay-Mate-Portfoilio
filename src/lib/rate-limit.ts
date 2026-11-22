/**
 * Minimal in-memory sliding-window rate limiter.
 *
 * NOTE: on serverless platforms (Vercel) memory is per-instance and ephemeral,
 * so this is a best-effort first line of defence against bursts. The
 * authoritative, persistent limiter lives in the StayMate backend.
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
}

export function createRateLimiter(opts: { limit: number; windowMs: number; maxKeys?: number }): RateLimiter {
  const { limit, windowMs, maxKeys = 5000 } = opts;
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const windowStart = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((t) => t > windowStart);

      if (recent.length >= limit) {
        const oldest = recent[0] ?? now;
        hits.set(key, recent);
        return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
      }

      recent.push(now);
      hits.set(key, recent);

      if (hits.size > maxKeys) {
        for (const [k, v] of hits) {
          if (v.every((t) => t <= windowStart)) hits.delete(k);
          if (hits.size <= maxKeys * 0.8) break;
        }
      }
      return { allowed: true, retryAfterSec: 0 };
    },
  };
}
