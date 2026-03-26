import "server-only";

import { randomBytes } from "node:crypto";

import {
  LeadSource,
  LeadStatus,
  type ProposalEventType,
  type ProposalItem,
  type ProposalStatus
} from "@prisma/client";

import {
  getBillingTypeLabel,
  type ProposalBuilderLeadDraft
} from "@/lib/proposal-draft";
import { ProposalError } from "@/lib/proposal-errors";
interface ProposalLeadSelection {
  mode: "existing" | "create";
  leadId?: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  source?: string;
  notes?: string;
  assignedPartner?: string;
}

// ---------------------------------------------------------------------------
// Proposal number and slug
// ---------------------------------------------------------------------------

/**
 * Generates a collision-resistant proposal number: FRK-YYYYMMDD-XXXXXX
 * Uses 6 hex chars from crypto random (16M combinations per day).
 */
export function createProposalNumber(): string {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;
  const randomPart = randomBytes(3).toString("hex");

  return `FRK-${datePart}-${randomPart}`;
}

export function buildPublicProposalSlug(proposalNumber: string, companyName: string): string {
  const base = `${slugify(companyName)}-${proposalNumber.toLowerCase()}`;
  if (base.length <= 80) return base;
  return `${base.slice(0, 73)}-${randomBytes(3).toString("hex")}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

// ---------------------------------------------------------------------------
// Quantity
// ---------------------------------------------------------------------------

export function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
}

// ---------------------------------------------------------------------------
// Lead helpers
// ---------------------------------------------------------------------------

export function getLeadStatusAfterProposalLink(status: LeadStatus): LeadStatus {
  switch (status) {
    case "NEW":
    case "QUALIFIED":
    case "DISCOVERY":
      return "PROPOSAL";
    case "PROPOSAL":
    case "WON":
    case "LOST":
    case "ARCHIVED":
    default:
      return status;
  }
}

export function toLeadDraft(selection: ProposalLeadSelection): ProposalBuilderLeadDraft {
  const fullName = selection.fullName?.trim() ?? "";
  const company = selection.company?.trim() ?? "";
  const email = selection.email?.trim() ?? "";
  const phone = selection.phone?.trim() ?? "";
  const source = selection.source?.trim() ?? "";
  const notes = selection.notes?.trim() ?? "";
  const assignedPartner = selection.assignedPartner?.trim() ?? "";

  if (!fullName || !company || !email || !phone || !source || !assignedPartner) {
    throw new ProposalError("LEAD_INCOMPLETE", "Os dados do lead estão incompletos.");
  }

  return {
    fullName,
    company,
    email,
    phone,
    source,
    notes,
    assignedPartner
  };
}

export function mapLeadSource(value: string): LeadSource {
  switch (value.trim().toLowerCase()) {
    case "referral":
    case "indicacao":
    case "indicação":
      return "REFERRAL";
    case "inbound":
    case "entrada":
      return "INBOUND";
    case "outbound":
    case "prospeccao":
    case "prospecção":
      return "OUTBOUND";
    case "partner":
    case "socio":
    case "sócio":
      return "PARTNER";
    case "event":
    case "evento":
      return "EVENT";
    default:
      return "OTHER";
  }
}

export function formatLeadSource(source: LeadSource): string {
  switch (source) {
    case "REFERRAL":
      return "Indicação";
    case "INBOUND":
      return "Inbound";
    case "OUTBOUND":
      return "Outbound";
    case "PARTNER":
      return "Sócio";
    case "EVENT":
      return "Evento";
    case "OTHER":
    default:
      return "Outro";
  }
}

export function formatLeadStatus(status: LeadStatus): string {
  switch (status) {
    case "NEW":
      return "Novo";
    case "QUALIFIED":
      return "Qualificado";
    case "DISCOVERY":
      return "Descoberta";
    case "PROPOSAL":
      return "Proposta";
    case "WON":
      return "Ganho";
    case "LOST":
      return "Perdido";
    case "ARCHIVED":
    default:
      return "Arquivado";
  }
}

// ---------------------------------------------------------------------------
// Billing / event formatters
// ---------------------------------------------------------------------------

export function formatBillingLabel(billingType: ProposalItem["billingTypeSnapshot"]): string {
  return getBillingTypeLabel(billingType);
}

export function formatProposalEventTitle(type: ProposalEventType): string {
  switch (type) {
    case "CREATED":
      return "Rascunho criado";
    case "PUBLIC_TOKEN_ISSUED":
      return "Token público emitido";
    case "SENT":
      return "Proposta publicada";
    case "VIEWED":
      return "Primeira visualização registrada";
    case "ACCEPTED":
      return "Proposta aceita";
    case "CANCELLED":
      return "Proposta cancelada";
    case "EXPIRED":
      return "Proposta expirada";
    case "PDF_GENERATION_QUEUED":
      return "PDF da proposta aceita disponível";
    default:
      return "Evento da proposta";
  }
}

export function formatProposalEventDescription(type: ProposalEventType): string {
  switch (type) {
    case "CREATED":
      return "O rascunho da proposta foi criado a partir do builder interno.";
    case "PUBLIC_TOKEN_ISSUED":
      return "O token público seguro da proposta foi emitido para revisão do cliente.";
    case "SENT":
      return "A proposta foi publicada e entrou em revisão do cliente.";
    case "VIEWED":
      return "A primeira visualização pública da proposta foi registrada.";
    case "ACCEPTED":
      return "A proposta foi aceita pelo fluxo seguro de clique para aceitar.";
    case "REJECTED":
      return "A proposta foi recusada pelo cliente no fluxo público.";
    case "CANCELLED":
      return "A proposta foi cancelada e bloqueada para edições livres.";
    case "EXPIRED":
      return "A janela de revisão da proposta expirou.";
    case "PDF_GENERATION_QUEUED":
      return "A proposta aceita agora pode ser aberta pela rota segura de PDF baseada no snapshot salvo.";
    case "CHECKLIST_ITEM_COMPLETED":
      return "Um item do checklist foi marcado como concluído.";
    default:
      return "Ocorreu uma atualização no fluxo da proposta.";
  }
}

// ---------------------------------------------------------------------------
// JSON helpers
// ---------------------------------------------------------------------------

export function parseJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

export function isLockedStatus(status: ProposalStatus): boolean {
  return ["ACCEPTED", "CANCELLED", "EXPIRED"].includes(status);
}

import { Prisma } from "@prisma/client";

export function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
