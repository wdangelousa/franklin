import "server-only";

import { LeadSource as PrismaLeadSource, LeadStatus, UserRole } from "@prisma/client";

import type { StatusTone } from "@/components/ui/status-pill";
import type { SessionData } from "@/lib/auth/types";
import {
  formatLeadSourceLabel,
  formatLeadStageLabel,
  type LeadSource,
  type LeadStage
} from "@/lib/lead-labels";
import { ensureInternalActor } from "@/lib/internal-organization";
import { prisma } from "@/lib/prisma";
import { mapDatabaseProposalStatus, type ProposalDisplayStatus } from "@/lib/proposal-status";
import { syncExpiredProposalStatusesForOrganization } from "@/lib/proposal-store";

export const leadSourceOptions: LeadSource[] = [
  "Referral",
  "Inbound",
  "Partner",
  "Event",
  "Outbound",
  "Other"
];

export { formatLeadSourceLabel, formatLeadStageLabel };

export interface LeadListItem {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  stage: LeadStage;
  notes: string;
  nextStep: string;
  estimatedValue: number;
  assignedPartner: string;
  proposalCount: number;
}

export interface LeadRelatedProposal {
  id: string;
  proposalNumber: string;
  title: string;
  status: ProposalDisplayStatus;
  total: number;
  updatedAt: string;
  expiresAt: string | null;
}

export interface LeadDetail extends LeadListItem {
  relatedProposals: LeadRelatedProposal[];
}

export async function getAssignedPartnerOptions(session: SessionData): Promise<string[]> {
  if (!process.env.DATABASE_URL) {
    return [session.user.name];
  }

  const { organization } = await ensureInternalActor(session);

  const users = await prisma.user.findMany({
    where: {
      organizationId: organization.id,
      role: {
        in: [UserRole.ADMIN, UserRole.PARTNER]
      },
      isActive: true
    },
    orderBy: {
      name: "asc"
    },
    select: {
      name: true
    }
  });

  const optionSet = new Set(users.map((user) => user.name.trim()).filter(Boolean));
  optionSet.add(session.user.name);

  return [...optionSet].sort((left, right) => left.localeCompare(right, "pt-BR"));
}

export async function getLeadList(session: SessionData): Promise<LeadListItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const { organization } = await ensureInternalActor(session);
  await syncExpiredProposalStatusesForOrganization(organization.id);

  const leadRecords = await prisma.lead.findMany({
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
      status: true,
      notes: true,
      nextStep: true,
      estimatedValueCents: true,
      owner: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          proposals: true
        }
      }
    }
  });

  return leadRecords
    .map((lead) => toLeadListItem(lead))
    .sort(
      (left, right) =>
        getLeadStageSortOrder(left.stage) - getLeadStageSortOrder(right.stage) ||
        left.company.localeCompare(right.company, "pt-BR")
    );
}

export async function getLeadById(session: SessionData, leadId: string): Promise<LeadDetail | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const { organization } = await ensureInternalActor(session);
  await syncExpiredProposalStatusesForOrganization(organization.id);

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      organizationId: organization.id
    },
    select: {
      id: true,
      contactName: true,
      companyName: true,
      contactEmail: true,
      contactPhone: true,
      source: true,
      status: true,
      notes: true,
      nextStep: true,
      estimatedValueCents: true,
      owner: {
        select: {
          name: true
        }
      },
      proposals: {
        orderBy: {
          updatedAt: "desc"
        },
        select: {
          id: true,
          proposalNumber: true,
          title: true,
          status: true,
          totalCents: true,
          updatedAt: true,
          expiresAt: true
        }
      }
    }
  });

  if (!lead) {
    return null;
  }

  const base = toLeadListItem({
    ...lead,
    _count: {
      proposals: lead.proposals.length
    }
  });

  return {
    ...base,
    relatedProposals: lead.proposals.map((proposal) => ({
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      status: mapDatabaseProposalStatus(proposal.status),
      total: proposal.totalCents / 100,
      updatedAt: proposal.updatedAt.toISOString(),
      expiresAt: proposal.expiresAt?.toISOString() ?? null
    }))
  };
}

export function getLeadStageTone(stage: LeadStage): StatusTone {
  switch (stage) {
    case "Won":
      return "success";
    case "Proposal":
      return "accent";
    case "Discovery":
    case "Lost":
      return "warning";
    case "Archived":
    case "Qualified":
    case "New":
      return "neutral";
  }
}

export function getLeadSourceTone(source: LeadSource): StatusTone {
  switch (source) {
    case "Referral":
    case "Partner":
      return "success";
    case "Inbound":
    case "Event":
      return "accent";
    case "Outbound":
    case "Other":
      return "neutral";
  }
}

