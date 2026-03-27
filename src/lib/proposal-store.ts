import "server-only";

import {
  UserRole,
  type ProposalItem,
  type ProposalPublicToken,
  type Proposal,
  type Service,
  type ServiceCategory
} from "@prisma/client";

import type { SessionData } from "@/lib/auth/types";
import { ensureInternalActor } from "@/lib/internal-organization";
import { prisma } from "@/lib/prisma";
import {
  buildProposalSnapshotPreview,
  buildProposalDraftTitle,
  getUnitLabel,
  sortProposalSelectedItems,
  type ProposalBuilderLeadRecord,
  type ProposalBuilderSelectedItem
} from "@/lib/proposal-draft";
import {
  buildProposalContentSnapshot,
  getRequiredDocumentsForCatalogService,
  type ProposalContentServiceInput
} from "@/lib/proposal-content";
import {
  mapDatabaseProposalStatus,
  mapDisplayProposalStatusToDatabase,
  type ProposalDisplayStatus
} from "@/lib/proposal-status";
import { createProposalToken, decryptProposalToken } from "@/lib/proposal-token";
import { ProposalError } from "@/lib/proposal-errors";
import { localizeServiceCategory } from "@/lib/service-catalog";
import { notifyProposalPublished } from "@/lib/notifications/notify";
import { audit } from "@/lib/audit";

// Imported from extracted modules
import {
  addDays,
  buildPublicProposalSlug,
  createProposalNumber,
  formatBillingLabel,
  formatLeadSource,
  formatLeadStatus,
  formatProposalEventDescription,
  formatProposalEventTitle,
  getLeadStatusAfterProposalLink,
  isLockedStatus,
  mapLeadSource,
  normalizeQuantity,
  parseJsonStringArray,
  toJsonValue,
  toLeadDraft
} from "@/lib/proposal-store-helpers";
import {
  syncExpiredProposalById,
  syncExpiredProposalStatusesForOrganization
} from "@/lib/proposal-store-expiration";
import { getInternalPublicLink } from "@/lib/proposal-store-public";

// ---------------------------------------------------------------------------
// Re-exports — keep external imports stable
// ---------------------------------------------------------------------------

export { syncExpiredProposalStatusesForOrganization } from "@/lib/proposal-store-expiration";
export {
  acceptProposalByToken,
  buildPublicProposalSnapshotFromRecord,
  completeProposalChecklistItem,
  getProposalChecklist,
  getProposalChecklistByToken,
  getProposalTokenValueByPublicSlug,
  getPublicProposalRecordByToken,
  rejectProposalByToken,
  type ProposalChecklistItemRecord
} from "@/lib/proposal-store-public";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProposalWithRelations = Proposal & {
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
  items: ProposalItem[];
  events: import("@prisma/client").ProposalEvent[];
  publicTokens: ProposalPublicToken[];
};

type CatalogServiceRecord = Service & {
  category: ServiceCategory | null;
};

