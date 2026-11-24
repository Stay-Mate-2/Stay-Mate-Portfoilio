import { describe, expect, it } from "vitest";
import { normalizeGoogleFormEmbedUrl, toGoogleFormDirectUrl } from "./google-form";

const SAMPLE_ID = "1FAIpQLSeStayMateExampleFormId0123456789";

describe("normalizeGoogleFormEmbedUrl", () => {
  it("normalizes a standard Google Forms viewform URL with tracking query", () => {
    const raw = `  https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform?usp=sf_link  `;
    expect(normalizeGoogleFormEmbedUrl(raw)).toBe(
      `https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform?embedded=true`,
    );
  });

  it("strips multi-account /u/N prefix and hash fragments", () => {
    const raw = `https://docs.google.com/forms/u/0/d/e/${SAMPLE_ID}/viewform?usp=header#section`;
    expect(normalizeGoogleFormEmbedUrl(raw)).toBe(
      `https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform?embedded=true`,
    );
  });

  it("accepts non-/e/ Google Forms viewform URLs and trailing slashes", () => {
    const raw = `https://docs.google.com/forms/d/${SAMPLE_ID}/viewform/`;
    expect(normalizeGoogleFormEmbedUrl(raw)).toBe(
      `https://docs.google.com/forms/d/${SAMPLE_ID}/viewform?embedded=true`,
    );
  });

  it("rejects empty, undefined, and overly long inputs", () => {
    expect(normalizeGoogleFormEmbedUrl(undefined)).toBeUndefined();
    expect(normalizeGoogleFormEmbedUrl("")).toBeUndefined();
    expect(normalizeGoogleFormEmbedUrl("   ")).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`https://docs.google.com/forms/d/e/${"a".repeat(600)}/viewform`),
    ).toBeUndefined();
  });

  it("rejects insecure schemes, XSS payloads, shorteners, and non-viewform paths", () => {
    expect(
      normalizeGoogleFormEmbedUrl(`http://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform`),
    ).toBeUndefined();
    expect(normalizeGoogleFormEmbedUrl("javascript:alert(1)")).toBeUndefined();
    expect(normalizeGoogleFormEmbedUrl("data:text/html,<script>alert(1)</script>")).toBeUndefined();
    expect(normalizeGoogleFormEmbedUrl("https://forms.gle/AbCdEfGhIjK")).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`https://docs.google.com.evil.example/forms/d/e/${SAMPLE_ID}/viewform`),
    ).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`https://docs.google.com/forms/d/${SAMPLE_ID}/edit`),
    ).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`https://docs.google.com/forms/d/e/${SAMPLE_ID}/formResponse`),
    ).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`<iframe src="https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform"></iframe>`),
    ).toBeUndefined();
    expect(
      normalizeGoogleFormEmbedUrl(`https://user:pass@docs.google.com/forms/d/e/${SAMPLE_ID}/viewform`),
    ).toBeUndefined();
  });

  it("produces clean standalone direct link from normalized embed URL", () => {
    const embed = `https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform?embedded=true`;
    expect(toGoogleFormDirectUrl(embed)).toBe(
      `https://docs.google.com/forms/d/e/${SAMPLE_ID}/viewform`,
    );
  });
});
