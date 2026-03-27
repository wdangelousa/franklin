import { brand } from "@/lib/brand";

export const PROPOSAL_CONTENT_SNAPSHOT_VERSION = 1 as const;

export interface ProposalContentServiceInput {
  internalCode: string;
  categoryCode: string | null;
  serviceName: string;
  publicName: string;
  specificClause: string | null;
  requiredDocuments: string[];
}

export interface ProposalContentSnapshot {
  version: typeof PROPOSAL_CONTENT_SNAPSHOT_VERSION;
  coverTagline: string;
  onebridgeInstitutionalPresentation: string[];
  proposalIntroduction: string[];
  specificTerms: string[];
  investmentIntro: string;
  requiredDocuments: string[];
  documentSubmissionInstructions: string[];
  generalTerms: string[];
  acceptanceText: string;
  paymentIntro: string;
  closingParagraph: string;
}

export function buildProposalContentSnapshot(args: {
  companyName: string;
  contactName: string;
  services: ProposalContentServiceInput[];
}): ProposalContentSnapshot {
  const serviceNames = args.services.map((service) => service.serviceName);
  const consolidatedRequiredDocuments = dedupeStrings([
    ...args.services.flatMap((service) => service.requiredDocuments),
    ...getProposalWideRequirements()
  ]);
  const specificTerms = dedupeStrings([
    "O escopo fica limitado aos serviços listados nesta proposta. Qualquer registro, protocolo ou trabalho consultivo adicional exigirá um escopo escrito separado.",
    "Os prazos dependem da prontidão documental do cliente e dos tempos de resposta de órgãos governamentais, bancos e instituições terceiras envolvidas no trabalho.",
    ...args.services
      .map((service) => service.specificClause?.trim() ?? null)
      .filter((value): value is string => Boolean(value))
  ]);

  return {
    version: PROPOSAL_CONTENT_SNAPSHOT_VERSION,
    coverTagline: buildCoverTagline(args.companyName, serviceNames),
    onebridgeInstitutionalPresentation: [
      `${brand.parentName} atende fundadores, operadores e clientes internacionais que precisam de uma estrutura empresarial confiável nos Estados Unidos, uma postura clara de compliance e execução prática em vez de coordenação fragmentada entre fornecedores.`,
      `A proposta que você está revisando é um snapshot comercial fixo preparado para ${args.companyName}, separado do catálogo interno usado pela equipe da ${brand.organizationName}.`
    ],
    proposalIntroduction: [
      `Para ${args.companyName}, esta proposta restringe o escopo apenas aos serviços selecionados, para que o registro comercial corresponda exatamente ao que a ${brand.parentName} executará caso a proposta seja aceita.`,
      `${args.contactName} pode usar esta página como referência comercial única de escopo, postura de prazo, prontidão documental e investimento.`
    ],
    specificTerms,
    investmentIntro:
      "O investimento abaixo reflete apenas o snapshot dos serviços selecionados. Ele não inclui tributos, desembolsos governamentais não expressamente incluídos na descrição dos serviços escolhidos, nem ampliações futuras de escopo.",
    requiredDocuments: consolidatedRequiredDocuments,
    documentSubmissionInstructions: [
      "Responda diretamente ao WhatsApp ou ao email original e anexe os arquivos solicitados em PDF ou imagem.",
      `Se for mais prático por email, envie os documentos para ${brand.supportEmail} e inclua o número da proposta no assunto.`,
      "Envie scans nítidos e completos para evitar pedidos de substituição antes do protocolo ou onboarding."
    ],
    generalTerms: [
      "Esta proposta é confidencial e foi preparada exclusivamente para o destinatário identificado neste link privado.",
      "O trabalho começa após o aceite formal e a confirmação de que os documentos obrigatórios estão completos.",
      "Se a proposta expirar antes do aceite, preço e escopo poderão precisar de revalidação antes de nova emissão."
    ],
    acceptanceText: `Ao aceitar esta proposta, você confirma que os serviços selecionados, o preço e os termos refletem corretamente o escopo que deseja que a ${brand.parentName} execute para sua empresa.`,
    paymentIntro:
      "As instruções de pagamento são enviadas após o aceite, como parte da sequência de onboarding. A equipe da Onebridge Stalwart compartilha as etapas de pagamento e o checklist de kickoff assim que o aceite for registrado.",
    closingParagraph:
      "Se este escopo reflete a estrutura com a qual você deseja seguir, aceite a proposta usando o botão seguro desta página e a equipe abrirá a sequência de onboarding."
  };
}

