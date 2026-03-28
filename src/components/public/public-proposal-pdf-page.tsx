import { BrandMark } from "@/components/ui/brand-mark";
import { brand } from "@/lib/brand";
import { buildProposalChecklist } from "@/lib/proposal-checklist";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface PublicProposalPdfPageProps {
  proposal: ResolvedPublicProposal;
}

export function PublicProposalPdfPage({ proposal }: PublicProposalPdfPageProps) {
  const { snapshot } = proposal;
  const checklist = buildProposalChecklist(snapshot);

  return (
    <main className="proposal-shell pdf-contract" data-proposal-pdf-ready="true">
      <header className="pdf-contract-header">
        <BrandMark href={null} />
        <div className="pdf-contract-ref">
          <strong>{snapshot.proposalNumber}</strong>
          <span>{formatDate(snapshot.preparedAt)}</span>
        </div>
      </header>

      <h1 className="pdf-contract-title">Confirmação de proposta aceita</h1>
      <p className="pdf-contract-subtitle">{snapshot.title}</p>

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">1</span>
          <h2>Partes</h2>
        </div>
        <div className="pdf-contract-parties">
          <div className="pdf-contract-party">
            <p className="pdf-contract-party-label">Prestador</p>
            <strong>{brand.legalName}</strong>
            <p>{brand.location}</p>
            <p>{brand.senderEmail}</p>
          </div>
          <div className="pdf-contract-party">
            <p className="pdf-contract-party-label">Cliente</p>
            <strong>{snapshot.contactName}</strong>
            <p>{snapshot.companyName}</p>
            <p>{snapshot.contactEmail}</p>
          </div>
        </div>
      </section>

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">2</span>
          <h2>Objeto</h2>
        </div>
        {snapshot.proposalIntroduction.map((p) => (
          <p key={p} className="pdf-contract-text">
            {p}
          </p>
        ))}
      </section>

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">3</span>
          <h2>Serviços contratados</h2>
        </div>

        <div className="pdf-contract-services">
          {snapshot.selectedServices.map((service) => {
            const hasDiscount = service.subtotalCents < service.quantity * service.unitPriceCents;

            return (
              <article key={service.internalCode} className="pdf-contract-service">
                <div className="pdf-contract-service-header">
                  <h3>{service.serviceName}</h3>
                  <strong className="currency-value">
                    {formatCurrencyFromCents(service.subtotalCents)}
                  </strong>
                </div>

                {service.description ? (
                  <p className="pdf-contract-service-desc">{service.description}</p>
                ) : null}

                <div className="pdf-contract-service-meta">
                  <span>Quantidade: {service.quantity}</span>
                  <span>
                    Valor unitário:{" "}
                    <span className="currency-value">
                      {formatCurrencyFromCents(service.unitPriceCents)}
                    </span>
                    {hasDiscount ? " (c/ desconto)" : ""}
                  </span>
                </div>

                {service.deliverables.length > 0 ? (
                  <div className="pdf-contract-deliverables">
                    <p className="pdf-contract-small-label">Inclui:</p>
                    <ul>
                      {service.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {service.specificClause ? (
                  <div className="pdf-contract-clause">
                    <p>{service.specificClause}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="pdf-contract-total">
          <span>Investimento total</span>
          <strong className="currency-value">
            {formatCurrencyFromCents(proposal.totalInvestmentCents)}
          </strong>
        </div>
      </section>

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">4</span>
          <h2>Condições de pagamento</h2>
        </div>
        <p className="pdf-contract-text">{snapshot.investmentIntro}</p>
        <p className="pdf-contract-text">{snapshot.paymentIntro}</p>
      </section>

      {snapshot.specificTerms.length > 0 ? (
        <section className="pdf-contract-section">
          <div className="pdf-contract-section-head">
            <span className="pdf-contract-num">5</span>
            <h2>Termos específicos</h2>
          </div>
          <ol className="pdf-contract-terms">
            {snapshot.specificTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">6</span>
          <h2>Condições gerais</h2>
        </div>
        <ol className="pdf-contract-terms">
          {snapshot.generalTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
          <li>
            Alterações de escopo após o aceite requerem um aditivo escrito e aprovado por ambas as partes.
          </li>
        </ol>
      </section>

      {checklist.items.length > 0 ? (
        <section className="pdf-contract-section">
          <div className="pdf-contract-section-head">
            <span className="pdf-contract-num">7</span>
            <h2>Documentos necessários</h2>
          </div>
          <ul className="pdf-contract-docs">
            {checklist.items.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
          {snapshot.documentSubmissionInstructions.length > 0 ? (
            <div className="pdf-contract-instructions">
              <p className="pdf-contract-small-label">Como enviar:</p>
              {snapshot.documentSubmissionInstructions.map((instruction) => (
                <p key={instruction} className="pdf-contract-text">
                  {instruction}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="pdf-contract-section">
        <div className="pdf-contract-section-head">
          <span className="pdf-contract-num">8</span>
          <h2>Registro do aceite</h2>
        </div>
        <div className="pdf-contract-acceptance">
          <strong>
            Proposta aceita em{" "}
            {proposal.lifecycle.acceptedAt
              ? formatDateTime(proposal.lifecycle.acceptedAt)
              : "data registrada"}
          </strong>
          {proposal.snapshot.acceptedByName ? (
            <p>Aceite registrado por: {proposal.snapshot.acceptedByName}</p>
          ) : null}
          <p>{snapshot.acceptanceText}</p>
        </div>
      </section>

      <footer className="pdf-contract-footer">
        <p>
          {brand.legalName} · {brand.location}
        </p>
        <p>
          Documento gerado a partir da proposta aceita. Referência: {snapshot.proposalNumber}
        </p>
      </footer>
    </main>
  );
}
