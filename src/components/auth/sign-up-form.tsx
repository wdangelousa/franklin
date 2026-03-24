"use client";

import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";

export function SignUpForm() {
  return (
    <section className="surface-card auth-card">
      <div className="section-head">
        <p className="eyebrow">Criar conta</p>
        <h2>Cadastro indisponível no MVP</h2>
        <p className="section-copy">
          O cadastro de novos usuários ainda não está habilitado. No MVP, utilize os perfis de
          demonstração disponíveis na tela de login.
        </p>
      </div>

      <div className="pill-row">
        <StatusPill tone="warning">Funcionalidade futura</StatusPill>
        <StatusPill tone="neutral">Admins &amp; Sócios</StatusPill>
      </div>

      <div className="inline-actions">
        <Link className="button-primary" href="/login">
          Ir para o login
        </Link>
      </div>
    </section>
  );
}