export interface ProposalLeadSelection {
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

export interface ProposalDraftSelection {
  internalCode: string;
  quantity: number;
  discountPercent?: number;
}

export interface InternalProposalListItem {
  id: string;
  proposalNumber: string;
  title: string;
  companyName: string;
  leadId: string | null;
  leadCompanyName: string | null;
  status: ProposalDisplayStatus;
  totalCents: number;
  updatedAt: string;
  expiresAt: string | null;
  publicLink: string | null;
  isLocked: boolean;
}

export interface InternalProposalDetail {
  id: string;
  proposalNumber: string;
  title: string;
  companyName: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  status: ProposalDisplayStatus;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  acceptedAt: string | null;
  expiresAt: string | null;
  publicLink: string | null;
  isLocked: boolean;
  ownerName: string | null;
  lead: {
    id: string;
    companyName: string;
    contactName: string;
  } | null;
  items: Array<{
    id: string;
    publicName: string;
    serviceName: string;
    categoryName: string | null;
    quantity: number;
    unitPriceCents: number;
    subtotalCents: number;
    unitLabel: string | null;
    billingType: string;
    specificClause: string | null;
    submissionNotes: string | null;
  }>;
  events: Array<{
    id: string;
    title: string;
    description: string;
    occurredAt: string;
  }>;
  checklistItems: Array<{
    id: string;
    side: "CLIENT" | "INTERNAL";
    title: string;
    description: string | null;
    sortOrder: number;
    isCompleted: boolean;
    completedAt: string | null;
    completedBy: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Lead options
// ---------------------------------------------------------------------------

export async function getProposalLeadOptions(session: SessionData): Promise<ProposalBuilderLeadRecord[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const { organization } = await ensureInternalActor(session);

  const leads = await prisma.lead.findMany({
    where: {
      organizationId: organization.id
    },
    orderBy: [
      {
        updatedAt: "desc"
      }
    ],
    select: {
      id: true,
      contactName: true,
      companyName: true,
      contactEmail: true,
      contactPhone: true,
      source: true,
      notes: true,
      owner: {
        select: {
          name: true
        }
      },
      status: true
    }
  });

  return leads.map((lead) => ({
    id: lead.id,
    fullName: lead.contactName,
    company: lead.companyName,
    email: lead.contactEmail ?? "",
    phone: lead.contactPhone ?? "",
    source: formatLeadSource(lead.source),
    notes: lead.notes ?? "",
    assignedPartner: lead.owner?.name ?? "",
    stage: formatLeadStatus(lead.status)
  }));
}

// ---------------------------------------------------------------------------
// Create draft
// ---------------------------------------------------------------------------

export async function createDraftProposal(args: {
  session: SessionData;
  leadSelection: ProposalLeadSelection;
  selectedServices: ProposalDraftSelection[];
}): Promise<{ proposalId: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  return prisma.$transaction(async (tx) => {
    const lead = await resolveProposalLead(tx, {
      organizationId: organization.id,
      ownerUserId: user.id,
      selection: args.leadSelection
    });
    const selectedItems = await buildSelectedItemsFromCatalog(tx, {
      organizationId: organization.id,
      selections: args.selectedServices
    });
    const snapshotPreview = buildProposalSnapshotPreview({
      lead,
      items: selectedItems,
      ownerName: user.name,
      ownerRole: args.session.user.role
    });
    const proposalNumber = createProposalNumber();
    const createdAt = new Date();

    const proposal = await tx.proposal.create({
      data: {
        organizationId: organization.id,
        leadId: lead.id || null,
        ownerUserId: user.id,
        proposalNumber,
        title: buildProposalDraftTitle(lead.company),
        publicSlug: buildPublicProposalSlug(proposalNumber, lead.company),
        status: "DRAFT",
        clientCompanyName: snapshotPreview.clientCompanyName,
        clientContactName: snapshotPreview.clientContactName,
        clientContactEmail: snapshotPreview.clientContactEmail,
        clientContactPhone: snapshotPreview.clientContactPhone,
        summary: snapshotPreview.leadNotes || null,
        contentSnapshot: toJsonValue(
          buildProposalContentSnapshot({
            companyName: lead.company,
            contactName: lead.fullName,
            services: toContentServices(selectedItems)
          })
        ),
        subtotalCents: snapshotPreview.subtotalCents,
        discountCents: snapshotPreview.discountCents,
        totalCents: snapshotPreview.totalCents,
        lastEventAt: createdAt,
        items: {
          create: selectedItems.map((item, index) => ({
            sortOrder: index,
            sourceServiceId: item.sourceServiceId,
            categoryCodeSnapshot: item.categoryCode,
            categoryNameSnapshot: item.categoryName,
            serviceCodeSnapshot: item.internalCode,
            serviceNameSnapshot: item.serviceName,
            servicePublicNameSnapshot: item.publicName,
            serviceShortDescriptionSnapshot: item.description,
            serviceDescriptionSnapshot: item.description,
            specificClauseSnapshot: item.specificClause,
            submissionNotesSnapshot: item.submissionNotes,
            requiredDocumentsSnapshot: toJsonValue(item.requiredDocuments),
            deliverablesSnapshot: toJsonValue(item.deliverables ?? []),
            billingTypeSnapshot: item.billingType,
            unitLabelSnapshot: item.unitLabel,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            subtotalCents: item.subtotalCents,
            discountPercent: item.discountPercent ?? 0,
            discountCents: item.quantity * item.unitPriceCents - item.subtotalCents,
            totalCents: item.subtotalCents
          }))
        },
        events: {
          create: {
            actorUserId: user.id,
            type: "CREATED",
            description: formatProposalEventDescription("CREATED"),
            occurredAt: createdAt
          }
        }
      }
    });

    return {
      proposalId: proposal.id
    };
  });
}

// ---------------------------------------------------------------------------
// Publish draft (formerly sendDraftProposal)
// ---------------------------------------------------------------------------

export async function publishDraftProposal(args: {
  proposalId: string;
  session: SessionData;
}): Promise<{ proposalId: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  const result = await prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findFirst({
      where: {
        id: args.proposalId,
        organizationId: organization.id
      },
      include: {
        publicTokens: {
          where: {
            revokedAt: null
          }
        }
      }
    });

    if (!proposal) {
      throw new ProposalError("PROPOSAL_NOT_FOUND", "Proposta não encontrada.");
    }

    if (proposal.status !== "DRAFT") {
      throw new ProposalError("INVALID_STATUS_FOR_PUBLISH", "Apenas propostas em rascunho podem ser enviadas.");
    }

    const token = createProposalToken();
    const sentAt = new Date();
    const expiresAt = proposal.expiresAt ?? addDays(sentAt, 14);

    await tx.proposal.update({
      where: {
        id: proposal.id
      },
      data: {
        status: "SENT",
        sentAt,
        expiresAt,
        publishedAt: sentAt,
        lastEventAt: sentAt,
        publicTokens: {
          updateMany: {
            where: {
              revokedAt: null
            },
            data: {
              revokedAt: sentAt
            }
          },
          create: {
            issuedByUserId: user.id,
            label: "Link principal de entrega",
            tokenPrefix: token.prefix,
            tokenHash: token.hash,
            tokenCiphertext: token.ciphertext,
            expiresAt,
            lastUsedAt: null
          }
        },
        events: {
          create: [
            {
              actorUserId: user.id,
              type: "PUBLIC_TOKEN_ISSUED",
              description: formatProposalEventDescription("PUBLIC_TOKEN_ISSUED"),
              metadata: {
                tokenPrefix: token.prefix
              },
              occurredAt: sentAt
            },
            {
              actorUserId: user.id,
              type: "SENT",
              description: formatProposalEventDescription("SENT"),
              occurredAt: sentAt
            }
          ]
        }
      }
    });

    return {
      proposalId: proposal.id,
      _notification: {
        clientName: proposal.clientContactName,
        clientEmail: proposal.clientContactEmail,
        companyName: proposal.clientCompanyName,
        proposalNumber: proposal.proposalNumber,
        publicTokenValue: token.value,
        expiresAt,
        publishedByName: user.name
      }
    };
  });

