import Link from "next/link";

import { IconChevronRight, IconPlus, IconUsers, IconProposals } from "@/components/ui/icons";
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

  return (
    <div className="page-stack leads-page">
      <PageHeader
        actions={
          <Link className="button-primary" href="/app/leads/new">
            <IconPlus size={16} /> Criar lead
          </Link>
        }
        description="Qualificação rápida e caminho direto para proposta."
        eyebrow="Leads"
        title="Leads"
      />

      {params?.created === "1" ? (
        <section className="surface-card notice-panel">
          <strong>
            Lead {params.fullName || "novo contato"}
            {params.company ? ` em ${params.company}` : ""} salvo.
          </strong>
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
          <div className="pill-row">
            <span className="icon-inline icon-muted"><IconUsers size={16} /></span>
            <p>Leads ativos</p>
          </div>
          <strong>{leadList.length}</strong>
          <span>Contatos em qualificação ou acompanhamento.</span>
        </article>

        <article className="metric-card">
          <div className="pill-row">
            <span className="icon-inline icon-muted"><IconProposals size={16} /></span>
            <p>Prontos para proposta</p>
          </div>
          <strong>{proposalReadyCount}</strong>
          <span>Leads prontos para avançar para rascunho.</span>
        </article>
      </section>

      <section className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Pipeline</p>
          <h2>Leads atuais</h2>
        </div>

        <div className="lead-list lead-record-list">
          {leadList.length > 0 ? (
            leadList.map((lead) => (
              <Link key={lead.id} className="lead-row lead-record" href={`/app/leads/${lead.id}`}>
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
                    <p className="detail-label">Propostas</p>
                    <strong>{lead.proposalCount}</strong>
                  </div>
                  <div>
                    <p className="detail-label">Valor</p>
                    <strong>{formatCurrency(lead.estimatedValue)}</strong>
                  </div>
                </div>

                <div className="lead-row-footer">
                  <p className="lead-next-step">{lead.nextStep}</p>
                  <IconChevronRight size={18} />
                </div>
              </Link>
            ))
          ) : (
            <div className="builder-empty-state">
              <strong>Nenhum lead registrado ainda.</strong>
              <p>Crie o primeiro lead para iniciar o fluxo de proposta.</p>
              <Link className="button-primary" href="/app/leads/new">
                <IconPlus size={16} /> Criar primeiro lead
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
