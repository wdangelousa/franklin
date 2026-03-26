import "server-only";

import type { Proposal } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { formatProposalEventDescription } from "@/lib/proposal-store-helpers";

type PrismaTx = Parameters<typeof prisma.$transaction>[0] extends (tx: infer T) => Promise<unknown>
  ? T
  : never;

export async function syncExpiredProposalStatusesForOrganization(organizationId: string): Promise<void> {
  await syncExpiredProposals(organizationId);
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

export async function syncExpiredProposalById(proposalId: string, organizationId: string) {
  await prisma.$transaction(async (tx) => {
    await syncExpiredProposalStatusInTransaction(tx, proposalId, organizationId);
  });
}

export async function syncExpiredProposalStatusInTransaction(
  tx: PrismaTx,
  proposalId: string,
  organizationId: string
): Promise<Proposal | null> {
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
