import "server-only";

import {
  LeadSource,
  LeadStatus,
  Prisma,
  ProposalEventType,
  ProposalStatus,
  UserRole,
  type ProposalEvent,
  type ProposalPublicToken,
  type Proposal,
  type ProposalItem,
  type Service,
  type ServiceCategory
} from "@prisma/client";

import type { SessionData } from "@/lib/auth/types";
import { ensureInternalActor } from "@/lib/internal-organization";
import { prisma } from "@/lib/prisma";
import {
  buildProposalSnapshotPreview,
  buildProposalDraftTitle,
  getBillingTypeLabel,
  getUnitLabel,
  sortProposalSelectedItems,
  type ProposalBuilderLeadDraft,
  type ProposalBuilderLeadRecord,
  type ProposalBuilderSelectedItem
} from "@/lib/proposal-draft";
import {
  buildProposalContentSnapshot,
  getRequiredDocumentsForCatalogService,
  parseProposalContentSnapshot,
  type ProposalContentServiceInput,
  type ProposalContentSnapshot
} from "@/lib/proposal-content";
import {
  mapDatabaseProposalStatus,
  mapDisplayProposalStatusToDatabase,
  type ProposalDisplayStatus
} from "@/lib/proposal-status";
import { createProposalToken, decryptProposalToken, hashProposalToken } from "@/lib/proposal-token";
import { localizeServiceCategory } from "@/lib/service-catalog";

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
  events: ProposalEvent[];
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
}

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
            billingTypeSnapshot: item.billingType,
            unitLabelSnapshot: item.unitLabel,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
            subtotalCents: item.subtotalCents,
            discountCents: 0,
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

export async function sendDraftProposal(args: {
  proposalId: string;
  session: SessionData;
}): Promise<{ proposalId: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  return prisma.$transaction(async (tx) => {
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
      throw new Error("Proposta não encontrada.");
    }

    if (proposal.status !== "DRAFT") {
      throw new Error("Apenas propostas em rascunho podem ser enviadas.");
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
      proposalId: proposal.id
    };
  });
}

export async function syncExpiredProposalStatusesForOrganization(organizationId: string): Promise<void> {
  await syncExpiredProposals(organizationId);
}

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
    }))
  };
}

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

