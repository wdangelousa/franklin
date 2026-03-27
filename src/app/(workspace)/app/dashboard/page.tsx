import Link from "next/link";

import { IconFileText, IconCheckCircle, IconEdit, IconClock } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireInternalSession } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { getProposalStatusTone } from "@/lib/proposal-status";
import { formatCurrency, formatDate } from "@/lib/utils";

const metricIcons = [IconFileText, IconCheckCircle, IconEdit, IconClock] as const;

const dashboardShortcuts = [
  {
    href: "/app/leads",
    label: "Leads",
    description: "Contexto de relacionamento e próxima ação."
  },
  {
    href: "/app/proposals",
    label: "Propostas",
    description: "Rascunhos, envios e rotas públicas."
  },
  {
    href: "/app/catalog",
    label: "Catálogo",
    description: "Serviços ativos e preços do builder."
  },
  {
    href: "/app/settings",
    label: "Configurações",
    description: "Modo de acesso e limites do MVP."
  }
] as const;

export default async function DashboardPage() {
  const session = await requireInternalSession();
  const snapshot = await getDashboardSnapshot(session);

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        actions={
          <Link className="button-primary" href="/app/proposals/new">
            Nova proposta
          </Link>
        }
        description="Indicadores e atividade recente de propostas."
        eyebrow="Painel"
        title="Painel"
      />

      {snapshot.isOffline ? (
        <section className="surface-card notice-panel">
          <strong>O banco de dados está temporariamente indisponível.</strong>
          <p>
            Os indicadores abaixo estão zerados porque não foi possível conectar ao banco.
            Verifique a variável DATABASE_URL e a conectividade com o servidor PostgreSQL.
          </p>
        </section>
      ) : null}

      <section className="dashboard-metric-grid">
        {snapshot.metrics.map((item, index) => {
          const MetricIcon = metricIcons[index % metricIcons.length];
          return (
            <article
              key={item.label}
              className={`metric-card dashboard-metric-card dashboard-metric-card-${item.tone}`}
            >
              <div className="pill-row">
                <span className="icon-inline icon-muted"><MetricIcon size={16} /></span>
                <StatusPill tone={item.tone}>{item.label}</StatusPill>
              </div>
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </article>
          );
        })}
      </section>

      <section className="dashboard-layout">
        <article className="surface-card dashboard-panel dashboard-panel-large">
          <div className="section-head">
            <p className="eyebrow">Propostas recentes</p>
            <h2>Última atividade</h2>
          </div>

          <div className="data-list">
            {snapshot.recentProposals.length > 0 ? (
              snapshot.recentProposals.map((proposal) => (
                <div key={proposal.proposalNumber} className="data-row data-row-stack">
                  <div>
                    <strong>
                      <Link className="text-link" href={`/app/proposals/${proposal.id}`}>
                        {proposal.title}
                      </Link>
                    </strong>
                    <p>
                      {proposal.company} · {proposal.proposalNumber}
                    </p>
                  </div>

                  <div className="row-meta row-meta-wide">
                    <StatusPill tone={getProposalStatusTone(proposal.status)}>
                      {proposal.status}
                    </StatusPill>
                    <span>Atualizada em {formatDate(proposal.updatedAt)}</span>
                    <strong>{formatCurrency(proposal.total)}</strong>
                  </div>
                </div>
              ))
            ) : (
              <div className="builder-empty-state">
                <strong>Nenhuma proposta registrada ainda.</strong>
                <p>Crie a primeira proposta para ativar o painel.</p>
                <Link className="button-primary" href="/app/proposals/new">
                  Criar primeira proposta
                </Link>
              </div>
            )}
          </div>
        </article>

        <div className="dashboard-sidebar-stack">
          <article className="surface-card dashboard-panel">
            <div className="section-head">
              <p className="eyebrow">Resumo por status</p>
              <h2>Distribuição atual</h2>
            </div>

            <div className="status-summary-list">
              {snapshot.statusSummary.map((status) => (
                <div key={status.status} className="status-summary-row">
                  <div className="status-summary-head">
                    <div>
                      <strong>{status.status}</strong>
                      <p>{status.count} proposta(s)</p>
                    </div>

                    <StatusPill tone={status.tone}>{Math.round(status.share * 100)}%</StatusPill>
                  </div>

                  <div className="status-meter">
                    <span style={{ width: `${status.share * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="dashboard-shortcuts">
            {dashboardShortcuts.map((shortcut) => (
              <Link key={shortcut.href} className="shortcut-card" href={shortcut.href}>
                <strong>{shortcut.label}</strong>
                <span>{shortcut.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
