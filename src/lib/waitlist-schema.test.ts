import { describe, expect, it } from "vitest";
import { unsubscribeRequestSchema, waitlistRequestSchema } from "./waitlist-schema";

const valid = { name: "Aarav Sharma", email: "Aarav@Example.com ", category: "student", city: "Indore", consent: true };

describe("waitlistRequestSchema", () => {
  it("accepts a valid registration and normalises the email", () => {
    const r = waitlistRequestSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("aarav@example.com");
  });

  it("treats empty city as absent", () => {
    const r = waitlistRequestSchema.safeParse({ ...valid, city: "  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.city).toBeUndefined();
  });

  it("requires explicit consent", () => {
    expect(waitlistRequestSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(waitlistRequestSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false);
  });

  it.each([
    ["bad email", { email: "not-an-email" }],
    ["short name", { name: "A" }],
    ["markup in name", { name: "<script>alert(1)</script>" }],
    ["unknown category", { category: "admin" }],
    ["long city", { city: "x".repeat(61) }],
    ["unknown field", { role: "admin" }],
  ])("rejects %s", (_label, patch) => {
    expect(waitlistRequestSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it("accepts international names", () => {
    expect(waitlistRequestSchema.safeParse({ ...valid, name: "Meera K. O'Neil-राव" }).success).toBe(true);
  });
});

describe("unsubscribeRequestSchema", () => {
  it("accepts an email and rejects extras", () => {
    expect(unsubscribeRequestSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
    expect(unsubscribeRequestSchema.safeParse({ email: "a@b.co", x: 1 }).success).toBe(false);
  });
});
