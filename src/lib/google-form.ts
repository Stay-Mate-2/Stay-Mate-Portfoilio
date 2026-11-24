const GOOGLE_FORM_PATH_RE =
  /^\/forms\/(?:u\/\d+\/)?(d\/(?:e\/)?[A-Za-z0-9_-]{10,128}\/viewform)\/?$/;

/**
 * Validates and normalizes a public Google Form responder URL into its safe
 * HTTPS embed URL (`https://docs.google.com/forms/.../viewform?embedded=true`).
 *
 * Rejects non-HTTPS schemes (`http:`, `javascript:`, `data:`), external hosts
 * (including shorteners like `forms.gle` that would violate CSP `frame-src`),
 * `/edit` links, embedded HTML snippets, and malformed inputs.
 */
export function normalizeGoogleFormEmbedUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed || trimmed.length > 512) return undefined;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:") return undefined;
  if (parsed.hostname !== "docs.google.com") return undefined;
  if (parsed.port !== "" || parsed.username !== "" || parsed.password !== "") return undefined;

  const match = GOOGLE_FORM_PATH_RE.exec(parsed.pathname);
  if (!match?.[1]) return undefined;

  return `https://docs.google.com/forms/${match[1]}?embedded=true`;
}

/**
 * Strips `?embedded=true` for the accessible fallback link that opens the same
 * validated Google Form in a separate tab.
 */
export function toGoogleFormDirectUrl(embedUrl: string): string {
  return embedUrl.replace(/\?embedded=true$/, "");
}
