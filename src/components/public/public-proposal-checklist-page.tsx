import Link from "next/link";

import { PaymentInstructions } from "@/components/public/payment-instructions";
import { BrandMark } from "@/components/ui/brand-mark";
import { StatusPill } from "@/components/ui/status-pill";
import { brand } from "@/lib/brand";
import { getProposalPdfPlan } from "@/lib/proposal-pdf";
import type { ProposalChecklistItemRecord } from "@/lib/proposal-store";
import { completeChecklistItemAction } from "@/lib/public-proposal-actions";
import type { ResolvedPublicProposal } from "@/lib/public-proposals";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/utils";

interface PublicProposalChecklistPageProps {
  proposal: ResolvedPublicProposal;
  checklistItems: ProposalChecklistItemRecord[];
}

export function PublicProposalChecklistPage({
  proposal,
  checklistItems
}: PublicProposalChecklistPageProps) {
  const { snapshot } = proposal;
  const checklistIsAvailable = proposal.lifecycle.status === "ACCEPTED";
  const pdfPlan = getProposalPdfPlan(proposal);

  const clientItems = checklistItems.filter((item) => item.side === "CLIENT");
  const completedCount = clientItems.filter((item) => item.isCompleted).length;

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
            Itens de onboarding gerados a partir da proposta aceita. Marque cada item conforme
            for concluído.
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
                    ? `O aceite foi registrado em ${formatDateTime(proposal.lifecycle.acceptedAt)}. Use esta página para acompanhar a entrega dos documentos.`
                    : "O aceite foi registrado para esta proposta. Use esta página para acompanhar a entrega dos documentos."
                  : proposal.statusMessage}
              </p>
            </div>
            <StatusPill tone={checklistIsAvailable ? "success" : "neutral"}>
              {proposal.statusLabel}
            </StatusPill>
          </div>

          <div className="pill-row">
            <StatusPill tone="neutral">{snapshot.companyName}</StatusPill>
            <StatusPill tone="neutral">{clientItems.length} itens do cliente</StatusPill>
            <StatusPill live tone={completedCount === clientItems.length && clientItems.length > 0 ? "success" : "neutral"}>
              {completedCount}/{clientItems.length} concluídos
            </StatusPill>
          </div>
        </article>

        <aside className="surface-card checklist-sidebar">
          <div className="public-flow-card">
            <p className="eyebrow">Onboarding</p>
            <h2>Entregue cada item sem perder o contexto</h2>
            <p className="section-copy">
              O checklist foi reorganizado como uma área de progresso: contexto no topo, ações no
              lado e itens em sequência clara.
            </p>
          </div>

          <div className="section-head">
            <p className="eyebrow">Próximas ações</p>
            <h2>{snapshot.contactName}</h2>
          </div>

          <div className="public-text-stack">
            <p className="section-copy">
              Marque os itens abaixo conforme entregar os documentos solicitados.
              A {brand.parentName} acompanhará o progresso internamente.
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
        <PaymentInstructions
          totalFormatted={formatCurrencyFromCents(proposal.totalInvestmentCents)}
          proposalNumber={snapshot.proposalNumber}
          clientName={snapshot.contactName}
        />
      ) : null}

      {checklistIsAvailable ? (
        <section className="checklist-layout">
          <article className="surface-card checklist-main-card">
            <div className="section-head">
              <p className="eyebrow">Checklist</p>
              <h2>Documentos obrigatórios</h2>
            </div>

            <div className="checklist-list">
              {clientItems.length > 0 ? (
                clientItems.map((item, index) => (
                  <article
                    key={item.id}
                    className={`checklist-item-card${item.isCompleted ? " is-completed" : ""}`}
                  >
                    <div className="checklist-item-index" aria-hidden="true">
                      {item.isCompleted ? "\u2713" : index + 1}
                    </div>

                    <div className="checklist-item-copy">
                      <div className="checklist-item-head">
                        <strong>{item.title}</strong>
                        <StatusPill tone={item.isCompleted ? "success" : "neutral"}>
                          {item.isCompleted ? "Concluído" : "Pendente"}
                        </StatusPill>
                      </div>

                      {item.description ? (
                        <p className="section-copy">{item.description}</p>
                      ) : null}

                      {item.isCompleted ? (
                        <p className="section-copy checklist-completed-info">
                          Concluído em {formatDateTime(item.completedAt!.toISOString())}
                          {item.completedBy ? ` por ${item.completedBy}` : ""}
                        </p>
                      ) : (
                        <form action={completeChecklistItemAction}>
                          <input type="hidden" name="token" value={snapshot.token} />
                          <input type="hidden" name="itemId" value={item.id} />
                          <input type="hidden" name="completedBy" value={snapshot.contactName} />
                          <button className="button-secondary checklist-complete-button" type="submit">
                            Marcar como concluído
                          </button>
                        </form>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="builder-empty-state">
                  <strong>Nenhum documento obrigatório encontrado.</strong>
                  <p>Os serviços desta proposta não exigem documentação adicional do cliente.</p>
                </div>
              )}
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
                <p className="eyebrow">Progresso</p>
                <h2>Resumo do checklist</h2>
              </div>

              <div className="public-text-stack">
                <p className="section-copy">
                  {completedCount === 0
                    ? "Nenhum item foi concluído ainda. Marque os itens conforme entregar os documentos."
                    : completedCount === clientItems.length
                      ? "Todos os itens foram concluídos. A equipe revisará a documentação antes do kickoff."
                      : `${completedCount} de ${clientItems.length} itens concluídos. Continue marcando os itens conforme entregar os documentos.`}
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
