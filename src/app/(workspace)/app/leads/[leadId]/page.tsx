import Link from "next/link";
import { notFound } from "next/navigation";

import { IconArrowLeft, IconMail, IconPhone, IconBuilding, IconDollarSign } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireInternalSession } from "@/lib/auth/session";
import {
  formatLeadSourceLabel,
  formatLeadStageLabel,
  getLeadById,
  getLeadSourceTone,
  getLeadStageTone
} from "@/lib/leads";
import { getProposalStatusTone } from "@/lib/proposal-status";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LeadDetailPageProps {
  params: Promise<{
    leadId: string;
  }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const session = await requireInternalSession();
  const { leadId } = await params;
  const lead = await getLeadById(session, leadId);

  if (!lead) {
    notFound();
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <>
            <Link className="button-secondary" href="/app/leads">
              <IconArrowLeft size={16} /> Voltar
            </Link>
            <Link className="button-primary" href={`/app/proposals/new?leadId=${lead.id}`}>
              Iniciar proposta
            </Link>
          </>
        }
        description="Qualificação, responsabilidade e propostas vinculadas."
        eyebrow="Detalhe do lead"
        title={lead.company}
      />

      <section className="surface-card lead-hero">
        <div className="lead-hero-copy">
          <p className="eyebrow">Contato principal</p>
          <h2>{lead.fullName}</h2>
          <p className="section-copy">{lead.notes}</p>
        </div>

        <div className="lead-hero-meta">
          <StatusPill tone={getLeadStageTone(lead.stage)}>{formatLeadStageLabel(lead.stage)}</StatusPill>
          <StatusPill tone={getLeadSourceTone(lead.source)}>{formatLeadSourceLabel(lead.source)}</StatusPill>
          <StatusPill tone="neutral">{lead.proposalCount} proposta(s) vinculada(s)</StatusPill>
        </div>
      </section>

      <section className="lead-detail-grid">
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Registro do contato</p>
            <h2>Detalhes da qualificação</h2>
          </div>

          <div className="detail-grid">
            <div className="detail-pair">
              <p className="detail-label">Nome completo</p>
              <strong>{lead.fullName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label"><IconBuilding size={14} /> Empresa</p>
              <strong>{lead.company}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label"><IconMail size={14} /> Email</p>
              <strong>{lead.email}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label"><IconPhone size={14} /> Telefone</p>
              <strong>{lead.phone}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Origem</p>
              <strong>{formatLeadSourceLabel(lead.source)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Sócio responsável</p>
              <strong>{lead.assignedPartner}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Próximo passo</p>
              <strong>{lead.nextStep}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label"><IconDollarSign size={14} /> Valor estimado</p>
              <strong>{formatCurrency(lead.estimatedValue)}</strong>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Fluxo de propostas</p>
            <h2>Propostas relacionadas</h2>
          </div>

          {lead.relatedProposals.length > 0 ? (
            <div className="data-list">
              {lead.relatedProposals.map((proposal) => (
                <div key={proposal.proposalNumber} className="data-row">
                  <div>
                    <strong>
                      <Link className="text-link" href={`/app/proposals/${proposal.id}`}>
                        {proposal.title}
                      </Link>
                    </strong>
                    <p>{proposal.proposalNumber}</p>
                  </div>

                  <div className="row-meta row-meta-wide">
                    <StatusPill tone={getProposalStatusTone(proposal.status)}>
                      {proposal.status}
                    </StatusPill>
                    <span>Atualizada em {formatDate(proposal.updatedAt)}</span>
                    <strong>{formatCurrency(proposal.total)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lead-empty-state">
              <p>Nenhuma proposta está vinculada a este lead ainda.</p>
              <Link className="button-primary" href={`/app/proposals/new?leadId=${lead.id}`}>
                Criar primeira proposta
              </Link>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
