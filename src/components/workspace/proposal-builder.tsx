"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { StatusPill } from "@/components/ui/status-pill";
import type { InternalRole } from "@/lib/auth/types";
import { formatLeadSourceLabel } from "@/lib/lead-labels";
import { createAndSendProposalAction, createProposalDraftAction } from "@/lib/proposal-actions";
import {
  buildProposalSnapshotPreview,
  calculateProposalSubtotalCents,
  calculateProposalTotalCents,
  createProposalSelectedItem,
  getBillingTypeLabel,
  getUnitLabel,
  isLeadDraftComplete,
  proposalBuilderSteps,
  sortProposalSelectedItems,
  updateProposalSelectedItemQuantity,
  type ProposalBuilderCatalogItem,
  type ProposalBuilderCatalogSection,
  type ProposalBuilderLeadDraft,
  type ProposalBuilderLeadRecord,
  type ProposalBuilderSelectedItem,
  type ProposalBuilderStepId
} from "@/lib/proposal-draft";
import { formatCurrencyFromCents } from "@/lib/utils";

interface ProposalBuilderProps {
  sessionUser: {
    name: string;
    role: InternalRole;
  };
  initialLeadId: string | null;
  leads: ProposalBuilderLeadRecord[];
  catalog: ProposalBuilderCatalogSection[];
  sourceOptions: readonly string[];
  partnerOptions: readonly string[];
}

type LeadMode = "existing" | "create";

