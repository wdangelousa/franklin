import type { InternalRole } from "@/lib/auth/types";

export const proposalBuilderSteps = [
  {
    id: "lead",
    label: "Lead",
    description: "Selecione um lead existente ou capture um rascunho enxuto."
  },
  {
    id: "services",
    label: "Serviços",
    description: "Monte a proposta a partir do catálogo interno."
  },
  {
    id: "review",
    label: "Revisão",
    description: "Revise o snapshot da proposta antes de enviar."
  }
] as const;

export type ProposalBuilderStepId = (typeof proposalBuilderSteps)[number]["id"];

export type ProposalBuilderBillingType =
  | "FIXED_FEE"
  | "ANNUAL"
  | "PER_CLASS"
  | "HOURLY"
  | "CUSTOM";

export interface ProposalBuilderLeadRecord {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  notes: string;
  assignedPartner: string;
  stage?: string;
}

export interface ProposalBuilderLeadDraft {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  notes: string;
  assignedPartner: string;
}

export interface ProposalBuilderCatalogItem {
  categoryCode: string;
  categoryName: string;
  categoryDescription: string | null;
  categorySortOrder: number;
  internalCode: string;
  slug: string;
  serviceName: string;
  publicName: string;
  longDescription: string | null;
  specificClause: string | null;
  submissionNotes: string | null;
  billingType: ProposalBuilderBillingType;
  unitLabel: string | null;
  unitPriceCents: number;
  allowsVariableQuantity: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProposalBuilderCatalogSection {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  services: ProposalBuilderCatalogItem[];
}

export interface ProposalBuilderSelectedItem {
  internalCode: string;
  slug: string;
  categoryCode: string;
  categoryName: string;
  categorySortOrder: number;
  sortOrder: number;
  serviceName: string;
  publicName: string;
  description: string | null;
  specificClause: string | null;
  submissionNotes: string | null;
  billingType: ProposalBuilderBillingType;
  unitLabel: string | null;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  allowsVariableQuantity: boolean;
  discountPercent: number;
}

export interface ProposalBuilderSnapshotPreview {
  title: string;
  clientCompanyName: string;
  clientContactName: string;
  clientContactEmail: string;
  clientContactPhone: string;
  leadReferenceId: string | null;
  source: string;
  assignedPartner: string;
  leadNotes: string;
  ownerRole: InternalRole;
  ownerName: string;
  itemCount: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  items: ProposalBuilderSelectedItem[];
  note: string;
}

export function isLeadDraftComplete(leadDraft: ProposalBuilderLeadDraft): boolean {
  return [
    leadDraft.fullName,
    leadDraft.company,
    leadDraft.email,
    leadDraft.phone,
    leadDraft.source,
    leadDraft.assignedPartner
  ].every((value) => value.trim().length > 0);
}

export function createProposalSelectedItem(
  catalogItem: ProposalBuilderCatalogItem
): ProposalBuilderSelectedItem {
  const quantity = normalizeProposalQuantity(1, catalogItem.allowsVariableQuantity);

  return {
    internalCode: catalogItem.internalCode,
    slug: catalogItem.slug,
    categoryCode: catalogItem.categoryCode,
    categoryName: catalogItem.categoryName,
    categorySortOrder: catalogItem.categorySortOrder,
    sortOrder: catalogItem.sortOrder,
    serviceName: catalogItem.serviceName,
    publicName: catalogItem.publicName,
    description: catalogItem.longDescription,
    specificClause: catalogItem.specificClause,
    submissionNotes: catalogItem.submissionNotes,
    billingType: catalogItem.billingType,
    unitLabel: catalogItem.unitLabel,
    quantity,
    unitPriceCents: catalogItem.unitPriceCents,
    subtotalCents: calculateItemSubtotalCents(quantity, catalogItem.unitPriceCents, 0),
    allowsVariableQuantity: catalogItem.allowsVariableQuantity,
    discountPercent: 0
  };
}

export function updateProposalSelectedItemQuantity(
  item: ProposalBuilderSelectedItem,
  nextQuantity: number
): ProposalBuilderSelectedItem {
  const quantity = normalizeProposalQuantity(nextQuantity, item.allowsVariableQuantity);

  return {
    ...item,
    quantity,
    subtotalCents: calculateItemSubtotalCents(quantity, item.unitPriceCents, item.discountPercent)
  };
}

export function updateProposalSelectedItemDiscount(
  item: ProposalBuilderSelectedItem,
  discountPercent: number
): ProposalBuilderSelectedItem {
  const normalized = normalizeDiscountPercent(discountPercent);

  return {
    ...item,
    discountPercent: normalized,
    subtotalCents: calculateItemSubtotalCents(item.quantity, item.unitPriceCents, normalized)
  };
}

export function calculateItemSubtotalCents(quantity: number, unitPriceCents: number, discountPercent = 0): number {
  const base = normalizeProposalQuantity(quantity, true) * Math.max(unitPriceCents, 0);
  const discount = normalizeDiscountPercent(discountPercent);
  return Math.round(base * (1 - discount / 100));
}

export function calculateProposalSubtotalCents(items: ProposalBuilderSelectedItem[]): number {
  return items.reduce((total, item) => total + item.subtotalCents, 0);
}

export function calculateProposalTotalCents(
  items: ProposalBuilderSelectedItem[],
  discountCents = 0
): number {
  return Math.max(calculateProposalSubtotalCents(items) - Math.max(discountCents, 0), 0);
}

export function buildProposalSnapshotPreview(args: {
  lead: ProposalBuilderLeadRecord;
  items: ProposalBuilderSelectedItem[];
  ownerName: string;
  ownerRole: InternalRole;
}): ProposalBuilderSnapshotPreview {
  const items = sortProposalSelectedItems(args.items);
  const subtotalCents = calculateProposalSubtotalCents(items);
  const discountCents = 0;

  return {
    title: buildProposalDraftTitle(args.lead.company),
    clientCompanyName: args.lead.company,
    clientContactName: args.lead.fullName,
    clientContactEmail: args.lead.email,
    clientContactPhone: args.lead.phone,
    leadReferenceId: args.lead.id.trim().length > 0 ? args.lead.id : null,
    source: args.lead.source,
    assignedPartner: args.lead.assignedPartner,
    leadNotes: args.lead.notes,
    ownerRole: args.ownerRole,
    ownerName: args.ownerName,
    itemCount: items.length,
    subtotalCents,
    discountCents,
    totalCents: calculateProposalTotalCents(items, discountCents),
    items,
    note:
      "O payload pronto para snapshot copia contato do cliente, nomenclatura do serviço, cobrança, quantidade e preço para que alterações futuras no catálogo não reescrevam a proposta enviada."
  };
}

export function sortProposalSelectedItems(
  items: ProposalBuilderSelectedItem[]
): ProposalBuilderSelectedItem[] {
  return [...items].sort(
    (left, right) =>
      left.categorySortOrder - right.categorySortOrder ||
      left.sortOrder - right.sortOrder ||
      left.publicName.localeCompare(right.publicName)
  );
}

export function getBillingTypeLabel(billingType: ProposalBuilderBillingType): string {
  switch (billingType) {
    case "ANNUAL":
      return "Anual";
    case "HOURLY":
      return "Por hora";
    case "PER_CLASS":
      return "Por classe";
    case "CUSTOM":
      return "Personalizado";
    case "FIXED_FEE":
    default:
      return "Preço fixo";
  }
}

export function getUnitLabel(unitLabel: string | null): string {
  switch (unitLabel?.trim().toLowerCase()) {
    case "engagement":
      return "projeto";
    case "year":
      return "ano";
    case "hour":
      return "hora";
    case "class":
      return "classe";
    case "unit":
    case "":
    case undefined:
    case null:
      return "unidade";
    default:
      return unitLabel ?? "unidade";
  }
}

export function buildProposalDraftTitle(companyName: string): string {
  return `Proposta para ${companyName}`;
}

function normalizeProposalQuantity(quantity: number, allowsVariableQuantity: boolean): number {
  if (!allowsVariableQuantity) {
    return 1;
  }

  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1;
  }

  return Math.floor(quantity);
}

function normalizeDiscountPercent(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.min(value, 100);
}
