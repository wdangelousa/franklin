import { BrandMark } from "@/components/ui/brand-mark";
import { brand } from "@/lib/brand";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface PublicProposalPdfPageProps {
  proposal: ResolvedPublicProposal;
}

const STANDARD_GENERAL_TERMS = [
  "O início dos trabalhos está condicionado ao aceite formal desta proposta e à entrega dos documentos obrigatórios.",
  "Alterações de escopo após o aceite requerem um aditivo escrito e aprovado por ambas as partes.",
  "Esta proposta é confidencial e destinada exclusivamente ao destinatário identificado.",
  "Os prazos estimados dependem da prontidão documental do cliente e dos tempos de resposta de terceiros."
];

export function PublicProposalPdfPage({ proposal }: PublicProposalPdfPageProps) {
  const { snapshot } = proposal;
  const acceptedAt = proposal.lifecycle.acceptedAt ?? snapshot.acceptedAt ?? snapshot.preparedAt;
  const documentDate = proposal.lifecycle.acceptedAt ?? snapshot.acceptedAt ?? snapshot.preparedAt;
  const generalTerms = Array.from(new Set([...snapshot.generalTerms, ...STANDARD_GENERAL_TERMS]));

  return (
    <main className="proposal-shell pdf-proposal-shell" data-proposal-pdf-ready="true">
      <header className="proposal-header pdf-proposal-header">
        <BrandMark href={null} />

        <article className="surface-card pdf-proposal-cover">
          <p className="eyebrow">Confirmação de proposta aceita</p>
          <h1>{snapshot.proposalNumber}</h1>
          <p className="proposal-summary">
            Documento contratual referente à proposta aceita para {snapshot.companyName}.
          </p>

          <div className="pdf-proposal-meta">
            <div className="detail-pair">
              <p className="detail-label">Proposta</p>
              <strong>{snapshot.proposalNumber}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Data</p>
              <strong>{formatDate(documentDate)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Cliente</p>
              <strong>{snapshot.companyName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Investimento</p>
              <strong>
                <span className="currency-value">
                  {formatCurrencyFromCents(proposal.totalInvestmentCents)}
                </span>
              </strong>
            </div>
          </div>
        </article>
      </header>

      <article className="surface-card">
        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">1</span>
            <h2>Partes</h2>
          </div>

          <div className="pdf-parties-grid">
            <div className="pdf-party-card">
              <strong>Prestador</strong>
              <p>{brand.legalName}</p>
              <p>{brand.location}</p>
              <p>{brand.senderEmail}</p>
            </div>

            <div className="pdf-party-card">
              <strong>Cliente</strong>
              <p>{snapshot.contactName}</p>
              <p>{snapshot.companyName}</p>
              <p>{snapshot.contactEmail || "Email não informado"}</p>
            </div>
          </div>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">2</span>
            <h2>Objeto</h2>
          </div>

          <p className="section-copy">
            A presente proposta contempla os seguintes serviços para {snapshot.companyName}:
          </p>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">3</span>
            <h2>Serviços contratados</h2>
          </div>

          <table className="pdf-service-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Qtd.</th>
                <th>Preço unitário</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.selectedServices.map((service) => (
                <tr key={service.internalCode}>
                  <td>
                    <strong>{service.serviceName}</strong>
                    {service.description ? (
                      <p className="public-service-description">{service.description}</p>
                    ) : null}
                    {service.deliverables.length > 0 ? (
                      <div className="public-service-deliverables">
                        <p className="eyebrow">Inclui</p>
                        <ul className="feature-list">
                          {service.deliverables.map((deliverable) => (
                            <li key={deliverable}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {service.specificClause ? (
                      <div className="public-service-clause">
                        <p>{service.specificClause}</p>
                      </div>
                    ) : null}
                  </td>
                  <td>{service.quantity}</td>
                  <td>
                    <span className="currency-value">
                      {formatCurrencyFromCents(service.unitPriceCents)}
                    </span>
                  </td>
                  <td>
                    <span className="currency-value">
                      {formatCurrencyFromCents(service.subtotalCents)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pdf-service-total">
            <strong>Total geral</strong>
            <strong>
              <span className="currency-value">
                {formatCurrencyFromCents(proposal.totalInvestmentCents)}
              </span>
            </strong>
          </div>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">4</span>
            <h2>Condições de pagamento</h2>
          </div>

          <p className="section-copy">{snapshot.paymentIntro}</p>
          <p className="section-copy">
            <strong>Investimento total:</strong>{" "}
            <span className="currency-value">
              {formatCurrencyFromCents(proposal.totalInvestmentCents)}
            </span>
          </p>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">5</span>
            <h2>Termos específicos</h2>
          </div>

          <ol className="pdf-terms-list">
            {snapshot.specificTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">6</span>
            <h2>Condições gerais</h2>
          </div>

          <ol className="pdf-terms-list">
            {generalTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">7</span>
            <h2>Documentos necessários</h2>
          </div>

          <ul className="feature-list">
            {snapshot.requiredDocuments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="public-text-stack">
            {snapshot.documentSubmissionInstructions.map((instruction) => (
              <p key={instruction} className="section-copy">
                {instruction}
              </p>
            ))}
          </div>
        </section>

        <section className="pdf-contract-section">
          <div className="pdf-section-title">
            <span className="pdf-section-number">8</span>
            <h2>Registro do aceite</h2>
          </div>

          <div className="pdf-acceptance-block">
            <strong>Proposta aceita em {formatDateTime(acceptedAt)}</strong>
            {snapshot.acceptedByName ? (
              <p className="section-copy">
                Aceite registrado por: {snapshot.acceptedByName}
              </p>
            ) : null}
            <p className="section-copy">{snapshot.acceptanceText}</p>
          </div>
        </section>
      </article>

      <footer className="pdf-footer-legal">
        <p>
          {brand.legalName} · {brand.location}
        </p>
        <p>
          Documento gerado automaticamente a partir da proposta aceita. Referência:{" "}
          {snapshot.proposalNumber}
        </p>
      </footer>
    </main>
  );
}
