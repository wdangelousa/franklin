import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { architecturePrinciples, foundationModules } from "@/lib/navigation";

export default function MarketingPage() {
  return (
    <main className="marketing-shell">
      <header className="marketing-header">
        <BrandMark />

        <div className="marketing-actions">
          <Link className="button-secondary" href="/login">
            Entrar
          </Link>
          <Link className="button-primary" href="/app/dashboard">
            Abrir área interna
          </Link>
        </div>
      </header>

      <section className="marketing-hero surface-card">
        <div className="hero-copy">
          <p className="eyebrow">{brand.parentName}</p>
          <h1>Operação consultiva com postura premium para o cliente.</h1>
          <p className="hero-text">
            O Franklin já tem a arquitetura-base de uma plataforma consultiva moderna: shell de
            marca, fronteira de autenticação, organização de rotas e modelo de dados capaz de
            sustentar o produto real.
          </p>

          <div className="pill-row">
            <StatusPill tone="accent">Área interna protegida</StatusPill>
            <StatusPill tone="neutral">Acesso de administrador e sócio</StatusPill>
            <StatusPill tone="neutral">A revisão do cliente continua pública</StatusPill>
          </div>
        </div>

        <div className="hero-panel">
          <p className="eyebrow">Incluído agora</p>
          <ul className="feature-list">
            <li>Landing page responsiva e shell da área interna</li>
            <li>Scaffold de login por perfil com proteção de rotas internas</li>
            <li>Entidades centrais em Prisma para leads, serviços e propostas</li>
            <li>Páginas-base para cada módulo principal do produto</li>
          </ul>
        </div>
      </section>

      <section className="card-grid">
        {foundationModules.map((module) => (
          <article key={module.title} className="surface-card">
            <div className="section-head">
              <p className="eyebrow">Módulo</p>
              <h2>{module.title}</h2>
            </div>
            <p className="section-copy">{module.summary}</p>
          </article>
        ))}
      </section>

      <section className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Arquitetura</p>
          <h2>Decisões da Fase 1</h2>
        </div>

        <div className="stack-grid">
          {architecturePrinciples.map((principle) => (
            <article key={principle} className="note-card">
              {principle}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
