import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getSessionSecrets } from "@/lib/auth/secrets";

function computeHmac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/**
 * Signs a JSON payload using the primary session secret.
 * Returns `base64url(payload).base64url(hmac)`.
 */
export function signSessionPayload(payload: string): string {
  const { primary } = getSessionSecrets();
  const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
  const signature = computeHmac(encodedPayload, primary);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies the HMAC signature against primary and previous secrets.
 * Returns the original JSON string, or null if all verifications fail.
 */
export function verifySessionPayload(signed: string): string | null {
  const dotIndex = signed.indexOf(".");
  if (dotIndex === -1) return null;

  const encodedPayload = signed.slice(0, dotIndex);
  const providedSignature = signed.slice(dotIndex + 1);
  if (!encodedPayload || !providedSignature) return null;

  const { primary, previous } = getSessionSecrets();

  // Try primary secret first
  if (verifyWithSecret(encodedPayload, providedSignature, primary)) {
    return decodePayload(encodedPayload);
  }

  // Try previous secret for rotation
  if (previous && verifyWithSecret(encodedPayload, providedSignature, previous)) {
    return decodePayload(encodedPayload);
  }

  return null;
}

function verifyWithSecret(encodedPayload: string, providedSignature: string, secret: string): boolean {
  const expectedSignature = computeHmac(encodedPayload, secret);

  const sigBuffer = Buffer.from(providedSignature, "base64url");
  const expectedBuffer = Buffer.from(expectedSignature, "base64url");

  if (sigBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(sigBuffer, expectedBuffer);
}

function decodePayload(encoded: string): string | null {
  try {
    return Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }
}
