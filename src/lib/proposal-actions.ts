"use server";

import { redirect } from "next/navigation";

import { requireInternalSession } from "@/lib/auth/session";
import {
  cancelProposal,
  createAndSendProposal,
  createDraftProposal,
  sendDraftProposal,
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

export async function sendProposalDraftAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId = "";

  try {
    proposalId = getRequiredString(formData.get("proposalId"), "O ID da proposta é obrigatório.");
    const result = await sendDraftProposal({
      proposalId,
      session
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapSendDraftErrorCode(error);
    const fallbackPath = proposalId ? `/app/proposals/${proposalId}` : "/app/proposals";
    redirect(`${fallbackPath}?sendError=${encodeURIComponent(errorCode)}`);
  }

  redirect(`/app/proposals/${proposalId}?sent=1`);
}

export async function createAndSendProposalAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId: string | null = null;

  try {
    const leadSelection = parseJsonField<ProposalLeadSelection>(formData.get("leadSelection"));
    const selectedServices = parseJsonField<ProposalDraftSelection[]>(formData.get("selectedServices"));
    const result = await createAndSendProposal({
      session,
      leadSelection,
      selectedServices
    });

    proposalId = result.proposalId;
  } catch (error) {
    const errorCode = mapCreateAndSendErrorCode(error);
    redirect(`/app/proposals/new?error=${encodeURIComponent(errorCode)}`);
  }

  if (!proposalId) {
    redirect("/app/proposals/new?error=send_failed");
  }

  redirect(`/app/proposals/${proposalId}?sent=1`);
}

export async function cancelProposalAction(formData: FormData): Promise<void> {
  const session = await requireInternalSession();
  let proposalId = "";

  try {
    proposalId = getRequiredString(formData.get("proposalId"), "O ID da proposta é obrigatório.");
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
  const rawValue = getRequiredString(value, "O payload obrigatório da proposta não foi enviado.");

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    throw new Error("O payload da proposta é inválido.");
  }
}

function getRequiredString(value: FormDataEntryValue | null, message: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(message);
  }

  return value.trim();
}

function mapCreateDraftErrorCode(error: unknown): string {
  const message = getErrorMessage(error);

  if (message === "É necessário selecionar pelo menos um serviço do catálogo.") {
    return "no_services";
  }

  if (message === "Um ou mais serviços selecionados do catálogo estão indisponíveis.") {
    return "services_unavailable";
  }

  if (message === "Os dados do lead estão incompletos.") {
    return "lead_incomplete";
  }

  if (message === "O payload obrigatório da proposta não foi enviado.") {
    return "missing_payload";
  }

  if (message === "O payload da proposta é inválido.") {
    return "invalid_payload";
  }

  return "create_failed";
}

function mapSendDraftErrorCode(error: unknown): string {
  const message = getErrorMessage(error);

  if (message === "Proposta não encontrada.") {
    return "not_found";
  }

  if (message === "Apenas propostas em rascunho podem ser enviadas.") {
    return "invalid_status";
  }

  if (message === "O ID da proposta é obrigatório.") {
    return "missing_proposal_id";
  }

  return "send_failed";
}

function mapCreateAndSendErrorCode(error: unknown): string {
  const message = getErrorMessage(error);

  if (message === "É necessário selecionar pelo menos um serviço do catálogo.") {
    return "no_services";
  }

  if (message === "Um ou mais serviços selecionados do catálogo estão indisponíveis.") {
    return "services_unavailable";
  }

  if (message === "Os dados do lead estão incompletos.") {
    return "lead_incomplete";
  }

  if (message === "O payload obrigatório da proposta não foi enviado.") {
    return "missing_payload";
  }

  if (message === "O payload da proposta é inválido.") {
    return "invalid_payload";
  }

  return "send_failed";
}

function mapCancelErrorCode(error: unknown): string {
  const message = getErrorMessage(error);

  if (message === "Proposta não encontrada.") {
    return "not_found";
  }

  if (message === "Apenas propostas em aberto podem ser canceladas.") {
    return "invalid_status";
  }

  if (message === "O ID da proposta é obrigatório.") {
    return "missing_proposal_id";
  }

  return "cancel_failed";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "";
}