  // Fire notification outside the transaction — email failure must not rollback.
  // Must await so the notification completes before redirect() aborts execution.
  const baseUrl = process.env.FRANKLIN_BASE_URL?.trim() || "http://localhost:3000";
  try {
    await notifyProposalPublished({
      proposalId: result.proposalId,
      proposalNumber: result._notification.proposalNumber,
      clientName: result._notification.clientName,
      clientEmail: result._notification.clientEmail,
      companyName: result._notification.companyName,
      publicLink: `${baseUrl}/p/${result._notification.publicTokenValue}`,
      expiresAt: result._notification.expiresAt,
      publishedByName: result._notification.publishedByName
    });
  } catch (error) {
    audit({
      event: "notification.email.failed",
      actorType: "system",
      outcome: "error",
      reasonCode: "NOTIFY_EXCEPTION",
      proposalId: result.proposalId,
      meta: { errorMessage: error instanceof Error ? error.message : "unknown" }
    });
  }

  return { proposalId: result.proposalId };
}

/** @deprecated Use publishDraftProposal */
export const sendDraftProposal = publishDraftProposal;

// ---------------------------------------------------------------------------
// Create and publish (formerly createAndSendProposal)
// ---------------------------------------------------------------------------

export async function createAndPublishProposal(args: {
  session: SessionData;
  leadSelection: ProposalLeadSelection;
  selectedServices: ProposalDraftSelection[];
}): Promise<{ proposalId: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  const result = await prisma.$transaction(async (tx) => {
    const lead = await resolveProposalLead(tx, {
      organizationId: organization.id,
      ownerUserId: user.id,
      selection: args.leadSelection
    });
    const selectedItems = await buildSelectedItemsFromCatalog(tx, {
      organizationId: organization.id,
      selections: args.selectedServices
    });
    const snapshotPreview = buildProposalSnapshotPreview({
      lead,
      items: selectedItems,
      ownerName: user.name,
      ownerRole: args.session.user.role
    });
    const proposalNumber = createProposalNumber();
    const sentAt = new Date();
    const expiresAt = addDays(sentAt, 14);
    const token = createProposalToken();

    const proposal = await tx.proposal.create({
      data: {
        organizationId: organization.id,
        leadId: lead.id || null,
        ownerUserId: user.id,
        proposalNumber,
        title: buildProposalDraftTitle(lead.company),
        publicSlug: buildPublicProposalSlug(proposalNumber, lead.company),
        status: "SENT",
        clientCompanyName: snapshotPreview.clientCompanyName,
        clientContactName: snapshotPreview.clientContactName,
        clientContactEmail: snapshotPreview.clientContactEmail,
        clientContactPhone: snapshotPreview.clientContactPhone,
        summary: snapshotPreview.leadNotes || null,
        contentSnapshot: toJsonValue(
          buildProposalContentSnapshot({
            companyName: lead.company,
            contactName: lead.fullName,
            services: toContentServices(selectedItems)
          })
        ),
        subtotalCents: snapshotPreview.subtotalCents,
        discountCents: snapshotPreview.discountCents,
        totalCents: snapshotPreview.totalCents,
        sentAt,
        expiresAt,
        publishedAt: sentAt,
        lastEventAt: sentAt,
        items: {
          create: selectedItems.map((item, index) => ({
            sortOrder: index,
            sourceServiceId: item.sourceServiceId,
            categoryCodeSnapshot: item.categoryCode,
            categoryNameSnapshot: item.categoryName,
            serviceCodeSnapshot: item.internalCode,
            serviceNameSnapshot: item.serviceName,
            servicePublicNameSnapshot: item.publicName,
            serviceShortDescriptionSnapshot: item.description,
            serviceDescriptionSnapshot: item.description,
            specificClauseSnapshot: item.specificClause,
            submissionNotesSnapshot: item.submissionNotes,
            requiredDocumentsSnapshot: toJsonValue(item.requiredDocuments),
            deliverablesSnapshot: toJsonValue(item.deliverables ?? []),
            billingTypeSnapshot: item.billingType,
            unitLabelSnapshot: item.unitLabel,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            subtotalCents: item.subtotalCents,
            discountPercent: item.discountPercent ?? 0,
            discountCents: item.quantity * item.unitPriceCents - item.subtotalCents,
            totalCents: item.subtotalCents
          }))
        },
        publicTokens: {
          create: {
            issuedByUserId: user.id,
            label: "Link principal de entrega",
            tokenPrefix: token.prefix,
            tokenHash: token.hash,
            tokenCiphertext: token.ciphertext,
            expiresAt,
            lastUsedAt: null
          }
        },
        events: {
          create: [
            {
              actorUserId: user.id,
              type: "CREATED",
              description: formatProposalEventDescription("CREATED"),
              occurredAt: sentAt
            },
            {
              actorUserId: user.id,
              type: "PUBLIC_TOKEN_ISSUED",
              description: formatProposalEventDescription("PUBLIC_TOKEN_ISSUED"),
              metadata: { tokenPrefix: token.prefix },
              occurredAt: sentAt
            },
            {
              actorUserId: user.id,
              type: "SENT",
              description: formatProposalEventDescription("SENT"),
              occurredAt: sentAt
            }
          ]
        }
      }
    });

    return {
      proposalId: proposal.id,
      _notification: {
        clientName: snapshotPreview.clientContactName,
        clientEmail: snapshotPreview.clientContactEmail,
        companyName: snapshotPreview.clientCompanyName,
        proposalNumber,
        publicTokenValue: token.value,
        expiresAt,
        publishedByName: user.name
      }
    };
  });

  const baseUrl = process.env.FRANKLIN_BASE_URL?.trim() || "http://localhost:3000";
  try {
    await notifyProposalPublished({
      proposalId: result.proposalId,
      proposalNumber: result._notification.proposalNumber,
      clientName: result._notification.clientName,
      clientEmail: result._notification.clientEmail,
      companyName: result._notification.companyName,
      publicLink: `${baseUrl}/p/${result._notification.publicTokenValue}`,
      expiresAt: result._notification.expiresAt,
      publishedByName: result._notification.publishedByName
    });
  } catch (error) {
    audit({
      event: "notification.email.failed",
      actorType: "system",
      outcome: "error",
      reasonCode: "NOTIFY_EXCEPTION",
      proposalId: result.proposalId,
      meta: { errorMessage: error instanceof Error ? error.message : "unknown" }
    });
  }

  return { proposalId: result.proposalId };
}

/** @deprecated Use createAndPublishProposal */
export const createAndSendProposal = createAndPublishProposal;

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export async function cancelProposal(args: {
  proposalId: string;
  session: SessionData;
}): Promise<{ proposalId: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  return prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findFirst({
      where: {
        id: args.proposalId,
        organizationId: organization.id
      }
    });

    if (!proposal) {
      throw new ProposalError("PROPOSAL_NOT_FOUND", "Proposta não encontrada.");
    }

    if (!["DRAFT", "SENT", "VIEWED"].includes(proposal.status)) {
      throw new ProposalError("INVALID_STATUS_FOR_CANCEL", "Apenas propostas em aberto podem ser canceladas.");
    }

    const cancelledAt = new Date();

    await tx.proposal.update({
      where: {
        id: proposal.id
      },
      data: {
        status: "CANCELLED",
        cancelledAt,
        lastEventAt: cancelledAt,
        events: {
          create: {
            actorUserId: user.id,
            type: "CANCELLED",
            description: formatProposalEventDescription("CANCELLED"),
            occurredAt: cancelledAt
          }
        }
      }
    });

    return {
      proposalId: proposal.id
    };
  });
}

