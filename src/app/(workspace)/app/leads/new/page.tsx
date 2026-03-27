import Link from "next/link";

import { IconArrowLeft } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StickyBottomBar } from "@/components/ui/sticky-bottom-bar";
import { requireInternalSession } from "@/lib/auth/session";
import { createLeadDraft } from "@/lib/lead-actions";
import {
  getAssignedPartnerOptions,
  formatLeadSourceLabel,
  leadSourceOptions
} from "@/lib/leads";

interface NewLeadPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function NewLeadPage({ searchParams }: NewLeadPageProps) {
  const session = await requireInternalSession();
  const params = searchParams ? await searchParams : undefined;
  const errorMessage = mapLeadCreateErrorMessage(params?.error);
  const assignedPartnerOptions = await getAssignedPartnerOptions(session);

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <Link className="button-secondary" href="/app/leads">
            <IconArrowLeft size={16} /> Voltar
          </Link>
        }
        description="Capture o contato e a responsabilidade antes de avançar para a proposta."
        eyebrow="Novo lead"
        title="Criar lead"
      />

      {errorMessage ? (
        <section className="surface-card notice-panel">
          <strong>Não foi possível salvar o lead.</strong>
          <p className="section-copy">{errorMessage}</p>
        </section>
      ) : null}

      <section className="lead-form-layout">
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Entrada de lead</p>
            <h2>Apenas campos centrais do negócio</h2>
          </div>

          <form action={createLeadDraft} className="lead-form-grid" id="lead-form">
            <div className="two-column-grid">
              <label className="field">
                <span>Nome completo</span>
                <input name="fullName" placeholder="Avery Cole" required type="text" />
              </label>

              <label className="field">
                <span>Empresa</span>
                <input name="company" placeholder="Northstar Capital" required type="text" />
              </label>

              <label className="field">
                <span>Email</span>
                <input name="email" placeholder="avery@company.com" required type="email" />
              </label>

              <label className="field">
                <span>Telefone</span>
                <input name="phone" placeholder="+1 (212) 555-0181" required type="tel" />
              </label>

              <label className="field">
                <span>Origem</span>
                <select defaultValue={leadSourceOptions[0]} name="source">
                  {leadSourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {formatLeadSourceLabel(source)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Sócio responsável</span>
                <select defaultValue={assignedPartnerOptions[0]} name="assignedPartner">
                  {assignedPartnerOptions.map((partner) => (
                    <option key={partner} value={partner}>
                      {partner}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="field">
              <span>Observações</span>
              <textarea
                name="notes"
                placeholder="Registre o contexto que deve orientar o rascunho da proposta."
                rows={6}
              />
            </label>

            <div className="inline-actions">
              <button className="button-primary" type="submit">
                Salvar lead
              </button>
              <Link className="button-secondary" href="/app/leads">
                Cancelar
              </Link>
            </div>
          </form>

          <StickyBottomBar>
            <button className="button-primary" form="lead-form" type="submit">
              Salvar lead
            </button>
          </StickyBottomBar>
        </article>

        <article className="surface-card notice-panel">
          <div className="section-head">
            <p className="eyebrow">Intenção do fluxo</p>
            <h2>Feito para gerar proposta, não para virar um CRM complexo</h2>
          </div>

          <ul className="feature-list">
            <li>Mantenha o registro pequeno o suficiente para ser concluído durante ou logo após uma call.</li>
            <li>Defina um sócio responsável imediatamente para deixar a proposta com dono desde o início.</li>
            <li>Use observações para registrar o contexto comercial que deve aparecer na proposta.</li>
            <li>Após salvar, o lead já fica persistido no Prisma e disponível para o builder de proposta.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function mapLeadCreateErrorMessage(errorCode?: string): string | null {
  if (!errorCode) {
    return null;
  }

  switch (errorCode) {
    case "required_fields":
      return "Preencha os campos obrigatórios de contato e responsável antes de continuar.";
    case "create_failed":
    default:
      return "Ocorreu uma falha ao persistir o lead. Tente novamente em instantes.";
  }
}
