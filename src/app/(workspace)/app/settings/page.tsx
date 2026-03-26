import { StatusPill } from "@/components/ui/status-pill";
import { AUTH_MODE } from "@/lib/auth/config";
import { PageHeader } from "@/components/ui/page-header";

const settingsSections = [
  {
    eyebrow: "Acesso",
    title: "Scaffold de autenticação",
    copy: "O acesso interno por perfil continua propositalmente mínimo e temporário no MVP: apenas sessões ADMIN e PARTNER em modo mock, com a revisão pública de propostas fora do login da área interna."
  },
  {
    eyebrow: "Dados",
    title: "Prontidão analítica",
    copy: "O painel agora usa consultas Prisma para contagens, recência e status de propostas, mantendo a visão executiva leve no escopo do MVP."
  },
  {
    eyebrow: "Entrega",
    title: "Postura de publicação",
    copy: "Os links públicos de proposta continuam sendo a superfície voltada ao cliente. As configurações internas permanecem separadas do acesso externo e da gestão de tokens."
  }
] as const;

export default function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        description="Configurações permanece propositalmente enxuto no MVP. A página expõe a postura operacional interna atual e os padrões do sistema que importam antes de uma implementação mais profunda."
        eyebrow="Configurações"
        title="Configurações da área interna"
      />

      <section className="surface-card notice-panel">
        <div className="section-head">
          <p className="eyebrow">Modo atual do sistema</p>
          <h2>Postura operacional interna</h2>
        </div>

        <div className="pill-row">
          <StatusPill tone={AUTH_MODE === "mock" ? "accent" : "warning"}>
            Modo mock temporário
          </StatusPill>
          <StatusPill tone="neutral">O acesso do cliente continua público</StatusPill>
          <StatusPill tone="neutral">Controles avançados adiados</StatusPill>
        </div>
      </section>

      <section className="card-grid">
        {settingsSections.map((section) => (
          <article key={section.title} className="surface-card">
            <div className="section-head">
              <p className="eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
            </div>
            <p className="section-copy">{section.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
