import type { ProposalStatus } from "@prisma/client";

import type { StatusTone } from "@/components/ui/status-pill";

export const proposalDisplayStatuses = [
  "Aceita",
  "Visualizada",
  "Enviada",
  "Rascunho",
  "Recusada",
  "Cancelada",
  "Expirada"
] as const;

export type ProposalDisplayStatus = (typeof proposalDisplayStatuses)[number];

export function getProposalStatusTone(status: ProposalDisplayStatus): StatusTone {
  switch (status) {
    case "Aceita":
      return "success";
    case "Visualizada":
    case "Enviada":
      return "accent";
    case "Rascunho":
      return "warning";
    case "Recusada":
    case "Cancelada":
    case "Expirada":
      return "neutral";
  }
}

export function getProposalStatusSortOrder(status: ProposalDisplayStatus): number {
  return proposalDisplayStatuses.indexOf(status);
}

export function isProposalStatusLocked(status: ProposalDisplayStatus): boolean {
  return ["Aceita", "Recusada", "Cancelada", "Expirada"].includes(status);
}

export function mapDatabaseProposalStatus(status: ProposalStatus): ProposalDisplayStatus {
  switch (status) {
    case "ACCEPTED":
      return "Aceita";
    case "VIEWED":
      return "Visualizada";
    case "SENT":
      return "Enviada";
    case "REJECTED":
      return "Recusada";
    case "CANCELLED":
      return "Cancelada";
    case "EXPIRED":
      return "Expirada";
    case "DRAFT":
    default:
      return "Rascunho";
  }
}

export function mapDisplayProposalStatusToDatabase(status: ProposalDisplayStatus): ProposalStatus {
  switch (status) {
    case "Aceita":
      return "ACCEPTED";
    case "Visualizada":
      return "VIEWED";
    case "Enviada":
      return "SENT";
    case "Recusada":
      return "REJECTED";
    case "Cancelada":
      return "CANCELLED";
    case "Expirada":
      return "EXPIRED";
    case "Rascunho":
    default:
      return "DRAFT";
  }
}
