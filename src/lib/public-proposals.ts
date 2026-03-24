import "server-only";

import type { ProposalEventType, ProposalStatus } from "@prisma/client";

import {
  formatProposalWorkflowStatus,
  resolveProposalWorkflow,
  type ProposalWorkflowEvent,
  type ProposalWorkflowResolution,
  type ProposalWorkflowStatus
} from "@/lib/proposal-lifecycle";
import {
  buildPublicProposalSnapshotFromRecord,
  getProposalTokenValueByPublicSlug,
  getPublicProposalRecordByToken
} from "@/lib/proposal-store";
import { formatDate, formatDateTime } from "@/lib/utils";

export interface PublicProposalSelectedServiceSnapshot {
  internalCode: string;
  serviceName: string;
  publicName: string;
  description: string;
  billingLabel: string;
  unitLabel: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  requiredDocuments: string[];
}

export interface PublicProposalSnapshot {
  token: string;
  legacySlug: string;
  proposalNumber: string;
  title: string;
  coverTagline: string;
  status: ProposalWorkflowStatus;
  companyName: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  draftedAt: string;
  preparedAt: string;
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  onebridgeInstitutionalPresentation: string[];
  proposalIntroduction: string[];
  selectedServices: PublicProposalSelectedServiceSnapshot[];
  specificTerms: string[];
  investmentIntro: string;
  requiredDocuments: string[];
  documentSubmissionInstructions: string[];
  generalTerms: string[];
  acceptanceText: string;
  paymentIntro: string;
  closingParagraph: string;
}

export interface ResolvedPublicProposal {
  snapshot: PublicProposalSnapshot;
  lifecycle: ProposalWorkflowResolution;
  statusLabel: string;
  statusTitle: string;
  statusMessage: string;
  showDetails: boolean;
  totalInvestmentCents: number;
  isEditable: boolean;
  futureAutomationReady: boolean;
}

export async function getPublicProposalSnapshotByToken(
  token: string,
  options?: {
    recordView?: boolean;
  }
): Promise<PublicProposalSnapshot | null> {
  const proposal = await getPublicProposalRecordByToken({
    token,
    recordView: options?.recordView
  });

  if (!proposal) {
    return null;
  }

  const mapped = buildPublicProposalSnapshotFromRecord(proposal);

  if (!mapped.token) {
    return null;
  }

  return {
    token: mapped.token,
    legacySlug: mapped.legacySlug,
    proposalNumber: mapped.proposalNumber,
    title: mapped.title,
    coverTagline: mapped.content.coverTagline,
    status: mapProposalStatus(mapped.status),
    companyName: mapped.companyName,
    contactName: mapped.contactName,
    contactTitle: mapped.contactTitle,
    contactEmail: mapped.contactEmail,
    draftedAt: mapped.draftedAt,
    preparedAt: mapped.preparedAt,
    sentAt: mapped.sentAt,
    expiresAt: mapped.expiresAt,
    acceptedAt: mapped.acceptedAt,
    rejectedAt: mapped.rejectedAt,
    cancelledAt: mapped.cancelledAt,
    onebridgeInstitutionalPresentation: mapped.content.onebridgeInstitutionalPresentation,
    proposalIntroduction: mapped.content.proposalIntroduction,
    selectedServices: mapped.selectedServices,
    specificTerms: mapped.content.specificTerms,
    investmentIntro: mapped.content.investmentIntro,
    requiredDocuments: mapped.content.requiredDocuments,
    documentSubmissionInstructions: mapped.content.documentSubmissionInstructions,
    generalTerms: mapped.content.generalTerms,
    acceptanceText: mapped.content.acceptanceText,
    paymentIntro: mapped.content.paymentIntro,
    closingParagraph: mapped.content.closingParagraph
  };
}

export async function getPublicProposalByLegacySlug(
  slug: string
): Promise<PublicProposalSnapshot | null> {
  const token = await getProposalTokenValueByPublicSlug(slug);

  if (!token) {
    return null;
  }

  return getPublicProposalSnapshotByToken(token, {
    recordView: false
  });
}

export function resolvePublicProposal(
  snapshot: PublicProposalSnapshot,
  eventLog: ProposalWorkflowEvent[] = []
): ResolvedPublicProposal {
  const lifecycle = resolveProposalWorkflow({
    proposalNumber: snapshot.proposalNumber,
    baseStatus: snapshot.status,
    draftedAt: snapshot.draftedAt,
    sentAt: snapshot.sentAt,
    firstViewedAt: getFirstViewedAt(eventLog),
    acceptedAt: snapshot.acceptedAt ?? null,
    rejectedAt: snapshot.rejectedAt ?? null,
    cancelledAt: snapshot.cancelledAt ?? null,
    expiresAt: snapshot.expiresAt
  });

  if (eventLog.length > 0) {
    lifecycle.eventLog = eventLog;
  }

  return {
    snapshot,
    lifecycle,
    statusLabel: formatProposalWorkflowStatus(lifecycle.status),
    statusTitle: getPublicProposalStatusTitle(lifecycle.status),
    statusMessage: getPublicProposalStatusMessage(lifecycle.status, snapshot, lifecycle),
    showDetails: lifecycle.status !== "DRAFT",
    totalInvestmentCents: snapshot.selectedServices.reduce(
      (sum, item) => sum + item.subtotalCents,
      0
    ),
    isEditable: lifecycle.isEditable,
    futureAutomationReady: lifecycle.pendingAutomation.some(
      (automation) => automation.key === "GENERATE_ACCEPTED_PDF"
    )
  };
}