// ---------------------------------------------------------------------------
// Internal list / detail
// ---------------------------------------------------------------------------

export async function getInternalProposalList(
  session: SessionData,
  filters?: {
    status?: ProposalDisplayStatus;
  }
): Promise<InternalProposalListItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const { organization } = await ensureInternalActor(session);
  await syncExpiredProposalStatusesForOrganization(organization.id);
  const statusFilter = filters?.status
    ? mapDisplayProposalStatusToDatabase(filters.status)
    : undefined;

  const proposals = await prisma.proposal.findMany({
    where: {
      organizationId: organization.id,
      ...(statusFilter ? { status: statusFilter } : {})
    },
    orderBy: [
      {
        updatedAt: "desc"
      }
    ],
    include: {
      lead: {
        select: {
          id: true,
          companyName: true
        }
      },
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

  return proposals.map((proposal) => {
    const publicLink = getInternalPublicLink(proposal.publicTokens[0] ?? null);
    const status = mapDatabaseProposalStatus(proposal.status);

    return {
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      companyName: proposal.clientCompanyName,
      leadId: proposal.lead?.id ?? null,
      leadCompanyName: proposal.lead?.companyName ?? null,
      status,
      totalCents: proposal.totalCents,
      updatedAt: proposal.updatedAt.toISOString(),
      expiresAt: proposal.expiresAt?.toISOString() ?? null,
      publicLink,
      isLocked: isLockedStatus(proposal.status)
    };
  });
}

export async function getInternalProposalDetail(args: {
  proposalId: string;
  session: SessionData;
}): Promise<InternalProposalDetail | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { organization } = await ensureInternalActor(args.session);
  await syncExpiredProposalById(args.proposalId, organization.id);

  const proposal = await prisma.proposal.findFirst({
    where: {
      id: args.proposalId,
      organizationId: organization.id
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
        },
        take: 1
      },
      checklistItems: {
        orderBy: [
          { side: "asc" },
          { sortOrder: "asc" }
        ]
      }
    }
  });

  if (!proposal) {
    return null;
  }

  return {
    id: proposal.id,
    proposalNumber: proposal.proposalNumber,
    title: proposal.title,
    companyName: proposal.clientCompanyName,
    contactName: proposal.clientContactName,
    contactEmail: proposal.clientContactEmail,
    contactPhone: proposal.clientContactPhone,
    status: mapDatabaseProposalStatus(proposal.status),
    subtotalCents: proposal.subtotalCents,
    discountCents: proposal.discountCents,
    totalCents: proposal.totalCents,
    createdAt: proposal.createdAt.toISOString(),
    sentAt: proposal.sentAt?.toISOString() ?? null,
    viewedAt: proposal.viewedAt?.toISOString() ?? null,
    acceptedAt: proposal.acceptedAt?.toISOString() ?? null,
    expiresAt: proposal.expiresAt?.toISOString() ?? null,
    publicLink: getInternalPublicLink(proposal.publicTokens[0] ?? null),
    isLocked: isLockedStatus(proposal.status),
    ownerName: proposal.owner?.name ?? null,
    lead: proposal.lead
      ? {
          id: proposal.lead.id,
          companyName: proposal.lead.companyName,
          contactName: proposal.lead.contactName
        }
      : null,
    items: proposal.items.map((item) => ({
      id: item.id,
      publicName: item.servicePublicNameSnapshot,
      serviceName: item.serviceNameSnapshot,
      categoryName: item.categoryNameSnapshot,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      subtotalCents: item.subtotalCents,
      unitLabel: getUnitLabel(item.unitLabelSnapshot),
      billingType: formatBillingLabel(item.billingTypeSnapshot),
      specificClause: item.specificClauseSnapshot,
      submissionNotes: item.submissionNotesSnapshot
    })),
    events: proposal.events.map((event) => ({
      id: event.id,
      title: formatProposalEventTitle(event.type),
      description: formatProposalEventDescription(event.type),
      occurredAt: event.occurredAt.toISOString()
    })),
    checklistItems: (proposal.checklistItems ?? []).map((ci) => ({
      id: ci.id,
      side: ci.side as "CLIENT" | "INTERNAL",
      title: ci.title,
      description: ci.description,
      sortOrder: ci.sortOrder,
      isCompleted: ci.isCompleted,
      completedAt: ci.completedAt?.toISOString() ?? null,
      completedBy: ci.completedBy
    }))
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function resolveProposalLead(
  tx: Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown> ? T : never,
  args: {
    organizationId: string;
    ownerUserId: string;
    selection: ProposalLeadSelection;
  }
): Promise<ProposalBuilderLeadRecord> {
  if (args.selection.mode === "existing" && args.selection.leadId) {
    const lead = await tx.lead.findFirst({
      where: {
        id: args.selection.leadId,
        organizationId: args.organizationId
      },
      include: {
        owner: {
          select: {
            name: true
          }
        }
      }
    });

    if (lead) {
      const nextLeadStatus = getLeadStatusAfterProposalLink(lead.status);

      if (nextLeadStatus !== lead.status) {
        await tx.lead.update({
          where: {
            id: lead.id
          },
          data: {
            status: nextLeadStatus
          }
        });
      }

      return {
        id: lead.id,
        fullName: lead.contactName,
        company: lead.companyName,
        email: lead.contactEmail ?? "",
        phone: lead.contactPhone ?? "",
        source: formatLeadSource(lead.source),
        notes: lead.notes ?? "",
        assignedPartner: lead.owner?.name ?? "",
        stage: formatLeadStatus(nextLeadStatus)
      };
    }
  }

  const leadDraft = toLeadDraft(args.selection);
  const ownerUserId = await resolvePartnerOwnerUserId(tx, {
    organizationId: args.organizationId,
    currentUserId: args.ownerUserId,
    assignedPartnerName: leadDraft.assignedPartner
  });
  const createdLead = await tx.lead.create({
    data: {
      organizationId: args.organizationId,
      ownerUserId,
      status: "PROPOSAL",
      source: mapLeadSource(leadDraft.source),
      companyName: leadDraft.company,
      contactName: leadDraft.fullName,
      contactEmail: leadDraft.email || null,
      contactPhone: leadDraft.phone || null,
      notes: leadDraft.notes || null
    },
    include: {
      owner: {
        select: {
          name: true
        }
      }
    }
  });

  return {
    id: createdLead.id,
    fullName: createdLead.contactName,
    company: createdLead.companyName,
    email: createdLead.contactEmail ?? "",
    phone: createdLead.contactPhone ?? "",
    source: formatLeadSource(createdLead.source),
    notes: createdLead.notes ?? "",
    assignedPartner: createdLead.owner?.name ?? leadDraft.assignedPartner,
    stage: formatLeadStatus(createdLead.status)
  };
}

async function buildSelectedItemsFromCatalog(
  tx: Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown> ? T : never,
  args: {
    organizationId: string;
    selections: ProposalDraftSelection[];
  }
): Promise<Array<ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[]; deliverables: string[] }>> {
  if (args.selections.length === 0) {
    throw new ProposalError("NO_SERVICES", "É necessário selecionar pelo menos um serviço do catálogo.");
  }

  const dedupedSelections = Array.from(
    new Map(
      args.selections.map((selection) => [
        selection.internalCode,
        {
          internalCode: selection.internalCode,
          quantity: normalizeQuantity(selection.quantity),
          discountPercent: selection.discountPercent ?? 0
        }
      ])
    ).values()
  );
  const services = await tx.service.findMany({
    where: {
      organizationId: args.organizationId,
      internalCode: {
        in: dedupedSelections.map((selection) => selection.internalCode)
      },
      isActive: true
    },
    include: {
      category: true
    }
  });

  if (services.length !== dedupedSelections.length) {
    throw new ProposalError("SERVICES_UNAVAILABLE", "Um ou mais serviços selecionados do catálogo estão indisponíveis.");
  }

  const selectionByCode = new Map(
    dedupedSelections.map((selection) => [selection.internalCode, selection])
  );

  return sortProposalSelectedItems(
    services.map((service) => {
      const sel = selectionByCode.get(service.internalCode);
      return mapServiceToSelectedItem(service, sel?.quantity ?? 1, sel?.discountPercent ?? 0);
    })
  ) as Array<ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[]; deliverables: string[] }>;
}

