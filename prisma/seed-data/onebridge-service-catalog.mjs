// Source: local Onebridge source documents in Downloads.
// internalCode values are deterministic normalized identifiers because the
// accessible source files did not include an explicit internal code column.

export const seedOrganization = {
  name: "Onebridge Stalwart",
  slug: "onebridge-stalwart"
};

export const serviceCatalogSeed = [
  {
    code: "formation",
    name: "Formação de Empresas",
    description: "Abertura de empresas, estruturação offshore e serviços bancários empresariais.",
    sortOrder: 1,
    services: [
      {
        internalCode: "formation_florida_company_formation",
        slug: "florida-company-formation",
        serviceName: "Abertura de Empresa na Flórida",
        publicName: "Florida Company Formation",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 99000,
        allowsVariableQuantity: false,
        longDescription:
          "Formação completa da sua LLC ou Corporation no estado da Flórida, com todo o suporte necessário para tornar sua empresa legalmente operacional nos Estados Unidos.",
        specificClause: null,
        submissionNotes: "Prazo estimado: 5–10 dias úteis",
        deliverables: [
          "Artigos de Organização / Incorporação",
          "Contrato Operacional ou Estatuto Social",
          "Obtenção do EIN (número federal de identificação fiscal)",
          "Registro no Sunbiz (Secretary of State da Flórida)",
          "Prazo estimado: 5–10 dias úteis"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "formation_delaware_company_formation",
        slug: "delaware-company-formation",
        serviceName: "Abertura de Empresa em Delaware",
        publicName: "Delaware Company Formation",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 179000,
        allowsVariableQuantity: false,
        longDescription:
          "Formação da sua LLC ou Corporation em Delaware, estado reconhecido por sua legislação societária avançada e proteções jurídicas superiores para empresas de qualquer porte.",
        specificClause: null,
        submissionNotes: "Prazo estimado: 7–14 dias úteis",
        deliverables: [
          "Certificado de Formação / Incorporação",
          "Contrato Operacional ou Estatuto Social",
          "Obtenção do EIN (número federal de identificação fiscal)",
          "Registro na Division of Corporations",
          "Prazo estimado: 7–14 dias úteis"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "formation_wyoming_company_formation",
        slug: "wyoming-company-formation",
        serviceName: "Abertura de Empresa em Wyoming",
        publicName: "Wyoming Company Formation",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 179000,
        allowsVariableQuantity: false,
        longDescription:
          "Formação da sua LLC ou Corporation em Wyoming, estado com imposto de renda estadual zero, forte proteção de ativos e privacidade para membros.",
        specificClause: null,
        submissionNotes: "Prazo estimado: 7–14 dias úteis",
        deliverables: [
          "Artigos de Organização / Incorporação",
          "Contrato Operacional ou Estatuto Social",
          "Obtenção do EIN (número federal de identificação fiscal)",
          "Registro no Secretary of State de Wyoming",
          "Prazo estimado: 7–14 dias úteis"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      },
      {
        internalCode: "formation_offshore_formation_british_virgin_islands",
        slug: "offshore-formation-british-virgin-islands",
        serviceName: "Abertura Offshore — Ilhas Virgens Britânicas (BVI)",
        publicName: "Offshore Formation — British Virgin Islands",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 360000,
        allowsVariableQuantity: false,
        longDescription:
          "Abertura de empresa nas British Virgin Islands, uma das jurisdições offshore mais respeitadas do mundo, ideal para holdings internacionais, proteção de ativos e planejamento tributário global.",
        specificClause: "Agente Registrado nas BVI incluído no primeiro ano.",
        submissionNotes: "Prazo estimado: 10–20 dias úteis",
        deliverables: [
          "Memorando e Artigos de Associação",
          "Certificado de Incorporação",
          "Agente Registrado nas BVI incluído no primeiro ano",
          "Prazo estimado: 10–20 dias úteis"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 4
      },
      {
        internalCode: "formation_business_bank_account_opening",
        slug: "business-bank-account-opening",
        serviceName: "Abertura de Conta Bancária Empresarial",
        publicName: "Business Bank Account Opening",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 35000,
        allowsVariableQuantity: false,
        longDescription:
          "Assessoria completa para abertura de conta bancária empresarial nos EUA, incluindo orientação sobre documentação necessária e acompanhamento até a ativação da conta.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise do perfil da empresa para seleção ideal do banco",
          "Preparação e revisão de documentação",
          "Acompanhamento do processo até a aprovação"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "registered_agent",
    name: "Agente Registrado",
    description: "Serviço de agente registrado em nível estadual e endereço legal.",
    sortOrder: 2,
    services: [
      {
        internalCode: "registered_agent_registered_agent_florida",
        slug: "registered-agent-florida",
        serviceName: "Agente Registrado — Flórida",
        publicName: "Registered Agent — Florida",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 22000,
        allowsVariableQuantity: false,
        longDescription:
          "Serviço de Agente Registrado no estado da Flórida. Sua empresa mantém um endereço legal válido para recebimento de correspondência oficial, notificações judiciais e documentos estaduais.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Endereço legal para correspondência oficial",
          "Recebimento e encaminhamento de notificações judiciais",
          "Conformidade com requisitos estaduais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "registered_agent_registered_agent_delaware",
        slug: "registered-agent-delaware",
        serviceName: "Agente Registrado — Delaware",
        publicName: "Registered Agent — Delaware",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 22000,
        allowsVariableQuantity: false,
        longDescription:
          "Serviço de Agente Registrado no estado de Delaware. Endereço legal obrigatório para toda empresa registrada no estado, com recebimento e encaminhamento de documentos oficiais.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Endereço legal para correspondência oficial",
          "Recebimento e encaminhamento de notificações judiciais",
          "Conformidade com requisitos estaduais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "registered_agent_registered_agent_wyoming",
        slug: "registered-agent-wyoming",
        serviceName: "Agente Registrado — Wyoming",
        publicName: "Registered Agent — Wyoming",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 22000,
        allowsVariableQuantity: false,
        longDescription:
          "Serviço de Agente Registrado no estado de Wyoming. Endereço legal obrigatório para toda empresa registrada no estado, com recebimento e encaminhamento de documentos oficiais.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Endereço legal para correspondência oficial",
          "Recebimento e encaminhamento de notificações judiciais",
          "Conformidade com requisitos estaduais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      }
    ]
  },
  {
    code: "compliance",
    name: "Compliance Anual",
    description: "Serviços de compliance anual, renovação e manutenção de boa situação legal.",
    sortOrder: 3,
    services: [
      {
        internalCode: "compliance_annual_compliance_florida",
        slug: "annual-compliance-florida",
        serviceName: "Compliance Anual — Flórida",
        publicName: "Annual Compliance — Florida",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 44000,
        allowsVariableQuantity: false,
        longDescription:
          "Manutenção anual da sua empresa na Flórida, garantindo o cumprimento de todas as obrigações estaduais dentro dos prazos, evitando multas e riscos de dissolução administrativa.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Relatório Anual protocolado no Sunbiz",
          "Renovação do Agente Registrado",
          "Monitoramento de prazos e obrigações"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "compliance_annual_compliance_delaware_corp",
        slug: "annual-compliance-delaware-corp",
        serviceName: "Compliance Anual — Delaware (Corp)",
        publicName: "Annual Compliance — Delaware (Corp)",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 79000,
        allowsVariableQuantity: false,
        longDescription:
          "Manutenção anual para Corporations em Delaware, incluindo o Franchise Tax obrigatório e o Relatório Anual, mantendo sua empresa em Good Standing junto ao estado.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Declaração do Franchise Tax",
          "Relatório Anual na Division of Corporations",
          "Renovação do Agente Registrado"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "compliance_annual_compliance_delaware_llc",
        slug: "annual-compliance-delaware-llc",
        serviceName: "Compliance Anual — Delaware (LLC)",
        publicName: "Annual Compliance — Delaware (LLC)",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 79000,
        allowsVariableQuantity: false,
        longDescription:
          "Manutenção anual para LLCs em Delaware, incluindo o pagamento obrigatório da taxa estadual anual de $300, mantendo sua empresa ativa e em conformidade.",
        specificClause: "Inclui o pagamento obrigatório da taxa estadual anual de $300 de Delaware.",
        submissionNotes: null,
        deliverables: [
          "Pagamento da taxa anual ($300 incluída)",
          "Renovação do Agente Registrado",
          "Monitoramento de prazos e obrigações"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      },
      {
        internalCode: "compliance_annual_compliance_wyoming",
        slug: "annual-compliance-wyoming",
        serviceName: "Compliance Anual — Wyoming",
        publicName: "Annual Compliance — Wyoming",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 44000,
        allowsVariableQuantity: false,
        longDescription:
          "Manutenção anual da sua empresa em Wyoming, incluindo o protocolo obrigatório do Relatório Anual e a renovação do agente registrado.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Relatório Anual protocolado no Secretary of State",
          "Renovação do Agente Registrado",
          "Monitoramento de prazos e obrigações"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 4
      },
      {
        internalCode: "compliance_annual_compliance_bvi",
        slug: "annual-compliance-bvi",
        serviceName: "Compliance Anual — BVI",
        publicName: "Annual Compliance — BVI",
        billingType: "ANNUAL",
        unitLabel: "year",
        priceCents: 286000,
        allowsVariableQuantity: false,
        longDescription:
          "Manutenção anual da sua empresa offshore nas BVI, incluindo renovação do agente registrado, taxas governamentais e conformidade contínua com a regulamentação local.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Renovação do Agente Registrado nas BVI",
          "Taxas governamentais anuais incluídas",
          "Conformidade com regulamentações das BVI"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "corporate_changes",
    name: "Alterações Societárias",
    description: "Alterações societárias, dissolução de entidades e serviços de documentação corporativa personalizada.",
    sortOrder: 4,
    services: [
      {
        internalCode: "corporate_changes_company_dissolution_florida",
        slug: "company-dissolution-florida",
        serviceName: "Dissolução de Empresa — Flórida",
        publicName: "Company Dissolution — Florida",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 37000,
        allowsVariableQuantity: false,
        longDescription:
          "Encerramento formal da sua empresa na Flórida, com protocolo dos documentos necessários junto ao estado para dissolução voluntária, evitando obrigações futuras indevidas.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Artigos de Dissolução protocolados no Sunbiz",
          "Relatório Anual final (se aplicável)",
          "Orientação sobre obrigações tributárias finais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "corporate_changes_company_dissolution_delaware",
        slug: "company-dissolution-delaware",
        serviceName: "Dissolução de Empresa — Delaware",
        publicName: "Company Dissolution — Delaware",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 68000,
        allowsVariableQuantity: false,
        longDescription:
          "Encerramento formal da sua empresa em Delaware, com protocolo do Certificado de Cancelamento/Dissolução na Division of Corporations.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Certificado de Cancelamento / Dissolução",
          "Pagamento de tributos estaduais pendentes",
          "Orientação sobre obrigações tributárias finais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "corporate_changes_company_dissolution_wyoming",
        slug: "company-dissolution-wyoming",
        serviceName: "Dissolução de Empresa — Wyoming",
        publicName: "Company Dissolution — Wyoming",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 68000,
        allowsVariableQuantity: false,
        longDescription:
          "Encerramento formal da sua empresa em Wyoming, com protocolo dos documentos de dissolução junto ao Secretary of State.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Artigos de Dissolução",
          "Pagamento de tributos estaduais pendentes",
          "Orientação sobre obrigações tributárias finais"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      },
      {
        internalCode: "corporate_changes_corporate_amendments",
        slug: "corporate-amendments",
        serviceName: "Alterações Contratuais (Amendments)",
        publicName: "Corporate Amendments",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 44000,
        allowsVariableQuantity: false,
        longDescription:
          "Alterações formais no registro da sua empresa, como mudança de nome, endereço, membros, gerentes ou objeto social, com atualização junto ao estado.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Preparação do Amendment / Artigos de Alteração",
          "Protocolo junto ao estado correspondente",
          "Atualização do Contrato Operacional (se aplicável)"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 4
      },
      {
        internalCode: "corporate_changes_custom_corporate_documents",
        slug: "custom-corporate-documents",
        serviceName: "Customização de Documentos Corporativos",
        publicName: "Custom Corporate Documents",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 80000,
        allowsVariableQuantity: false,
        longDescription:
          "Preparação ou customização de documentos corporativos sob medida, como Contratos Operacionais complexos, Estatutos Sociais detalhados, resoluções e outros documentos específicos para as necessidades da sua empresa.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise da estrutura e necessidades da empresa",
          "Elaboração e revisão dos documentos",
          "Até 2 rodadas de revisão"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "visas",
    name: "Vistos e Imigração",
    description: "Petições imigratórias, respostas a RFE e serviços de reapresentação de casos.",
    sortOrder: 5,
    services: [
      {
        internalCode: "visas_eb_1_visa_extraordinary_ability",
        slug: "eb-1-visa-extraordinary-ability",
        serviceName: "Visto EB-1 (Habilidade Extraordinária)",
        publicName: "EB-1 Visa (Extraordinary Ability)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1690000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição completa para o visto EB-1, destinado a profissionais com habilidade extraordinária reconhecida internacionalmente em ciências, artes, educação, negócios ou esportes. Uma categoria prioritária que não exige oferta de emprego.",
        specificClause: "Não exige oferta de emprego.",
        submissionNotes: null,
        deliverables: [
          "Avaliação detalhada de elegibilidade",
          "Preparação completa da petição (Formulário I-140)",
          "Elaboração de cartas de recomendação e evidências",
          "Compilação e organização do pacote documental",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "visas_eb_2_visa_advanced_degree_niw",
        slug: "eb-2-visa-advanced-degree-niw",
        serviceName: "Visto EB-2 (Grau Avançado / NIW)",
        publicName: "EB-2 Visa (Advanced Degree / NIW)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1690000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição para o visto EB-2, para profissionais com grau avançado (mestrado ou superior) ou habilidade excepcional. Inclui a possibilidade do National Interest Waiver (NIW), que dispensa a exigência de oferta de emprego.",
        specificClause:
          "Pode incluir o National Interest Waiver, que dispensa a exigência de oferta de emprego.",
        submissionNotes: null,
        deliverables: [
          "Avaliação de elegibilidade (EB-2 clássico ou NIW)",
          "Preparação completa da petição (Formulário I-140)",
          "Argumentação jurídica para o National Interest Waiver",
          "Compilação do pacote documental",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "visas_eb_3_visa_skilled_worker",
        slug: "eb-3-visa-skilled-worker",
        serviceName: "Visto EB-3 (Trabalhador Qualificado)",
        publicName: "EB-3 Visa (Skilled Worker)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1290000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição para o visto EB-3, destinado a trabalhadores qualificados, profissionais com bacharelado ou trabalhadores em categorias específicas. Exige oferta de emprego de empregador nos EUA.",
        specificClause: "Exige oferta de emprego de empregador nos EUA.",
        submissionNotes: null,
        deliverables: [
          "Avaliação de elegibilidade",
          "Coordenação da Labor Certification (PERM)",
          "Preparação da petição (Formulário I-140)",
          "Compilação do pacote documental",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      },
      {
        internalCode: "visas_e_2_visa_treaty_investor",
        slug: "e-2-visa-treaty-investor",
        serviceName: "Visto E-2 (Investidor)",
        publicName: "E-2 Visa (Treaty Investor)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1290000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição para o visto E-2, destinado a investidores de países com tratado que estão investindo capital substancial em um negócio nos EUA.",
        specificClause: "Disponível apenas para investidores de países com tratado.",
        submissionNotes: null,
        deliverables: [
          "Análise do investimento e estrutura do negócio",
          "Preparação completa da petição (Formulário DS-160 / I-129)",
          "Elaboração do Business Plan (se necessário)",
          "Compilação de evidências financeiras e documentais",
          "Taxas governamentais incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 4
      },
      {
        internalCode: "visas_l_1_visa_intracompany_transfer",
        slug: "l-1-visa-intracompany-transfer",
        serviceName: "Visto L-1 (Transferência Intracompanhia)",
        publicName: "L-1 Visa (Intracompany Transfer)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1290000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição para o visto L-1, que permite a transferência de executivos, gerentes ou funcionários com conhecimento especializado de uma empresa estrangeira para uma filial, subsidiária ou matriz nos EUA.",
        specificClause:
          "Exige relação societária qualificada entre empresa matriz, filial, subsidiária ou afiliada.",
        submissionNotes: null,
        deliverables: [
          "Análise do vínculo societário (matriz/subsidiária)",
          "Preparação completa da petição (Formulário I-129)",
          "Documentação de suporte do vínculo societário",
          "Compilação do pacote de evidências",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      },
      {
        internalCode: "visas_o_1_visa_extraordinary_ability",
        slug: "o-1-visa-extraordinary-ability",
        serviceName: "Visto O-1 (Habilidade Extraordinária)",
        publicName: "O-1 Visa (Extraordinary Ability)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 1290000,
        allowsVariableQuantity: false,
        longDescription:
          "Petição para o visto O-1, destinado a indivíduos com habilidade extraordinária ou realizações notáveis em ciências, artes, educação, negócios, esportes, cinema ou televisão.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Avaliação detalhada de elegibilidade",
          "Preparação completa da petição (Formulário I-129)",
          "Elaboração de cartas de recomendação",
          "Compilação do pacote de evidências",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 6
      },
      {
        internalCode: "visas_rfe_response_request_for_evidence",
        slug: "rfe-response-request-for-evidence",
        serviceName: "Resposta a RFE (Request for Evidence)",
        publicName: "RFE Response (Request for Evidence)",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 100000,
        allowsVariableQuantity: false,
        longDescription:
          "Preparação de resposta a um Request for Evidence (RFE) emitido pelo USCIS durante o processamento do seu caso imigratório.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise detalhada do RFE",
          "Estratégia de resposta personalizada",
          "Compilação de evidências adicionais",
          "Elaboração e envio da resposta"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 7
      },
      {
        internalCode: "visas_appeal_motion",
        slug: "appeal-motion",
        serviceName: "Appeal / Motion",
        publicName: "Appeal / Motion",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 280000,
        allowsVariableQuantity: false,
        longDescription:
          "Preparação e envio de um Appeal ou Motion (Motion to Reopen / Reconsider) após decisão desfavorável do USCIS.",
        specificClause: null,
        submissionNotes: "Envio inclui protocolo junto ao AAO ou USCIS.",
        deliverables: [
          "Análise da decisão desfavorável",
          "Estratégia jurídica para o recurso",
          "Elaboração do brief / argumentação",
          "Protocolo junto ao AAO / USCIS"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 8
      },
      {
        internalCode: "visas_case_refiling",
        slug: "case-refiling",
        serviceName: "Reapresentação de Caso (Refile)",
        publicName: "Case Refiling",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 280000,
        allowsVariableQuantity: false,
        longDescription:
          "Reapresentação completa de uma petição imigratória previamente negada, com nova estratégia, evidências reforçadas e argumentação atualizada.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise dos motivos da negativa anterior",
          "Nova estratégia para a petição",
          "Reforço do pacote de evidências",
          "Taxas governamentais do USCIS incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 9
      }
    ]
  },
  {
    code: "specialized",
    name: "Serviços Especializados",
    description: "Planejamento tributário, registro de marca, apostilamento, business plan e consultoria com CPA.",
    sortOrder: 6,
    services: [
      {
        internalCode: "specialized_business_plan",
        slug: "business-plan",
        serviceName: "Business Plan",
        publicName: "Business Plan",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 380000,
        allowsVariableQuantity: false,
        longDescription:
          "Preparação de um Business Plan profissional, estruturado para atender tanto requisitos imigratórios (vistos E-2, L-1) quanto apresentações a investidores e instituições financeiras.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise de mercado e concorrência",
          "Projeções financeiras detalhadas",
          "Estratégia operacional e de crescimento",
          "Documento formatado profissionalmente",
          "Até 2 rodadas de revisão"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 1
      },
      {
        internalCode: "specialized_basic_tax_planning",
        slug: "basic-tax-planning",
        serviceName: "Planejamento Tributário Básico",
        publicName: "Basic Tax Planning",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 320000,
        allowsVariableQuantity: false,
        longDescription:
          "Consultoria de planejamento tributário para estruturar suas operações nos EUA de forma eficiente, cobrindo obrigações federais e estaduais, classificação tributária da empresa e estratégias básicas de otimização.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise da estrutura tributária atual",
          "Recomendação de classificação tributária (LLC vs Corp, eleição S-Corp)",
          "Orientação sobre obrigações federais e estaduais",
          "Relatório com recomendações"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 2
      },
      {
        internalCode: "specialized_advanced_tax_planning",
        slug: "advanced-tax-planning",
        serviceName: "Planejamento Tributário Avançado",
        publicName: "Advanced Tax Planning",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 480000,
        allowsVariableQuantity: false,
        longDescription:
          "Planejamento tributário aprofundado para estruturas corporativas complexas, incluindo operações internacionais, holdings, tratados de dupla tributação e estratégias avançadas de proteção de ativos.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Análise completa da estrutura multijurisdicional",
          "Estratégias de transfer pricing e compliance internacional",
          "Planejamento de tratados de dupla tributação",
          "Consultoria especializada com CPA",
          "Relatório executivo detalhado"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      },
      {
        internalCode: "specialized_uspto_trademark_registration_per_class",
        slug: "uspto-trademark-registration-per-class",
        serviceName: "Registro de Marca no USPTO (por classe)",
        publicName: "USPTO Trademark Registration (per class)",
        billingType: "PER_CLASS",
        unitLabel: "class",
        priceCents: 250000,
        allowsVariableQuantity: true,
        longDescription:
          "Registro da sua marca junto ao United States Patent and Trademark Office (USPTO), garantindo proteção legal da sua marca em todo o território norte-americano. Preço por classe de registro.",
        specificClause: "Preço aplicável por classe de registro.",
        submissionNotes: null,
        deliverables: [
          "Pesquisa de disponibilidade da marca",
          "Preparação e envio da aplicação",
          "Acompanhamento do processo até aprovação",
          "Taxas do USPTO incluídas"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 4
      },
      {
        internalCode: "specialized_apostille_and_translation",
        slug: "apostille-and-translation",
        serviceName: "Apostilamento e Tradução",
        publicName: "Apostille and Translation",
        billingType: "FIXED_FEE",
        unitLabel: "engagement",
        priceCents: 360000,
        allowsVariableQuantity: false,
        longDescription:
          "Serviço completo de apostilamento e tradução juramentada, aceito por órgãos governamentais dos EUA e internacionais. Ideal para validação de documentos brasileiros nos EUA ou vice-versa.",
        specificClause: null,
        submissionNotes: "Prazo estimado: varia conforme estado/país.",
        deliverables: [
          "Tradução juramentada (aceita pelo USCIS)",
          "Processo completo de apostilamento",
          "Logística de envio de documentos",
          "Prazo estimado: varia conforme estado/país"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      },
      {
        internalCode: "specialized_cpa_advisory_per_hour",
        slug: "cpa-advisory-per-hour",
        serviceName: "Consultoria com Contadores (por hora)",
        publicName: "CPA Advisory (per hour)",
        billingType: "HOURLY",
        unitLabel: "hour",
        priceCents: 39000,
        allowsVariableQuantity: true,
        longDescription:
          "Sessão de consultoria com contador especializado (CPA) em tributação norte-americana para empresas e pessoas físicas, ideal para dúvidas específicas, revisão da situação fiscal ou uma segunda opinião profissional.",
        specificClause: "Cobrança por hora.",
        submissionNotes: null,
        deliverables: [
          "Sessão com CPA especializado em tributação dos EUA",
          "Análise personalizada da sua situação",
          "Recomendações por escrito documentadas (se solicitado)"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 6
      }
    ]
  }
];
