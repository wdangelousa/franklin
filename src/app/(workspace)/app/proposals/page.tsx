import Link from "next/link";

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
  }>;
}

export default async function ProposalsPage({ searchParams }: ProposalsPageProps) {
  const session = await requireInternalSession();
  const params = searchParams ? await searchParams : undefined;
  const selectedStatus = parseStatusFilter(params?.status);
  const sendErrorMessage = params?.sendError ? mapSendErrorMessage(params.sendError) : null;
  const proposals = await getInternalProposalList(session, {
    status: selectedStatus ?? undefined
  });

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <Link className="button-primary" href="/app/proposals/new">
            Abrir builder de proposta
          </Link>
        }
        description="Rascunhos, propostas enviadas, visualizações de cliente e aceites agora vêm de registros duráveis em Prisma, não mais de estado simulado."
        eyebrow="Propostas"
        title="Área de propostas"
      />

      {sendErrorMessage ? (
        <section className="surface-card notice-panel">
          <strong>Não foi possível concluir a ação solicitada.</strong>
          <p>{sendErrorMessage}</p>
        </section>
      ) : null}

      <section className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Pipeline</p>
          <h2>Propostas atuais</h2>
        </div>

        <div className="inline-actions">
          <Link
            className={`button-secondary${selectedStatus ? "" : " is-active"}`}
            href="/app/proposals"
          >
            Todos os status
          </Link>
          {proposalDisplayStatuses.map((status) => (
            <Link
              key={status}
              className={`button-secondary${selectedStatus === status ? " is-active" : ""}`}
              href={`/app/proposals?status=${encodeURIComponent(status)}`}
            >
              {status}
            </Link>
          ))}
        </div>

        {proposals.length > 0 ? (
          <div className="data-list">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="data-row">
                <div>
                  <strong>
                    <Link className="text-link" href={`/app/proposals/${proposal.id}`}>
                      {proposal.title}
                    </Link>
                  </strong>
                  <p>
                    {proposal.companyName} · {proposal.proposalNumber}
                  </p>
                </div>

                <div className="row-meta row-meta-wide">
                  <StatusPill tone={getProposalStatusTone(proposal.status)}>{proposal.status}</StatusPill>
                  {proposal.isLocked ? <StatusPill tone="neutral">Bloqueada</StatusPill> : null}
                  <span>Atualizada em {formatDate(proposal.updatedAt)}</span>
                  <span>
                    {proposal.expiresAt ? `Expira em ${formatDate(proposal.expiresAt)}` : "Sem expiração"}
                  </span>
                  {proposal.leadId ? (
                    <Link className="text-link" href={`/app/leads/${proposal.leadId}`}>
                      Lead: {proposal.leadCompanyName ?? "Vinculado"}
                    </Link>
                  ) : (
                    <span>Sem lead vinculado</span>
                  )}
                  <strong><span className="currency-value">{formatCurrencyFromCents(proposal.totalCents)}</span></strong>
                  <Link className="button-secondary" href={`/app/proposals/${proposal.id}`}>
                    Abrir
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>
              {selectedStatus
                ? `Nenhuma proposta com status ${selectedStatus}.`
                : "Nenhuma proposta foi criada ainda."}
            </strong>
            <p>
              Comece pelo builder de proposta para criar o primeiro rascunho durável e, depois,
              emitir o link público seguro a partir da página de detalhe.
            </p>
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

function mapSendErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "not_found":
      return "A proposta não foi encontrada ou não pertence à organização atual.";
    case "invalid_status":
      return "Somente propostas em rascunho podem ser enviadas.";
    case "missing_proposal_id":
      return "O identificador da proposta não foi recebido corretamente.";
    case "send_failed":
    default:
      return "Ocorreu uma falha no envio da proposta. Tente novamente em instantes.";
  }
}