function mapServiceToSelectedItem(
  service: CatalogServiceRecord,
  requestedQuantity: number,
  discountPercent = 0
): ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[]; deliverables: string[] } {
  const quantity = normalizeQuantity(requestedQuantity);
  const unitPriceCents = service.priceCents ?? 0;
  const normalizedDiscount = Math.min(Math.max(discountPercent, 0), 100);
  const subtotalCents = Math.round(quantity * unitPriceCents * (1 - normalizedDiscount / 100));
  const categoryName = service.category
    ? localizeServiceCategory({
        code: service.category.code,
        name: service.category.name,
        description: service.category.description
      }).name
    : null;

  return {
    sourceServiceId: service.id,
    internalCode: service.internalCode,
    slug: service.slug,
    categoryCode: service.category?.code ?? "",
    categoryName: categoryName ?? "Catálogo",
    categorySortOrder: service.category?.sortOrder ?? 0,
    sortOrder: service.sortOrder,
    serviceName: service.serviceName,
    publicName: service.publicName,
    description: service.longDescription,
    specificClause: service.specificClause,
    submissionNotes: service.submissionNotes,
    billingType: service.billingType,
    unitLabel: service.unitLabel,
    quantity,
    unitPriceCents,
    subtotalCents,
    allowsVariableQuantity: service.allowsVariableQuantity,
    discountPercent: normalizedDiscount,
    requiredDocuments: getRequiredDocumentsForCatalogService({
      internalCode: service.internalCode,
      categoryCode: service.category?.code ?? null
    }),
    deliverables: parseJsonStringArray(service.deliverables)
  };
}

function toContentServices(
  items: Array<ProposalBuilderSelectedItem & { requiredDocuments: string[]; deliverables: string[] }>
): ProposalContentServiceInput[] {
  return items.map((item) => ({
    internalCode: item.internalCode,
    categoryCode: item.categoryCode,
    serviceName: item.serviceName,
    publicName: item.publicName,
    specificClause: item.specificClause,
    requiredDocuments: item.requiredDocuments
  }));
}

async function resolvePartnerOwnerUserId(
  tx: Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown> ? T : never,
  args: {
    organizationId: string;
    currentUserId: string;
    assignedPartnerName: string;
  }
): Promise<string> {
  const normalizedTarget = args.assignedPartnerName.trim();

  if (!normalizedTarget) {
    return args.currentUserId;
  }

  const matchedOwner = await tx.user.findFirst({
    where: {
      organizationId: args.organizationId,
      role: {
        in: [UserRole.ADMIN, UserRole.PARTNER]
      },
      isActive: true,
      name: {
        equals: normalizedTarget,
        mode: "insensitive"
      }
    },
    select: {
      id: true
    }
  });

  return matchedOwner?.id ?? args.currentUserId;
}
