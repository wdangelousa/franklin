export const proposalWorkflowStatuses = [
  "DRAFT",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED"
] as const;

export type ProposalWorkflowStatus = (typeof proposalWorkflowStatuses)[number];

export const proposalWorkflowEventTypes = [
  "DRAFT_CREATED",
  "SENT",
  "FIRST_VIEWED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED"
] as const;

export type ProposalWorkflowEventType = (typeof proposalWorkflowEventTypes)[number];

export interface ProposalWorkflowEvent {
  id: string;
  type: ProposalWorkflowEventType;
  status: ProposalWorkflowStatus;
  occurredAt: string;
  title: string;
  description: string;
  metadata?: {
    futureAction?: "GENERATE_ACCEPTED_PDF";
  };
}

export interface ProposalWorkflowAutomation {
  key: "GENERATE_ACCEPTED_PDF";
  label: string;
  description: string;
}

export interface ProposalWorkflowResolution {
  status: ProposalWorkflowStatus;
  draftedAt: string | null;
  sentAt: string | null;
  firstViewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
  canAccept: boolean;
  canReject: boolean;
  isEditable: boolean;
  lockReason: string | null;
  eventLog: ProposalWorkflowEvent[];
  pendingAutomation: ProposalWorkflowAutomation[];
}

interface ProposalWorkflowInput {
  proposalNumber: string;
  baseStatus: ProposalWorkflowStatus;
  draftedAt?: string | null;
  sentAt?: string | null;
  firstViewedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  cancelledAt?: string | null;
  expiresAt?: string | null;
}

export function resolveProposalWorkflow(input: ProposalWorkflowInput): ProposalWorkflowResolution {
  const draftedAt = normalizeTimestamp(input.draftedAt);
  const sentAt = normalizeTimestamp(input.sentAt);
  const firstViewedAt = normalizeTimestamp(input.firstViewedAt);
  const acceptedAt = normalizeTimestamp(input.acceptedAt);
  const rejectedAt = normalizeTimestamp(input.rejectedAt);
  const cancelledAt = normalizeTimestamp(input.cancelledAt);
  const expiresAt = normalizeTimestamp(input.expiresAt);
  const expiredAt =
    !acceptedAt && !rejectedAt && !cancelledAt && (input.baseStatus === "EXPIRED" || isTimestampInPast(expiresAt))
      ? expiresAt ?? sentAt ?? draftedAt ?? new Date().toISOString()
      : null;

  const status = resolveWorkflowStatus({
    baseStatus: input.baseStatus,
    sentAt,
    firstViewedAt,
    acceptedAt,
    rejectedAt,
    cancelledAt,
    expiredAt
  });

  return {
    status,
    draftedAt,
    sentAt,
    firstViewedAt,
    acceptedAt,
    rejectedAt,
    cancelledAt,
    expiredAt,
    canAccept: canTransitionProposalStatus(status, "ACCEPTED"),
    canReject: canTransitionProposalStatus(status, "REJECTED"),
    isEditable: isProposalEditable(status),
    lockReason: getProposalLockReason(status),
    eventLog: buildProposalEventLog({
      proposalNumber: input.proposalNumber,
      draftedAt,
      sentAt,
      firstViewedAt,
      acceptedAt,
      rejectedAt,
      cancelledAt,
      expiredAt
    }),
    pendingAutomation: acceptedAt
      ? [
          {
            key: "GENERATE_ACCEPTED_PDF",
            label: "PDF da proposta aceita disponível",
            description:
              "A aceitação foi registrada com sucesso. A rota segura de PDF da proposta aceita já pode ser usada a partir do snapshot salvo."
          }
        ]
      : []
  };
}

