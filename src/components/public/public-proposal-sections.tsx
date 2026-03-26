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
      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Apresentação institucional</p>
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

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Introdução</p>
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
          <p className="eyebrow">Serviços</p>
          <h2>Serviços incluídos</h2>
        </div>

        <div className="public-service-list">
          {snapshot.selectedServices.map((service) => {
            const hasDiscount = service.subtotalCents < service.quantity * service.unitPriceCents;

            return (
              <article key={service.internalCode} className="surface-card public-service-card">
                <h3>{service.serviceName}</h3>

                {service.description ? (
                  <p className="public-service-description">{service.description}</p>
                ) : null}

                {service.deliverables.length > 0 ? (
                  <div className="public-service-deliverables">
                    <p className="eyebrow">O que está incluído</p>
                    <ul className="feature-list">
                      {service.deliverables.map((deliverable) => (
                        <li key={deliverable}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {service.submissionNotes ? (
                  <p className="public-service-timeline">{service.submissionNotes}</p>
                ) : null}

                {service.specificClause ? (
                  <div className="public-service-clause">
                    <p>{service.specificClause}</p>
                  </div>
                ) : null}

                <div className="public-service-price">
                  <span>
                    {service.quantity} × <span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span>
                    {hasDiscount ? ` c/ desconto` : ""}
                  </span>
                  <strong><span className="currency-value">{formatCurrencyFromCents(service.subtotalCents)}</span></strong>
                </div>
              </article>
            );
          })}
        </div>
      </article>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Investimento</p>
          <h2>Resumo do investimento</h2>
        </div>
        {snapshot.investmentIntro ? (
          <p className="section-copy">{snapshot.investmentIntro}</p>
        ) : null}

        <div className="review-item-list">
          {snapshot.selectedServices.map((service) => {
            const hasDiscount = service.subtotalCents < service.quantity * service.unitPriceCents;

            return (
              <div key={service.internalCode} className="review-item-row">
                <strong>{service.serviceName}</strong>
                <div className="review-item-pricing">
                  <span className="review-item-calc">
                    {service.quantity} × <span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span>
                    {hasDiscount ? ` c/ desconto` : ""}
                  </span>
                  <strong><span className="currency-value">{formatCurrencyFromCents(service.subtotalCents)}</span></strong>
                </div>
              </div>
            );
          })}

          <div className="review-item-total">
            <strong>Total</strong>
            <strong><span className="currency-value">{formatCurrencyFromCents(proposal.totalInvestmentCents)}</span></strong>
          </div>
        </div>
      </article>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Termos específicos</p>
            <h2>Condições desta proposta</h2>
          </div>
          <ul className="feature-list">
            {snapshot.specificTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Documentos obrigatórios</p>
            <h2>Documentos necessários</h2>
          </div>
          <ul className="feature-list">
            {checklist.items.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </article>
      </section>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Instruções de envio</p>
          <h2>Como enviar seus documentos</h2>
        </div>
        <ul className="feature-list">
          {snapshot.documentSubmissionInstructions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Termos gerais</p>
          <h2>Termos gerais</h2>
        </div>
        <ul className="feature-list">
          {snapshot.generalTerms.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>

      <section className={gridClassName}>
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Pagamento</p>
            <h2>Próximos passos</h2>
          </div>
          <p className="section-copy">{snapshot.paymentIntro}</p>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Encerramento</p>
            <h2>Como prosseguir</h2>
          </div>
          <p className="section-copy">{snapshot.closingParagraph}</p>
        </article>
      </section>
    </>
  );
}
