import { describe, expect, it } from "vitest";
import { FACTORS, SAMPLE_PROFILE, scoreCompatibility, type Selection } from "./compat-demo";
import { createRateLimiter } from "./rate-limit";

describe("scoreCompatibility (illustrative)", () => {
  it("identical profiles score 100", () => {
    expect(scoreCompatibility(SAMPLE_PROFILE, SAMPLE_PROFILE).score).toBe(100);
  });

  it("opposite profiles score low and surface differences", () => {
    const opposite = Object.fromEntries(FACTORS.map((f) => [f.key, f.options.length - 1])) as Selection;
    const zero = Object.fromEntries(FACTORS.map((f) => [f.key, 0])) as Selection;
    const r = scoreCompatibility(zero, opposite);
    expect(r.score).toBeLessThan(40);
    expect(r.verdict).toBe("Worth a conversation");
    expect(r.differences.length).toBeGreaterThan(0);
  });

  it("score is always within 0..100", () => {
    const wild = Object.fromEntries(FACTORS.map((f) => [f.key, 999])) as Selection;
    const r = scoreCompatibility(wild, SAMPLE_PROFILE);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});

describe("createRateLimiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.check("ip", 0).allowed).toBe(true);
    expect(rl.check("ip", 10).allowed).toBe(true);
    const blocked = rl.check("ip", 20);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(rl.check("other", 20).allowed).toBe(true);
    expect(rl.check("ip", 1500).allowed).toBe(true);
  });
});
