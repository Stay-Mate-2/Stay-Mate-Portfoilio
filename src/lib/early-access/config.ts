export interface EarlyAccessServerConfig {
  appsScriptUrl: string;
  hmacSecret: string;
  allowedOrigins: string[];
  upstashUrl: string;
  upstashToken: string;
}

function parseUrlStrict(raw: string | undefined, opts: { allowLocalhost?: boolean; requireAppsScriptPath?: boolean } = {}): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const localAllowed = opts.allowLocalhost && process.env.NODE_ENV !== "production" && isLocal;

    if (url.protocol !== "https:" && !(localAllowed && url.protocol === "http:")) {
      return null;
    }

    if (opts.requireAppsScriptPath && !localAllowed) {
      if (url.hostname !== "script.google.com" || !url.pathname.startsWith("/macros/s/")) {
        return null;
      }
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Server-controlled registration feature flag. Defaults strictly to `false`
 * unless explicitly set to `"true"` in server environment variables.
 */
export function isEarlyAccessEnabled(): boolean {
  if (typeof window !== "undefined") {
    throw new Error("isEarlyAccessEnabled() must only run on the server.");
  }
  return process.env.EARLY_ACCESS_ENABLED?.trim() === "true";
}

/**
 * Parses configured allowed browser origins for POST Origin validation.
 * Rejects wildcards (`*`) and insecure schemes outside local development/test.
 */
export function getAllowedOrigins(): string[] {
  if (typeof window !== "undefined") {
    throw new Error("getAllowedOrigins() must only run on the server.");
  }
  const raw = process.env.STAYMATE_ALLOWED_ORIGIN?.trim();
  if (!raw) return [];

  const origins: string[] = [];
  for (const part of raw.split(",")) {
    const candidate = part.trim();
    if (!candidate || candidate === "*") continue;
    const valid = parseUrlStrict(candidate, { allowLocalhost: true });
    if (valid) {
      origins.push(new URL(valid).origin);
    }
  }
  return origins;
}

/**
 * Validates and returns complete server-only secrets & endpoint configuration.
 * Fails closed (`null`) if ANY required secret, Apps Script URL, Origin, or Redis config is missing/invalid.
 */
export function getEarlyAccessConfig(): EarlyAccessServerConfig | null {
  if (typeof window !== "undefined") {
    throw new Error("getEarlyAccessConfig() must only run on the server.");
  }

  const appsScriptUrl = parseUrlStrict(process.env.STAYMATE_APPS_SCRIPT_URL, {
    allowLocalhost: true,
    requireAppsScriptPath: true,
  });

  const hmacSecret = process.env.STAYMATE_HMAC_SECRET?.trim() ?? "";
  const hmacBytes = Buffer.byteLength(hmacSecret, "utf8");
  const allowedOrigins = getAllowedOrigins();

  const upstashUrl = parseUrlStrict(process.env.UPSTASH_REDIS_REST_URL, { allowLocalhost: true });
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

  if (
    !appsScriptUrl ||
    hmacBytes < 32 ||
    allowedOrigins.length === 0 ||
    !upstashUrl ||
    upstashToken.length < 10
  ) {
    return null;
  }

  return {
    appsScriptUrl,
    hmacSecret,
    allowedOrigins,
    upstashUrl: new URL(upstashUrl).origin,
    upstashToken,
  };
}
