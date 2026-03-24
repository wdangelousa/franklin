import { PageHeader } from "@/components/ui/page-header";
import { getInternalProposalCatalog } from "@/lib/proposal-builder";
import { getBillingTypeLabel, getUnitLabel } from "@/lib/proposal-draft";
import { formatCurrencyFromCents } from "@/lib/utils";

export default async function CatalogPage() {
  const catalog = await getInternalProposalCatalog();

  return (
    <div className="page-stack">
      <PageHeader
        description="A rota de catálogo agora lê os registros reais de serviços do Anexo A salvos em Prisma, a mesma origem usada pelo builder e pela persistência de snapshots."
        eyebrow="Catálogo"
        title="Catálogo de serviços"
      />

      {catalog.length > 0 ? (
        catalog.map((category) => (
          <section key={category.code} className="page-stack">
            <div className="section-head">
              <p className="eyebrow">{category.name}</p>
              <h2>{category.description ?? "Serviços do catálogo interno"}</h2>
            </div>

            <div className="card-grid">
              {category.services.map((service) => (
                <article key={service.internalCode} className="surface-card">
                  <div className="section-head">
                    <p className="eyebrow">{service.internalCode}</p>
                    <h2>{service.serviceName}</h2>
                  </div>
                  {service.publicName !== service.serviceName ? (
                    <p className="section-copy">Nome original: {service.publicName}</p>
                  ) : null}
                  <div className="service-meta">
                    <span>
                      {getBillingTypeLabel(service.billingType)} · {getUnitLabel(service.unitLabel)}
                    </span>
                    <strong><span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span></strong>
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
