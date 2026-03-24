import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import { buildProposalChecklist } from "@/lib/proposal-checklist";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatDateTime } from "@/lib/utils";

interface PublicProposalChecklistPageProps {
  proposal: ResolvedPublicProposal;
}

export function PublicProposalChecklistPage({
  proposal
}: PublicProposalChecklistPageProps) {
  const { snapshot } = proposal;
  const checklist = buildProposalChecklist(snapshot);
  const checklistIsAvailable = proposal.lifecycle.status === "ACCEPTED";
  const pdfPlan = getProposalPdfPlan(proposal);

  return (
    <main className="proposal-shell checklist-shell">
      <header className="proposal-header">
        <BrandMark href="/" />

        <div className="pill-row">
          <StatusPill tone={checklistIsAvailable ? "success" : "neutral"}>
            {checklistIsAvailable ? "Checklist aceito" : "Checklist bloqueado"}
          </StatusPill>
          <StatusPill tone="neutral">Rota privada de onboarding</StatusPill>
        </div>
      </header>

      <section className="checklist-hero">
        <article className="surface-card">
          <p className="eyebrow">{snapshot.proposalNumber}</p>
          <h1>Checklist de documentos</h1>
          <p className="proposal-summary">
            Consolidado apenas a partir do snapshot da proposta aceita, com requisitos duplicados
            removidos entre os serviços selecionados.
          </p>

          <div className="proposal-status-banner">
            <div>
              <strong>
                {checklistIsAvailable
                  ? "O checklist está pronto para onboarding"
                  : "O checklist libera após o aceite"}
              </strong>
              <p>
                {checklistIsAvailable
                  ? proposal.lifecycle.acceptedAt
                    ? `O aceite foi registrado em ${formatDateTime(proposal.lifecycle.acceptedAt)}. Use esta página como referência operacional para entrega documental.`
                    : "O aceite foi registrado para esta proposta. Use esta página como referência operacional para entrega documental."
                  : proposal.statusMessage}
              </p>
            </div>
            <StatusPill tone={checklistIsAvailable ? "success" : "neutral"}>
              {proposal.statusLabel}
            </StatusPill>
          </div>

          <div className="pill-row">
            <StatusPill tone="neutral">{snapshot.companyName}</StatusPill>
            <StatusPill tone="neutral">{checklist.totalItems} documentos únicos</StatusPill>
            <StatusPill tone="neutral">
              {snapshot.selectedServices.length} serviços selecionados
            </StatusPill>
          </div>
        </article>

        <aside className="surface-card checklist-sidebar">
          <div className="section-head">
            <p className="eyebrow">Próximas ações</p>
            <h2>{snapshot.contactName}</h2>
          </div>

          <div className="public-text-stack">
            <p className="section-copy">
              Este checklist é apenas informativo no MVP. O Franklin ainda não coleta arquivos
              diretamente, mas o snapshot aceito já expõe chaves estáveis de documento para um
              futuro módulo de upload.
            </p>
            <p className="section-copy">
              A {brand.parentName} revisará o conjunto de arquivos enviados antes do kickoff.
            </p>
          </div>

          <div className="inline-actions">
            <Link className="button-secondary" href={`/p/${snapshot.token}`}>
              Voltar para a proposta
            </Link>
            {pdfPlan.status === "ready" ? (
              <Link className="button-secondary" href={pdfPlan.renderPath}>
                Abrir PDF de entrega
              </Link>
            ) : null}
          </div>
        </aside>
      </section>

      {checklistIsAvailable ? (
        <section className="checklist-layout">
            <article className="surface-card checklist-main-card">
              <div className="section-head">
                <p className="eyebrow">Checklist</p>
                <h2>Documentos obrigatórios</h2>
              </div>

            <div className="checklist-list">
              {checklist.items.map((item, index) => (
                <article key={item.id} className="checklist-item-card">
                  <div className="checklist-item-index" aria-hidden="true">
                    {index + 1}
                  </div>

                  <div className="checklist-item-copy">
                    <div className="checklist-item-head">
                      <strong>{item.title}</strong>
                      <StatusPill tone="neutral">Somente informativo</StatusPill>
                    </div>

                    <div className="checklist-source-list">
                      {item.sources.map((source) => (
                        <StatusPill
                          key={`${item.id}-${source.kind}-${source.label}`}
                          tone={source.kind === "service" ? "accent" : "neutral"}
                        >
                          {source.label}
                        </StatusPill>
                      ))}
                    </div>

                    <p className="section-copy">
                      Este requisito aparece em {item.sources.length} fonte(s) de escopo e já tem
                      um slot de upload reservado para o futuro módulo documental.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="checklist-side-stack">
            <article className="surface-card">
              <div className="section-head">
                <p className="eyebrow">Instruções de envio</p>
                <h2>Como enviar o conjunto de arquivos</h2>
              </div>
              <ul className="feature-list">
                {snapshot.documentSubmissionInstructions.map((instruction) => (
                  <li key={instruction}>{instruction}</li>
                ))}
              </ul>
            </article>

            <article className="surface-card">
              <div className="section-head">
                <p className="eyebrow">Módulo de upload</p>
                <h2>Preparado para uma fase futura</h2>
              </div>

              <div className="public-text-stack">
                <p className="section-copy">
                  Uploads diretos continuam propositalmente desabilitados no MVP.
                </p>
                <p className="section-copy">
                  Cada item do checklist é gerado com uma chave estável para que um futuro fluxo
                  seguro de upload possa anexar arquivos ao snapshot da proposta aceita sem alterar
                  o registro comercial.
                </p>
              </div>
            </article>
          </aside>
        </section>
      ) : (
        <article className="surface-card checklist-locked-card">
          <div className="section-head">
            <p className="eyebrow">Status</p>
            <h2>Checklist ainda indisponível</h2>
          </div>
          <p className="section-copy">
            Esta rota passa a ser útil depois do aceite da proposta. Até lá, o cliente deve revisar
            o snapshot da proposta e usar o fluxo seguro de aceite na página principal.
          </p>
          <div className="inline-actions">
            <Link className="button-secondary" href={`/p/${snapshot.token}`}>
              Voltar para a proposta
            </Link>
          </div>
        </article>
      )}
    </main>
  );
}
