import crypto from "node:crypto";

export interface HmacEnvelope {
  timestamp: string;
  nonce: string;
  data: string;
  signature: string;
}

/**
 * Generates an HMAC-SHA256 signed envelope matching Code.gs verification exactly:
 *   signingMessage = `${timestamp}.${nonce}.${data}`
 *   signature      = HMAC_SHA256_HEX(secret_utf8, signingMessage_utf8)
 *
 * The exact serialized `data` string is transmitted inside the envelope and NEVER reserialized.
 */
export function createSignedEnvelope(
  payload: Record<string, unknown>,
  secret: string,
  opts: { timestamp?: string; nonce?: string } = {},
): HmacEnvelope {
  const timestamp = opts.timestamp ?? String(Date.now());
  const nonce = opts.nonce ?? crypto.randomBytes(24).toString("hex");
  const data = JSON.stringify(payload);
  const signingMessage = `${timestamp}.${nonce}.${data}`;
  const signature = crypto
    .createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(signingMessage, "utf8")
    .digest("hex");

  return { timestamp, nonce, data, signature };
}

/**
 * Verifies an HMAC-SHA256 envelope using constant-time buffer comparison and clock checks.
 */
export function verifySignedEnvelope(
  envelope: HmacEnvelope,
  secret: string,
  opts: { nowMs?: number; maxAgeMs?: number; maxFutureSkewMs?: number } = {},
): { ok: true } | { ok: false; code: string } {
  const nowMs = opts.nowMs ?? Date.now();
  const maxAgeMs = opts.maxAgeMs ?? 5 * 60 * 1000;
  const maxFutureSkewMs = opts.maxFutureSkewMs ?? 30 * 1000;

  if (!/^\d{10,16}$/.test(envelope.timestamp)) {
    return { ok: false, code: "AUTH_INVALID_TIMESTAMP" };
  }
  const tsMs = Number(envelope.timestamp);
  if (!Number.isFinite(tsMs)) return { ok: false, code: "AUTH_INVALID_TIMESTAMP" };
  if (nowMs - tsMs > maxAgeMs) return { ok: false, code: "REQUEST_EXPIRED" };
  if (tsMs - nowMs > maxFutureSkewMs) return { ok: false, code: "INVALID_FUTURE_TIMESTAMP" };

  if (!/^[0-9a-f]{32,128}$/i.test(envelope.nonce)) {
    return { ok: false, code: "AUTH_INVALID_NONCE" };
  }
  if (!/^[0-9a-f]{64}$/i.test(envelope.signature)) {
    return { ok: false, code: "INVALID_SIGNATURE" };
  }

  const signingMessage = `${envelope.timestamp}.${envelope.nonce}.${envelope.data}`;
  const expectedHex = crypto
    .createHmac("sha256", Buffer.from(secret, "utf8"))
    .update(signingMessage, "utf8")
    .digest("hex");

  const actualBuf = Buffer.from(envelope.signature.toLowerCase(), "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (actualBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(actualBuf, expectedBuf)) {
    return { ok: false, code: "INVALID_SIGNATURE" };
  }

  return { ok: true };
}
