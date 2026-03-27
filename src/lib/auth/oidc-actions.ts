"use server";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getOidcConfig } from "@/lib/auth/oidc-config";
import { AUTH_MODE, SESSION_COOKIE_NAME, SESSION_COOKIE_PATH } from "@/lib/auth/config";
import { signSessionPayload } from "@/lib/auth/session-crypto";
import type { InternalRole, SessionData } from "@/lib/auth/types";
import { AuthError } from "@/lib/auth/errors";

const OIDC_STATE_COOKIE = "franklin_oidc_state";
const OIDC_VERIFIER_COOKIE = "franklin_oidc_verifier";

/**
 * Initiates the OIDC authorization code flow with PKCE.
 * Sets state and verifier cookies, then redirects to the provider.
 */
export async function initiateOidcLogin(): Promise<void> {
  if (AUTH_MODE !== "strict") {
    throw new AuthError(
      "DEMO_LOGIN_DISABLED_IN_STRICT_MODE",
      "OIDC login is only available in strict mode."
    );
  }

  const { config, error } = await getOidcConfig();
  if (!config) {
    throw new AuthError("SESSION_SECRET_MISSING", error ?? "OIDC not configured.");
  }

  const state = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");

  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: SESSION_COOKIE_PATH,
    maxAge: 600 // 10 minutes for the auth flow
  };

  cookieStore.set(OIDC_STATE_COOKIE, state, cookieOptions);
  cookieStore.set(OIDC_VERIFIER_COOKIE, codeVerifier, cookieOptions);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });

  redirect(`${config.authorizationEndpoint}?${params.toString()}`);
}

/**
 * Handles the OIDC callback. Validates state, exchanges code for tokens,
 * fetches user info, creates a signed session, and redirects to workspace.
 */
export async function handleOidcCallback(
  code: string,
  state: string
): Promise<void> {
  const cookieStore = await cookies();

  const savedState = cookieStore.get(OIDC_STATE_COOKIE)?.value;
  const savedVerifier = cookieStore.get(OIDC_VERIFIER_COOKIE)?.value;

  // Clean up OIDC flow cookies
  cookieStore.delete(OIDC_STATE_COOKIE);
  cookieStore.delete(OIDC_VERIFIER_COOKIE);

  if (!savedState || !savedVerifier || state !== savedState) {
    redirect("/login?error=invalid_state");
  }

  const { config, error } = await getOidcConfig();
  if (!config) {
    redirect(`/login?error=oidc_config&detail=${encodeURIComponent(error ?? "unknown")}`);
  }

  // Exchange authorization code for tokens
  const tokenResponse = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      code_verifier: savedVerifier
    })
  });

  if (!tokenResponse.ok) {
    redirect("/login?error=token_exchange_failed");
  }

  const tokenData = await tokenResponse.json() as { access_token?: string };
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    redirect("/login?error=no_access_token");
  }

  // Fetch user info
  const userinfoResponse = await fetch(config.userinfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!userinfoResponse.ok) {
    redirect("/login?error=userinfo_failed");
  }

  const userinfo = await userinfoResponse.json() as {
    sub?: string;
    email?: string;
    name?: string;
    preferred_username?: string;
  };

  if (!userinfo.sub || !userinfo.email) {
    redirect("/login?error=incomplete_profile");
  }

  // Map OIDC claims to Franklin session
  const role = resolveUserRole(userinfo.email);
  const session: SessionData = {
    mode: "strict",
    user: {
      id: userinfo.sub,
      name: userinfo.name ?? userinfo.preferred_username ?? userinfo.email,
      email: userinfo.email,
      title: "",
      role,
      organizationName: "Onebridge"
    }
  };

  const signedValue = signSessionPayload(JSON.stringify(session));

  cookieStore.set(SESSION_COOKIE_NAME, signedValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: SESSION_COOKIE_PATH,
    maxAge: 60 * 60 * 8
  });

  redirect("/app/dashboard");
}

/**
 * Maps an email address to an internal role.
 *
 * This is a placeholder implementation. In production, replace with:
 * - Database lookup
 * - OIDC groups/roles claim mapping
 * - External authorization service
 */
function resolveUserRole(email: string): InternalRole {
  const adminEmails = (process.env.FRANKLIN_ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (adminEmails.includes(email.toLowerCase())) {
    return "ADMIN";
  }
  return "PARTNER";
}
