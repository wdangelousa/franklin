"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { IconSend } from "@/components/ui/icons";
import { StatusPill } from "@/components/ui/status-pill";
import type { InternalRole } from "@/lib/auth/types";
import { formatLeadSourceLabel } from "@/lib/lead-labels";
import { createAndPublishProposalAction, createProposalDraftAction } from "@/lib/proposal-actions";
import {
  getBillingTypeLabel,
  isLeadDraftComplete,
  proposalBuilderSteps,
  type ProposalBuilderCatalogSection,
  type ProposalBuilderLeadRecord,
  type ProposalBuilderStepId
} from "@/lib/proposal-draft";
import { formatCurrencyFromCents } from "@/lib/utils";

import {
  canContinue,
  getContinueHint,
  getStepSummary,
  isStepUnlocked,
  useProposalBuilder
} from "@/components/workspace/proposal-builder/use-proposal-builder";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProposalBuilderProps {
  sessionUser: { name: string; role: InternalRole };
  initialLeadId: string | null;
  leads: ProposalBuilderLeadRecord[];
  catalog: ProposalBuilderCatalogSection[];
  sourceOptions: readonly string[];
  partnerOptions: readonly string[];
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProposalBuilder({
  sessionUser,
  initialLeadId,
  leads,
  catalog,
  sourceOptions,
  partnerOptions
}: ProposalBuilderProps) {
  const builder = useProposalBuilder({
    sessionUser,
    initialLeadId,
    leads,
    sourceOptions,
    partnerOptions
  });

  const {
    currentStep,
    currentStepIndex,
    leadMode,
    setLeadMode,
    selectedLeadId,
    setSelectedLeadId,
    leadDraft,
    selectedItems,
    expandedServiceCode,
    activeLead,
    hasLead,
    grossSubtotalCents,
    subtotalCents,
    totalCents,
    totalDiscountCents,
    selectedServiceCodes,
    leadSelectionPayload,
    selectedServicePayload,
    snapshotPreview,
    handleSelectStep,
    handleContinue,
    handleBack,
    handleToggleService,
    handleQuantityChange,
    handleQuantityStep,
    handleDiscountChange,
    handleToggleExpand,
    updateLeadDraft
  } = builder;

  return (
    <form action={createProposalDraftAction}>
      <input name="leadSelection" type="hidden" value={JSON.stringify(leadSelectionPayload)} />
      <input name="selectedServices" type="hidden" value={JSON.stringify(selectedServicePayload)} />

      <section className="proposal-builder-layout">
        <div className="builder-panel">
          <div className="builder-v-stepper">
            {proposalBuilderSteps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = index < currentStepIndex;
              const isUnlocked = isStepUnlocked(step.id, hasLead, selectedItems.length);

              return (
                <div
                  key={step.id}
                  className={[
                    "builder-v-step",
                    isActive ? "is-active" : "",
                    isComplete ? "is-complete" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <button
                    className="builder-v-step-header"
                    disabled={!isUnlocked && !isActive}
                    onClick={() => handleSelectStep(step.id)}
                    type="button"
                  >
                    <span className="builder-v-step-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="builder-v-step-meta">
                      <strong>{step.label}</strong>
                      {isComplete ? (
                        <span className="builder-v-step-summary">
                          {getStepSummary(step.id, activeLead, selectedItems, totalCents, formatCurrencyFromCents)}
                        </span>
                      ) : isActive ? (
                        <span>{step.description}</span>
                      ) : null}
                    </div>
                  </button>

                  <div className="builder-v-step-body">
                    <div className="builder-v-step-body-inner">
                      {/* Lead step */}
                      {step.id === "lead" && (
                        <LeadStepPanel
                          initialLeadId={initialLeadId}
                          leadMode={leadMode}
                          setLeadMode={setLeadMode}
                          selectedLeadId={selectedLeadId}
                          setSelectedLeadId={setSelectedLeadId}
                          leadDraft={leadDraft}
                          updateLeadDraft={updateLeadDraft}
                          leads={leads}
                          sourceOptions={sourceOptions}
                          partnerOptions={partnerOptions}
                        />
                      )}

                      {/* Services step */}
                      {step.id === "services" && (
                        <ServicesStepPanel
                          catalog={catalog}
                          selectedItems={selectedItems}
                          selectedServiceCodes={selectedServiceCodes}
                          expandedServiceCode={expandedServiceCode}
                          handleToggleService={handleToggleService}
                          handleQuantityChange={handleQuantityChange}
                          handleQuantityStep={handleQuantityStep}
                          handleDiscountChange={handleDiscountChange}
                          handleToggleExpand={handleToggleExpand}
                        />
                      )}

                      {/* Review step */}
                      {step.id === "review" && (
                        <ReviewStepPanel
                          activeLead={activeLead}
                          selectedItems={selectedItems}
                          totalCents={totalCents}
                          totalDiscountCents={totalDiscountCents}
                          grossSubtotalCents={grossSubtotalCents}
                          snapshotPreview={snapshotPreview}
                        />
                      )}

                      {/* Step navigation */}
                      <div className="builder-actions">
                        <div className="builder-actions-group">
                          {step.id === "lead" ? (
                            <Link className="button-secondary" href="/app/proposals">
                              Voltar para propostas
                            </Link>
                          ) : (
                            <button className="button-secondary" onClick={handleBack} type="button">
                              Voltar
                            </button>
                          )}

                          {step.id !== "review" ? (
                            <button
                              className="button-primary"
                              disabled={!canContinue(step.id as ProposalBuilderStepId, hasLead, selectedItems.length)}
                              onClick={handleContinue}
                              type="button"
                            >
                              Continuar
                            </button>
                          ) : (
                            <div className="builder-review-actions">
                              <PublishNowButton disabled={!snapshotPreview} />
                              <CreateDraftButton disabled={!snapshotPreview} />
                            </div>
                          )}
                        </div>

                        <p className="builder-actions-note">
                          {getContinueHint(step.id as ProposalBuilderStepId, hasLead, selectedItems.length)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar summary */}
        <BuilderSidebar
          activeLead={activeLead}
          selectedItems={selectedItems}
          grossSubtotalCents={grossSubtotalCents}
          subtotalCents={subtotalCents}
          totalCents={totalCents}
          totalDiscountCents={totalDiscountCents}
        />
      </section>

      {/* Mobile sticky bottom bar */}
      <div aria-label="Ações da proposta" className="builder-mobile-bar">
        <div className="builder-mobile-bar-info">
          <span>
            {activeLead?.company ?? "Lead pendente"} ·{" "}
            {selectedItems.length}{" "}
            {selectedItems.length === 1 ? "serviço" : "serviços"}
          </span>
          <strong><span className="currency-value">{formatCurrencyFromCents(totalCents)}</span></strong>
        </div>
        <PublishNowButton disabled={!snapshotPreview} />
        <button className="builder-mobile-bar-draft" disabled={!snapshotPreview} type="submit">
          Salvar rascunho
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Lead step panel
// ---------------------------------------------------------------------------

function LeadStepPanel({
  initialLeadId,
  leadMode,
  setLeadMode,
  selectedLeadId,
  setSelectedLeadId,
  leadDraft,
  updateLeadDraft,
  leads,
  sourceOptions,
  partnerOptions
}: {
  initialLeadId: string | null;
  leadMode: "existing" | "create";
  setLeadMode: (mode: "existing" | "create") => void;
  selectedLeadId: string;
  setSelectedLeadId: (id: string) => void;
  leadDraft: ReturnType<typeof useProposalBuilder>["leadDraft"];
  updateLeadDraft: ReturnType<typeof useProposalBuilder>["updateLeadDraft"];
  leads: ProposalBuilderLeadRecord[];
  sourceOptions: readonly string[];
  partnerOptions: readonly string[];
}) {
  return (
    <div className="page-stack">
      {initialLeadId ? (
        <div className="builder-inline-note">
          <strong>O contexto do lead já está anexado.</strong>
          <p>
            Este builder foi aberto a partir de um registro de lead. Você pode
            manter essa seleção ou trocar para um rascunho rápido se a
            oportunidade tiver mudado.
          </p>
        </div>
      ) : null}

      <div className="builder-mode-toggle" role="tablist" aria-label="Modo do lead">
        <button
          className={leadMode === "existing" ? "is-active" : ""}
          onClick={() => setLeadMode("existing")}
          type="button"
        >
          Selecionar lead existente
        </button>
        <button
          className={leadMode === "create" ? "is-active" : ""}
          onClick={() => setLeadMode("create")}
          type="button"
        >
          Criar lead rápido
        </button>
      </div>

      {leadMode === "existing" ? (
        leads.length > 0 ? (
          <div className="lead-picker-list">
            {leads.map((lead) => {
              const isSelected = selectedLeadId === lead.id;
              return (
                <label
                  key={lead.id}
                  className={["lead-picker-card", isSelected ? "is-selected" : ""].filter(Boolean).join(" ")}
                >
                  <input
                    checked={isSelected}
                    name="selectedLead"
                    onChange={() => setSelectedLeadId(lead.id)}
                    type="radio"
                    value={lead.id}
                  />
                  <div className="lead-picker-head">
                    <div>
                      <strong>{lead.company}</strong>
                      <p>{lead.fullName}</p>
                    </div>
                    <StatusPill tone="neutral">{lead.stage ?? "Lead"}</StatusPill>
                  </div>
                  <div className="lead-picker-meta">
                    <span>{lead.email}</span>
                    <span>{lead.phone}</span>
                    <span>{lead.source}</span>
                    <span>{lead.assignedPartner}</span>
                  </div>
                  <p>{lead.notes}</p>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>Nenhum lead está disponível ainda.</strong>
            <p>Troque para a criação rápida para não travar o fluxo da proposta.</p>
          </div>
        )
      ) : (
        <div className="page-stack">
          <div className="lead-form-grid">
            <div className="two-column-grid">
              <label className="field">
                <span>Nome completo</span>
                <input onChange={(e) => updateLeadDraft("fullName", e.target.value)} placeholder="Avery Cole" type="text" value={leadDraft.fullName} />
              </label>
              <label className="field">
                <span>Empresa</span>
                <input onChange={(e) => updateLeadDraft("company", e.target.value)} placeholder="Northstar Capital" type="text" value={leadDraft.company} />
              </label>
              <label className="field">
                <span>Email</span>
                <input onChange={(e) => updateLeadDraft("email", e.target.value)} placeholder="avery@company.com" type="email" value={leadDraft.email} />
              </label>
              <label className="field">
                <span>Telefone</span>
                <input onChange={(e) => updateLeadDraft("phone", e.target.value)} placeholder="+1 (212) 555-0181" type="tel" value={leadDraft.phone} />
              </label>
              <label className="field">
                <span>Origem</span>
                <select onChange={(e) => updateLeadDraft("source", e.target.value)} value={leadDraft.source}>
                  {sourceOptions.map((source) => (
                    <option key={source} value={source}>
                      {formatLeadSourceLabel(source as Parameters<typeof formatLeadSourceLabel>[0])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Sócio responsável</span>
                <select onChange={(e) => updateLeadDraft("assignedPartner", e.target.value)} value={leadDraft.assignedPartner}>
                  {partnerOptions.map((partner) => (
                    <option key={partner} value={partner}>{partner}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Observações</span>
              <textarea
                onChange={(e) => updateLeadDraft("notes", e.target.value)}
                placeholder="Registre apenas o contexto que o rascunho da proposta precisa."
                rows={5}
                value={leadDraft.notes}
              />
            </label>
          </div>
          <div className="builder-inline-note">
            <strong>
              {isLeadDraftComplete(leadDraft)
                ? "O lead rápido já está pronto para uso na proposta."
                : "Preencha os campos do contato para continuar."}
            </strong>
            <p>
              Esta etapa mantém a captura do lead leve para geração de proposta.
              Se você precisar de um registro separado depois, use a{" "}
              <Link className="text-link" href="/app/leads/new">rota dedicada de criação de lead</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Services step panel
// ---------------------------------------------------------------------------

function ServicesStepPanel({
  catalog,
  selectedItems,
  selectedServiceCodes,
  expandedServiceCode,
  handleToggleService,
  handleQuantityChange,
  handleQuantityStep,
  handleDiscountChange,
  handleToggleExpand
}: {
  catalog: ProposalBuilderCatalogSection[];
  selectedItems: ReturnType<typeof useProposalBuilder>["selectedItems"];
  selectedServiceCodes: Set<string>;
  expandedServiceCode: string | null;
  handleToggleService: ReturnType<typeof useProposalBuilder>["handleToggleService"];
  handleQuantityChange: ReturnType<typeof useProposalBuilder>["handleQuantityChange"];
  handleQuantityStep: ReturnType<typeof useProposalBuilder>["handleQuantityStep"];
  handleDiscountChange: ReturnType<typeof useProposalBuilder>["handleDiscountChange"];
  handleToggleExpand: ReturnType<typeof useProposalBuilder>["handleToggleExpand"];
}) {
  return (
    <div className="page-stack">
      <div className="builder-toolbar">
        <p className="section-copy">
          Selecione os serviços que devem compor esta proposta. Toque em um card para ver detalhes.
        </p>
        <StatusPill tone="accent">
          {selectedItems.length}{" "}
          {selectedItems.length === 1 ? "serviço selecionado" : "serviços selecionados"}
        </StatusPill>
      </div>

      <div className="builder-inline-note">
        <strong>A quantidade é definida na proposta, não apenas no catálogo.</strong>
        <p>
          Depois de selecionar o serviço, ajuste a quantidade conforme o escopo comercial desta
          proposta. O snapshot salvo preserva esse número no rascunho, no envio e na versão aceita.
        </p>
      </div>

      {catalog.length > 0 ? (
        catalog.map((section) => (
          <section key={section.code} className="catalog-section">
            <div className="section-head">
              <p className="eyebrow">{section.name}</p>
              <h2>{section.description ?? "Registros do catálogo interno"}</h2>
            </div>

            <div className="catalog-service-list">
              {section.services.map((service) => {
                const isSelected = selectedServiceCodes.has(service.internalCode);
                const isExpanded = expandedServiceCode === service.internalCode;
                const selectedItem = selectedItems.find((item) => item.internalCode === service.internalCode);

                return (
                  <div
                    key={service.internalCode}
                    className={[
                      "svc-card",
                      isSelected ? "is-selected" : "",
                      isExpanded ? "is-expanded" : "",
                      service.isActive ? "" : "is-disabled"
                    ].filter(Boolean).join(" ")}
                  >
                    <div className="svc-card-row" onClick={() => handleToggleExpand(service.internalCode)}>
                      <div className="svc-card-info">
                        <strong>{service.serviceName}</strong>
                        <span><span className="currency-value">{formatCurrencyFromCents(service.unitPriceCents)}</span></span>
                      </div>
                      <button
                        aria-label={`${isSelected ? "Remover" : "Adicionar"} ${service.serviceName}`}
                        aria-pressed={isSelected}
                        className={["svc-toggle", isSelected ? "is-on" : ""].filter(Boolean).join(" ")}
                        disabled={!service.isActive}
                        onClick={(e) => { e.stopPropagation(); handleToggleService(service); }}
                        type="button"
                      >
                        {isSelected ? "ON" : "OFF"}
                      </button>
                    </div>

                    <div className="svc-card-detail">
                      <div className="svc-card-detail-inner">
                        {service.publicName !== service.serviceName ? (
                          <p className="svc-public-name">Nome público: {service.publicName}</p>
                        ) : null}
                        {service.longDescription ? <p className="svc-description">{service.longDescription}</p> : null}
                        {service.specificClause ? (
                          <div className="svc-callout">
                            <strong>Cláusula específica</strong>
                            <p>{service.specificClause}</p>
                          </div>
                        ) : null}
                        {service.submissionNotes ? (
                          <div className="svc-timeline">
                            <strong>Prazo e entrega</strong>
                            <p>{service.submissionNotes}</p>
                          </div>
                        ) : null}

                        <div className="svc-card-tags">
                          <StatusPill tone="accent">{getBillingTypeLabel(service.billingType)}</StatusPill>
                          <StatusPill tone="neutral">
                            {service.allowsVariableQuantity ? "Catálogo: quantidade variável" : "Catálogo: quantidade fixa"}
                          </StatusPill>
                        </div>

                        {isSelected && selectedItem ? (
                          <div className="svc-card-fields">
                            <div className="svc-card-field">
                              <span>Quantidade</span>
                              <div className="quantity-stepper" role="group" aria-label={`Quantidade de ${service.serviceName}`}>
                                <button
                                  aria-label="Diminuir quantidade"
                                  className="button-secondary quantity-stepper-button"
                                  disabled={selectedItem.quantity <= 1}
                                  onClick={(e) => { e.stopPropagation(); handleQuantityStep(service.internalCode, selectedItem.quantity, -1); }}
                                  type="button"
                                >-</button>
                                <label className="field quantity-field">
                                  <span>Qtd.</span>
                                  <input
                                    inputMode="numeric"
                                    min={1}
                                    onChange={(e) => handleQuantityChange(service.internalCode, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    pattern="[0-9]*"
                                    type="number"
                                    value={selectedItem.quantity}
                                  />
                                </label>
                                <button
                                  aria-label="Aumentar quantidade"
                                  className="button-secondary quantity-stepper-button"
                                  onClick={(e) => { e.stopPropagation(); handleQuantityStep(service.internalCode, selectedItem.quantity, 1); }}
                                  type="button"
                                >+</button>
                              </div>
                            </div>
                            <div className="svc-card-field">
                              <span>Desconto (%)</span>
                              <input
                                className="svc-discount-input"
                                max={100}
                                min={0}
                                onChange={(e) => { e.stopPropagation(); handleDiscountChange(service.internalCode, e.target.value); }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="0"
                                step={1}
                                type="number"
                                value={selectedItem.discountPercent || ""}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <div className="builder-empty-state">
          <strong>Nenhum serviço utilizável está disponível no catálogo.</strong>
          <p>Carregue o seed do Prisma ou publique pelo menos um serviço ativo para continuar criando propostas.</p>
          <div className="inline-actions">
            <Link className="button-secondary" href="/app/catalog">Revisar catálogo</Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Review step panel
// ---------------------------------------------------------------------------

function ReviewStepPanel({
  activeLead,
  selectedItems,
  totalCents,
  totalDiscountCents,
  grossSubtotalCents,
  snapshotPreview
}: {
  activeLead: ProposalBuilderLeadRecord | null;
  selectedItems: ReturnType<typeof useProposalBuilder>["selectedItems"];
  totalCents: number;
  totalDiscountCents: number;
  grossSubtotalCents: number;
  snapshotPreview: ReturnType<typeof useProposalBuilder>["snapshotPreview"];
}) {
  return (
    <div className="page-stack">
      <div className="review-grid">
        <div className="snapshot-note">
          <strong>{snapshotPreview?.title ?? "Snapshot ainda não pronto"}</strong>
          <p>{snapshotPreview?.note ?? "Selecione um lead e pelo menos um serviço antes de preparar o snapshot."}</p>
        </div>
        {totalDiscountCents > 0 ? (
          <div className="snapshot-note">
            <strong>Descontos aplicados por item.</strong>
            <p>
              Desconto total de <span className="currency-value">{formatCurrencyFromCents(totalDiscountCents)}</span>{" "}
              sobre o subtotal bruto de <span className="currency-value">{formatCurrencyFromCents(grossSubtotalCents)}</span>.
            </p>
          </div>
        ) : null}
      </div>

      {activeLead ? (
        <div className="detail-grid">
          <div className="detail-pair"><p className="detail-label">Empresa do cliente</p><strong>{activeLead.company}</strong></div>
          <div className="detail-pair"><p className="detail-label">Contato</p><strong>{activeLead.fullName}</strong></div>
          <div className="detail-pair"><p className="detail-label">Email</p><strong>{activeLead.email}</strong></div>
          <div className="detail-pair"><p className="detail-label">Sócio responsável</p><strong>{activeLead.assignedPartner}</strong></div>
        </div>
      ) : null}

      {selectedItems.length > 0 ? (
        <div className="review-item-list">
          {selectedItems.map((item) => (
            <div key={item.internalCode} className="review-item-row">
              <strong>{item.serviceName}</strong>
              <div className="review-item-pricing">
                <span className="review-item-calc">
                  {item.quantity} × <span className="currency-value">{formatCurrencyFromCents(item.unitPriceCents)}</span>
                  {item.discountPercent > 0 ? ` − ${item.discountPercent}%` : ""}
                </span>
                <strong><span className="currency-value">{formatCurrencyFromCents(item.subtotalCents)}</span></strong>
              </div>
            </div>
          ))}
          <div className="review-item-total">
            <strong>Total</strong>
            <strong><span className="currency-value">{formatCurrencyFromCents(totalCents)}</span></strong>
          </div>
        </div>
      ) : null}

      {snapshotPreview ? (
        <div className="snapshot-note">
          <strong>Responsabilidade interna da proposta</strong>
          <div className="data-list">
            <div className="data-row">
              <div className="data-row-stack">
                <strong>{snapshotPreview.ownerName}</strong>
                <p>Responsável pela proposta</p>
              </div>
              <StatusPill tone="accent">{snapshotPreview.ownerRole}</StatusPill>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar summary
// ---------------------------------------------------------------------------

function BuilderSidebar({
  activeLead,
  selectedItems,
  grossSubtotalCents,
  subtotalCents,
  totalCents,
  totalDiscountCents
}: {
  activeLead: ProposalBuilderLeadRecord | null;
  selectedItems: ReturnType<typeof useProposalBuilder>["selectedItems"];
  grossSubtotalCents: number;
  subtotalCents: number;
  totalCents: number;
  totalDiscountCents: number;
}) {
  return (
    <aside className="builder-summary-stack">
      <article className="surface-card">
        <div className="section-head">
          <p className="eyebrow">Resumo do rascunho</p>
          <h2>Composição da proposta</h2>
        </div>

        <div className="summary-stat-grid">
          <div className="summary-stat"><span>Lead</span><strong>{activeLead ? activeLead.company : "Não selecionado"}</strong></div>
          <div className="summary-stat"><span>Itens</span><strong>{selectedItems.length}</strong></div>
          <div className="summary-stat"><span>Subtotal</span><strong><span className="currency-value">{formatCurrencyFromCents(subtotalCents)}</span></strong></div>
          <div className="summary-stat"><span>Total</span><strong><span className="currency-value">{formatCurrencyFromCents(totalCents)}</span></strong></div>
        </div>

        {activeLead ? (
          <div className="proposal-contact">
            <span>{activeLead.fullName}</span>
            <strong>{activeLead.company}</strong>
            <span>{activeLead.email}</span>
            <span>{activeLead.phone}</span>
          </div>
        ) : (
          <div className="builder-empty-state">
            <strong>A seleção do lead vem primeiro.</strong>
            <p>O snapshot da proposta não pode ser preparado até que um lead seja anexado.</p>
          </div>
        )}

        <div className="page-stack">
          <div className="totals-panel">
            <div className="total-row"><span>Subtotal bruto</span><strong><span className="currency-value">{formatCurrencyFromCents(grossSubtotalCents)}</span></strong></div>
            <div className="total-row"><span>Desconto</span><strong><span className="currency-value">−{formatCurrencyFromCents(totalDiscountCents)}</span></strong></div>
            <div className="total-row is-grand"><span>Total</span><strong><span className="currency-value">{formatCurrencyFromCents(totalCents)}</span></strong></div>
          </div>
        </div>
      </article>

      <article className="surface-card notice-panel">
        <div className="section-head">
          <p className="eyebrow">Prontidão do snapshot</p>
          <h2>Preparado para criação durável de rascunho</h2>
        </div>
        <ul className="feature-list">
          <li>Os serviços selecionados são reconstruídos no servidor a partir do catálogo interno antes do salvamento.</li>
          <li>Os itens da proposta persistem como snapshots, então mudanças futuras no catálogo não reescrevem a proposta.</li>
          <li>O rascunho é criado primeiro e o token público seguro só é emitido quando a proposta é publicada.</li>
          <li>Depois do aceite, a rota segura de PDF desta cópia aceita fica disponível sem depender do catálogo ao vivo.</li>
        </ul>
      </article>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Action buttons
// ---------------------------------------------------------------------------

function CreateDraftButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="button-secondary" disabled={disabled || pending} type="submit">
      {pending ? "Salvando..." : "Salvar rascunho"}
    </button>
  );
}

function PublishNowButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="button-primary builder-send-now"
      disabled={disabled || pending}
      formAction={createAndPublishProposalAction}
      type="submit"
    >
      {pending ? "Publicando..." : <><IconSend size={16} /> Publicar agora</>}
    </button>
  );
}
