import { audit } from "@/lib/audit";
import type { NotificationResult } from "@/lib/notifications/types";

const MAILERSEND_API_URL = "https://api.mailersend.com/v1/email";

function getApiKey(): string | null {
  return process.env.MAILERSEND_API_KEY?.trim() || null;
}

function getFromAddress(): { email: string; name?: string } {
  const raw = process.env.EMAIL_FROM?.trim() || "Franklin <noreply@example.com>";
  const match = raw.match(/^(.+)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: raw };
}

function getReplyTo(): { email: string } | undefined {
  const email = process.env.EMAIL_REPLY_TO?.trim();
  return email ? { email } : undefined;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Identifier for audit logging (e.g., "proposal_published") */
  templateKey: string;
  /** Optional proposal ID for audit context */
  proposalId?: string;
}

/**
 * Send an email via MailerSend REST API.
 * Never throws — failures are captured and returned.
 */
export async function sendEmail(params: SendEmailParams): Promise<NotificationResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    audit({
      event: "notification.email.skipped",
      actorType: "system",
      outcome: "denied",
      reasonCode: "MAILERSEND_API_KEY_MISSING",
      proposalId: params.proposalId,
      meta: { templateKey: params.templateKey, to: params.to }
    });
    return { channel: "email", status: "skipped", error: "MAILERSEND_API_KEY not configured" };
  }

  audit({
    event: "notification.email.requested",
    actorType: "system",
    outcome: "success",
    proposalId: params.proposalId,
    meta: { templateKey: params.templateKey, to: params.to }
  });

  const from = getFromAddress();
  const replyTo = params.replyTo ? { email: params.replyTo } : getReplyTo();

  const body: Record<string, unknown> = {
    from,
    to: [{ email: params.to }],
    subject: params.subject,
    html: params.html
  };

  if (replyTo) {
    body.reply_to = replyTo;
  }

  try {
    const response = await fetch(MAILERSEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      let errorMessage = `MailerSend API error: HTTP ${response.status}`;
      try {
        const errorData = JSON.parse(errorText) as { message?: string };
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        if (errorText) errorMessage = errorText.slice(0, 200);
      }

      audit({
        event: "notification.email.failed",
        actorType: "system",
        outcome: "error",
        reasonCode: `HTTP_${response.status}`,
        proposalId: params.proposalId,
        meta: { templateKey: params.templateKey, to: params.to, errorMessage }
      });
      return { channel: "email", status: "failed", error: errorMessage };
    }

    // MailerSend returns 202 Accepted with x-message-id header
    const messageId = response.headers.get("x-message-id") ?? undefined;

    audit({
      event: "notification.email.sent",
      actorType: "system",
      outcome: "success",
      proposalId: params.proposalId,
      meta: {
        templateKey: params.templateKey,
        to: params.to,
        providerMessageId: messageId ?? ""
      }
    });

    return {
      channel: "email",
      status: "sent",
      providerMessageId: messageId
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown send error";

    audit({
      event: "notification.email.failed",
      actorType: "system",
      outcome: "error",
      reasonCode: "SEND_EXCEPTION",
      proposalId: params.proposalId,
      meta: { templateKey: params.templateKey, to: params.to, errorMessage: message }
    });

    return { channel: "email", status: "failed", error: message };
  }
}
