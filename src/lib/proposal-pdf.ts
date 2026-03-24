import "server-only";

import type { ResolvedPublicProposal } from "@/lib/public-proposals";

export const proposalPdfStrategy = {
  renderer: "headless-browser-print",
  trigger: "on_acceptance",
  pageFormat: "Letter",
  orientation: "portrait",
  preferCssPageSize: true,
  waitSelector: "[data-proposal-pdf-ready='true']"
} as const;

export interface ProposalPdfPlan {
  status: "ready" | "blocked";
  trigger: typeof proposalPdfStrategy.trigger;
  renderer: typeof proposalPdfStrategy.renderer;
  renderPath: string;
  fileName: string;
  waitSelector: string;
  reason: string | null;
}

export function getProposalPdfPlan(proposal: ResolvedPublicProposal): ProposalPdfPlan {
  const fileName = getProposalPdfFileName(proposal);

  if (proposal.lifecycle.status !== "ACCEPTED") {
    return {
      status: "blocked",
      trigger: proposalPdfStrategy.trigger,
      renderer: proposalPdfStrategy.renderer,
      renderPath: `/p/${proposal.snapshot.token}/pdf`,
      fileName,
      waitSelector: proposalPdfStrategy.waitSelector,
      reason: "Apenas propostas aceitas. O PDF de entrega é gerado a partir do snapshot imutável aceito."
    };
  }

  return {
    status: "ready",
    trigger: proposalPdfStrategy.trigger,
    renderer: proposalPdfStrategy.renderer,
    renderPath: `/p/${proposal.snapshot.token}/pdf`,
    fileName,
    waitSelector: proposalPdfStrategy.waitSelector,
    reason: null
  };
}

function getProposalPdfFileName(proposal: ResolvedPublicProposal): string {
  const companySlug = proposal.snapshot.companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safeCompanySlug = companySlug.length > 0 ? companySlug : "cliente";

  return `${proposal.snapshot.proposalNumber.toLowerCase()}-${safeCompanySlug}-proposta-aceita.pdf`;
}