export function ProposalBuilder({
  sessionUser,
  initialLeadId,
  leads,
  catalog,
  sourceOptions,
  partnerOptions
}: ProposalBuilderProps) {
  const [currentStep, setCurrentStep] = useState<ProposalBuilderStepId>("lead");
  const [leadMode, setLeadMode] = useState<LeadMode>(
    initialLeadId || leads.length > 0 ? "existing" : "create"
  );
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId ?? "");
  const [leadDraft, setLeadDraft] = useState<ProposalBuilderLeadDraft>(() =>
    createInitialLeadDraft(sourceOptions, partnerOptions, sessionUser.name)
  );
  const [selectedItems, setSelectedItems] = useState<ProposalBuilderSelectedItem[]>([]);
  const [expandedServiceCode, setExpandedServiceCode] = useState<string | null>(null);

  const activeLead = getActiveLead({ leadMode, selectedLeadId, leadDraft, leads });
  const hasLead = Boolean(activeLead);
  const subtotalCents = calculateProposalSubtotalCents(selectedItems);
  const totalCents = calculateProposalTotalCents(selectedItems);
  const selectedServiceCodes = new Set(selectedItems.map((item) => item.internalCode));
  const currentStepIndex = getStepIndex(currentStep);
  const leadSelectionPayload =
    leadMode === "existing" && selectedLeadId
      ? {
          mode: "existing" as const,
          leadId: selectedLeadId
        }
      : {
          mode: "create" as const,
          ...leadDraft
        };
  const selectedServicePayload = selectedItems.map((item) => ({
    internalCode: item.internalCode,
    quantity: item.quantity
  }));
  const snapshotPreview =
    activeLead && selectedItems.length > 0
      ? buildProposalSnapshotPreview({
          lead: activeLead,
          items: selectedItems,
          ownerName: sessionUser.name,
          ownerRole: sessionUser.role
        })
      : null;

  function handleSelectStep(nextStep: ProposalBuilderStepId) {
    if (isStepUnlocked(nextStep, hasLead, selectedItems.length)) {
      setCurrentStep(nextStep);
    }
  }

  function handleContinue() {
    const nextStep = proposalBuilderSteps[currentStepIndex + 1];

    if (nextStep && isStepUnlocked(nextStep.id, hasLead, selectedItems.length)) {
      setCurrentStep(nextStep.id);
    }
  }

  function handleBack() {
    const previousStep = proposalBuilderSteps[currentStepIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
  }

  function handleToggleService(service: ProposalBuilderCatalogItem) {
    setSelectedItems((currentItems) => {
      const itemExists = currentItems.some((item) => item.internalCode === service.internalCode);

      if (itemExists) {
        return currentItems.filter((item) => item.internalCode !== service.internalCode);
      }

      return sortProposalSelectedItems([...currentItems, createProposalSelectedItem(service)]);
    });
  }

  function handleQuantityChange(itemCode: string, nextValue: string) {
    const parsedValue = Number.parseInt(nextValue, 10);

    setSelectedItems((currentItems) =>
      sortProposalSelectedItems(
        currentItems.map((item) =>
          item.internalCode === itemCode
            ? updateProposalSelectedItemQuantity(
                item,
                Number.isFinite(parsedValue) ? parsedValue : item.quantity
              )
            : item
        )
      )
    );
  }

  function handleQuantityStep(itemCode: string, currentQuantity: number, delta: number) {
    const nextQuantity = Math.max(1, currentQuantity + delta);
    handleQuantityChange(itemCode, String(nextQuantity));
  }

  function handleToggleExpand(code: string) {
    setExpandedServiceCode((current) => (current === code ? null : code));
  }

  function updateLeadDraft(field: keyof ProposalBuilderLeadDraft, value: string) {
    setLeadDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
  }

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
                          {getStepSummary(step.id, activeLead, selectedItems, totalCents)}
                        </span>
                      ) : isActive ? (
                        <span>{step.description}</span>
                      ) : null}
                    </div>
                  </button>

                  <div className="builder-v-step-body">
                    <div className="builder-v-step-body-inner">
                      {step.id === "lead" && (
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

                          <div
                            className="builder-mode-toggle"
                            role="tablist"
                            aria-label="Modo do lead"
                          >
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
                                      className={[
                                        "lead-picker-card",
                                        isSelected ? "is-selected" : ""
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
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

                                        <StatusPill tone="neutral">
                                          {lead.stage ?? "Lead"}
                                        </StatusPill>
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
                                <p>
                                  Troque para a criação rápida para não travar o fluxo da proposta.
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="page-stack">
                              <div className="lead-form-grid">
                                <div className="two-column-grid">
                                  <label className="field">
                                    <span>Nome completo</span>
                                    <input
                                      onChange={(event) =>
                                        updateLeadDraft("fullName", event.target.value)
                                      }
                                      placeholder="Avery Cole"
                                      type="text"
                                      value={leadDraft.fullName}
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Empresa</span>
                                    <input
                                      onChange={(event) =>
                                        updateLeadDraft("company", event.target.value)
                                      }
                                      placeholder="Northstar Capital"
                                      type="text"
                                      value={leadDraft.company}
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Email</span>
                                    <input
                                      onChange={(event) =>
                                        updateLeadDraft("email", event.target.value)
                                      }
                                      placeholder="avery@company.com"
                                      type="email"
                                      value={leadDraft.email}
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Telefone</span>
                                    <input
                                      onChange={(event) =>
                                        updateLeadDraft("phone", event.target.value)
                                      }
                                      placeholder="+1 (212) 555-0181"
                                      type="tel"
                                      value={leadDraft.phone}
                                    />
                                  </label>

                                  <label className="field">
                                    <span>Origem</span>
                                    <select
                                      onChange={(event) =>
                                        updateLeadDraft("source", event.target.value)
                                      }
                                      value={leadDraft.source}
                                    >
                                      {sourceOptions.map((source) => (
                                        <option key={source} value={source}>
                                          {formatLeadSourceLabel(
                                            source as Parameters<typeof formatLeadSourceLabel>[0]
                                          )}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label className="field">
                                    <span>Sócio responsável</span>
                                    <select
                                      onChange={(event) =>
                                        updateLeadDraft("assignedPartner", event.target.value)
                                      }
                                      value={leadDraft.assignedPartner}
                                    >
                                      {partnerOptions.map((partner) => (
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
                                    onChange={(event) =>
                                      updateLeadDraft("notes", event.target.value)
                                    }
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
                                  <Link className="text-link" href="/app/leads/new">
                                    rota dedicada de criação de lead
                                  </Link>
                                  .
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {step.id === "services" && (
                        <div className="page-stack">
                          <div className="builder-toolbar">
                            <p className="section-copy">
                              Selecione os serviços que devem compor esta proposta. Toque em um card
                              para ver detalhes.
                            </p>

                            <StatusPill tone="accent">
                              {selectedItems.length}{" "}
                              {selectedItems.length === 1
                                ? "serviço selecionado"
                                : "serviços selecionados"}
                            </StatusPill>
                          </div>

                          {catalog.map((section) => (
                            <section key={section.code} className="catalog-section">
                              <div className="section-head">
                                <p className="eyebrow">{section.name}</p>
                                <h2>
                                  {section.description ?? "Registros do catálogo interno"}
                                </h2>
                              </div>

                              <div className="catalog-service-list">
                                {section.services.map((service) => {
                                  const isSelected = selectedServiceCodes.has(
                                    service.internalCode
                                  );
                                  const isExpanded =
                                    expandedServiceCode === service.internalCode;
                                  const selectedItem = selectedItems.find(
                                    (item) => item.internalCode === service.internalCode
                                  );

                                  return (
                                    <div
                                      key={service.internalCode}
                                      className={[
                                        "svc-card",
                                        isSelected ? "is-selected" : "",
                                        isExpanded ? "is-expanded" : "",
                                        service.isActive ? "" : "is-disabled"
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    >
                                      <div
                                        className="svc-card-row"
                                        onClick={() =>
                                          handleToggleExpand(service.internalCode)
                                        }
                                      >
                                        <div className="svc-card-info">
                                          <strong>{service.serviceName}</strong>
                                          <span>
                                            {formatCurrencyFromCents(service.unitPriceCents)}
                                          </span>
                                        </div>
                                        <button
                                          className={[
                                            "svc-toggle",
                                            isSelected ? "is-on" : ""
                                          ]
                                            .filter(Boolean)
                                            .join(" ")}
                                          disabled={!service.isActive}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleService(service);
                                          }}
                                          type="button"
                                        >
                                          {isSelected ? "ON" : "OFF"}
                                        </button>
                                      </div>

                                      <div className="svc-card-detail">
                                        <div className="svc-card-detail-inner">
                                          {service.publicName !== service.serviceName ? (
                                            <p className="svc-public-name">
                                              Nome público: {service.publicName}
                                            </p>
                                          ) : null}

                                          {service.longDescription ? (
                                            <p className="svc-description">
                                              {service.longDescription}
                                            </p>
                                          ) : null}

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
                                            <StatusPill tone="accent">
                                              {getBillingTypeLabel(service.billingType)}
                                            </StatusPill>
                                            <StatusPill tone="neutral">
                                              {service.allowsVariableQuantity
                                                ? "Quantidade variável"
                                                : "Quantidade fixa"}
                                            </StatusPill>
                                          </div>

                                          {isSelected && selectedItem ? (
                                            <div className="svc-card-fields">
                                              <div className="svc-card-field">
                                                <span>Quantidade</span>
                                                {selectedItem.allowsVariableQuantity ? (
                                                  <div
                                                    className="quantity-stepper"
                                                    role="group"
                                                    aria-label={`Quantidade de ${service.serviceName}`}
                                                  >
                                                    <button
                                                      className="button-secondary quantity-stepper-button"
                                                      disabled={selectedItem.quantity <= 1}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityStep(
                                                          service.internalCode,
                                                          selectedItem.quantity,
                                                          -1
                                                        );
                                                      }}
                                                      type="button"
                                                    >
                                                      -
                                                    </button>
                                                    <label className="field quantity-field">
                                                      <span>Qtd.</span>
                                                      <input
                                                        inputMode="numeric"
                                                        min={1}
                                                        onChange={(event) =>
                                                          handleQuantityChange(
                                                            service.internalCode,
                                                            event.target.value
                                                          )
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                        pattern="[0-9]*"
                                                        type="number"
                                                        value={selectedItem.quantity}
                                                      />
                                                    </label>
                                                    <button
                                                      className="button-secondary quantity-stepper-button"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuantityStep(
                                                          service.internalCode,
                                                          selectedItem.quantity,
                                                          1
                                                        );
                                                      }}
                                                      type="button"
                                                    >
                                                      +
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <strong>1 (fixa)</strong>
                                                )}
                                              </div>
                                              <div className="svc-card-field">
                                                <span>Desconto (%)</span>
                                                <input
                                                  className="svc-discount-input"
                                                  disabled
                                                  onClick={(e) => e.stopPropagation()}
                                                  placeholder="0"
                                                  title="Descontos desabilitados no MVP"
                                                  type="number"
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
                          ))}
                        </div>
                      )}

                      {step.id === "quantities" && (
                        <div className="page-stack">
                          <p className="section-copy">
                            As quantidades só podem ser editadas quando o catálogo permite variação
                            de forma explícita. Toda a matemática permanece em centavos inteiros para
                            manter o snapshot final estável.
                          </p>

                          <SelectedItemList
                            editable
                            items={selectedItems}
                            onQuantityChange={handleQuantityChange}
                            onQuantityStep={handleQuantityStep}
                          />
                        </div>
                      )}

                      {step.id === "review" && (
                        <div className="page-stack">
                          <div className="review-grid">
                            <div className="snapshot-note">
                              <strong>
                                {snapshotPreview?.title ?? "Snapshot ainda não pronto"}
                              </strong>
                              <p>
                                {snapshotPreview?.note ??
                                  "Selecione um lead e pelo menos um serviço antes de preparar o snapshot."}
                              </p>
                            </div>

                            <div className="snapshot-note">
                              <strong>Descontos continuam desabilitados no MVP.</strong>
                              <p>
                                O Franklin hoje suporta apenas acesso de administrador e sócio. Até
                                que as permissões de desconto sejam modeladas explicitamente, o total
                                da proposta permanece sem descontos.
                              </p>
                            </div>
                          </div>

                          {activeLead ? (
                            <div className="detail-grid">
                              <div className="detail-pair">
                                <p className="detail-label">Empresa do cliente</p>
                                <strong>{activeLead.company}</strong>
                              </div>
                              <div className="detail-pair">
                                <p className="detail-label">Contato</p>
                                <strong>{activeLead.fullName}</strong>
                              </div>
                              <div className="detail-pair">
                                <p className="detail-label">Email</p>
                                <strong>{activeLead.email}</strong>
                              </div>
                              <div className="detail-pair">
                                <p className="detail-label">Sócio responsável</p>
                                <strong>{activeLead.assignedPartner}</strong>
                              </div>
                            </div>
                          ) : null}

                          <SelectedItemList items={selectedItems} />

                          {snapshotPreview ? (
                            <div className="review-grid">
                              <div className="snapshot-note">
                                <strong>
                                  Campos do snapshot que serão salvos na criação do rascunho
                                </strong>
                                <ul className="feature-list">
                                  <li>
                                    Empresa, contato, email, telefone, origem e observações do
                                    cliente
                                  </li>
                                  <li>
                                    Nome do serviço, nome original, tipo de cobrança, unidade,
                                    quantidade e preço
                                  </li>
                                  <li>
                                    Subtotal da proposta, desconto zero e total em centavos inteiros
                                  </li>
                                </ul>
                              </div>

                              <div className="snapshot-note">
                                <strong>Responsabilidade interna da proposta</strong>
                                <div className="data-list">
                                  <div className="data-row">
                                    <div className="data-row-stack">
                                      <strong>{snapshotPreview.ownerName}</strong>
                                      <p>Responsável pela proposta</p>
                                    </div>
                                    <StatusPill tone="accent">
                                      {snapshotPreview.ownerRole}
                                    </StatusPill>
                                  </div>
                                  <div className="data-row">
                                    <div className="data-row-stack">
                                      <strong>{snapshotPreview.itemCount}</strong>
                                      <p>Itens do snapshot</p>
                                    </div>
                                    <strong>
                                      {formatCurrencyFromCents(snapshotPreview.totalCents)}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {/* Step navigation */}
                      <div className="builder-actions">
                        <div className="builder-actions-group">
                          {step.id === "lead" ? (
                            <Link className="button-secondary" href="/app/proposals">
                              Voltar para propostas
                            </Link>
                          ) : (
                            <button
                              className="button-secondary"
                              onClick={handleBack}
                              type="button"
                            >
                              Voltar
                            </button>
                          )}

                          {step.id !== "review" ? (
                            <button
                              className="button-primary"
                              disabled={
                                !canContinue(
                                  step.id as ProposalBuilderStepId,
                                  hasLead,
                                  selectedItems.length
                                )
                              }
                              onClick={handleContinue}
                              type="button"
                            >
                              Continuar
                            </button>
                          ) : (
                            <div className="builder-review-actions">
                              <SendNowButton disabled={!snapshotPreview} />
                              <CreateDraftButton disabled={!snapshotPreview} />
                            </div>
                          )}
                        </div>

                        <p className="builder-actions-note">
                          {getContinueHint(
                            step.id as ProposalBuilderStepId,
                            hasLead,
                            selectedItems.length
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="builder-summary-stack">
          <article className="surface-card">
            <div className="section-head">
              <p className="eyebrow">Resumo do rascunho</p>
              <h2>Composição da proposta</h2>
            </div>

            <div className="summary-stat-grid">
              <div className="summary-stat">
                <span>Lead</span>
                <strong>{activeLead ? activeLead.company : "Não selecionado"}</strong>
              </div>
              <div className="summary-stat">
                <span>Itens</span>
                <strong>{selectedItems.length}</strong>
              </div>
              <div className="summary-stat">
                <span>Subtotal</span>
                <strong>{formatCurrencyFromCents(subtotalCents)}</strong>
              </div>
              <div className="summary-stat">
                <span>Total</span>
                <strong>{formatCurrencyFromCents(totalCents)}</strong>
              </div>
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
                <p>
                  O snapshot da proposta não pode ser preparado até que um lead seja anexado.
                </p>
              </div>
            )}

            <div className="page-stack">
              <div className="totals-panel">
                <div className="total-row">
                  <span>Subtotal</span>
                  <strong>{formatCurrencyFromCents(subtotalCents)}</strong>
                </div>
                <div className="total-row">
                  <span>Desconto</span>
                  <strong>{formatCurrencyFromCents(0)}</strong>
                </div>
                <div className="total-row is-grand">
                  <span>Total</span>
                  <strong>{formatCurrencyFromCents(totalCents)}</strong>
                </div>
              </div>

              <div className="discount-disabled">
                <strong>Os controles de desconto estão desabilitados.</strong>
                <p>
                  Eles permanecem bloqueados até que permissões comerciais por perfil sejam
                  modeladas.
                </p>
              </div>
            </div>
          </article>

          <article className="surface-card notice-panel">
            <div className="section-head">
              <p className="eyebrow">Prontidão do snapshot</p>
              <h2>Preparado para criação durável de rascunho</h2>
            </div>

            <ul className="feature-list">
              <li>
                Os serviços selecionados são reconstruídos no servidor a partir do catálogo
                interno antes do salvamento.
              </li>
              <li>
                Os itens da proposta persistem como snapshots, então mudanças futuras no catálogo
                não reescrevem a proposta.
              </li>
              <li>
                O rascunho é criado primeiro e o token público seguro só é emitido quando a
                proposta é enviada.
              </li>
              <li>
                A geração de PDF continua adiada, mas o aceite já tem um gatilho durável
                preparado.
              </li>
            </ul>
          </article>
        </aside>
      </section>

      {/* Mobile sticky bottom bar */}
      <div className="builder-mobile-bar">
        <div className="builder-mobile-bar-info">
          <span>
            {activeLead?.company ?? "Lead pendente"} ·{" "}
            {selectedItems.length}{" "}
            {selectedItems.length === 1 ? "serviço" : "serviços"}
          </span>
          <strong>{formatCurrencyFromCents(totalCents)}</strong>
        </div>
        <SendNowButton disabled={!snapshotPreview} />
        <button
          className="builder-mobile-bar-draft"
          disabled={!snapshotPreview}
          type="submit"
        >
          Salvar rascunho
        </button>
      </div>
    </form>
  );
}

function SelectedItemList({
  items,
  editable = false,
  onQuantityChange,
  onQuantityStep
}: {
  items: ProposalBuilderSelectedItem[];
  editable?: boolean;
  onQuantityChange?: (itemCode: string, nextValue: string) => void;
  onQuantityStep?: (itemCode: string, currentQuantity: number, delta: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="builder-empty-state">
        <strong>Nenhum serviço selecionado ainda.</strong>
        <p>Volte para a etapa do catálogo e escolha os serviços que devem aparecer nesta proposta.</p>
      </div>
    );
  }

  return (
    <div className="selected-item-list">
      {items.map((item) => (
        <article key={item.internalCode} className="selected-item-card">
          <div className="selected-item-head">
            <div>
              <span className="catalog-service-kicker">
                {item.internalCode} · {item.categoryName}
              </span>
              <strong>{item.serviceName}</strong>
              {item.publicName !== item.serviceName ? <p>Nome original: {item.publicName}</p> : null}
            </div>

            <StatusPill tone={item.allowsVariableQuantity ? "accent" : "neutral"}>
              {item.allowsVariableQuantity ? "Quantidade variável" : "Quantidade fixa"}
            </StatusPill>
          </div>

          <div className="selected-item-grid">
            <div className="detail-pair">
              <p className="detail-label">Nome do serviço</p>
              <strong>{item.serviceName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Nome original</p>
              <strong>{item.publicName}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Quantidade</p>
              {editable && onQuantityChange && item.allowsVariableQuantity ? (
                <div className="quantity-stepper" role="group" aria-label={`Quantidade de ${item.serviceName}`}>
                  <button
                    className="button-secondary quantity-stepper-button"
                    disabled={item.quantity <= 1}
                    onClick={() => onQuantityStep?.(item.internalCode, item.quantity, -1)}
                    type="button"
                  >
                    -
                  </button>

                  <label className="field quantity-field">
                    <span>Qtd.</span>
                    <input
                      inputMode="numeric"
                      min={1}
                      onChange={(event) => onQuantityChange(item.internalCode, event.target.value)}
                      pattern="[0-9]*"
                      type="number"
                      value={item.quantity}
                    />
                  </label>

                  <button
                    className="button-secondary quantity-stepper-button"
                    onClick={() => onQuantityStep?.(item.internalCode, item.quantity, 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              ) : (
                <strong>{item.quantity}</strong>
              )}
            </div>
            <div className="detail-pair">
              <p className="detail-label">Preço unitário</p>
              <strong>{formatCurrencyFromCents(item.unitPriceCents)}</strong>
            </div>
            <div className="detail-pair">
              <p className="detail-label">Subtotal</p>
              <strong>{formatCurrencyFromCents(item.subtotalCents)}</strong>
            </div>
          </div>

          <div className="catalog-service-tags">
            <StatusPill tone="accent">{getBillingTypeLabel(item.billingType)}</StatusPill>
            <StatusPill tone="neutral">{getUnitLabel(item.unitLabel)}</StatusPill>
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
  );
}

function getActiveLead(args: {
  leadMode: LeadMode;
  selectedLeadId: string;
  leadDraft: ProposalBuilderLeadDraft;
  leads: ProposalBuilderLeadRecord[];
}): ProposalBuilderLeadRecord | null {
  if (args.leadMode === "existing") {
    return args.leads.find((lead) => lead.id === args.selectedLeadId) ?? null;
  }

  if (!isLeadDraftComplete(args.leadDraft)) {
    return null;
  }

  return {
    id: "",
    fullName: args.leadDraft.fullName,
    company: args.leadDraft.company,
    email: args.leadDraft.email,
    phone: args.leadDraft.phone,
    source: args.leadDraft.source,
    notes: args.leadDraft.notes,
    assignedPartner: args.leadDraft.assignedPartner
  };
}

function createInitialLeadDraft(
  sourceOptions: readonly string[],
  partnerOptions: readonly string[],
  sessionUserName: string
): ProposalBuilderLeadDraft {
  return {
    fullName: "",
    company: "",
    email: "",
    phone: "",
    source: sourceOptions[0] ?? "Referral",
    notes: "",
    assignedPartner: partnerOptions.includes(sessionUserName) ? sessionUserName : partnerOptions[0] ?? ""
  };
}

function canContinue(
  currentStep: ProposalBuilderStepId,
  hasLead: boolean,
  selectedItemCount: number
): boolean {
  switch (currentStep) {
    case "lead":
      return hasLead;
    case "services":
    case "quantities":
      return selectedItemCount > 0;
    case "review":
      return false;
  }
}

function isStepUnlocked(
  step: ProposalBuilderStepId,
  hasLead: boolean,
  selectedItemCount: number
): boolean {
  switch (step) {
    case "lead":
      return true;
    case "services":
      return hasLead;
    case "quantities":
    case "review":
      return hasLead && selectedItemCount > 0;
  }
}

function getStepIndex(step: ProposalBuilderStepId): number {
  return proposalBuilderSteps.findIndex((item) => item.id === step);
}

function getStepSummary(
  stepId: ProposalBuilderStepId,
  activeLead: ProposalBuilderLeadRecord | null,
  selectedItems: ProposalBuilderSelectedItem[],
  totalCents: number
): string {
  switch (stepId) {
    case "lead":
      return activeLead ? `${activeLead.company} · ${activeLead.email}` : "";
    case "services":
      return `${selectedItems.length} ${selectedItems.length === 1 ? "serviço" : "serviços"}`;
    case "quantities":
      return `${selectedItems.length} ${selectedItems.length === 1 ? "item" : "itens"} · ${formatCurrencyFromCents(totalCents)}`;
    case "review":
      return "";
  }
}

function CreateDraftButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button-secondary" disabled={disabled || pending} type="submit">
      {pending ? "Salvando..." : "Salvar rascunho"}
    </button>
  );
}

function SendNowButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="button-primary builder-send-now"
      disabled={disabled || pending}
      formAction={createAndSendProposalAction}
      type="submit"
    >
      {pending ? "Enviando..." : "Enviar agora"}
    </button>
  );
}

function getContinueHint(
  currentStep: ProposalBuilderStepId,
  hasLead: boolean,
  selectedItemCount: number
): string {
  switch (currentStep) {
    case "lead":
      return hasLead
        ? "O contexto do lead está pronto. Continue para o catálogo de serviços."
        : "Selecione um lead existente ou conclua o lead rápido para continuar.";
    case "services":
      return selectedItemCount > 0
        ? "A seleção de serviços está pronta. Continue para as quantidades."
        : "Escolha pelo menos um serviço do catálogo interno para continuar.";
    case "quantities":
      return selectedItemCount > 0
        ? "As quantidades estão prontas. Continue para a revisão."
        : "Volte para serviços e escolha pelo menos um item.";
    case "review":
      return "A prévia do snapshot está pronta. Use \"Enviar agora\" para criar e enviar a proposta.";
  }
}
