import "server-only";

import type { ProposalStatus } from "@prisma/client";

import type { StatusTone } from "@/components/ui/status-pill";
import type { SessionData } from "@/lib/auth/types";
import { ensureInternalActor } from "@/lib/internal-organization";
import { prisma } from "@/lib/prisma";
import { syncExpiredProposalStatusesForOrganization } from "@/lib/proposal-store";
import {
  getProposalStatusTone,
  mapDatabaseProposalStatus,
  proposalDisplayStatuses,
  type ProposalDisplayStatus
} from "@/lib/proposal-status";

interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
  tone: StatusTone;
}

interface DashboardStatusSummaryItem {
  status: ProposalDisplayStatus;
  count: number;
  share: number;
  tone: StatusTone;
}

interface DashboardRecentProposal {
  id: string;
  proposalNumber: string;
  title: string;
  company: string;
  status: ProposalDisplayStatus;
  total: number;
  updatedAt: string;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  recentProposals: DashboardRecentProposal[];
  statusSummary: DashboardStatusSummaryItem[];
  /** True when data could not be loaded (database unavailable). */
  isOffline?: boolean;
}

export async function getDashboardSnapshot(session: SessionData): Promise<DashboardSnapshot> {
  if (!process.env.DATABASE_URL) {
    return buildEmptyDashboardSnapshot();
  }

  try {
    return await fetchDashboardFromDatabase(session);
  } catch (error) {
    console.log(JSON.stringify({
      event: "dashboard.database.error",
      timestamp: new Date().toISOString(),
      outcome: "error",
      message: error instanceof Error ? error.message : "Unknown database error",
      userId: session.user.id
    }));
    return { ...buildEmptyDashboardSnapshot(), isOffline: true };
  }
}

async function fetchDashboardFromDatabase(session: SessionData): Promise<DashboardSnapshot> {
  const { organization } = await ensureInternalActor(session);
  await syncExpiredProposalStatusesForOrganization(organization.id);

  const [proposalCount, groupedStatuses, recentProposals] = await Promise.all([
    prisma.proposal.count({
      where: {
        organizationId: organization.id
      }
    }),
    prisma.proposal.groupBy({
      by: ["status"],
      where: {
        organizationId: organization.id
      },
      _count: {
        _all: true
      }
    }),
    prisma.proposal.findMany({
      where: {
        organizationId: organization.id
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: 5,
      select: {
        id: true,
        proposalNumber: true,
        title: true,
        clientCompanyName: true,
        status: true,
        totalCents: true,
        updatedAt: true
      }
    })
  ]);

  const statusCountMap = buildStatusCountMap(groupedStatuses);
  const sentCount = statusCountMap.get("Enviada") ?? 0;
  const viewedCount = statusCountMap.get("Visualizada") ?? 0;
  const acceptedCount = statusCountMap.get("Aceita") ?? 0;
  const cancelledCount = statusCountMap.get("Cancelada") ?? 0;
  const expiredCount = statusCountMap.get("Expirada") ?? 0;

  return {
    metrics: [
      {
        label: "Total de propostas",
        value: proposalCount.toString(),
        detail: "Todos os registros de proposta persistidos para a organização.",
        tone: "accent"
      },
      {
        label: "Propostas enviadas",
        value: sentCount.toString(),
        detail: "Propostas com link público seguro já emitido.",
        tone: "accent"
      },
      {
        label: "Propostas visualizadas",
        value: viewedCount.toString(),
        detail: "Propostas que já registraram abertura pelo cliente.",
        tone: "accent"
      },
      {
        label: "Propostas aceitas",
        value: acceptedCount.toString(),
        detail: "Propostas formalmente aceitas no fluxo público.",
        tone: "success"
      },
      {
        label: "Propostas canceladas",
        value: cancelledCount.toString(),
        detail: "Propostas encerradas por cancelamento.",
        tone: "warning"
      },
      {
        label: "Propostas expiradas",
        value: expiredCount.toString(),
        detail: "Propostas que passaram da janela de validade.",
        tone: "neutral"
      }
    ],
    recentProposals: recentProposals.map((proposal) => ({
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      title: proposal.title,
      company: proposal.clientCompanyName,
      status: mapDatabaseProposalStatus(proposal.status),
      total: proposal.totalCents / 100,
      updatedAt: proposal.updatedAt.toISOString()
    })),
    statusSummary: buildStatusSummary(statusCountMap, proposalCount)
  };
}

function buildEmptyDashboardSnapshot(): DashboardSnapshot {
  const statusCountMap = new Map<ProposalDisplayStatus, number>();

  return {
    metrics: [
      {
        label: "Total de propostas",
        value: "0",
        detail: "Todos os registros de proposta persistidos para a organização.",
        tone: "accent"
      },
      {
        label: "Propostas enviadas",
        value: "0",
        detail: "Propostas com link público seguro já emitido.",
        tone: "accent"
      },
      {
        label: "Propostas visualizadas",
        value: "0",
        detail: "Propostas que já registraram abertura pelo cliente.",
        tone: "accent"
      },
      {
        label: "Propostas aceitas",
        value: "0",
        detail: "Propostas formalmente aceitas no fluxo público.",
        tone: "success"
      },
      {
        label: "Propostas canceladas",
        value: "0",
        detail: "Propostas encerradas por cancelamento.",
        tone: "warning"
      },
      {
        label: "Propostas expiradas",
        value: "0",
        detail: "Propostas que passaram da janela de validade.",
        tone: "neutral"
      }
    ],
    recentProposals: [],
    statusSummary: buildStatusSummary(statusCountMap, 0)
  };
}

function buildStatusCountMap(
  groupedStatuses: Array<{
    status: ProposalStatus;
    _count: {
      _all: number;
    };
  }>
): Map<ProposalDisplayStatus, number> {
  const countByDisplay = new Map<ProposalDisplayStatus, number>();

  for (const grouped of groupedStatuses) {
    const displayStatus = mapDatabaseProposalStatus(grouped.status);

    countByDisplay.set(displayStatus, (countByDisplay.get(displayStatus) ?? 0) + grouped._count._all);
  }

  return countByDisplay;
}

function buildStatusSummary(
  statusCountMap: Map<ProposalDisplayStatus, number>,
  proposalCount: number
): DashboardStatusSummaryItem[] {
  return proposalDisplayStatuses.map((status) => {
    const count = statusCountMap.get(status) ?? 0;

    return {
      status,
      count,
      share: proposalCount === 0 ? 0 : count / proposalCount,
      tone: getProposalStatusTone(status)
    };
  });
}