export async function acceptProposalByToken(token: string): Promise<void> {
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
      throw new Error("Token da proposta não encontrado.");
    }

    const proposal = await syncExpiredProposalStatusInTransaction(
      tx,
      tokenRecord.proposalId,
      tokenRecord.proposal.organizationId
    );

    if (!proposal) {
      throw new Error("A proposta não pode ser aceita.");
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
      throw new Error("A proposta não pode ser aceita.");
    }

    const acceptedAt = actionTime;
    const viewNeedsCapture = !proposal.viewedAt;
    const events: Array<{
      actorUserId?: string;
      type: ProposalEventType;
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
  });
}

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
    requiredDocuments: parseJsonStringArray(item.requiredDocumentsSnapshot)
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
): Promise<Array<ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[] }>> {
  if (args.selections.length === 0) {
    throw new Error("É necessário selecionar pelo menos um serviço do catálogo.");
  }

  const dedupedSelections = Array.from(
    new Map(
      args.selections.map((selection) => [
        selection.internalCode,
        {
          internalCode: selection.internalCode,
          quantity: normalizeQuantity(selection.quantity)
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
    throw new Error("Um ou mais serviços selecionados do catálogo estão indisponíveis.");
  }

  const quantityByCode = new Map(
    dedupedSelections.map((selection) => [selection.internalCode, selection.quantity])
  );

  return sortProposalSelectedItems(
    services.map((service) => mapServiceToSelectedItem(service, quantityByCode.get(service.internalCode) ?? 1))
  ) as Array<ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[] }>;
}

function mapServiceToSelectedItem(
  service: CatalogServiceRecord,
  requestedQuantity: number
): ProposalBuilderSelectedItem & { sourceServiceId: string; requiredDocuments: string[] } {
  const quantity = service.allowsVariableQuantity ? normalizeQuantity(requestedQuantity) : 1;
  const unitPriceCents = service.priceCents ?? 0;
  const subtotalCents = quantity * unitPriceCents;
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
    requiredDocuments: getRequiredDocumentsForCatalogService({
      internalCode: service.internalCode,
      categoryCode: service.category?.code ?? null
    })
  };
}

function toContentServices(
  items: Array<ProposalBuilderSelectedItem & { requiredDocuments: string[] }>
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

async function syncExpiredProposals(organizationId: string) {
  const now = new Date();
  const proposals = await prisma.proposal.findMany({
    where: {
      organizationId,
      status: {
        in: ["SENT", "VIEWED"]
      },
      expiresAt: {
        lt: now
      }
    },
    select: {
      id: true
    }
  });

  await Promise.all(
    proposals.map((proposal) => syncExpiredProposalById(proposal.id, organizationId))
  );
}

async function syncExpiredProposalById(proposalId: string, organizationId: string) {
  await prisma.$transaction(async (tx) => {
    await syncExpiredProposalStatusInTransaction(tx, proposalId, organizationId);
  });
}

async function syncExpiredProposalStatusInTransaction(
  tx: Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown> ? T : never,
  proposalId: string,
  organizationId: string
) {
  const proposal = await tx.proposal.findFirst({
    where: {
      id: proposalId,
      organizationId
    }
  });

  if (
    !proposal ||
    !proposal.expiresAt ||
    proposal.expiresAt >= new Date() ||
    !["SENT", "VIEWED"].includes(proposal.status)
  ) {
    return proposal;
  }

  const expiredAt = proposal.expiresAt;

  return tx.proposal.update({
    where: {
      id: proposal.id
    },
    data: {
      status: "EXPIRED",
      lastEventAt: expiredAt,
      events: {
        create: {
          type: "EXPIRED",
          description: formatProposalEventDescription("EXPIRED"),
          occurredAt: expiredAt
        }
      }
    }
  });
}

function buildPublicProposalSlug(proposalNumber: string, companyName: string): string {
  return `${slugify(companyName)}-${proposalNumber.toLowerCase()}`.slice(0, 80);
}

function createProposalNumber(): string {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(Math.random() * 9000 + 1000);

  return `FRK-${datePart}-${randomPart}`;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
}

function getLeadStatusAfterProposalLink(status: LeadStatus): LeadStatus {
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

function toLeadDraft(selection: ProposalLeadSelection): ProposalBuilderLeadDraft {
  const fullName = selection.fullName?.trim() ?? "";
  const company = selection.company?.trim() ?? "";
  const email = selection.email?.trim() ?? "";
  const phone = selection.phone?.trim() ?? "";
  const source = selection.source?.trim() ?? "";
  const notes = selection.notes?.trim() ?? "";
  const assignedPartner = selection.assignedPartner?.trim() ?? "";

  if (!fullName || !company || !email || !phone || !source || !assignedPartner) {
    throw new Error("Os dados do lead estão incompletos.");
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

function mapLeadSource(value: string): LeadSource {
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

function formatLeadSource(source: LeadSource): string {
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

function formatLeadStatus(status: LeadStatus): string {
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

function formatBillingLabel(billingType: ProposalItem["billingTypeSnapshot"]): string {
  return getBillingTypeLabel(billingType);
}

function formatProposalEventTitle(type: ProposalEventType): string {
  switch (type) {
    case "CREATED":
      return "Rascunho criado";
    case "PUBLIC_TOKEN_ISSUED":
      return "Token público emitido";
    case "SENT":
      return "Proposta enviada";
    case "VIEWED":
      return "Primeira visualização registrada";
    case "ACCEPTED":
      return "Proposta aceita";
    case "CANCELLED":
      return "Proposta cancelada";
    case "EXPIRED":
      return "Proposta expirada";
    case "PDF_GENERATION_QUEUED":
      return "Geração de PDF enfileirada";
    default:
      return "Evento da proposta";
  }
}

function formatProposalEventDescription(type: ProposalEventType): string {
  switch (type) {
    case "CREATED":
      return "O rascunho da proposta foi criado a partir do builder interno.";
    case "PUBLIC_TOKEN_ISSUED":
      return "O token público seguro da proposta foi emitido para revisão do cliente.";
    case "SENT":
      return "A proposta foi enviada e entrou em revisão do cliente.";
    case "VIEWED":
      return "A primeira visualização pública da proposta foi registrada.";
    case "ACCEPTED":
      return "A proposta foi aceita pelo fluxo seguro de clique para aceitar.";
    case "CANCELLED":
      return "A proposta foi cancelada e bloqueada para edições livres.";
    case "EXPIRED":
      return "A janela de revisão da proposta expirou.";
    case "PDF_GENERATION_QUEUED":
      return "A proposta aceita foi marcada como pronta para geração de PDF.";
    default:
      return "Ocorreu uma atualização no fluxo da proposta.";
  }
}

function parseJsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function isLockedStatus(status: ProposalStatus): boolean {
  return ["ACCEPTED", "CANCELLED", "EXPIRED"].includes(status);
}

function getInternalPublicLink(token: ProposalPublicToken | null): string | null {
  const rawToken = decryptProposalToken(token?.tokenCiphertext ?? null);
  return rawToken ? `/p/${rawToken}` : null;
}

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
