import Link from "next/link";

import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { requireInternalSession } from "@/lib/auth/session";
import { getDashboardSnapshot } from "@/lib/dashboard";
import { getProposalStatusTone } from "@/lib/proposal-status";
import { formatCurrency, formatDate } from "@/lib/utils";

const dashboardShortcuts = [
  {
    href: "/app/leads",
    label: "Leads",
    description: "Saia da atividade de propostas para o contexto do relacionamento e da próxima ação."
  },
  {
    href: "/app/proposals",
    label: "Propostas",
    description: "Revise rascunhos, propostas enviadas e rotas públicas de entrega."
  },
  {
    href: "/app/catalog",
    label: "Catálogo",
    description: "Confira os serviços ativos e os preços que o builder consegue usar hoje."
  },
  {
    href: "/app/settings",
    label: "Configurações",
    description: "Revise o modo atual de acesso e os limites operacionais assumidos no MVP."
  }
] as const;

export default async function DashboardPage() {
  const session = await requireInternalSession();
  const snapshot = await getDashboardSnapshot(session);

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        actions={
          <>
            <Link className="button-secondary" href="/app/proposals">
              Abrir propostas
            </Link>
            <Link className="button-primary" href="/app/proposals/new">
              Iniciar rascunho de proposta
            </Link>
          </>
        }
        description="Uma visão executiva orientada a propostas para a equipe interna do Franklin. Os indicadores e a atividade recente agora vêm diretamente de dados persistidos no Prisma."
        eyebrow="Painel"
        title="Painel interno"
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

      <section className="surface-card workspace-intro-card">
        <div className="workspace-intro-copy">
          <p className="eyebrow">Leitura rápida</p>
          <h2>Primeiro entenda a carga do dia, depois aprofunde.</h2>
          <p className="section-copy">
            Esta área foi reorganizada para destacar prioridades imediatas, atalhos de ação e
            leitura curta de status antes de entrar nos detalhes operacionais.
          </p>
        </div>

        <div className="pill-row">
          <StatusPill tone="accent">Fluxo consultivo</StatusPill>
          <StatusPill tone="neutral">Leitura rápida</StatusPill>
          <StatusPill tone="neutral">Ação direta</StatusPill>
        </div>
      </section>

      <section className="surface-card dashboard-overview">
        <div className="dashboard-overview-copy">
          <p className="eyebrow">Central de propostas</p>
          <h2>Feito para revisão interna rápida, não para relatório decorativo.</h2>
          <p className="section-copy">
            O painel do Franklin prioriza a carga atual de propostas, a movimentação recente e os
            poucos sinais analíticos que mais importam em um workflow consultivo em estágio inicial.
          </p>

          <div className="pill-row">
            <StatusPill tone="accent">Dados reais em Prisma</StatusPill>
            <StatusPill tone="neutral">Contagem por status</StatusPill>
            <StatusPill tone="neutral">Últimas 5 propostas</StatusPill>
          </div>
        </div>

        <div className="dashboard-shortcuts">
          {dashboardShortcuts.map((shortcut) => (
            <Link key={shortcut.href} className="shortcut-card" href={shortcut.href}>
              <strong>{shortcut.label}</strong>
              <span>{shortcut.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-metric-grid">
        {snapshot.metrics.map((item) => (
          <article
            key={item.label}
            className={`metric-card dashboard-metric-card dashboard-metric-card-${item.tone}`}
          >
            <StatusPill tone={item.tone}>{item.label}</StatusPill>
            <strong>{item.value}</strong>
            <span>{item.detail}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-layout">
        <article className="surface-card dashboard-panel dashboard-panel-large">
          <div className="section-head">
            <p className="eyebrow">Propostas recentes</p>
            <h2>Última atividade interna</h2>
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
                <p>Crie a primeira proposta para ativar os blocos de atividade e status do painel.</p>
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
        </div>
      </section>
    </div>
  );
}
