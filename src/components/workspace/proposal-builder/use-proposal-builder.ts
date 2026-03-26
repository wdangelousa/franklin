"use client";

import { useState } from "react";

import {
  buildProposalSnapshotPreview,
  calculateProposalSubtotalCents,
  calculateProposalTotalCents,
  createProposalSelectedItem,
  isLeadDraftComplete,
  proposalBuilderSteps,
  sortProposalSelectedItems,
  updateProposalSelectedItemDiscount,
  updateProposalSelectedItemQuantity,
  type ProposalBuilderCatalogItem,
  type ProposalBuilderLeadDraft,
  type ProposalBuilderLeadRecord,
  type ProposalBuilderSelectedItem,
  type ProposalBuilderStepId
} from "@/lib/proposal-draft";
import type { InternalRole } from "@/lib/auth/types";

export type LeadMode = "existing" | "create";

export interface UseProposalBuilderArgs {
  sessionUser: { name: string; role: InternalRole };
  initialLeadId: string | null;
  leads: ProposalBuilderLeadRecord[];
  sourceOptions: readonly string[];
  partnerOptions: readonly string[];
}

export function useProposalBuilder(args: UseProposalBuilderArgs) {
  const { sessionUser, initialLeadId, leads, sourceOptions, partnerOptions } = args;

  const [currentStep, setCurrentStep] = useState<ProposalBuilderStepId>("lead");
  const [leadMode, setLeadMode] = useState<LeadMode>(
    initialLeadId || leads.length > 0 ? "existing" : "create"
  );
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId ?? "");
  const [leadDraft, setLeadDraft] = useState<ProposalBuilderLeadDraft>(() => ({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    source: sourceOptions[0] ?? "Referral",
    notes: "",
    assignedPartner: partnerOptions.includes(sessionUser.name) ? sessionUser.name : partnerOptions[0] ?? ""
  }));
  const [selectedItems, setSelectedItems] = useState<ProposalBuilderSelectedItem[]>([]);
  const [expandedServiceCode, setExpandedServiceCode] = useState<string | null>(null);

  const activeLead = getActiveLead({ leadMode, selectedLeadId, leadDraft, leads });
  const hasLead = Boolean(activeLead);
  const grossSubtotalCents = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
  const subtotalCents = calculateProposalSubtotalCents(selectedItems);
  const totalCents = calculateProposalTotalCents(selectedItems);
  const totalDiscountCents = grossSubtotalCents - subtotalCents;
  const selectedServiceCodes = new Set(selectedItems.map((item) => item.internalCode));
  const currentStepIndex = proposalBuilderSteps.findIndex((s) => s.id === currentStep);

  const leadSelectionPayload =
    leadMode === "existing" && selectedLeadId
      ? { mode: "existing" as const, leadId: selectedLeadId }
      : { mode: "create" as const, ...leadDraft };

  const selectedServicePayload = selectedItems.map((item) => ({
    internalCode: item.internalCode,
    quantity: item.quantity,
    discountPercent: item.discountPercent
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
            ? updateProposalSelectedItemQuantity(item, Number.isFinite(parsedValue) ? parsedValue : item.quantity)
            : item
        )
      )
    );
  }

  function handleQuantityStep(itemCode: string, currentQuantity: number, delta: number) {
    handleQuantityChange(itemCode, String(Math.max(1, currentQuantity + delta)));
  }

  function handleDiscountChange(itemCode: string, nextValue: string) {
    const parsedValue = Number.parseFloat(nextValue);
    setSelectedItems((currentItems) =>
      sortProposalSelectedItems(
        currentItems.map((item) =>
          item.internalCode === itemCode
            ? updateProposalSelectedItemDiscount(item, Number.isFinite(parsedValue) ? parsedValue : 0)
            : item
        )
      )
    );
  }

  function handleToggleExpand(code: string) {
    setExpandedServiceCode((current) => (current === code ? null : code));
  }

  function updateLeadDraft(field: keyof ProposalBuilderLeadDraft, value: string) {
    setLeadDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  }

  return {
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
  };
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

export function isStepUnlocked(
  step: ProposalBuilderStepId,
  hasLead: boolean,
  selectedItemCount: number
): boolean {
  switch (step) {
    case "lead":
      return true;
    case "services":
      return hasLead;
    case "review":
      return hasLead && selectedItemCount > 0;
  }
}

export function canContinue(
  currentStep: ProposalBuilderStepId,
  hasLead: boolean,
  selectedItemCount: number
): boolean {
  switch (currentStep) {
    case "lead":
      return hasLead;
    case "services":
      return selectedItemCount > 0;
    case "review":
      return false;
  }
}

export function getStepSummary(
  stepId: ProposalBuilderStepId,
  activeLead: ProposalBuilderLeadRecord | null,
  selectedItems: ProposalBuilderSelectedItem[],
  totalCents: number,
  formatCurrency: (cents: number) => string
): string {
  switch (stepId) {
    case "lead":
      return activeLead ? `${activeLead.company} · ${activeLead.email}` : "";
    case "services":
      return `${selectedItems.length} ${selectedItems.length === 1 ? "serviço" : "serviços"} · ${formatCurrency(totalCents)}`;
    case "review":
      return "";
  }
}

export function getContinueHint(
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
        ? "A seleção de serviços está pronta. Continue para a revisão."
        : "Escolha pelo menos um serviço do catálogo interno para continuar.";
    case "review":
      return "A prévia do snapshot está pronta. Use \"Publicar agora\" para criar e publicar o link seguro da proposta.";
  }
}
