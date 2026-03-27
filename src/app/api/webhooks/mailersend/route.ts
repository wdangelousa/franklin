import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";

import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * MailerSend webhook handler.
 *
 * MailerSend sends webhook events as JSON with a signing secret.
 * Docs: https://developers.mailersend.com/general.html#webhooks
 *
 * Events we process: delivered, soft_bounced, hard_bounced, spam_complaint, opened, clicked.
 */

type MailerSendEventType =
  | "activity.sent"
  | "activity.delivered"
  | "activity.soft_bounced"
  | "activity.hard_bounced"
  | "activity.opened"
  | "activity.clicked"
  | "activity.spam_complaint";

interface MailerSendWebhookPayload {
  type: MailerSendEventType;
  created_at: string;
  data: {
    object: string;
    email: {
      id?: string;
      from?: string;
      subject?: string;
      recipients?: Array<{ email: string }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text();

  // Verify webhook signature if secret is configured
  const webhookSecret = process.env.MAILERSEND_WEBHOOK_SECRET?.trim();
  if (webhookSecret) {
    const signature = request.headers.get("signature");

    if (!signature) {
      audit({
        event: "notification.webhook.received",
        actorType: "system",
        outcome: "denied",
        reasonCode: "MISSING_SIGNATURE"
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const expectedSignature = createHmac("sha256", webhookSecret).update(body).digest("hex");

    if (signature !== expectedSignature) {
      audit({
        event: "notification.webhook.received",
        actorType: "system",
        outcome: "denied",
        reasonCode: "INVALID_SIGNATURE"
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: MailerSendWebhookPayload;
  try {
    payload = JSON.parse(body) as MailerSendWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const recipients = (payload.data?.email?.recipients ?? []).map(r => r.email).join(",").slice(0, 100);
  const emailId = payload.data?.email?.id ?? "";

  audit({
    event: "notification.webhook.received",
    actorType: "system",
    outcome: "success",
    meta: {
      eventType: payload.type,
      emailId,
      to: recipients
    }
  });

  switch (payload.type) {
    case "activity.delivered":
    case "activity.hard_bounced":
    case "activity.soft_bounced":
    case "activity.spam_complaint":
      audit({
        event: "notification.webhook.processed",
        actorType: "system",
        outcome: payload.type === "activity.delivered" ? "success" : "error",
        reasonCode: payload.type,
        meta: { emailId, to: recipients }
      });
      break;

    case "activity.sent":
    case "activity.opened":
    case "activity.clicked":
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
