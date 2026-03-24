import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { buildProposalChecklist } from "@/lib/proposal-checklist";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents } from "@/lib/utils";

interface PublicProposalSectionsProps {
  proposal: ResolvedPublicProposal;
  mode?: "web" | "pdf";
}

export function PublicProposalSections({
  proposal,
  mode = "web"
}: PublicProposalSectionsProps) {
  const { snapshot } = proposal;
  const checklist = buildProposalChecklist(snapshot);
  const gridClassName =
    mode === "pdf"
      ? "public-proposal-grid pdf-proposal-grid"
      : "public-proposal-grid";

  return (
    <>
      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Tagline de capa</p>
            <h2>Posicionamento executivo</h2>
          </div>
          <p className="section-copy">{snapshot.coverTagline}</p>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Apresentação institucional da Onebridge</p>
            <h2>{brand.parentName}</h2>
          </div>
          <div className="public-text-stack">
            {snapshot.onebridgeInstitutionalPresentation.map((paragraph) => (
              <p key={paragraph} className="section-copy">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </section>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Introdução da proposta</p>
          <h2>Escopo preparado para {snapshot.companyName}</h2>
        </div>
        <div className="public-text-stack">
          {snapshot.proposalIntroduction.map((paragraph) => (
            <p key={paragraph} className="section-copy">
              {paragraph}
            </p>
          ))}
        </div>
      </article>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Serviços selecionados</p>
          <h2>Apenas itens do snapshot</h2>
        </div>

        <div className="selected-service-list">
          {snapshot.selectedServices.map((service) => (
            <article key={service.internalCode} className="selected-service-card">
              <div className="selected-service-head">
                <div>
                  <strong>{service.serviceName}</strong>
                  {service.publicName !== service.serviceName ? (
                    <p>Nome original: {service.publicName}</p>
                  ) : null}
                </div>

                <div className="catalog-service-pricing">
                  <strong><span className="currency-value">{formatCurrencyFromCents(service.subtotalCents)}</span></strong>
                  {service.subtotalCents < service.quantity * service.unitPriceCents ? (
                    <span>
                      {service.quantity} × <span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span>
                      {" "}<span className="service-discount-strikethrough"><span className="currency-value">{formatCurrencyFromCents(service.quantity * service.unitPriceCents)}</span></span>
                    </span>
                  ) : (
                    <span>
                      {service.quantity} × <span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="selected-service-grid">
                <div className="detail-pair">
                  <p className="detail-label">Nome do serviço</p>
                  <strong>{service.serviceName}</strong>
                </div>
                <div className="detail-pair">
                  <p className="detail-label">Nome original</p>
                  <strong>{service.publicName}</strong>
                </div>
                <div className="detail-pair">
                  <p className="detail-label">Quantidade</p>
                  <strong>{service.quantity}</strong>
                </div>
                <div className="detail-pair">
                  <p className="detail-label">Preço unitário</p>
                  <strong><span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span></strong>
                </div>
                <div className="detail-pair">
                  <p className="detail-label">Subtotal</p>
                  <strong><span className="currency-value">{formatCurrencyFromCents(service.subtotalCents)}</span></strong>
                </div>
              </div>

              {service.deliverables.length > 0 ? (
                <ul className="feature-list">
                  {service.deliverables.map((deliverable) => (
                    <li key={deliverable}>{deliverable}</li>
                  ))}
                </ul>
              ) : null}

              {service.specificClause ? (
                <div className="service-clause-callout">
                  <p>{service.specificClause}</p>
                </div>
              ) : null}

              {service.submissionNotes ? (
                <p className="section-copy service-submission-notes">{service.submissionNotes}</p>
              ) : null}

              <div className="catalog-service-tags">
                <StatusPill tone="accent">{service.billingLabel}</StatusPill>
                <StatusPill tone="neutral">{service.unitLabel}</StatusPill>
              </div>
            </article>
          ))}
        </div>
      </article>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Termos específicos</p>
            <h2>Limites comerciais desta proposta</h2>
          </div>
          <ul className="feature-list">
            {snapshot.specificTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Investimento</p>
            <h2><span className="currency-value">{formatCurrencyFromCents(proposal.totalInvestmentCents)}</span></h2>
          </div>
          <p className="section-copy">{snapshot.investmentIntro}</p>

          <div className="investment-breakdown">
            {snapshot.selectedServices.map((service) => (
              <div key={service.internalCode} className="data-row">
                <div className="data-row-stack">
                  <strong>{service.serviceName}</strong>
                  <p>
                    {service.quantity} × {service.unitLabel}
                  </p>
                </div>
                <strong><span className="currency-value">{formatCurrencyFromCents(service.subtotalCents)}</span></strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Documentos obrigatórios</p>
            <h2>O que a equipe precisa de você</h2>
          </div>
          <ul className="feature-list">
            {checklist.items.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Instruções de envio de documentos</p>
            <h2>Como enviar o conjunto de arquivos</h2>
          </div>
          <ul className="feature-list">
            {snapshot.documentSubmissionInstructions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Termos gerais</p>
            <h2>Condições operacionais base</h2>
          </div>
          <ul className="feature-list">
            {snapshot.generalTerms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Introdução ao pagamento</p>
            <h2>Próximo passo comercial</h2>
          </div>
          <p className="section-copy">{snapshot.paymentIntro}</p>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Encerramento</p>
            <h2>Próxima ação</h2>
          </div>
          <p className="section-copy">{snapshot.closingParagraph}</p>
        </article>
      </section>
    </>
  );
}
