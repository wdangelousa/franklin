import Link from "next/link";

import { IconChevronRight } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireInternalSession } from "@/lib/auth/session";
import { getInternalProposalList } from "@/lib/proposal-store";
import {
  getProposalStatusTone,
  proposalDisplayStatuses,
  type ProposalDisplayStatus
} from "@/lib/proposal-status";
import { formatCurrencyFromCents, formatDate } from "@/lib/utils";

interface ProposalsPageProps {
  searchParams?: Promise<{
    status?: string;
    sendError?: string;
    publishError?: string;
  }>;
}

export default async function ProposalsPage({ searchParams }: ProposalsPageProps) {
  const session = await requireInternalSession();
  const params = searchParams ? await searchParams : undefined;
  const selectedStatus = parseStatusFilter(params?.status);
  const errorCode = params?.publishError ?? params?.sendError ?? null;
  const publishErrorMessage = errorCode ? mapPublishErrorMessage(errorCode) : null;

  const allProposals = await getInternalProposalList(session);
  const proposals = selectedStatus
    ? allProposals.filter((p) => p.status === selectedStatus)
    : allProposals;

  const statusCounts = new Map<string, number>();
  for (const p of allProposals) {
    statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);
  }

  return (
    <div className="page-stack operations-page">
      <PageHeader
        actions={
          <>
            <StatusPill tone="accent">{allProposals.length} propostas</StatusPill>
            <Link className="button-primary" href="/app/proposals/new">
              Nova proposta
            </Link>
          </>
        }
        description="Rascunhos, envios e aceites em um só lugar."
        eyebrow="Propostas"
        title="Propostas"
      />

      {publishErrorMessage ? (
        <section className="surface-card notice-panel">
          <strong>Não foi possível concluir a ação solicitada.</strong>
          <p>{publishErrorMessage}</p>
        </section>
      ) : null}

      <section className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Pipeline</p>
          <h2>Propostas atuais</h2>
        </div>

        <div className="filter-toolbar inline-actions">
          <Link
            className={`button-secondary${selectedStatus ? "" : " is-active"}`}
            href="/app/proposals"
          >
            Todas ({allProposals.length})
          </Link>
          {proposalDisplayStatuses.map((status) => {
            const count = statusCounts.get(status) ?? 0;
            return (
              <Link
                key={status}
                className={`button-secondary${selectedStatus === status ? " is-active" : ""}`}
                href={`/app/proposals?status=${encodeURIComponent(status)}`}
              >
                {status} ({count})
              </Link>
            );
          })}
        </div>

        {proposals.length > 0 ? (
          <div className="proposal-list">
            {proposals.map((proposal) => (
              <Link
                key={proposal.id}
                className="proposal-record"
                href={`/app/proposals/${proposal.id}`}
              >
                <div className="proposal-record-main">
                  <strong>{proposal.title}</strong>
                  <p>
                    {proposal.companyName} · {proposal.proposalNumber}
                  </p>
                </div>

                <div className="proposal-record-meta">
                  <StatusPill tone={getProposalStatusTone(proposal.status)}>{proposal.status}</StatusPill>
                  {proposal.isLocked ? <StatusPill tone="neutral">Bloqueada</StatusPill> : null}
                  <span>{formatDate(proposal.updatedAt)}</span>
                  <strong><span className="currency-value">{formatCurrencyFromCents(proposal.totalCents)}</span></strong>
                  <IconChevronRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>
              {selectedStatus
                ? `Nenhuma proposta com status "${selectedStatus}".`
                : "Nenhuma proposta foi criada ainda."}
            </strong>
            <p>Use o builder para criar o primeiro rascunho.</p>
            <Link className="button-primary" href="/app/proposals/new">
              Criar primeira proposta
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function parseStatusFilter(status?: string): ProposalDisplayStatus | null {
  if (!status) {
    return null;
  }

  const normalized = status.trim().toLocaleLowerCase("pt-BR");
  const statusFromDisplay = proposalDisplayStatuses.find(
    (candidate) => candidate.toLocaleLowerCase("pt-BR") === normalized
  );

  if (statusFromDisplay) {
    return statusFromDisplay;
  }

  switch (normalized) {
    case "accepted":
      return "Aceita";
    case "viewed":
      return "Visualizada";
    case "sent":
      return "Enviada";
    case "draft":
      return "Rascunho";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    default:
      return null;
  }
}

function mapPublishErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "not_found":
      return "A proposta não foi encontrada ou não pertence à organização atual.";
    case "invalid_status":
      return "Somente propostas em rascunho podem ser publicadas.";
    case "missing_proposal_id":
      return "O identificador da proposta não foi recebido corretamente.";
    case "publish_failed":
    case "send_failed":
    default:
      return "Ocorreu uma falha na publicação da proposta. Tente novamente em instantes.";
  }
}