function toLeadListItem(
  lead: {
    id: string;
    contactName: string;
    companyName: string;
    contactEmail: string | null;
    contactPhone: string | null;
    source: PrismaLeadSource;
    status: LeadStatus;
    notes: string | null;
    nextStep: string | null;
    estimatedValueCents: number | null;
    owner: {
      name: string;
    } | null;
    _count: {
      proposals: number;
    };
  }
): LeadListItem {
  return {
    id: lead.id,
    fullName: lead.contactName,
    company: lead.companyName,
    email: lead.contactEmail ?? "Não informado",
    phone: lead.contactPhone ?? "Não informado",
    source: mapLeadSource(lead.source),
    stage: mapLeadStage(lead.status),
    notes: lead.notes ?? "Sem observações registradas.",
    nextStep: lead.nextStep ?? "Sem próximo passo definido.",
    estimatedValue: (lead.estimatedValueCents ?? 0) / 100,
    assignedPartner: lead.owner?.name ?? "Não atribuído",
    proposalCount: lead._count.proposals
  };
}

function mapLeadSource(source: PrismaLeadSource): LeadSource {
  switch (source) {
    case "REFERRAL":
      return "Referral";
    case "INBOUND":
      return "Inbound";
    case "OUTBOUND":
      return "Outbound";
    case "PARTNER":
      return "Partner";
    case "EVENT":
      return "Event";
    case "OTHER":
    default:
      return "Other";
  }
}

function mapLeadStage(status: LeadStatus): LeadStage {
  switch (status) {
    case "NEW":
      return "New";
    case "QUALIFIED":
      return "Qualified";
    case "DISCOVERY":
      return "Discovery";
    case "PROPOSAL":
      return "Proposal";
    case "WON":
      return "Won";
    case "LOST":
      return "Lost";
    case "ARCHIVED":
    default:
      return "Archived";
  }
}

function getLeadStageSortOrder(stage: LeadStage): number {
  switch (stage) {
    case "Proposal":
      return 0;
    case "Discovery":
      return 1;
    case "Qualified":
      return 2;
    case "New":
      return 3;
    case "Won":
      return 4;
    case "Lost":
      return 5;
    case "Archived":
      return 6;
  }
}

export function mapLeadSourceToDatabase(value: LeadSource): PrismaLeadSource {
  switch (value) {
    case "Referral":
      return PrismaLeadSource.REFERRAL;
    case "Inbound":
      return PrismaLeadSource.INBOUND;
    case "Outbound":
      return PrismaLeadSource.OUTBOUND;
    case "Partner":
      return PrismaLeadSource.PARTNER;
    case "Event":
      return PrismaLeadSource.EVENT;
    case "Other":
    default:
      return PrismaLeadSource.OTHER;
  }
}

async function resolvePartnerOwnerUserId(args: {
  organizationId: string;
  currentUserId: string;
  assignedPartnerName: string;
}): Promise<string> {

  const normalizedTarget = args.assignedPartnerName.trim().toLocaleLowerCase("pt-BR");

  if (!normalizedTarget) {
    return args.currentUserId;
  }

  const owners = await prisma.user.findMany({
    where: {
      organizationId: args.organizationId,
      role: {
        in: [UserRole.ADMIN, UserRole.PARTNER]
      },
      isActive: true
    },
    select: {
      id: true,
      name: true
    }
  });

  const matchedOwner = owners.find(
    (owner) => owner.name.trim().toLocaleLowerCase("pt-BR") === normalizedTarget
  );

  return matchedOwner?.id ?? args.currentUserId;
}

export async function createLeadRecord(args: {
  session: SessionData;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  source: LeadSource;
  assignedPartner: string;
  notes: string;
}): Promise<{ id: string; fullName: string; company: string }> {
  const { organization, user } = await ensureInternalActor(args.session);

  const ownerUserId = await resolvePartnerOwnerUserId({
    organizationId: organization.id,
    currentUserId: user.id,
    assignedPartnerName: args.assignedPartner
  });

  const lead = await prisma.lead.create({
    data: {
      organizationId: organization.id,
      ownerUserId,
      status: LeadStatus.NEW,
      source: mapLeadSourceToDatabase(args.source),
      companyName: args.company,
      contactName: args.fullName,
      contactEmail: args.email || null,
      contactPhone: args.phone || null,
      notes: args.notes || null
    },
    select: {
      id: true,
      contactName: true,
      companyName: true
    }
  });

  return {
    id: lead.id,
    fullName: lead.contactName,
    company: lead.companyName
  };
}