export function mapProposalEventsToWorkflowEventLog(
  events: Array<{
    id: string;
    type: ProposalEventType;
    description: string;
    occurredAt: string;
  }>
): ProposalWorkflowEvent[] {
  const workflowEvents: ProposalWorkflowEvent[] = [];

  for (const event of events) {
    const mappedType = mapEventType(event.type);

    if (!mappedType) {
      continue;
    }

    workflowEvents.push({
      id: event.id,
      type: mappedType.type,
      status: mappedType.status,
      occurredAt: event.occurredAt,
      title: mappedType.title,
      description: mappedType.description,
      metadata:
        event.type === "PDF_GENERATION_QUEUED"
          ? {
              futureAction: "GENERATE_ACCEPTED_PDF"
            }
          : undefined
    });
  }

  return workflowEvents;
}

function mapProposalStatus(status: ProposalStatus): ProposalWorkflowStatus {
  switch (status) {
    case "ACCEPTED":
      return "ACCEPTED";
    case "VIEWED":
      return "VIEWED";
    case "SENT":
      return "SENT";
    case "REJECTED":
      return "REJECTED";
    case "CANCELLED":
      return "CANCELLED";
    case "EXPIRED":
      return "EXPIRED";
    case "DRAFT":
    default:
      return "DRAFT";
  }
}

function getPublicProposalStatusTitle(status: ProposalWorkflowStatus): string {
  switch (status) {
    case "ACCEPTED":
      return "Proposta aceita";
    case "REJECTED":
      return "Proposta recusada";
    case "CANCELLED":
      return "Proposta cancelada";
    case "EXPIRED":
      return "Proposta expirada";
    case "DRAFT":
      return "Proposta indisponível";
    case "VIEWED":
      return "Proposta visualizada";
    case "SENT":
    default:
      return "Proposta pronta para revisão";
  }
}

function getPublicProposalStatusMessage(
  status: ProposalWorkflowStatus,
  snapshot: PublicProposalSnapshot,
  lifecycle: ProposalWorkflowResolution
): string {
  switch (status) {
    case "ACCEPTED":
      return lifecycle.acceptedAt
        ? `O aceite foi registrado em ${formatDateTime(lifecycle.acceptedAt)}. Esta página agora funciona como cópia somente leitura do snapshot aceito.`
        : "O aceite já foi registrado para esta proposta. Esta página agora funciona como cópia somente leitura do snapshot aceito.";
    case "REJECTED":
      return lifecycle.rejectedAt
        ? `A proposta foi recusada em ${formatDateTime(lifecycle.rejectedAt)}. Esta página agora funciona como registro somente leitura.`
        : "A proposta foi recusada pelo cliente.";
    case "CANCELLED":
      return "Esta proposta foi cancelada e agora está bloqueada para edição livre ou aceite.";
    case "EXPIRED":
      return `A janela de revisão foi encerrada em ${formatDate(snapshot.expiresAt)}. Fale com a equipe se precisar de uma proposta atualizada.`;
    case "DRAFT":
      return "Este link privado não está atualmente em estado de revisão do cliente, então o aceite está desabilitado.";
    case "VIEWED":
      return "A proposta já foi visualizada e continua disponível para aceite enquanto a janela de revisão estiver aberta.";
    case "SENT":
    default:
      return "Este link seguro mostra o snapshot exato da proposta preparada para sua empresa. Ele não expõe o catálogo interno usado pela equipe.";
  }
}

function getFirstViewedAt(events: ProposalWorkflowEvent[]): string | null {
  return events.find((event) => event.type === "FIRST_VIEWED")?.occurredAt ?? null;
}

function mapEventType(type: ProposalEventType): {
  type: ProposalWorkflowEvent["type"];
  status: ProposalWorkflowEvent["status"];
  title: string;
  description: string;
} | null {
  switch (type) {
    case "CREATED":
      return {
        type: "DRAFT_CREATED",
        status: "DRAFT",
        title: "Rascunho criado",
        description: "O rascunho da proposta foi criado no fluxo interno."
      };
    case "SENT":
      return {
        type: "SENT",
        status: "SENT",
        title: "Proposta enviada",
        description: "A proposta foi enviada e entrou em revisão do cliente."
      };
    case "PUBLIC_TOKEN_ISSUED":
      return null;
    case "VIEWED":
      return {
        type: "FIRST_VIEWED",
        status: "VIEWED",
        title: "Primeira visualização registrada",
        description: "A primeira visualização do link privado foi registrada."
      };
    case "ACCEPTED":
      return {
        type: "ACCEPTED",
        status: "ACCEPTED",
        title: "Proposta aceita",
        description: "O aceite foi registrado pelo fluxo seguro de clique para aceitar."
      };
    case "REJECTED":
      return {
        type: "REJECTED",
        status: "REJECTED",
        title: "Proposta recusada",
        description: "O cliente recusou a proposta pelo fluxo público."
      };
    case "CANCELLED":
      return {
        type: "CANCELLED",
        status: "CANCELLED",
        title: "Proposta cancelada",
        description: "A proposta foi cancelada e ficou bloqueada para edição livre."
      };
    case "EXPIRED":
      return {
        type: "EXPIRED",
        status: "EXPIRED",
        title: "Proposta expirada",
        description: "A janela de revisão foi encerrada antes do aceite."
      };
    case "PDF_GENERATION_QUEUED":
      return {
        type: "ACCEPTED",
        status: "ACCEPTED",
        title: "Geração de PDF enfileirada",
        description: "A proposta aceita foi marcada como pronta para geração de PDF."
      };
    default:
      return null;
  }
}
