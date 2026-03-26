import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireInternalSession } from "@/lib/auth/session";
import {
  formatLeadSourceLabel,
  formatLeadStageLabel,
  getLeadList,
  getLeadSourceTone,
  getLeadStageTone
} from "@/lib/leads";
import { formatCurrency } from "@/lib/utils";

interface LeadsPageProps {
  searchParams?: Promise<{
    created?: string;
    leadId?: string;
    fullName?: string;
    company?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const session = await requireInternalSession();
  const params = searchParams ? await searchParams : undefined;
  const leadList = await getLeadList(session);
  const proposalReadyCount = leadList.filter((lead) => lead.stage === "Proposal").length;
  const assignedPartnerCount = new Set(leadList.map((lead) => lead.assignedPartner)).size;

  return (
    <div className="page-stack leads-page">
      <PageHeader
        actions={
          <Link className="button-primary" href="/app/leads/new">
            Criar lead
          </Link>
        }
        description="A gestão de leads permanece propositalmente enxuta no Franklin. O foco é qualificação rápida, responsabilidade clara e caminho direto para a proposta."
        eyebrow="Leads"
        title="Área de leads"
      />

      <section className="surface-card operations-hero">
        <div className="operations-hero-copy">
          <p className="eyebrow">Qualificação</p>
          <h2>Contexto comercial antes da proposta.</h2>
          <p className="section-copy">
            Esta tela foi refinada para facilitar a leitura do estágio, da responsabilidade e do
            próximo passo sem exigir navegação imediata para o detalhe.
          </p>
        </div>

        <div className="operations-hero-metrics">
          <div className="summary-stat">
            <span>Leads ativos</span>
            <strong>{leadList.length}</strong>
          </div>
          <div className="summary-stat">
            <span>Prontos para proposta</span>
            <strong>{proposalReadyCount}</strong>
          </div>
          <div className="summary-stat">
            <span>Sócios responsáveis</span>
            <strong>{assignedPartnerCount}</strong>
          </div>
        </div>
      </section>

      {params?.created === "1" ? (
        <section className="surface-card notice-panel">
          <div className="section-head">
            <p className="eyebrow">Lead salvo</p>
            <h2>Registro persistido com sucesso</h2>
          </div>
          <p className="section-copy">
            O Franklin registrou{" "}
            <strong>
              {params.fullName || "o novo contato"}
              {params.company ? ` em ${params.company}` : ""}
            </strong>
            . O lead já está disponível com relacionamento durável para propostas.
          </p>
          {params.leadId ? (
            <div className="inline-actions">
              <Link className="button-secondary" href={`/app/leads/${params.leadId}`}>
                Abrir lead criado
              </Link>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="metric-grid">
        <article className="metric-card">
          <p>Leads ativos</p>
          <strong>{leadList.length}</strong>
          <span>Contatos visíveis hoje em qualificação ou acompanhamento para proposta.</span>
        </article>

        <article className="metric-card">
          <p>Leads em proposta</p>
          <strong>{proposalReadyCount}</strong>
          <span>Leads já maduros o suficiente para avançar direto para um rascunho.</span>
        </article>

        <article className="metric-card">
          <p>Sócios responsáveis</p>
          <strong>{assignedPartnerCount}</strong>
          <span>Responsáveis internos conduzindo conversas ativas até a criação da proposta.</span>
        </article>
      </section>

      <section className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Lista</p>
          <h2>Pipeline de leads orientado a proposta</h2>
        </div>

        <div className="lead-list lead-record-list">
          {leadList.length > 0 ? (
            leadList.map((lead) => (
              <article key={lead.id} className="lead-row lead-record">
                <div className="lead-row-primary">
                  <div className="lead-row-heading">
                    <div>
                      <strong>{lead.fullName}</strong>
                      <p>{lead.company}</p>
                    </div>

                    <StatusPill tone={getLeadStageTone(lead.stage)}>
                      {formatLeadStageLabel(lead.stage)}
                    </StatusPill>
                  </div>

                  <div className="lead-row-contact">
                    <span>{lead.email}</span>
                    <span>{lead.phone}</span>
                  </div>
                </div>

                <div className="lead-row-meta">
                  <div>
                    <p className="detail-label">Origem</p>
                    <StatusPill tone={getLeadSourceTone(lead.source)}>
                      {formatLeadSourceLabel(lead.source)}
                    </StatusPill>
                  </div>
                  <div>
                    <p className="detail-label">Sócio responsável</p>
                    <strong>{lead.assignedPartner}</strong>
                  </div>
                  <div>
                    <p className="detail-label">Propostas relacionadas</p>
                    <strong>{lead.proposalCount}</strong>
                  </div>
                  <div>
                    <p className="detail-label">Valor do lead</p>
                    <strong>{formatCurrency(lead.estimatedValue)}</strong>
                  </div>
                </div>

                <div className="lead-row-footer">
                  <p className="lead-next-step">{lead.nextStep}</p>

                  <div className="inline-actions">
                    <Link className="button-secondary" href={`/app/proposals/new?leadId=${lead.id}`}>
                      Nova proposta
                    </Link>
                    <Link className="button-primary" href={`/app/leads/${lead.id}`}>
                      Abrir lead
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="builder-empty-state">
              <strong>Nenhum lead registrado ainda.</strong>
              <p>
                Crie o primeiro lead para iniciar o fluxo completo de proposta, envio e acompanhamento.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
