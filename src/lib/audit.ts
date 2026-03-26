/**
 * Structured audit logging for security-sensitive events.
 *
 * Writes JSON logs to stdout. In production, pipe stdout to a log
 * aggregator (Datadog, CloudWatch, etc.) for indexing and alerting.
 *
 * Security rules:
 *   - Never log raw tokens, secrets, or session payloads
 *   - Token references use prefix only (first 16 chars)
 *   - IP and user-agent are included for forensic context
 *   - All events have a stable `event` field for filtering
 */

export type AuditEvent =
  | "auth.login.success"
  | "auth.login.denied"
  | "auth.login.demo_blocked"
  | "auth.login.oidc_initiated"
  | "auth.login.oidc_callback"
  | "auth.logout"
  | "auth.session.invalid"
  | "auth.session.expired"
  | "middleware.auth.rejected"
  | "middleware.ratelimit.exceeded"
  | "public.token.invalid"
  | "public.token.expired"
  | "public.proposal.viewed"
  | "public.proposal.accepted"
  | "public.proposal.rejected"
  | "public.checklist.completed"
  | "ratelimit.exceeded";

export interface AuditEntry {
  event: AuditEvent;
  timestamp: string;
  actorType: "user" | "system" | "anonymous";
  actorId?: string;
  ip?: string;
  userAgent?: string;
  route?: string;
  outcome: "success" | "denied" | "error" | "blocked";
  reasonCode?: string;
  proposalId?: string;
  tokenPrefix?: string;
  meta?: Record<string, string | number | boolean>;
}

/**
 * Emit a structured audit log entry.
 *
 * Uses console.log with JSON for structured output.
 * Replace with a proper transport (e.g., OpenTelemetry, Pino) when needed.
 */
export function audit(entry: Omit<AuditEntry, "timestamp">): void {
  const record: AuditEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  // Ensure no secrets leak — strip any field that looks like a full token
  if (record.tokenPrefix && record.tokenPrefix.length > 20) {
    record.tokenPrefix = record.tokenPrefix.slice(0, 16);
  }

  console.log(JSON.stringify(record));
}

/**
 * Create a partial audit entry from common request context.
 */
export function auditContext(options: {
  ip?: string;
  userAgent?: string;
  route?: string;
}): Pick<AuditEntry, "ip" | "userAgent" | "route"> {
  return {
    ip: options.ip,
    userAgent: options.userAgent?.slice(0, 256),
    route: options.route
  };
}
