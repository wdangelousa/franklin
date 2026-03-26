"use server";

import { redirect } from "next/navigation";

import { requireInternalSession } from "@/lib/auth/session";
import { getProposalErrorCode } from "@/lib/proposal-errors";
import {
  cancelProposal,
  createAndPublishProposal,
  createDraftProposal,
  publishDraftProposal,
  type ProposalDraftSelection,
  type ProposalLeadSelection
} from "@/lib/proposal-store";

export async function createProposalDraftAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId: string | null = null;

  try {
    const leadSelection = parseJsonField<ProposalLeadSelection>(formData.get("leadSelection"));
    const selectedServices = parseJsonField<ProposalDraftSelection[]>(formData.get("selectedServices"));
    const result = await createDraftProposal({
      session,
      leadSelection,
      selectedServices
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapCreateDraftErrorCode(error);
    redirect(`/app/proposals/new?error=${encodeURIComponent(errorCode)}`);
  }

  if (!proposalId) {
    redirect("/app/proposals/new?error=create_failed");
  }

  redirect(`/app/proposals/${proposalId}?created=1`);
}

export async function publishProposalDraftAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId = "";

  try {
    proposalId = getRequiredString(formData.get("proposalId")) ?? "";
    if (!proposalId) throw new Error("O ID da proposta é obrigatório.");
    const result = await publishDraftProposal({
      proposalId,
      session
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapPublishDraftErrorCode(error);
    const fallbackPath = proposalId ? `/app/proposals/${proposalId}` : "/app/proposals";
    redirect(`${fallbackPath}?publishError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/app/proposals/${proposalId}?published=1`);
}

/** @deprecated Use publishProposalDraftAction. Kept for backwards compatibility with existing forms. */
export const sendProposalDraftAction = publishProposalDraftAction;

export async function createAndPublishProposalAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId: string | null = null;

  try {
    const leadSelection = parseJsonField<ProposalLeadSelection>(formData.get("leadSelection"));
    const selectedServices = parseJsonField<ProposalDraftSelection[]>(formData.get("selectedServices"));
    const result = await createAndPublishProposal({
      session,
      leadSelection,
      selectedServices
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapCreateAndPublishErrorCode(error);
    redirect(`/app/proposals/new?error=${encodeURIComponent(errorCode)}`);
  }

  if (!proposalId) {
    redirect("/app/proposals/new?error=publish_failed");
  }

  redirect(`/app/proposals/${proposalId}?published=1`);
}

/** @deprecated Use createAndPublishProposalAction. */
export const createAndSendProposalAction = createAndPublishProposalAction;

export async function cancelProposalAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId = "";

  try {
    proposalId = getRequiredString(formData.get("proposalId")) ?? "";
    if (!proposalId) throw new Error("O ID da proposta é obrigatório.");
    const result = await cancelProposal({
      proposalId,
      session
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapCancelErrorCode(error);
    const fallbackPath = proposalId ? `/app/proposals/${proposalId}` : "/app/proposals";
    redirect(`${fallbackPath}?cancelError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/app/proposals/${proposalId}?cancelled=1`);
}

function parseJsonField<T>(value: FormDataEntryValue | null): T {
  const rawValue = getRequiredString(value);

  if (!rawValue) {
    throw new Error("O payload obrigatório da proposta não foi enviado.");
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    throw new Error("O payload da proposta é inválido.");
  }
}

function getRequiredString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim();
}

const ERROR_CODE_MAP: Record<string, string> = {
  NO_SERVICES: "no_services",
  SERVICES_UNAVAILABLE: "services_unavailable",
  LEAD_INCOMPLETE: "lead_incomplete",
  MISSING_PAYLOAD: "missing_payload",
  INVALID_PAYLOAD: "invalid_payload",
  PROPOSAL_NOT_FOUND: "not_found",
  INVALID_STATUS_FOR_PUBLISH: "invalid_status",
  INVALID_STATUS_FOR_CANCEL: "invalid_status",
  PROPOSAL_ID_REQUIRED: "missing_proposal_id"
};

function mapCreateDraftErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  return (code && ERROR_CODE_MAP[code]) ?? "create_failed";
}

function mapPublishDraftErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  return (code && ERROR_CODE_MAP[code]) ?? "publish_failed";
}

function mapCreateAndPublishErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  return (code && ERROR_CODE_MAP[code]) ?? "publish_failed";
}

function mapCancelErrorCode(error: unknown): string {
  const code = getProposalErrorCode(error);
  return (code && ERROR_CODE_MAP[code]) ?? "cancel_failed";
}
