import { audit } from "@/lib/audit";

/**
 * Returns the public base URL of the application.
 *
 * Resolution order:
 *   1. FRANKLIN_BASE_URL (explicit configuration — preferred)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (set by Vercel on production deployments)
 *   3. VERCEL_URL (set by Vercel on all deployments, including previews)
 *   4. http://localhost:3000 (development only)
 *
 * In production, if none of the above yields a real URL, an audit log
 * is emitted as a warning. The function never throws.
 */
export function getPublicBaseUrl(): string {
  console.log("[DEBUG base-url] FRANKLIN_BASE_URL:", process.env.FRANKLIN_BASE_URL ?? "(vazio)");
  console.log(
    "[DEBUG base-url] VERCEL_PROJECT_PRODUCTION_URL:",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "(vazio)"
  );
  console.log("[DEBUG base-url] VERCEL_URL:", process.env.VERCEL_URL ?? "(vazio)");

  const explicit = process.env.FRANKLIN_BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) {
    console.log("[DEBUG base-url] URL resolvida:", explicit);
    return explicit;
  }

  // Vercel injects these automatically — no configuration needed
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    const resolved = `https://${vercelProd}`;
    console.log("[DEBUG base-url] URL resolvida:", resolved);
    return resolved;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const resolved = `https://${vercelUrl}`;
    console.log("[DEBUG base-url] URL resolvida:", resolved);
    return resolved;
  }

  if (process.env.NODE_ENV === "production") {
    audit({
      event: "notification.email.failed",
      actorType: "system",
      outcome: "error",
      reasonCode: "BASE_URL_MISSING_IN_PRODUCTION",
      meta: {
        detail: "FRANKLIN_BASE_URL is not set and no Vercel URL detected. Email links will use localhost."
      }
    });
  }

  const resolved = "http://localhost:3000";
  console.log("[DEBUG base-url] URL resolvida:", resolved);
  return resolved;
}
