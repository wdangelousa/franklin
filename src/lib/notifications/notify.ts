/**
 * Notification orchestrator.
 *
 * Domain code calls these functions. Each function resolves which channels
 * to use (email today, WhatsApp in the future) and dispatches accordingly.
 *
 * All functions are fire-and-forget safe — they never throw.
 * Failures are logged via audit and returned in the result array.
 */

import { sendEmail } from "@/lib/notifications/email/mailersend";
import { audit } from "@/lib/audit";
import type {
  NotificationResult,
  ProposalPublishedPayload,
  ProposalAcceptedPayload,
  ProposalRejectedPayload
} from "@/lib/notifications/types";
import {
  proposalPublishedSubject,
  proposalPublishedHtml
} from "@/lib/notifications/email/templates/proposal-published";
import {
  proposalAcceptedSubject,
  proposalAcceptedHtml
} from "@/lib/notifications/email/templates/proposal-accepted";
import {
  proposalRejectedSubject,
  proposalRejectedHtml
} from "@/lib/notifications/email/templates/proposal-rejected";

/**
 * Notify that a proposal has been published (link available for client).
 * Sends email to client if email is available.
 */
export async function notifyProposalPublished(
  payload: ProposalPublishedPayload
): Promise<NotificationResult[]> {
  audit({
    event: "notification.email.requested",
    actorType: "system",
    outcome: "success",
    proposalId: payload.proposalId,
    meta: {
      templateKey: "proposal_published",
      hasClientEmail: payload.clientEmail ? "yes" : "no",
      companyName: payload.companyName
    }
  });

  const results: NotificationResult[] = [];

  if (payload.clientEmail) {
    const result = await sendEmail({
      to: payload.clientEmail,
      subject: proposalPublishedSubject(payload),
      html: proposalPublishedHtml(payload),
      templateKey: "proposal_published",
      proposalId: payload.proposalId
    });
    results.push(result);
  } else {
    audit({
      event: "notification.email.skipped",
      actorType: "system",
      outcome: "denied",
      reasonCode: "NO_CLIENT_EMAIL",
      proposalId: payload.proposalId,
      meta: { templateKey: "proposal_published" }
    });
  }

  // Future: WhatsApp channel
  // if (payload.clientPhone) { ... }

  return results;
}

/**
 * Notify that a proposal has been accepted.
 * Sends internal notification email to the proposal owner/team.
 */
export async function notifyProposalAccepted(
  payload: ProposalAcceptedPayload,
  internalRecipientEmail?: string
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  const recipient = internalRecipientEmail ?? process.env.EMAIL_INTERNAL_NOTIFICATIONS?.trim();

  if (recipient) {
    const result = await sendEmail({
      to: recipient,
      subject: proposalAcceptedSubject(payload),
      html: proposalAcceptedHtml(payload),
      templateKey: "proposal_accepted",
      proposalId: payload.proposalId
    });
    results.push(result);
  }

  return results;
}

/**
 * Notify that a proposal has been rejected.
 * Sends internal notification email.
 */
export async function notifyProposalRejected(
  payload: ProposalRejectedPayload,
  internalRecipientEmail?: string
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  const recipient = internalRecipientEmail ?? process.env.EMAIL_INTERNAL_NOTIFICATIONS?.trim();

  if (recipient) {
    const result = await sendEmail({
      to: recipient,
      subject: proposalRejectedSubject(payload),
      html: proposalRejectedHtml(payload),
      templateKey: "proposal_rejected",
      proposalId: payload.proposalId
    });
    results.push(result);
  }

  return results;
}

/**
 * Placeholder for future "expiring soon" notification.
 * Not triggered yet — will be called from a scheduled job.
 */
export async function notifyProposalExpiringSoon(
  _payload: import("@/lib/notifications/types").ProposalExpiringSoonPayload
): Promise<NotificationResult[]> {
  // Not implemented yet — return empty results.
  return [];
}
