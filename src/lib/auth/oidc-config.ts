/**
 * OIDC/OAuth configuration for strict mode.
 *
 * Reads provider settings from environment variables.
 * Returns null when configuration is incomplete — callers must handle this.
 *
 * Required env vars for strict mode:
 *   FRANKLIN_OIDC_ISSUER        - OIDC issuer URL (e.g., https://accounts.google.com)
 *   FRANKLIN_OIDC_CLIENT_ID     - OAuth client ID
 *   FRANKLIN_OIDC_CLIENT_SECRET - OAuth client secret
 *
 * Optional:
 *   FRANKLIN_OIDC_SCOPES        - Space-separated scopes (default: "openid email profile")
 *   FRANKLIN_BASE_URL            - Application base URL for redirect_uri (default: http://localhost:3000)
 */

export interface OidcProviderConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint: string;
}

interface OidcDiscoveryDocument {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  issuer: string;
}

let cachedConfig: OidcProviderConfig | null = null;
let cacheError: string | null = null;

/**
 * Returns the OIDC configuration if all required env vars are set.
 * Performs OIDC discovery on first call and caches the result.
 * Returns null with a reason string if configuration is incomplete.
 */
export async function getOidcConfig(): Promise<{ config: OidcProviderConfig | null; error: string | null }> {
  if (cachedConfig) return { config: cachedConfig, error: null };
  if (cacheError) return { config: null, error: cacheError };

  const issuer = process.env.FRANKLIN_OIDC_ISSUER?.trim();
  const clientId = process.env.FRANKLIN_OIDC_CLIENT_ID?.trim();
  const clientSecret = process.env.FRANKLIN_OIDC_CLIENT_SECRET?.trim();

  if (!issuer || !clientId || !clientSecret) {
    cacheError = "OIDC configuration incomplete. Set FRANKLIN_OIDC_ISSUER, FRANKLIN_OIDC_CLIENT_ID, and FRANKLIN_OIDC_CLIENT_SECRET.";
    return { config: null, error: cacheError };
  }

  const scopes = process.env.FRANKLIN_OIDC_SCOPES?.trim() || "openid email profile";
  const baseUrl = process.env.FRANKLIN_BASE_URL?.trim() || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/callback`;

  try {
    const discoveryUrl = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
    const response = await fetch(discoveryUrl, { next: { revalidate: 3600 } });

    if (!response.ok) {
      cacheError = `OIDC discovery failed: HTTP ${response.status} from ${discoveryUrl}`;
      return { config: null, error: cacheError };
    }

    const doc = (await response.json()) as OidcDiscoveryDocument;

    cachedConfig = {
      issuer,
      clientId,
      clientSecret,
      scopes,
      redirectUri,
      authorizationEndpoint: doc.authorization_endpoint,
      tokenEndpoint: doc.token_endpoint,
      userinfoEndpoint: doc.userinfo_endpoint
    };

    return { config: cachedConfig, error: null };
  } catch (err) {
    cacheError = `OIDC discovery failed: ${err instanceof Error ? err.message : "unknown error"}`;
    return { config: null, error: cacheError };
  }
}

/** Reset cached config — useful for testing. */
export function resetOidcConfigCache(): void {
  cachedConfig = null;
  cacheError = null;
}
