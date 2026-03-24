import type { InternalRole } from "@/lib/auth/types";

type RoleTone = "accent" | "success";

interface RoleDefinition {
  label: string;
  summary: string;
  shellEyebrow: string;
  shellSummary: string;
  tone: RoleTone;
}

const roleDefinitions: Record<InternalRole, RoleDefinition> = {
  ADMIN: {
    label: "Administrador",
    summary: "Supervisão da plataforma, governança de configuração e visibilidade executiva.",
    shellEyebrow: "Acesso administrativo",
    shellSummary:
      "Sessões de administrador são voltadas para supervisão da plataforma, governança de serviços e coordenação interna.",
    tone: "accent"
  },
  PARTNER: {
    label: "Sócio",
    summary: "Liderança de clientes, propriedade de propostas e decisões do pipeline.",
    shellEyebrow: "Acesso de sócio",
    shellSummary:
      "Sessões de sócio focam avanço de leads, qualidade de propostas e controle da entrega ao cliente.",
    tone: "success"
  }
};

export function getRoleDefinition(role: InternalRole): RoleDefinition {
  return roleDefinitions[role];
}
