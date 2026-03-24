import Link from "next/link";

import { PublicProposalSections } from "@/components/public/public-proposal-sections";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { acceptPublicProposal } from "@/lib/public-proposal-actions";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface PublicProposalPageProps {
  proposal: ResolvedPublicProposal;
  feedback?: {
    acceptError?: string;
  };
}

export function PublicProposalPage({ proposal, feedback }: PublicProposalPageProps) {
  const { snapshot } = proposal;
  const pdfPlan = getProposalPdfPlan(proposal);
  const acceptErrorMessage = mapAcceptErrorMessage(feedback?.acceptError);

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

      {acceptErrorMessage ? (
        <article className="surface-card notice-panel">
          <strong>Não foi possível registrar o aceite.</strong>
          <p className="section-copy">{acceptErrorMessage}</p>
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

          <AcceptProposalForm proposal={proposal} />
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
            <AcceptProposalForm proposal={proposal} compact />
          </article>
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

function AcceptProposalForm({
  proposal,
  compact = false
}: {
  proposal: ResolvedPublicProposal;
  compact?: boolean;
}) {
  const buttonLabel = proposal.lifecycle.canAccept
    ? "Aceitar proposta"
    : getDisabledLabel(proposal.lifecycle.status);
  const formClassName = [
    "public-accept-form",
    compact ? "compact" : "",
    compact ? "" : "is-primary-flow"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form action={acceptPublicProposal} className={formClassName}>
      <input name="token" type="hidden" value={proposal.snapshot.token} />
      <button
        className="button-primary public-accept-button"
        disabled={!proposal.lifecycle.canAccept}
        type="submit"
      >
        {buttonLabel}
      </button>
      <p className="builder-actions-note">
        {proposal.lifecycle.canAccept
          ? "O aceite é registrado contra este token seguro e o Franklin abre o checklist pós-aceite na sequência."
          : proposal.statusMessage}
      </p>
    </form>
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
    case "CANCELLED":
    case "DRAFT":
      return "neutral";
    case "SENT":
    case "VIEWED":
    default:
      return "accent";
  }
}

function getDisabledLabel(status: ResolvedPublicProposal["lifecycle"]["status"]): string {
  switch (status) {
    case "ACCEPTED":
      return "Proposta aceita";
    case "CANCELLED":
      return "Proposta cancelada";
    case "EXPIRED":
      return "Proposta expirada";
    case "DRAFT":
      return "Proposta indisponível";
    case "SENT":
    case "VIEWED":
    default:
      return "Aceitar proposta";
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