export function parseProposalContentSnapshot(
  value: unknown,
  fallbackArgs: {
    companyName: string;
    contactName: string;
    services: ProposalContentServiceInput[];
  }
): ProposalContentSnapshot {
  const fallback = buildProposalContentSnapshot(fallbackArgs);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const candidate = value as Partial<ProposalContentSnapshot>;

  return {
    version:
      candidate.version === PROPOSAL_CONTENT_SNAPSHOT_VERSION
        ? PROPOSAL_CONTENT_SNAPSHOT_VERSION
        : PROPOSAL_CONTENT_SNAPSHOT_VERSION,
    coverTagline: getNonEmptyString(candidate.coverTagline) ?? fallback.coverTagline,
    onebridgeInstitutionalPresentation:
      parseStringArray(candidate.onebridgeInstitutionalPresentation) ??
      fallback.onebridgeInstitutionalPresentation,
    proposalIntroduction: parseStringArray(candidate.proposalIntroduction) ?? fallback.proposalIntroduction,
    specificTerms: parseStringArray(candidate.specificTerms) ?? fallback.specificTerms,
    investmentIntro: getNonEmptyString(candidate.investmentIntro) ?? fallback.investmentIntro,
    requiredDocuments: parseStringArray(candidate.requiredDocuments) ?? fallback.requiredDocuments,
    documentSubmissionInstructions:
      parseStringArray(candidate.documentSubmissionInstructions) ??
      fallback.documentSubmissionInstructions,
    generalTerms: parseStringArray(candidate.generalTerms) ?? fallback.generalTerms,
    acceptanceText: getNonEmptyString(candidate.acceptanceText) ?? fallback.acceptanceText,
    paymentIntro: getNonEmptyString(candidate.paymentIntro) ?? fallback.paymentIntro,
    closingParagraph: getNonEmptyString(candidate.closingParagraph) ?? fallback.closingParagraph
  };
}

export function getRequiredDocumentsForCatalogService(args: {
  internalCode: string;
  categoryCode: string | null;
}): string[] {
  const baseIdentityDocuments = [
    "Cópia do passaporte de cada beneficiário final ou signatário autorizado",
    "Comprovante atual de endereço residencial de cada beneficiário final ou signatário autorizado"
  ];

  if (args.internalCode === "formation_business_bank_account_opening") {
    return [
      ...baseIdentityDocuments,
      "Breve descrição da atividade esperada da conta e do perfil transacional",
      "Endereço postal nos Estados Unidos para o perfil bancário, se diferente do endereço registrado"
    ];
  }

  switch (args.categoryCode) {
    case "formation":
      return [
        ...baseIdentityDocuments,
        "Dados pretendidos da empresa, incluindo nome preferido da entidade e descrição da atividade"
      ];
    case "registered_agent":
      return [
        "Documentos atuais de constituição ou registro da empresa",
        "Dados principais de contato para encaminhamento de correspondência oficial"
      ];
    case "compliance":
      return [
        "Documentos atuais de constituição ou registro da empresa",
        "Dados atuais de sócios, membros ou administradores da empresa",
        "Cópias de Annual Report, notificações ou lembretes de renovação anteriores, se houver"
      ];
    case "corporate_changes":
      return [
        "Documentos atuais de constituição ou registro da empresa",
        "Dados da alteração societária ou do encerramento pretendido",
        "Qualquer documento corporativo já existente relacionado à mudança solicitada"
      ];
    case "visas":
      return [
        "Passaporte válido e documentos de identificação do aplicante principal",
        "Currículo, diplomas e evidências profissionais relevantes ao visto selecionado",
        "Documentos de suporte adicionais conforme a estratégia do caso"
      ];
    case "specialized":
      if (args.internalCode.includes("trademark")) {
        return [
          "Nome exato da marca ou arquivo do logotipo",
          "Descrição dos produtos ou serviços a serem protegidos",
          "Comprovante de use in commerce, se a marca já estiver em uso"
        ];
      }

      if (args.internalCode.includes("tax")) {
        return [
          ...baseIdentityDocuments,
          "EIN, ITIN ou notificações do IRS já emitidas, se aplicável",
          "Resumo breve do objetivo fiscal ou do protocolo ligado a este engajamento"
        ];
      }

      if (args.internalCode.includes("business_plan")) {
        return [
          "Resumo do modelo de negócio, produto ou serviço principal",
          "Informações financeiras disponíveis e premissas de projeção",
          "Materiais institucionais ou comerciais já existentes, se houver"
        ];
      }

      return [
        ...baseIdentityDocuments,
        "Quaisquer documentos já existentes relevantes ao escopo do serviço especializado"
      ];
    default:
      return [
        ...baseIdentityDocuments,
        "Quaisquer documentos já existentes relevantes ao escopo do serviço selecionado"
      ];
  }
}

function buildCoverTagline(companyName: string, serviceNames: string[]): string {
  const summary =
    serviceNames.length === 0
      ? "um escopo consultivo objetivo"
      : `${formatServiceNames(serviceNames)} com condução ponta a ponta`;

  return `Uma proposta objetiva para ${companyName}, com ${summary}.`;
}

function getProposalWideRequirements(): string[] {
  return [
    "Contato preferencial para kickoff e canal principal de comunicação do engajamento",
    "Quaisquer documentos societários, fiscais ou de compliance já existentes e relevantes ao escopo selecionado"
  ];
}

function formatServiceNames(serviceNames: string[]): string {
  if (serviceNames.length === 1) {
    return serviceNames[0];
  }

  if (serviceNames.length === 2) {
    return `${serviceNames[0]} e ${serviceNames[1]}`;
  }

  const firstServices = serviceNames.slice(0, 2);
  return `${firstServices.join(", ")} e serviços correlatos`;
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  for (const value of values) {
    const normalizedValue = normalizeValue(value);

    if (!normalizedValue || seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    results.push(value.trim());
  }

  return results;
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const parsed = value
    .map((item) => getNonEmptyString(item))
    .filter((item): item is string => Boolean(item));

  return parsed.length > 0 ? parsed : null;
}

function getNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
