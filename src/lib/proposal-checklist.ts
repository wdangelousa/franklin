import type { PublicProposalSnapshot } from "@/lib/public-proposals";

export interface ProposalChecklistItemSource {
  kind: "service" | "proposal";
  label: string;
  internalCode?: string;
}

export interface ProposalChecklistItem {
  id: string;
  title: string;
  sources: ProposalChecklistItemSource[];
  futureUploadSlotKey: string;
  uploadState: "not_started";
}

export interface ProposalChecklist {
  items: ProposalChecklistItem[];
  totalItems: number;
}

export function buildProposalChecklist(
  snapshot: Pick<PublicProposalSnapshot, "selectedServices" | "requiredDocuments">
): ProposalChecklist {
  const items = new Map<string, ProposalChecklistItem>();

  for (const service of snapshot.selectedServices) {
    for (const requirement of service.requiredDocuments) {
      upsertChecklistItem(items, requirement, {
        kind: "service",
        label: service.serviceName,
        internalCode: service.internalCode
      });
    }
  }

  for (const requirement of snapshot.requiredDocuments) {
    upsertChecklistItem(items, requirement, {
      kind: "proposal",
      label: "Requisito geral da proposta"
    });
  }

  return {
    items: Array.from(items.values()),
    totalItems: items.size
  };
}

function upsertChecklistItem(
  items: Map<string, ProposalChecklistItem>,
  title: string,
  source: ProposalChecklistItemSource
) {
  const normalizedTitle = normalizeRequirementTitle(title);

  if (!normalizedTitle) {
    return;
  }

  const existingItem = items.get(normalizedTitle);

  if (!existingItem) {
    items.set(normalizedTitle, {
      id: `document-${normalizedTitle.replace(/\s+/g, "-")}`,
      title: title.trim(),
      sources: [source],
      futureUploadSlotKey: `upload-${normalizedTitle.replace(/\s+/g, "-")}`,
      uploadState: "not_started"
    });
    return;
  }

  if (
    existingItem.sources.some(
      (existingSource) =>
        existingSource.kind === source.kind &&
        existingSource.label === source.label &&
        existingSource.internalCode === source.internalCode
    )
  ) {
    return;
  }

  existingItem.sources.push(source);
}

function normalizeRequirementTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
