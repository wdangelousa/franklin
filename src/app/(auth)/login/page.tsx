import Image from "next/image";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";

export default function LoginPage() {
  return (
    <main className="auth-grid">
      <section className="auth-copy">
        <BrandMark />
        <p className="eyebrow">Acesso interno</p>
        <h1>Login da área interna protegida do Franklin.</h1>
        <p className="section-copy">
          No MVP, o acesso é limitado a administradores e sócios internos. Clientes não fazem login
          aqui e continuam acessando propostas por links públicos com token.
        </p>
        <p className="section-copy">
          O modo de autenticação atual é um mock temporário para uso interno controlado. Ele existe
          apenas para destravar a operação do MVP enquanto a autenticação definitiva ainda não foi
          implementada.
        </p>

        <div className="pill-row">
          <StatusPill tone="accent">Rotas internas protegidas</StatusPill>
          <StatusPill tone="neutral">Apenas administrador e sócio</StatusPill>
          <StatusPill tone="neutral">Acesso do cliente continua público</StatusPill>
        </div>

        <div className="auth-highlights">
          <article className="note-card auth-highlight">
            <strong>Perfis internos</strong>
            <p>A área interna do Franklin no MVP suporta apenas sessões `ADMIN` e `PARTNER`.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Modo temporário</strong>
            <p>O login demo atual é provisório e não substitui um sistema definitivo de autenticação.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Limite de rota</strong>
            <p>Tudo sob `/app` exige uma sessão interna autenticada antes da renderização.</p>
          </article>

          <article className="note-card auth-highlight">
            <strong>Postura do cliente</strong>
            <p>A revisão de propostas continua separada do login interno e permanece na rota pública.</p>
          </article>
        </div>

        <div className="inline-actions">
          <Link className="button-secondary" href="/">
            Voltar para a visão geral
          </Link>
        </div>
      </section>

      <SignInForm />
    </main>
  );
}
