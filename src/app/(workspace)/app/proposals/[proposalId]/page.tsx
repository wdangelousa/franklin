import Link from "next/link";
import { notFound } from "next/navigation";

import { IconArrowLeft, IconSend } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { StickyBottomBar } from "@/components/ui/sticky-bottom-bar";
import { ProposalPublicLinkActions } from "@/components/workspace/proposal-public-link-actions";
import { ProposalSentSuccess } from "@/components/workspace/proposal-sent-success";
import { requireInternalSession } from "@/lib/auth/session";
import { publishProposalDraftAction } from "@/lib/proposal-actions";
import { getInternalProposalDetail, type InternalProposalDetail } from "@/lib/proposal-store";
import { getProposalStatusTone, type ProposalDisplayStatus } from "@/lib/proposal-status";
import { formatCurrencyFromCents, formatDate, formatDateTime } from "@/lib/utils";

interface ProposalDetailPageProps {
  params: Promise<{
    proposalId: string;
  }>;
  searchParams?: Promise<{
    created?: string;
    sent?: string;
    published?: string;
    cancelled?: string;
    sendError?: string;
    publishError?: string;
    cancelError?: string;
  }>;
}

export default async function ProposalDetailPage({
  params,
  searchParams
}: ProposalDetailPageProps) {
  const session = await requireInternalSession();
  const { proposalId } = await params;
  const detail = await getInternalProposalDetail({
    proposalId,
    session
  });
  const feedback = searchParams ? await searchParams : undefined;

  if (!detail) {
    notFound();
  }

  if ((feedback?.published === "1" || feedback?.sent === "1") && detail.status === "Enviada") {
    return <ProposalSentSuccess proposal={detail} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        actions={
          <div className="proposal-detail-header-actions">
            <Link className="button-secondary" href="/app/proposals">
              <IconArrowLeft size={16} /> Voltar
            </Link>
            {detail.status === "Rascunho" ? (
              <form action={publishProposalDraftAction} className="proposal-send-form-inline">
                <input name="proposalId" type="hidden" value={detail.id} />
                <button className="button-primary" type="submit">
                  <IconSend size={16} /> Publicar proposta
                </button>
              </form>
            ) : detail.publicLink ? (
              <ProposalPublicLinkActions publicLink={detail.publicLink} />
            ) : null}
          </div>
        }
        description="Detalhes da proposta, serviços incluídos e histórico de eventos."
        eyebrow="Detalhe da proposta"
        title={detail.title}
      />

      {feedback?.created === "1" ? (
        <section className="surface-card notice-panel">
          <strong>Rascunho da proposta criado.</strong>
          <p>O rascunho foi salvo e está pronto para ser publicado.</p>
        </section>
      ) : null}

      {(feedback?.published === "1" || feedback?.sent === "1") ? (
        <section className="surface-card notice-panel">
          <strong>Proposta publicada.</strong>
          <p>A proposta foi publicada e o link de revisão já está disponível para o cliente.</p>
        </section>
      ) : null}

      {(feedback?.publishError || feedback?.sendError) ? (
        <section className="surface-card notice-panel">
          <strong>Não foi possível publicar a proposta.</strong>
          <p>{mapPublishErrorMessage(feedback.publishError ?? feedback.sendError ?? "")}</p>
        </section>
      ) : null}

      <section className="two-column-grid">
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">{detail.proposalNumber}</p>
            <h2>Resumo da proposta</h2>
          </div>

          <div className="lead-detail-grid">
            <div className="detail-pair">
              <p className="detail-label">Status</p>
              <StatusPill tone={getProposalStatusTone(detail.status)}>{detail.status}</StatusPill>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Empresa</p>
              <strong>{detail.companyName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Lead</p>
              <strong>
                {detail.lead ? (
                  <Link className="text-link" href={`/app/leads/${detail.lead.id}`}>
                    {detail.lead.companyName}
                  </Link>
                ) : (
                  "Sem lead vinculado"
                )}
              </strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Contato</p>
              <strong>{detail.contactName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Email</p>
              <strong>{detail.contactEmail ?? "Não informado"}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Telefone</p>
              <strong>{detail.contactPhone ?? "Não informado"}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Responsável</p>
              <strong>{detail.ownerName ?? "Não atribuído"}</strong>
            </div>
          </div>

          <div className="totals-panel">
            <div className="total-row">
              <span>Subtotal</span>
              <strong><span className="currency-value">{formatCurrencyFromCents(detail.subtotalCents)}</span></strong>
            </div>
            <div className="total-row">
              <span>Desconto</span>
              <strong><span className="currency-value">{formatCurrencyFromCents(detail.discountCents)}</span></strong>
            </div>
            <div className="total-row is-grand">
              <span>Total</span>
              <strong><span className="currency-value">{formatCurrencyFromCents(detail.totalCents)}</span></strong>
            </div>
          </div>
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Entrega</p>
            <h2>Status e entrega</h2>
          </div>

          <div className="public-text-stack">
            <p className="section-copy">
              {detail.status === "Rascunho"
                ? "Esta proposta ainda não foi publicada. O link será gerado ao publicar."
                : "O link público da proposta está ativo e disponível para o cliente."}
            </p>
            <p className="section-copy">
              {detail.isLocked
                ? getLockedStatusMessage(detail.status)
                : "Use esta página para acompanhar o status da proposta e acessar o link do cliente."}
            </p>
          </div>

          <div className="lead-detail-grid">
            <div className="detail-pair">
              <p className="detail-label">Criada</p>
              <strong>{formatDateTime(detail.createdAt)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Enviada</p>
              <strong>{detail.sentAt ? formatDateTime(detail.sentAt) : "Ainda não enviada"}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Visualizada</p>
              <strong>{detail.viewedAt ? formatDateTime(detail.viewedAt) : "Ainda não visualizada"}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Aceita</p>
              <strong>{detail.acceptedAt ? formatDateTime(detail.acceptedAt) : "Ainda não aceita"}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Expira</p>
              <strong>{detail.expiresAt ? formatDate(detail.expiresAt) : "Não definido"}</strong>
            </div>
          </div>

          {detail.status === "Rascunho" ? (
            <form action={publishProposalDraftAction} className="public-accept-form compact proposal-send-form">
              <input name="proposalId" type="hidden" value={detail.id} />
              <button className="button-primary proposal-send-button" type="submit">
                Publicar proposta
              </button>
              <p className="builder-actions-note">
                Ao publicar, o link de revisão é gerado e fica disponível para o cliente.
              </p>
            </form>
          ) : detail.publicLink ? (
            <div className="public-text-stack">
              <p className="section-copy">
                Link público: <strong className="proposal-public-link-value">{detail.publicLink}</strong>
              </p>
              <ProposalPublicLinkActions
                className="proposal-link-actions-inline"
                publicLink={detail.publicLink}
              />
              <div className="inline-actions">
                <Link
                  className="button-secondary"
                  href={`${detail.publicLink}/checklist`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Abrir checklist
                </Link>
                {detail.status === "Aceita" ? (
                  <Link
                    className="button-secondary"
                    href={`${detail.publicLink}/pdf`}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Abrir PDF de entrega
                  </Link>
                ) : (
                  <span className="detail-label">
                    O PDF de entrega é liberado automaticamente após o aceite.
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section className="two-column-grid">
        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Escopo</p>
            <h2>Serviços incluídos</h2>
          </div>

          {detail.items.length > 0 ? (
            <div className="selected-item-list">
              {detail.items.map((item) => (
                <article key={item.id} className="selected-item-card">
                  <div className="selected-item-head">
                    <div>
                      <span className="catalog-service-kicker">{item.categoryName ?? "Item de catálogo"}</span>
                      <strong>{item.serviceName}</strong>
                      {item.publicName !== item.serviceName ? <p>Nome original: {item.publicName}</p> : null}
                    </div>
                    <StatusPill tone="accent">{item.billingType}</StatusPill>
                  </div>

                  <div className="selected-item-summary">
                    <strong>
                      {item.quantity} x <span className="currency-value">{formatCurrencyFromCents(item.unitPriceCents)}</span>
                    </strong>
                    <span>
                      {item.quantity === 1
                        ? "1 unidade"
                        : `${item.quantity} unidades`}
                    </span>
                  </div>

                  <div className="lead-detail-grid">
                    <div className="detail-pair">
                      <p className="detail-label">Quantidade</p>
                      <strong>{item.quantity}</strong>
                    </div>
                    <div className="detail-pair">
                      <p className="detail-label">Unidade</p>
                      <strong>{item.unitLabel ?? "unidade"}</strong>
                    </div>
                    <div className="detail-pair">
                      <p className="detail-label">Preço unitário</p>
                      <strong><span className="currency-value">{formatCurrencyFromCents(item.unitPriceCents)}</span></strong>
                    </div>
                    <div className="detail-pair">
                      <p className="detail-label">Subtotal</p>
                      <strong><span className="currency-value">{formatCurrencyFromCents(item.subtotalCents)}</span></strong>
                    </div>
                  </div>

                  {item.specificClause || item.submissionNotes ? (
                    <div className="catalog-service-notes">
                      {item.specificClause ? (
                        <p>
                          <strong>Cláusula específica:</strong> {item.specificClause}
                        </p>
                      ) : null}
                      {item.submissionNotes ? (
                        <p>
                          <strong>Observações para envio:</strong> {item.submissionNotes}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="builder-empty-state">
              <strong>Esta proposta não possui serviços incluídos.</strong>
              <p>Revise o rascunho para incluir serviços antes de enviar ao cliente.</p>
            </div>
          )}
        </article>

        <article className="surface-card">
          <div className="section-head">
            <p className="eyebrow">Eventos</p>
            <h2>Histórico de eventos</h2>
          </div>

          {detail.events.length > 0 ? (
            <div className="proposal-event-log">
              {detail.events.map((event) => (
                <div key={event.id} className="proposal-event-row">
                  <div className="proposal-event-marker" aria-hidden="true" />
                  <div className="proposal-event-content">
                    <div className="proposal-event-head">
                      <strong>{event.title}</strong>
                      <span>{formatDateTime(event.occurredAt)}</span>
                    </div>
                    <p className="section-copy">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="builder-empty-state">
              <strong>Nenhum evento registrado ainda.</strong>
              <p>Os eventos aparecerão aqui conforme o fluxo da proposta avançar.</p>
            </div>
          )}
        </article>
      </section>

      {detail.status === "Aceita" && detail.checklistItems.length > 0 ? (
        <InternalChecklistSection items={detail.checklistItems} />
      ) : null}

      {detail.status === "Rascunho" ? (
        <StickyBottomBar
          summary={
            <>
              <span>Investimento</span>
              <strong className="currency-value">{formatCurrencyFromCents(detail.totalCents)}</strong>
            </>
          }
        >
          <form action={publishProposalDraftAction} className="proposal-send-form-inline">
            <input name="proposalId" type="hidden" value={detail.id} />
            <button className="button-primary" type="submit">
              <IconSend size={16} /> Publicar proposta
            </button>
          </form>
        </StickyBottomBar>
      ) : null}

      {detail.status === "Enviada" && detail.publicLink ? (
        <StickyBottomBar>
          <ProposalPublicLinkActions publicLink={detail.publicLink} />
        </StickyBottomBar>
      ) : null}
    </div>
  );
}

function mapPublishErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "not_found":
      return "A proposta não foi encontrada ou não pertence à organização atual.";
    case "invalid_status":
      return "Somente propostas em rascunho podem ser enviadas.";
    case "missing_proposal_id":
      return "O identificador da proposta não foi recebido corretamente.";
    case "send_failed":
    default:
      return "Ocorreu uma falha no envio. Tente novamente em instantes.";
  }
}

function getLockedStatusMessage(status: ProposalDisplayStatus): string {
  switch (status) {
    case "Aceita":
      return "Esta proposta foi aceita e está bloqueada para preservar exatamente a versão aprovada pelo cliente.";
    case "Cancelada":
      return "Esta proposta foi cancelada e está bloqueada para manter o histórico final da negociação.";
    case "Expirada":
      return "Esta proposta expirou e está somente leitura até que um novo envio seja preparado.";
    case "Enviada":
    case "Visualizada":
    case "Rascunho":
    default:
      return "Esta proposta está bloqueada para edição livre a fim de preservar a versão final enviada ao cliente.";
  }
}

function InternalChecklistSection({
  items
}: {
  items: InternalProposalDetail["checklistItems"];
}) {
  const clientItems = items.filter((i) => i.side === "CLIENT");
  const internalItems = items.filter((i) => i.side === "INTERNAL");

  return (
    <section className="two-column-grid">
      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Checklist do cliente</p>
          <h2>Documentos e obrigações</h2>
        </div>

        {clientItems.length > 0 ? (
          <div className="internal-checklist-list">
            {clientItems.map((item) => (
              <div
                key={item.id}
                className={`internal-checklist-row${item.isCompleted ? " is-completed" : ""}`}
              >
                <div
                  className="internal-checklist-marker"
                  aria-hidden="true"
                  data-completed={item.isCompleted}
                >
                  {item.isCompleted ? "\u2713" : ""}
                </div>
                <div className="internal-checklist-content">
                  <div className="internal-checklist-head">
                    <strong>{item.title}</strong>
                    <StatusPill tone={item.isCompleted ? "success" : "neutral"}>
                      {item.isCompleted ? "Concluído" : "Pendente"}
                    </StatusPill>
                  </div>
                  {item.description ? (
                    <p className="section-copy">{item.description}</p>
                  ) : null}
                  {item.isCompleted && item.completedAt ? (
                    <p className="section-copy checklist-completed-info">
                      Concluído em {formatDateTime(item.completedAt)}
                      {item.completedBy ? ` por ${item.completedBy}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>Nenhum item do cliente.</strong>
            <p>Os serviços desta proposta não exigem documentação adicional do cliente.</p>
          </div>
        )}
      </article>

      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Checklist interno</p>
          <h2>Tarefas da equipe</h2>
        </div>

        {internalItems.length > 0 ? (
          <div className="internal-checklist-list">
            {internalItems.map((item) => (
              <div
                key={item.id}
                className={`internal-checklist-row${item.isCompleted ? " is-completed" : ""}`}
              >
                <div
                  className="internal-checklist-marker"
                  aria-hidden="true"
                  data-completed={item.isCompleted}
                >
                  {item.isCompleted ? "\u2713" : ""}
                </div>
                <div className="internal-checklist-content">
                  <div className="internal-checklist-head">
                    <strong>{item.title}</strong>
                    <StatusPill tone={item.isCompleted ? "success" : "neutral"}>
                      {item.isCompleted ? "Concluído" : "Pendente"}
                    </StatusPill>
                  </div>
                  {item.description ? (
                    <p className="section-copy">{item.description}</p>
                  ) : null}
                  {item.isCompleted && item.completedAt ? (
                    <p className="section-copy checklist-completed-info">
                      Concluído em {formatDateTime(item.completedAt)}
                      {item.completedBy ? ` por ${item.completedBy}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>Nenhum item interno.</strong>
            <p>Nenhuma tarefa interna foi gerada para esta proposta.</p>
          </div>
        )}
      </article>
    </section>
  );
}
