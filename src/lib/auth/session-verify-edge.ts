/**
 * Edge-compatible session verification with secret rotation support.
 *
 * Uses Web Crypto API (available in Edge Runtime) instead of node:crypto.
 * Must stay in sync with session-crypto.ts (HMAC-SHA256, same secret derivation).
 */

import { getSessionSecretsEdge } from "@/lib/auth/secrets";

async function computeHmacEdge(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  // Normalize base64url → base64: replace URL-safe chars and add padding
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  if (remainder === 2) base64 += "==";
  else if (remainder === 3) base64 += "=";

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

async function verifyWithSecret(encodedPayload: string, providedSignature: string, secret: string): Promise<boolean> {
  const expectedSignature = await computeHmacEdge(encodedPayload, secret);
  const sigBytes = base64UrlDecode(providedSignature);
  const expectedBytes = base64UrlDecode(expectedSignature);
  return timingSafeCompare(sigBytes, expectedBytes);
}

/**
 * Verifies an HMAC-signed session cookie value against primary and previous secrets.
 * Returns the decoded JSON payload string, or null if verification fails.
 */
export async function verifySessionPayloadEdge(signed: string): Promise<string | null> {
  try {
    const { primary, previous } = getSessionSecretsEdge();
    if (!primary) return null;

    const dotIndex = signed.indexOf(".");
    if (dotIndex === -1) return null;

    const encodedPayload = signed.slice(0, dotIndex);
    const providedSignature = signed.slice(dotIndex + 1);
    if (!encodedPayload || !providedSignature) return null;

    // Try primary secret first
    if (await verifyWithSecret(encodedPayload, providedSignature, primary)) {
      return decodePayload(encodedPayload);
    }

    // Try previous secret for rotation
    if (previous && await verifyWithSecret(encodedPayload, providedSignature, previous)) {
      return decodePayload(encodedPayload);
    }

    return null;
  } catch {
    // Never throw from middleware verification — malformed cookies,
    // invalid base64, or crypto errors all result in "invalid session".
    return null;
  }
}

function decodePayload(encoded: string): string | null {
  try {
    const decoder = new TextDecoder();
    return decoder.decode(base64UrlDecode(encoded));
  } catch {
    return null;
  }
}
