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
  const explicit = process.env.FRANKLIN_BASE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;

  // Vercel injects these automatically — no configuration needed
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) return `https://${vercelProd}`;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

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

  return "http://localhost:3000";
}
