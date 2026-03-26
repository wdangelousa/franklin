import "server-only";

import {
  ChecklistItemSide,
  type ProposalEventType,
  type ProposalStatus
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createProposalToken, decryptProposalToken, hashProposalToken } from "@/lib/proposal-token";
import {
  parseProposalContentSnapshot,
  type ProposalContentSnapshot
} from "@/lib/proposal-content";
import {
  formatBillingLabel,
  formatProposalEventDescription,
  parseJsonStringArray,
  toJsonValue
} from "@/lib/proposal-store-helpers";
import { syncExpiredProposalById, syncExpiredProposalStatusInTransaction } from "@/lib/proposal-store-expiration";
import { ProposalError } from "@/lib/proposal-errors";
import { getUnitLabel } from "@/lib/proposal-draft";

type PrismaTx = Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProposalWithRelations = import("@prisma/client").Proposal & {
  lead: {
    id: string;
    companyName: string;
    contactName: string;
    contactEmail: string | null;
    contactPhone: string | null;
  } | null;
  owner: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  items: import("@prisma/client").ProposalItem[];
  events: import("@prisma/client").ProposalEvent[];
  publicTokens: import("@prisma/client").ProposalPublicToken[];
};

export interface ProposalChecklistItemRecord {
  id: string;
  proposalId: string;
  side: ChecklistItemSide;
  title: string;
  description: string | null;
  sortOrder: number;
  isCompleted: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Public token lookup
// ---------------------------------------------------------------------------

export async function getProposalTokenValueByPublicSlug(slug: string): Promise<string | null> {
  const proposal = await prisma.proposal.findUnique({
    where: {
      publicSlug: slug
    },
    include: {
      publicTokens: {
        where: {
          revokedAt: null
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    }
  });

  if (!proposal) {
    return null;
  }

  return decryptProposalToken(proposal.publicTokens[0]?.tokenCiphertext ?? null);
}

export async function getPublicProposalRecordByToken(args: {
  token: string;
  recordView?: boolean;
}): Promise<ProposalWithRelations | null> {
  const tokenHash = hashProposalToken(args.token);
  const tokenRecord = await prisma.proposalPublicToken.findUnique({
    where: {
      tokenHash
    },
    include: {
      proposal: {
        include: {
          lead: {
            select: {
              id: true,
              companyName: true,
              contactName: true,
              contactEmail: true,
              contactPhone: true
            }
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          items: {
            orderBy: {
              sortOrder: "asc"
            }
          },
          events: {
            orderBy: {
              occurredAt: "asc"
            }
          },
          publicTokens: {
            where: {
              revokedAt: null
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      }
    }
  });

  if (!tokenRecord || tokenRecord.revokedAt) {
    return null;
  }

  // Check token-level expiration
  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    return null;
  }

  await syncExpiredProposalById(tokenRecord.proposalId, tokenRecord.proposal.organizationId);

  if (args.recordView !== false) {
    await recordProposalViewIfNeeded(tokenRecord.proposalId, tokenRecord.id);
  }

  const proposal = await prisma.proposal.findUnique({
    where: {
      id: tokenRecord.proposalId
    },
    include: {
      lead: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true
        }
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      items: {
        orderBy: {
          sortOrder: "asc"
        }
      },
      events: {
        orderBy: {
          occurredAt: "asc"
        }
      },
      publicTokens: {
        where: {
          revokedAt: null
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  return proposal as ProposalWithRelations | null;
}

// ---------------------------------------------------------------------------
// Public snapshot builder
// ---------------------------------------------------------------------------

export function buildPublicProposalSnapshotFromRecord(proposal: ProposalWithRelations): {
  token: string | null;
  legacySlug: string;
  proposalNumber: string;
  title: string;
  status: ProposalStatus;
  companyName: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  draftedAt: string;
  preparedAt: string;
  sentAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  selectedServices: Array<{
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
    deliverables: string[];
    submissionNotes: string | null;
    specificClause: string | null;
  }>;
  content: ProposalContentSnapshot;
  eventLog: Array<{
    id: string;
    type: ProposalEventType;
    occurredAt: string;
    description: string;
  }>;
} {
  const activeToken = proposal.publicTokens.find((token) => !token.revokedAt) ?? null;
  const selectedServices = proposal.items.map((item) => ({
    internalCode: item.serviceCodeSnapshot,
    serviceName: item.serviceNameSnapshot,
    publicName: item.servicePublicNameSnapshot,
    description: item.serviceDescriptionSnapshot ?? item.serviceShortDescriptionSnapshot ?? "",
    billingLabel: formatBillingLabel(item.billingTypeSnapshot),
    unitLabel: getUnitLabel(item.unitLabelSnapshot),
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    subtotalCents: item.subtotalCents,
    requiredDocuments: parseJsonStringArray(item.requiredDocumentsSnapshot),
    deliverables: parseJsonStringArray(item.deliverablesSnapshot),
    submissionNotes: item.submissionNotesSnapshot ?? null,
    specificClause: item.specificClauseSnapshot ?? null
  }));
  const content = parseProposalContentSnapshot(proposal.contentSnapshot, {
    companyName: proposal.clientCompanyName,
    contactName: proposal.clientContactName,
    services: proposal.items.map((item) => ({
      internalCode: item.serviceCodeSnapshot,
      categoryCode: item.categoryCodeSnapshot,
      serviceName: item.serviceNameSnapshot,
      publicName: item.servicePublicNameSnapshot,
      specificClause: item.specificClauseSnapshot,
      requiredDocuments: parseJsonStringArray(item.requiredDocumentsSnapshot)
    }))
  });
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  };

  return {
    token: activeToken ? decryptProposalToken(activeToken.tokenCiphertext) : null,
    legacySlug: proposal.publicSlug,
    proposalNumber: proposal.proposalNumber,
    title: proposal.title,
    status: proposal.status,
    companyName: proposal.clientCompanyName,
    contactName: proposal.clientContactName,
    contactTitle: proposal.clientContactTitle ?? "Contato principal",
    contactEmail: proposal.clientContactEmail ?? "",
    draftedAt: proposal.createdAt.toISOString(),
    preparedAt: proposal.createdAt.toISOString(),
    sentAt: proposal.sentAt?.toISOString() ?? proposal.createdAt.toISOString(),
    expiresAt: proposal.expiresAt?.toISOString() ?? addDays(proposal.createdAt, 14).toISOString(),
    acceptedAt: proposal.acceptedAt?.toISOString() ?? null,
    rejectedAt: proposal.rejectedAt?.toISOString() ?? null,
    cancelledAt: proposal.cancelledAt?.toISOString() ?? null,
    selectedServices,
    content,
    eventLog: proposal.events.map((event) => ({
      id: event.id,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      description: formatProposalEventDescription(event.type)
    }))
  };
}

// ---------------------------------------------------------------------------
// Accept / Reject
// ---------------------------------------------------------------------------

export async function acceptProposalByToken(
  token: string,
  meta?: {
    acceptedByName?: string;
    acceptedByIp?: string;
    acceptedByUserAgent?: string;
  }
): Promise<void> {
  const tokenHash = hashProposalToken(token);

  await prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.proposalPublicToken.findUnique({
      where: {
        tokenHash
      },
      include: {
        proposal: true
      }
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new ProposalError("TOKEN_NOT_FOUND", "Token da proposta não encontrado.");
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new ProposalError("TOKEN_EXPIRED", "O token da proposta expirou.");
    }

    const proposal = await syncExpiredProposalStatusInTransaction(
      tx,
      tokenRecord.proposalId,
      tokenRecord.proposal.organizationId
    );

    if (!proposal) {
      throw new ProposalError("INVALID_STATUS_FOR_ACCEPT", "A proposta não pode ser aceita.");
    }

    const actionTime = new Date();

    if (proposal.status === "ACCEPTED") {
      await tx.proposalPublicToken.update({
        where: {
          id: tokenRecord.id
        },
        data: {
          lastUsedAt: actionTime
        }
      });
      return;
    }

    if (!["SENT", "VIEWED"].includes(proposal.status)) {
      throw new ProposalError("INVALID_STATUS_FOR_ACCEPT", "A proposta não pode ser aceita.");
    }

    const acceptedAt = actionTime;
    const viewNeedsCapture = !proposal.viewedAt;
    const events: Array<{
      actorUserId?: string;
      type: import("@prisma/client").ProposalEventType;
      description: string;
      occurredAt: Date;
      metadata?: Record<string, string>;
    }> = [];

    if (viewNeedsCapture) {
      events.push({
        type: "VIEWED",
        description: formatProposalEventDescription("VIEWED"),
        occurredAt: acceptedAt
      });
    }

    events.push(
      {
        type: "ACCEPTED",
        description: formatProposalEventDescription("ACCEPTED"),
        occurredAt: acceptedAt
      },
      {
        type: "PDF_GENERATION_QUEUED",
        description: formatProposalEventDescription("PDF_GENERATION_QUEUED"),
        occurredAt: acceptedAt
      }
    );

    await tx.proposal.update({
      where: {
        id: proposal.id
      },
      data: {
        status: "ACCEPTED",
        viewedAt: proposal.viewedAt ?? acceptedAt,
        acceptedAt,
        acceptedByName: meta?.acceptedByName ?? null,
        acceptedByIp: meta?.acceptedByIp ?? null,
        acceptedByUserAgent: meta?.acceptedByUserAgent ?? null,
        lastEventAt: acceptedAt,
        pdfGenerationQueuedAt: proposal.pdfGenerationQueuedAt ?? acceptedAt,
        events: {
          create: events
        }
      }
    });

    await tx.proposalPublicToken.update({
      where: {
        id: tokenRecord.id
      },
      data: {
        lastUsedAt: acceptedAt
      }
    });

    await createProposalChecklist(proposal.id, tx);
  });
}

export async function rejectProposalByToken(
  token: string,
  meta?: {
    rejectedReason?: string;
  }
): Promise<void> {
  const tokenHash = hashProposalToken(token);

  await prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.proposalPublicToken.findUnique({
      where: {
        tokenHash
      },
      include: {
        proposal: true
      }
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new ProposalError("TOKEN_NOT_FOUND", "Token da proposta não encontrado.");
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new ProposalError("TOKEN_EXPIRED", "O token da proposta expirou.");
    }

    const proposal = await syncExpiredProposalStatusInTransaction(
      tx,
      tokenRecord.proposalId,
      tokenRecord.proposal.organizationId
    );

    if (!proposal) {
      throw new ProposalError("INVALID_STATUS_FOR_REJECT", "A proposta não pode ser recusada.");
    }

    if (!["SENT", "VIEWED"].includes(proposal.status)) {
      throw new ProposalError("INVALID_STATUS_FOR_REJECT", "A proposta não pode ser recusada.");
    }

    const rejectedAt = new Date();
    const viewNeedsCapture = !proposal.viewedAt;
    const events: Array<{
      actorUserId?: string;
      type: import("@prisma/client").ProposalEventType;
      description: string;
      occurredAt: Date;
      metadata?: Record<string, string>;
    }> = [];

    if (viewNeedsCapture) {
      events.push({
        type: "VIEWED",
        description: formatProposalEventDescription("VIEWED"),
        occurredAt: rejectedAt
      });
    }

    events.push({
      type: "REJECTED",
      description: formatProposalEventDescription("REJECTED"),
      occurredAt: rejectedAt
    });

    await tx.proposal.update({
      where: {
        id: proposal.id
      },
      data: {
        status: "REJECTED",
        viewedAt: proposal.viewedAt ?? rejectedAt,
        rejectedAt,
        rejectedReason: meta?.rejectedReason?.trim() || null,
        lastEventAt: rejectedAt,
        events: {
          create: events
        }
      }
    });

    await tx.proposalPublicToken.update({
      where: {
        id: tokenRecord.id
      },
      data: {
        lastUsedAt: rejectedAt
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

const INTERNAL_CHECKLIST_DEFAULTS = [
  { title: "Configurar ambiente do projeto", description: "Preparar ferramentas, acessos e repositórios necessários para o início dos trabalhos." },
  { title: "Atribuir equipe responsável", description: "Definir os membros da equipe interna que irão conduzir o projeto." },
  { title: "Agendar reunião de kickoff", description: "Marcar a reunião inicial com o cliente para alinhar escopo, cronograma e expectativas." },
  { title: "Emitir fatura inicial", description: "Gerar e enviar a fatura referente à entrada ou primeira parcela do contrato." }
] as const;

async function createProposalChecklist(proposalId: string, tx: PrismaTx): Promise<void> {
  const items = await tx.proposalItem.findMany({
    where: { proposalId }
  });

  const clientItems: Array<{ title: string; description: string; side: ChecklistItemSide; sortOrder: number }> = [];

  let sortIndex = 0;
  for (const item of items) {
    const docs = parseJsonStringArray(item.requiredDocumentsSnapshot);
    for (const doc of docs) {
      clientItems.push({
        title: doc,
        description: `Documento necessário referente ao serviço: ${item.servicePublicNameSnapshot}`,
        side: "CLIENT" as ChecklistItemSide,
        sortOrder: sortIndex++
      });
    }
  }

  const internalItems = INTERNAL_CHECKLIST_DEFAULTS.map((item, idx) => ({
    title: item.title,
    description: item.description,
    side: "INTERNAL" as ChecklistItemSide,
    sortOrder: idx
  }));

  const allItems = [...clientItems, ...internalItems];

  if (allItems.length === 0) {
    return;
  }

  await tx.proposalChecklistItem.createMany({
    data: allItems.map((item) => ({
      id: crypto.randomUUID(),
      proposalId,
      side: item.side,
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder,
      isCompleted: false
    }))
  });
}

export async function getProposalChecklist(
  proposalId: string
): Promise<ProposalChecklistItemRecord[]> {
  return prisma.proposalChecklistItem.findMany({
    where: { proposalId },
    orderBy: [
      { side: "asc" },
      { sortOrder: "asc" }
    ]
  });
}

export async function getProposalChecklistByToken(
  token: string
): Promise<ProposalChecklistItemRecord[]> {
  const tokenHash = hashProposalToken(token);
  const tokenRecord = await prisma.proposalPublicToken.findUnique({
    where: { tokenHash },
    select: { proposalId: true, revokedAt: true, expiresAt: true }
  });

  if (!tokenRecord || tokenRecord.revokedAt) {
    return [];
  }

  if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
    return [];
  }

  return getProposalChecklist(tokenRecord.proposalId);
}

export async function completeProposalChecklistItem(
  args: {
    token: string;
    itemId: string;
    completedBy?: string;
  }
): Promise<void> {
  const tokenHash = hashProposalToken(args.token);

  await prisma.$transaction(async (tx) => {
    const tokenRecord = await tx.proposalPublicToken.findUnique({
      where: { tokenHash },
      include: { proposal: { select: { id: true, status: true } } }
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new ProposalError("TOKEN_NOT_FOUND", "Token inválido.");
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new ProposalError("TOKEN_EXPIRED", "O token da proposta expirou.");
    }

    const proposal = tokenRecord.proposal;

    if (proposal.status !== "ACCEPTED") {
      throw new ProposalError("CHECKLIST_NOT_AVAILABLE", "O checklist só está disponível para propostas aceitas.");
    }

    const item = await tx.proposalChecklistItem.findFirst({
      where: { id: args.itemId, proposalId: proposal.id }
    });

    if (!item) {
      throw new ProposalError("CHECKLIST_ITEM_NOT_FOUND", "Item do checklist não encontrado.");
    }

    if (item.isCompleted) {
      return; // idempotent
    }

    const now = new Date();

    await tx.proposalChecklistItem.update({
      where: { id: item.id },
      data: {
        isCompleted: true,
        completedAt: now,
        completedBy: item.side === "CLIENT" ? (args.completedBy ?? null) : null
      }
    });

    await tx.proposalEvent.create({
      data: {
        proposalId: proposal.id,
        type: "CHECKLIST_ITEM_COMPLETED",
        description: `Item do checklist concluído: "${item.title}"`,
        occurredAt: now,
        metadata: toJsonValue({ itemId: item.id, itemTitle: item.title, side: item.side })
      }
    });
  });
}

// ---------------------------------------------------------------------------
// View recording
// ---------------------------------------------------------------------------

async function recordProposalViewIfNeeded(proposalId: string, tokenId: string) {
  await prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findUnique({
      where: {
        id: proposalId
      }
    });

    if (!proposal || proposal.viewedAt || proposal.status !== "SENT") {
      return;
    }

    const viewedAt = new Date();

    await tx.proposal.update({
      where: {
        id: proposalId
      },
      data: {
        status: "VIEWED",
        viewedAt,
        lastEventAt: viewedAt,
        events: {
          create: {
            type: "VIEWED",
            description: formatProposalEventDescription("VIEWED"),
            occurredAt: viewedAt
          }
        }
      }
    });

    await tx.proposalPublicToken.update({
      where: {
        id: tokenId
      },
      data: {
        lastUsedAt: viewedAt
      }
    });
  });
}

// ---------------------------------------------------------------------------
// Internal public link helper
// ---------------------------------------------------------------------------

export function getInternalPublicLink(token: import("@prisma/client").ProposalPublicToken | null): string | null {
  const rawToken = decryptProposalToken(token?.tokenCiphertext ?? null);
  return rawToken ? `/p/${rawToken}` : null;
}
