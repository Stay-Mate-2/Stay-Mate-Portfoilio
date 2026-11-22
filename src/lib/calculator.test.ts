import { describe, expect, it } from "vitest";
import { calculateCosts, formatINR, sanitizeAmount, sanitizePeople, type CostInputs } from "./calculator";

const base: CostInputs = { rent: 15000, deposit: 30000, electricity: 1200, internet: 800, groceries: 3000, other: 600, food: 3500, people: 3 };

describe("calculateCosts", () => {
  it("splits shared items equally and keeps food personal", () => {
    const r = calculateCosts(base);
    expect(r.sharedMonthly).toBe(20600);
    expect(r.perPersonMonthly).toBeCloseTo(20600 / 3 + 3500, 5);
    expect(r.householdMonthly).toBe(20600 + 3500 * 3);
    expect(r.depositPerPerson).toBe(10000);
    expect(r.firstMonthPerPerson).toBeCloseTo(r.perPersonMonthly + 10000, 5);
  });

  it("breakdown sums to the per-person total", () => {
    const r = calculateCosts(base);
    expect(r.breakdown.reduce((s, b) => s + b.perPerson, 0)).toBeCloseTo(r.perPersonMonthly, 5);
  });

  it("handles a single person (no splitting)", () => {
    const r = calculateCosts({ ...base, people: 1 });
    expect(r.perPersonMonthly).toBe(20600 + 3500);
  });

  it("is safe against invalid input", () => {
    const r = calculateCosts({ ...base, rent: -5, deposit: Number.NaN, people: 0, food: Infinity });
    expect(Number.isFinite(r.perPersonMonthly)).toBe(true);
    expect(r.people).toBe(1);
    expect(r.depositPerPerson).toBe(0);
  });
});

describe("sanitizers", () => {
  it("clamps amounts", () => {
    expect(sanitizeAmount("abc")).toBe(0);
    expect(sanitizeAmount(-10)).toBe(0);
    expect(sanitizeAmount(99_999_999)).toBe(1_000_000);
    expect(sanitizeAmount("1200.6")).toBe(1201);
  });
  it("clamps people between 1 and 8", () => {
    expect(sanitizePeople(0)).toBe(1);
    expect(sanitizePeople(99)).toBe(8);
    expect(sanitizePeople(2.9)).toBe(2);
  });
});

describe("formatINR", () => {
  it("uses Indian digit grouping", () => {
    expect(formatINR(125000).replace(/\s/g, "")).toBe("₹1,25,000");
  });
});
