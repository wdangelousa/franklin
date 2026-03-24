export const leadSourceValues = [
  "Referral",
  "Inbound",
  "Partner",
  "Event",
  "Outbound",
  "Other"
] as const;

export type LeadSource = (typeof leadSourceValues)[number];

export const leadStageValues = [
  "New",
  "Qualified",
  "Discovery",
  "Proposal",
  "Won",
  "Lost",
  "Archived"
] as const;

export type LeadStage = (typeof leadStageValues)[number];

export function formatLeadStageLabel(stage: LeadStage): string {
  switch (stage) {
    case "New":
      return "Novo";
    case "Qualified":
      return "Qualificado";
    case "Discovery":
      return "Descoberta";
    case "Proposal":
      return "Proposta";
    case "Won":
      return "Ganho";
    case "Lost":
      return "Perdido";
    case "Archived":
      return "Arquivado";
  }
}

export function formatLeadSourceLabel(source: LeadSource): string {
  switch (source) {
    case "Referral":
      return "Indicação";
    case "Inbound":
      return "Inbound";
    case "Partner":
      return "Sócio";
    case "Event":
      return "Evento";
    case "Outbound":
      return "Outbound";
    case "Other":
      return "Outro";
  }
}
