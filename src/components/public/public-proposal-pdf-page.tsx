import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { PublicProposalSections } from "@/components/public/public-proposal-sections";
import { brand } from "@/lib/brand";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface PublicProposalPdfPageProps {
  proposal: ResolvedPublicProposal;
}

export function PublicProposalPdfPage({ proposal }: PublicProposalPdfPageProps) {
  const { snapshot } = proposal;
  const pdfPlan = getProposalPdfPlan(proposal);

  return (
    <main className="proposal-shell pdf-proposal-shell" data-proposal-pdf-ready="true">
      <header className="proposal-header pdf-proposal-header">
        <BrandMark href={null} />

        <div className="pill-row">
          <StatusPill tone="success">Cópia final aceita</StatusPill>
          <StatusPill tone="neutral">{pdfPlan.fileName}</StatusPill>
        </div>
      </header>

      <section className="pdf-proposal-hero">
        <article className="surface-card pdf-proposal-cover">
          <p className="eyebrow">{snapshot.proposalNumber}</p>
          <h1>{snapshot.title}</h1>
          <p className="proposal-summary">{snapshot.coverTagline}</p>

          <div className="proposal-status-banner">
            <div>
              <strong>Snapshot da proposta aceita</strong>
              <p>
                Esta cópia de entrega é renderizada no servidor a partir do snapshot imutável da
                proposta aceita no Franklin e preparada para a entrega ao cliente da {brand.parentName}.
              </p>
            </div>
            <StatusPill tone="success">{proposal.statusLabel}</StatusPill>
          </div>
        </article>

        <aside className="surface-card pdf-proposal-sidebar">
          <div className="public-flow-card pdf-meta-card">
            <p className="eyebrow">Entrega</p>
            <h2>Cópia final pronta para compartilhamento</h2>
            <p className="section-copy">
              Esta visão serve como versão final controlada, com metadados e investimento visíveis
              sem depender do estado atual do catálogo.
            </p>
          </div>

          <div className="pdf-proposal-meta">
            <div className="detail-pair">
              <p className="detail-label">Preparada para</p>
              <strong>{snapshot.companyName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Contato do cliente</p>
              <strong>{snapshot.contactName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Data de preparo</p>
              <strong>{formatDate(snapshot.preparedAt)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Aceita em</p>
              <strong>
                {proposal.lifecycle.acceptedAt
                  ? formatDateTime(proposal.lifecycle.acceptedAt)
                  : "Aceita"}
              </strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Investimento</p>
              <strong><span className="currency-value">{formatCurrencyFromCents(proposal.totalInvestmentCents)}</span></strong>
            </div>
          </div>
        </aside>
      </section>

      <article className="surface-card pdf-note-card">
        <div className="section-head">
          <p className="eyebrow">Estratégia de PDF</p>
          <h2>Renderização confiável da cópia aceita</h2>
        </div>
        <div className="public-text-stack">
          <p className="section-copy">
            O PDF de entrega só é gerado após o aceite. O Franklin renderiza esta rota segura para
            impressão no servidor, e um navegador headless pode exportá-la diretamente usando o
            snapshot aceito, sem tocar no catálogo vivo.
          </p>
          <p className="section-copy">
            Rota de renderização: <strong>{pdfPlan.renderPath}</strong>
          </p>
        </div>
      </article>

      <PublicProposalSections proposal={proposal} mode="pdf" />

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Texto de aceite</p>
          <h2>Confirmação formal</h2>
        </div>
        <p className="section-copy">{snapshot.acceptanceText}</p>
      </article>

      <footer className="surface-card pdf-proposal-footer">
        <p className="eyebrow">Cópia de entrega</p>
        <p className="section-copy">
          Gerado pelo Franklin para a {brand.parentName}. A indexação em buscadores continua
          desabilitada e o documento é destinado apenas à entrega controlada ao cliente.
        </p>
      </footer>
    </main>
  );
}