export function canTransitionProposalStatus(
  currentStatus: ProposalWorkflowStatus,
  nextStatus: ProposalWorkflowStatus
): boolean {
  const allowedTransitions: Record<ProposalWorkflowStatus, ProposalWorkflowStatus[]> = {
    DRAFT: ["SENT", "CANCELLED"],
    SENT: ["VIEWED", "ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"],
    VIEWED: ["ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"],
    ACCEPTED: [],
    REJECTED: [],
    CANCELLED: [],
    EXPIRED: []
  };

  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function isProposalEditable(status: ProposalWorkflowStatus): boolean {
  return !["ACCEPTED", "REJECTED", "CANCELLED", "EXPIRED"].includes(status);
}

export function formatProposalWorkflowStatus(status: ProposalWorkflowStatus): string {
  switch (status) {
    case "DRAFT":
      return "Rascunho";
    case "SENT":
      return "Enviada";
    case "VIEWED":
      return "Visualizada";
    case "ACCEPTED":
      return "Aceita";
    case "REJECTED":
      return "Recusada";
    case "CANCELLED":
      return "Cancelada";
    case "EXPIRED":
      return "Expirada";
  }
}

function resolveWorkflowStatus(args: {
  baseStatus: ProposalWorkflowStatus;
  sentAt: string | null;
  firstViewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
}): ProposalWorkflowStatus {
  if (args.acceptedAt || args.baseStatus === "ACCEPTED") {
    return "ACCEPTED";
  }

  if (args.rejectedAt || args.baseStatus === "REJECTED") {
    return "REJECTED";
  }

  if (args.cancelledAt || args.baseStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (args.expiredAt) {
    return "EXPIRED";
  }

  if (args.firstViewedAt || args.baseStatus === "VIEWED") {
    return "VIEWED";
  }

  if (args.sentAt || args.baseStatus === "SENT") {
    return "SENT";
  }

  return "DRAFT";
}

function buildProposalEventLog(args: {
  proposalNumber: string;
  draftedAt: string | null;
  sentAt: string | null;
  firstViewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  expiredAt: string | null;
}): ProposalWorkflowEvent[] {
  const events: ProposalWorkflowEvent[] = [];

  if (args.draftedAt) {
    events.push({
      id: `${args.proposalNumber}-draft`,
      type: "DRAFT_CREATED",
      status: "DRAFT",
      occurredAt: args.draftedAt,
      title: "Rascunho criado",
      description: "O rascunho da proposta foi criado e preparado para revisão interna."
    });
  }

  if (args.sentAt) {
    events.push({
      id: `${args.proposalNumber}-sent`,
      type: "SENT",
      status: "SENT",
      occurredAt: args.sentAt,
      title: "Proposta enviada",
      description: "O link seguro da proposta foi liberado para o cliente."
    });
  }

  if (args.firstViewedAt) {
    events.push({
      id: `${args.proposalNumber}-first-viewed`,
      type: "FIRST_VIEWED",
      status: "VIEWED",
      occurredAt: args.firstViewedAt,
      title: "Primeira visualização registrada",
      description: "O link privado da proposta foi aberto pela primeira vez."
    });
  }

  if (args.acceptedAt) {
    events.push({
      id: `${args.proposalNumber}-accepted`,
      type: "ACCEPTED",
      status: "ACCEPTED",
      occurredAt: args.acceptedAt,
      title: "Proposta aceita",
      description: "A aceitação foi registrada pelo fluxo seguro de clique para aceitar.",
      metadata: {
        futureAction: "GENERATE_ACCEPTED_PDF"
      }
    });
  }

  if (args.rejectedAt) {
    events.push({
      id: `${args.proposalNumber}-rejected`,
      type: "REJECTED",
      status: "REJECTED",
      occurredAt: args.rejectedAt,
      title: "Proposta recusada",
      description: "O cliente recusou a proposta pelo fluxo público."
    });
  }

  if (args.cancelledAt) {
    events.push({
      id: `${args.proposalNumber}-cancelled`,
      type: "CANCELLED",
      status: "CANCELLED",
      occurredAt: args.cancelledAt,
      title: "Proposta cancelada",
      description: "A proposta foi cancelada e agora está bloqueada para edição livre."
    });
  }

  if (args.expiredAt) {
    events.push({
      id: `${args.proposalNumber}-expired`,
      type: "EXPIRED",
      status: "EXPIRED",
      occurredAt: args.expiredAt,
      title: "Proposta expirada",
      description: "A janela de revisão foi encerrada antes do registro da aceitação."
    });
  }

  return events.sort(
    (left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt)
  );
}

function getProposalLockReason(status: ProposalWorkflowStatus): string | null {
  switch (status) {
    case "ACCEPTED":
      return "Propostas aceitas ficam bloqueadas para que o snapshot comercial não seja reescrito após a aprovação do cliente.";
    case "REJECTED":
      return "Propostas recusadas ficam bloqueadas para preservar o registro da decisão do cliente.";
    case "CANCELLED":
      return "Propostas canceladas ficam bloqueadas para preservar o registro final do fluxo.";
    case "EXPIRED":
      return "Propostas expiradas permanecem somente leitura até que uma nova proposta seja emitida.";
    case "DRAFT":
    case "SENT":
    case "VIEWED":
      return null;
  }
}

function normalizeTimestamp(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return Number.isNaN(Date.parse(value)) ? null : value;
}

function isTimestampInPast(value: string | null): boolean {
  return value ? Date.parse(value) < Date.now() : false;
}
