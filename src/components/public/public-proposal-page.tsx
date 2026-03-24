import Link from "next/link";

import { AcceptProposalForm } from "@/components/public/accept-proposal-form";
import { PublicProposalSections } from "@/components/public/public-proposal-sections";
import { RejectProposalSection } from "@/components/public/reject-proposal-section";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface PublicProposalPageProps {
  proposal: ResolvedPublicProposal;
  feedback?: {
    acceptError?: string;
    rejectError?: string;
    rejected?: string;
  };
}

export function PublicProposalPage({ proposal, feedback }: PublicProposalPageProps) {
  const { snapshot } = proposal;
  const pdfPlan = getProposalPdfPlan(proposal);
  const acceptErrorMessage = mapAcceptErrorMessage(feedback?.acceptError);
  const rejectErrorMessage = mapRejectErrorMessage(feedback?.rejectError);
  const isRejectedFeedback = feedback?.rejected === "1";
  const showForms = proposal.lifecycle.canAccept && !isRejectedFeedback;

  return (
    <main className="proposal-shell public-proposal-shell">
      <header className="proposal-header">
        <BrandMark href="/" />

        <div className="pill-row">
          <StatusPill tone={getStatusTone(proposal.lifecycle.status)}>
            {proposal.statusLabel}
          </StatusPill>
          <StatusPill tone="neutral">Link privado da proposta</StatusPill>
        </div>
      </header>

      {isRejectedFeedback ? (
        <article className="surface-card notice-panel">
          <strong>Proposta recusada.</strong>
          <p className="section-copy">A recusa foi registrada. Esta página agora funciona como registro somente leitura.</p>
        </article>
      ) : null}

      {acceptErrorMessage ? (
        <article className="surface-card notice-panel">
          <strong>Não foi possível registrar o aceite.</strong>
          <p className="section-copy">{acceptErrorMessage}</p>
        </article>
      ) : null}

      {rejectErrorMessage ? (
        <article className="surface-card notice-panel">
          <strong>Não foi possível registrar a recusa.</strong>
          <p className="section-copy">{rejectErrorMessage}</p>
        </article>
      ) : null}

      <section className="public-proposal-hero">
        <article className="surface-card public-proposal-cover">
          <p className="eyebrow">{snapshot.proposalNumber}</p>
          <h1>{snapshot.title}</h1>
          <p className="proposal-summary">{snapshot.coverTagline}</p>

          <div className="proposal-status-banner">
            <div>
              <strong>{proposal.statusTitle}</strong>
              <p>{proposal.statusMessage}</p>
            </div>
            <StatusPill tone={getStatusTone(proposal.lifecycle.status)}>
              {proposal.statusLabel}
            </StatusPill>
          </div>

          <div className="pill-row">
            <StatusPill tone="neutral">{snapshot.companyName}</StatusPill>
            <StatusPill tone="neutral">Preparada em {formatDate(snapshot.preparedAt)}</StatusPill>
            <StatusPill tone="neutral">Válida até {formatDate(snapshot.expiresAt)}</StatusPill>
          </div>
        </article>

        <aside className="surface-card public-proposal-sidebar">
          <div className="section-head">
            <p className="eyebrow">Preparada para</p>
            <h2>{snapshot.contactName}</h2>
          </div>

          <div className="proposal-contact public-proposal-contact">
            <span>{formatContactTitle(snapshot.contactTitle)}</span>
            <strong>{snapshot.companyName}</strong>
            <a className="text-link" href={`mailto:${snapshot.contactEmail}`}>
              {snapshot.contactEmail}
            </a>
            <span>{brand.location}</span>
          </div>

          <div className="totals-panel">
            <div className="total-row">
              <span>Investimento</span>
              <strong>{formatCurrencyFromCents(proposal.totalInvestmentCents)}</strong>
            </div>
            <div className="total-row">
              <span>Status</span>
              <strong>{proposal.statusLabel}</strong>
            </div>
          </div>

          <div className="public-proposal-meta-grid">
            <div className="detail-pair">
              <p className="detail-label">Data de preparo</p>
              <strong>{formatDate(snapshot.preparedAt)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Janela de revisão</p>
              <strong>Até {formatDate(snapshot.expiresAt)}</strong>
            </div>
          </div>

          {showForms ? (
            <AcceptProposalForm
              canAccept={proposal.lifecycle.canAccept}
              status={proposal.lifecycle.status}
              statusMessage={proposal.statusMessage}
              token={proposal.snapshot.token}
            />
          ) : !isRejectedFeedback ? (
            <AcceptProposalForm
              canAccept={false}
              status={proposal.lifecycle.status}
              statusMessage={proposal.statusMessage}
              token={proposal.snapshot.token}
            />
          ) : null}
          {proposal.lifecycle.status === "ACCEPTED" ? (
            <div className="public-proposal-actions">
              <Link className="button-secondary public-checklist-link" href={`/p/${snapshot.token}/checklist`}>
                Abrir checklist de documentos
              </Link>
              <Link className="button-secondary public-checklist-link" href={pdfPlan.renderPath}>
                Abrir PDF de entrega
              </Link>
            </div>
          ) : null}
        </aside>
      </section>

      {proposal.showDetails ? (
        <>
          <section className="public-proposal-grid">
            <article className="surface-card">
              <div className="section-head">
                <p className="eyebrow">Status</p>
                <h2>Ciclo de vida e log de eventos</h2>
              </div>

              <div className="proposal-event-log">
                {proposal.lifecycle.eventLog.map((event) => (
                  <div key={event.id} className="proposal-event-row">
                    <div className="proposal-event-marker" aria-hidden="true" />
                    <div className="proposal-event-content">
                      <div className="proposal-event-head">
                        <strong>{event.title}</strong>
                        <span>{formatDateTime(event.occurredAt)}</span>
                      </div>
                      <p className="section-copy">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-card">
              <div className="section-head">
                <p className="eyebrow">Controles da proposta</p>
                <h2>Política de edição e aceite</h2>
              </div>

              <div className="public-text-stack">
                <p className="section-copy">
                  {proposal.isEditable
                    ? "Esta proposta continua em revisão ativa. O snapshot aceito só é consolidado depois que o clique de aceite é registrado."
                    : proposal.lifecycle.lockReason ?? "Esta proposta está bloqueada para edição livre."}
                </p>
                {proposal.futureAutomationReady ? (
                  <p className="section-copy">
                    O aceite é salvo com timestamp, e o próximo gatilho de automação já está pronto
                    para gerar o PDF imutável da cópia aceita a partir deste snapshot.
                  </p>
                ) : null}
              </div>
            </article>
          </section>

          <PublicProposalSections proposal={proposal} />

          <article className="surface-card">
            <div className="section-head">
              <p className="eyebrow">Texto de aceite</p>
              <h2>Confirmação formal</h2>
            </div>
            <p className="section-copy">{snapshot.acceptanceText}</p>
            {showForms ? (
              <AcceptProposalForm
                acceptanceText={snapshot.acceptanceText}
                canAccept={proposal.lifecycle.canAccept}
                compact
                status={proposal.lifecycle.status}
                statusMessage={proposal.statusMessage}
                token={snapshot.token}
              />
            ) : null}
          </article>

          {showForms ? (
            <RejectProposalSection token={snapshot.token} />
          ) : null}
        </>
      ) : (
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Status</p>
            <h2>Esta proposta não está disponível para revisão do cliente</h2>
          </div>
          <p className="section-copy">{proposal.statusMessage}</p>
        </article>
      )}

      <footer className="surface-card public-proposal-footer">
        <p className="eyebrow">Link privado</p>
        <p className="section-copy">
          Esta página é propositalmente excluída da indexação em buscadores e foi desenhada para
          revisão segura apenas por links diretos de WhatsApp ou email.
        </p>
      </footer>
    </main>
  );
}

function getStatusTone(
  status: ResolvedPublicProposal["lifecycle"]["status"]
): "accent" | "success" | "warning" | "neutral" {
  switch (status) {
    case "ACCEPTED":
      return "success";
    case "EXPIRED":
      return "warning";
    case "REJECTED":
    case "CANCELLED":
    case "DRAFT":
      return "neutral";
    case "SENT":
    case "VIEWED":
    default:
      return "accent";
  }
}

function formatContactTitle(value: string): string {
  return value === "Primary contact" ? "Contato principal" : value;
}

function mapAcceptErrorMessage(errorCode?: string): string | null {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case "invalid_token":
      return "Este link privado não é válido ou já foi revogado. Solicite um novo link para a equipe.";
    case "not_available":
      return "Esta proposta não está em um estado elegível para aceite no momento.";
    case "accept_failed":
    default:
      return "Tente novamente em instantes. Se o problema persistir, fale com a equipe responsável.";
  }
}

function mapRejectErrorMessage(errorCode?: string): string | null {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case "invalid_token":
      return "Este link privado não é válido ou já foi revogado. Solicite um novo link para a equipe.";
    case "not_available":
      return "Esta proposta não está em um estado elegível para recusa no momento.";
    case "reject_failed":
    default:
      return "Tente novamente em instantes. Se o problema persistir, fale com a equipe responsável.";
  }
}
