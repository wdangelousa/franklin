/**
 * Centralized secret resolution with rotation support.
 *
 * Secrets are resolved in order:
 *   1. Primary secret (current)
 *   2. Previous secret (legacy, for rotation)
 *
 * Signing always uses the primary secret.
 * Verification tries primary first, then previous.
 *
 * Env vars:
 *   Session signing:
 *     - FRANKLIN_SESSION_SECRET           (primary, falls back to FRANKLIN_TOKEN_SECRET)
 *     - FRANKLIN_SESSION_SECRET_PREVIOUS  (legacy, for rotation)
 *
 *   Token encryption:
 *     - FRANKLIN_TOKEN_SECRET             (primary)
 *     - FRANKLIN_TOKEN_SECRET_PREVIOUS    (legacy, for rotation)
 *
 * In development (NODE_ENV !== "production"), a dev fallback is used when
 * no secret is configured. In production, missing primary secrets cause
 * a hard failure.
 */

const DEV_SESSION_SECRET = "franklin-dev-session-secret";
const DEV_TOKEN_SECRET = "franklin-dev-token-secret";

// ---------------------------------------------------------------------------
// Session secrets
// ---------------------------------------------------------------------------

export function getSessionSecrets(): { primary: string; previous: string | null } {
  const primary = process.env.FRANKLIN_SESSION_SECRET ?? process.env.FRANKLIN_TOKEN_SECRET;
  const previous = process.env.FRANKLIN_SESSION_SECRET_PREVIOUS ?? process.env.FRANKLIN_TOKEN_SECRET_PREVIOUS ?? null;

  if (primary) {
    return { primary, previous: previous || null };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FRANKLIN_SESSION_SECRET (or FRANKLIN_TOKEN_SECRET) must be set in production."
    );
  }

  return { primary: DEV_SESSION_SECRET, previous: null };
}

// ---------------------------------------------------------------------------
// Token secrets
// ---------------------------------------------------------------------------

export function getTokenSecrets(): { primary: string; previous: string | null } {
  const primary = process.env.FRANKLIN_TOKEN_SECRET ?? process.env.NEXTAUTH_SECRET;
  const previous = process.env.FRANKLIN_TOKEN_SECRET_PREVIOUS ?? null;

  if (primary) {
    return { primary, previous: previous || null };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "FRANKLIN_TOKEN_SECRET must be set in production."
    );
  }

  return { primary: DEV_TOKEN_SECRET, previous: null };
}

// ---------------------------------------------------------------------------
// Edge-compatible session secrets (no node:crypto dependency)
// ---------------------------------------------------------------------------

export function getSessionSecretsEdge(): { primary: string; previous: string | null } {
  const primary = process.env.FRANKLIN_SESSION_SECRET ?? process.env.FRANKLIN_TOKEN_SECRET;
  const previous = process.env.FRANKLIN_SESSION_SECRET_PREVIOUS ?? process.env.FRANKLIN_TOKEN_SECRET_PREVIOUS ?? null;

  if (primary) {
    return { primary, previous: previous || null };
  }

  if (process.env.NODE_ENV === "production") {
    return { primary: "", previous: null }; // Empty string causes verification to fail safely
  }

  return { primary: DEV_SESSION_SECRET, previous: null };
}
