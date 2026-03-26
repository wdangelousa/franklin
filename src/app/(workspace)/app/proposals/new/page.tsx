import Link from "next/link";

import { ProposalBuilder } from "@/components/workspace/proposal-builder";
import { PageHeader } from "@/components/ui/page-header";
import { requireInternalSession } from "@/lib/auth/session";
import { getAssignedPartnerOptions, leadSourceOptions } from "@/lib/leads";
import { getInternalProposalCatalog } from "@/lib/proposal-builder";
import { getProposalLeadOptions } from "@/lib/proposal-store";

interface NewProposalPageProps {
  searchParams?: Promise<{
    leadId?: string;
    error?: string;
  }>;
}

export default async function NewProposalPage({ searchParams }: NewProposalPageProps) {
  const session = await requireInternalSession();
  const params = searchParams ? await searchParams : undefined;
  const errorMessage = mapBuilderErrorMessage(params?.error);
  const [leads, catalog, partnerOptions] = await Promise.all([
    getProposalLeadOptions(session),
    getInternalProposalCatalog(),
    getAssignedPartnerOptions(session)
  ]);
  const initialLeadId =
    params?.leadId && leads.some((lead) => lead.id === params.leadId) ? params.leadId : null;

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <Link className="button-secondary" href="/app/proposals">
            Voltar para propostas
          </Link>
        }
        description={
          initialLeadId
            ? "Este rascunho de proposta foi aberto a partir de um lead existente, então o contexto do contato já está anexado antes da seleção de serviços."
            : "Monte uma proposta a partir do catálogo interno do Franklin, valide quantidades em centavos e revise a estrutura do snapshot antes do envio."
        }
        eyebrow="Builder de proposta"
        title="Nova proposta"
      />

      {errorMessage ? (
        <section className="surface-card notice-panel">
          <strong>Não foi possível criar o rascunho.</strong>
          <p className="section-copy">{errorMessage}</p>
        </section>
      ) : null}

      {catalog.length === 0 ? (
        <section className="surface-card notice-panel">
          <strong>O catálogo utilizável ainda não está disponível.</strong>
          <p className="section-copy">
            O builder continua acessível, mas você só conseguirá criar propostas depois que houver
            pelo menos um serviço ativo no catálogo interno.
          </p>
        </section>
      ) : null}

      <ProposalBuilder
        catalog={catalog}
        initialLeadId={initialLeadId}
        leads={leads}
        partnerOptions={partnerOptions}
        sessionUser={{
          name: session.user.name,
          role: session.user.role
        }}
        sourceOptions={leadSourceOptions}
      />
    </div>
  );
}

function mapBuilderErrorMessage(errorCode?: string): string | null {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case "no_services":
      return "Selecione pelo menos um serviço no catálogo antes de criar o rascunho.";
    case "services_unavailable":
      return "Um ou mais serviços selecionados ficaram indisponíveis. Revise o catálogo e tente novamente.";
    case "lead_incomplete":
      return "Complete os campos obrigatórios do lead para continuar.";
    case "missing_payload":
    case "invalid_payload":
      return "A sessão do builder perdeu dados durante o envio. Revise os campos e tente novamente.";
    case "create_failed":
    default:
      return "Ocorreu uma falha ao persistir o rascunho. Tente novamente em instantes.";
  }
}
