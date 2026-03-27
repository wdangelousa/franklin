import type { ComponentType, SVGProps } from "react";

import {
  IconDashboard,
  IconLeads,
  IconProposals,
  IconCatalog,
  IconSettings,
} from "@/components/ui/icons";

export interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
}

export const workspaceNavigation: NavigationItem[] = [
  {
    href: "/app/dashboard",
    label: "Painel",
    description: "Atividade atual de propostas e atalhos para o fluxo interno do dia.",
    icon: IconDashboard,
  },
  {
    href: "/app/leads",
    label: "Leads",
    description: "Oportunidades qualificadas e acompanhamento de relacionamento.",
    icon: IconLeads,
  },
  {
    href: "/app/proposals",
    label: "Propostas",
    description: "Status do builder, links públicos e propostas enviadas.",
    icon: IconProposals,
  },
  {
    href: "/app/catalog",
    label: "Catálogo",
    description: "Serviços ativos e preços disponíveis hoje no builder de proposta.",
    icon: IconCatalog,
  },
  {
    href: "/app/settings",
    label: "Configurações",
    description: "Postura atual de acesso e limites operacionais do MVP.",
    icon: IconSettings,
  }
];

export const foundationModules = [
  {
    title: "Painel consultivo",
    summary: "Visão operacional compartilhada de receita, propostas e sinais atuais de entrega."
  },
  {
    title: "Pipeline de leads",
    summary: "Estrutura essencial para contas, contatos, responsáveis e estágios de conversão."
  },
  {
    title: "Catálogo de serviços",
    summary: "Serviços reutilizáveis por categoria, com preço e enquadramento de entrega."
  },
  {
    title: "Sistema de propostas",
    summary: "Builder interno, apresentação pública versionada e fluxo futuro de aceite."
  }
] as const;

export const architecturePrinciples = [
  "Os grupos de rotas separam com clareza as experiências pública, de autenticação e da área interna.",
  "Rotas internas exigem uma sessão explícita de administrador ou sócio antes da renderização.",
  "Os modelos Prisma refletem entidades reais do negócio, não apenas dados de proposta.",
  "Tokens de design e primitives do shell dão ao produto uma base visual durável."
] as const;
