/**
 * Notification channel abstraction.
 *
 * The domain layer calls notify* functions which resolve to one or more
 * channels (email today, WhatsApp in the future). Each channel has its
 * own provider implementation but shares a common result type.
 */

export type NotificationChannel = "email" | "whatsapp";

export type NotificationStatus = "sent" | "failed" | "skipped";

export interface NotificationResult {
  channel: NotificationChannel;
  status: NotificationStatus;
  providerMessageId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Proposal notification payloads (channel-agnostic)
// ---------------------------------------------------------------------------

export interface ProposalPublishedPayload {
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  clientEmail: string | null;
  companyName: string;
  publicLink: string;
  expiresAt: Date;
  publishedByName: string;
}

export interface ProposalAcceptedPayload {
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  clientEmail: string | null;
  companyName: string;
  acceptedByName?: string;
  acceptedAt: Date;
}

export interface ProposalRejectedPayload {
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  clientEmail: string | null;
  companyName: string;
  rejectedReason?: string;
  rejectedAt: Date;
}

export interface ProposalExpiringSoonPayload {
  proposalId: string;
  proposalNumber: string;
  clientName: string;
  clientEmail: string | null;
  companyName: string;
  expiresAt: Date;
}
