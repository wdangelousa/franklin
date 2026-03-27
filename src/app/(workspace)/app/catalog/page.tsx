import { PageHeader } from "@/components/ui/page-header";
import { getInternalProposalCatalog } from "@/lib/proposal-builder";
import { getBillingTypeLabel, getUnitLabel } from "@/lib/proposal-draft";
import { formatCurrencyFromCents } from "@/lib/utils";

export default async function CatalogPage() {
  const catalog = await getInternalProposalCatalog();

  return (
    <div className="page-stack catalog-page">
      <PageHeader
        description="Serviços e preços disponíveis para montagem de propostas."
        eyebrow="Catálogo"
        title="Catálogo"
      />

      {catalog.length > 0 ? (
        catalog.map((category) => (
          <section key={category.code} className="surface-card catalog-category">
            <div className="section-head catalog-category-head">
              <p className="eyebrow">{category.name}</p>
              <h2>{category.description ?? "Serviços do catálogo interno"}</h2>
            </div>

            <div className="catalog-grid">
              {category.services.map((service) => (
                <article key={service.internalCode} className="catalog-card">
                  <div className="catalog-card-head">
                    <p className="catalog-card-code">{service.internalCode}</p>
                    <h2 className="catalog-card-title">{service.serviceName}</h2>
                  </div>

                  <div className="catalog-card-body">
                    {service.publicName !== service.serviceName ? (
                      <p className="catalog-card-copy">Nome público: {service.publicName}</p>
                    ) : null}

                    {service.longDescription ? (
                      <p className="catalog-card-copy">{service.longDescription}</p>
                    ) : null}
                  </div>

                  <hr className="catalog-card-divider" />

                  <div className="catalog-price-row">
                    <div className="catalog-price-meta">
                      <span>{getBillingTypeLabel(service.billingType)}</span>
                      <span>{getUnitLabel(service.unitLabel)}</span>
                    </div>
                    <strong className="catalog-price-value">
                      <span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span>
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="builder-empty-state">
          <strong>Nenhum registro de catálogo está disponível ainda.</strong>
          <p>Execute o seed do Prisma para carregar o catálogo interno de serviços a partir do banco.</p>
        </div>
      )}
    </div>
  );
}
