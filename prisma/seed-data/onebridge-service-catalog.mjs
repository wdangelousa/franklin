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
    name: "Company Formation",
    description: "Company formation, offshore setup, and business banking services.",
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
          "Full formation of your LLC or Corporation in the state of Florida, with all the support needed to make your company legally operational in the United States.",
        specificClause: null,
        submissionNotes: "Estimated timeline: 5–10 business days",
        deliverables: [
          "Articles of Organization / Incorporation",
          "Operating Agreement or Bylaws",
          "EIN obtainment (federal tax ID number)",
          "Sunbiz registration (FL Secretary of State)",
          "Estimated timeline: 5–10 business days"
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
          "Formation of your LLC or Corporation in Delaware, a state recognized for its advanced corporate law and superior legal protections for businesses of any size.",
        specificClause: null,
        submissionNotes: "Estimated timeline: 7–14 business days",
        deliverables: [
          "Certificate of Formation / Incorporation",
          "Operating Agreement or Bylaws",
          "EIN obtainment (federal tax ID number)",
          "Division of Corporations registration",
          "Estimated timeline: 7–14 business days"
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
          "Formation of your LLC or Corporation in Wyoming, a state with zero state income tax, strong asset protection, and privacy for members.",
        specificClause: null,
        submissionNotes: "Estimated timeline: 7–14 business days",
        deliverables: [
          "Articles of Organization / Incorporation",
          "Operating Agreement or Bylaws",
          "EIN obtainment (federal tax ID number)",
          "WY Secretary of State registration",
          "Estimated timeline: 7–14 business days"
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
          "Company formation in the British Virgin Islands, one of the most respected offshore jurisdictions in the world, ideal for international holdings, asset protection, and global tax planning.",
        specificClause: "BVI Registered Agent included for the first year.",
        submissionNotes: "Estimated timeline: 10–20 business days",
        deliverables: [
          "Memorandum & Articles of Association",
          "Certificate of Incorporation",
          "BVI Registered Agent included for the first year",
          "Estimated timeline: 10–20 business days"
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
          "Full assistance in opening a U.S. business bank account, including guidance on required documentation and follow-up until account activation.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Company profile analysis for ideal bank selection",
          "Documentation preparation and review",
          "Process follow-up until approval"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "registered_agent",
    name: "Registered Agent",
    description: "State-level registered agent coverage and legal address services.",
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
          "Registered Agent service in the state of Florida. Your company maintains a valid legal address for receiving official correspondence, legal notices, and state documents.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Legal address for official correspondence",
          "Receipt and forwarding of legal notices",
          "Compliance with state requirements"
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
          "Registered Agent service in the state of Delaware. A mandatory legal address for every company registered in the state, with receipt and forwarding of official documents.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Legal address for official correspondence",
          "Receipt and forwarding of legal notices",
          "Compliance with state requirements"
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
          "Registered Agent service in the state of Wyoming. A mandatory legal address for every company registered in the state, with receipt and forwarding of official documents.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Legal address for official correspondence",
          "Receipt and forwarding of legal notices",
          "Compliance with state requirements"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 3
      }
    ]
  },
  {
    code: "compliance",
    name: "Annual Compliance",
    description: "Annual compliance, renewal, and standing-maintenance services.",
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
          "Annual maintenance of your Florida company, ensuring all state obligations are met on time, avoiding fines and administrative dissolution risks.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Annual Report filed with Sunbiz",
          "Registered Agent renewal",
          "Deadline and obligation monitoring"
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
          "Annual maintenance for Delaware Corporations, including mandatory Franchise Tax and Annual Report, keeping your company in Good Standing with the state.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Franchise Tax filing",
          "Annual Report with Division of Corporations",
          "Registered Agent renewal"
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
          "Annual maintenance for Delaware LLCs, including the mandatory $300 annual state tax payment, keeping your company active and in compliance.",
        specificClause: "Includes the mandatory $300 Delaware annual state tax.",
        submissionNotes: null,
        deliverables: [
          "Annual Tax payment ($300 included)",
          "Registered Agent renewal",
          "Deadline and obligation monitoring"
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
          "Annual maintenance of your Wyoming company, including the mandatory Annual Report filing and registered agent renewal.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Annual Report filed with Secretary of State",
          "Registered Agent renewal",
          "Deadline and obligation monitoring"
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
          "Annual maintenance of your BVI offshore company, including registered agent renewal, government fees, and ongoing compliance with local regulations.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "BVI Registered Agent renewal",
          "Annual government fees included",
          "Compliance with BVI regulations"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "corporate_changes",
    name: "Corporate Changes",
    description: "Entity amendments, dissolution, and custom corporate document services.",
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
          "Formal closing of your Florida company, filing the necessary documents with the state for voluntary dissolution, avoiding undue future obligations.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Articles of Dissolution filed with Sunbiz",
          "Final Annual Report (if applicable)",
          "Guidance on final tax obligations"
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
          "Formal closing of your Delaware company, filing the Certificate of Cancellation/Dissolution with the Division of Corporations.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Certificate of Cancellation / Dissolution",
          "Payment of outstanding state taxes",
          "Guidance on final tax obligations"
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
          "Formal closing of your Wyoming company, filing dissolution documents with the Secretary of State.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Articles of Dissolution",
          "Payment of outstanding state taxes",
          "Guidance on final tax obligations"
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
          "Formal changes to your company’s registration, such as name change, address, members, managers, or business purpose, with state filing update.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Amendment / Articles of Amendment preparation",
          "Filing with the corresponding state",
          "Operating Agreement update (if applicable)"
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
          "Preparation or customization of tailored corporate documents, such as complex Operating Agreements, detailed Bylaws, resolutions, and other documents specific to your company’s needs.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Company structure and needs analysis",
          "Document drafting and review",
          "Up to 2 rounds of revisions"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 5
      }
    ]
  },
  {
    code: "visas",
    name: "Visas & Immigration",
    description: "Immigration petition, response, and refiling services.",
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
          "Full petition for the EB-1 visa, designed for professionals with internationally recognized extraordinary ability in sciences, arts, education, business, or athletics. A priority category that does not require a job offer.",
        specificClause: "Does not require a job offer.",
        submissionNotes: null,
        deliverables: [
          "Detailed eligibility assessment",
          "Full petition preparation (Form I-140)",
          "Recommendation letters and evidence drafting",
          "Documentation package compilation and organization",
          "USCIS government filing fees included"
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
          "Petition for the EB-2 visa, for professionals with an advanced degree (master’s or higher) or exceptional ability. Includes the possibility of a National Interest Waiver (NIW), which waives the job offer requirement.",
        specificClause:
          "May include a National Interest Waiver, which waives the job offer requirement.",
        submissionNotes: null,
        deliverables: [
          "Eligibility assessment (classic EB-2 or NIW)",
          "Full petition preparation (Form I-140)",
          "Legal argumentation for National Interest Waiver",
          "Documentation package compilation",
          "USCIS government filing fees included"
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
          "Petition for the EB-3 visa, aimed at skilled workers, professionals with a bachelor’s degree, or workers in specific categories. Requires a job offer from a U.S. employer.",
        specificClause: "Requires a job offer from a U.S. employer.",
        submissionNotes: null,
        deliverables: [
          "Eligibility assessment",
          "Labor Certification (PERM) coordination",
          "Petition preparation (Form I-140)",
          "Documentation package compilation",
          "USCIS government filing fees included"
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
          "Petition for the E-2 visa, designed for investors from treaty countries who are investing substantial capital in a U.S. business.",
        specificClause: "Available only to investors from treaty countries.",
        submissionNotes: null,
        deliverables: [
          "Investment and business structure analysis",
          "Full petition preparation (Form DS-160 / I-129)",
          "Business Plan preparation (if needed)",
          "Financial and documentary evidence compilation",
          "Government filing fees included"
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
          "Petition for the L-1 visa, which allows the transfer of executives, managers, or employees with specialized knowledge from a foreign company to a U.S. branch, subsidiary, or parent company.",
        specificClause:
          "Requires a qualifying parent, branch, subsidiary, or affiliate relationship.",
        submissionNotes: null,
        deliverables: [
          "Company relationship analysis (parent/subsidiary)",
          "Full petition preparation (Form I-129)",
          "Corporate relationship supporting documentation",
          "Evidence package compilation",
          "USCIS government filing fees included"
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
          "Petition for the O-1 visa, designed for individuals with extraordinary ability or notable achievements in sciences, arts, education, business, athletics, film, or television.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Detailed eligibility assessment",
          "Full petition preparation (Form I-129)",
          "Recommendation letters drafting",
          "Evidence package compilation",
          "USCIS government filing fees included"
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
          "Preparation of a response to a Request for Evidence (RFE) issued by USCIS during the processing of your immigration case.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Detailed RFE analysis",
          "Customized response strategy",
          "Additional evidence compilation",
          "Response drafting and submission"
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
          "Preparation and submission of an Appeal or Motion (Motion to Reopen / Reconsider) after an unfavorable USCIS decision.",
        specificClause: null,
        submissionNotes: "Submission includes filing with AAO or USCIS.",
        deliverables: [
          "Unfavorable decision analysis",
          "Legal strategy for the appeal",
          "Brief / argumentation drafting",
          "Filing with AAO / USCIS"
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
          "Complete refiling of a previously denied immigration petition, with a new strategy, strengthened evidence, and updated argumentation.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Previous denial reason analysis",
          "New petition strategy",
          "Evidence package reinforcement",
          "USCIS government filing fees included"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 9
      }
    ]
  },
  {
    code: "specialized",
    name: "Specialized Services",
    description: "Tax, trademark, apostille, business plan, and CPA advisory services.",
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
          "Preparation of a professional Business Plan, structured to meet both immigration requirements (E-2, L-1 visas) and presentations to investors and financial institutions.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Market and competition analysis",
          "Detailed financial projections",
          "Operational and growth strategy",
          "Professionally formatted document",
          "Up to 2 rounds of revisions"
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
          "Tax planning advisory to structure your U.S. operations in a tax-efficient manner, covering federal and state obligations, company tax classification, and basic optimization strategies.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Current tax structure analysis",
          "Tax classification recommendation (LLC vs Corp, S-Corp election)",
          "Federal and state obligation guidance",
          "Report with recommendations"
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
          "In-depth tax planning for complex corporate structures, including international operations, holdings, double taxation treaties, and advanced asset protection strategies.",
        specificClause: null,
        submissionNotes: null,
        deliverables: [
          "Full multi-jurisdictional structure analysis",
          "Transfer pricing and international compliance strategies",
          "Double taxation treaty planning",
          "Specialized CPA advisory",
          "Detailed executive report"
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
          "Registration of your trademark with the United States Patent and Trademark Office (USPTO), ensuring legal protection of your brand across the entire U.S. territory. Price per registration class.",
        specificClause: "Price applies per registration class.",
        submissionNotes: null,
        deliverables: [
          "Trademark availability search",
          "Application preparation and submission",
          "Process follow-up until approval",
          "USPTO fees included"
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
          "Complete apostille and certified translation service, accepted by U.S. and international government agencies. Ideal for validating Brazilian documents in the U.S. or vice versa.",
        specificClause: null,
        submissionNotes: "Estimated timeline: varies by state/country.",
        deliverables: [
          "Certified translation (USCIS-accepted)",
          "Complete apostille process",
          "Document shipping and logistics",
          "Estimated timeline: varies by state/country"
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
          "Advisory session with a specialized accountant (CPA) in U.S. taxation for businesses and individuals, ideal for specific questions, tax situation review, or a professional second opinion.",
        specificClause: "Billed per hour.",
        submissionNotes: null,
        deliverables: [
          "Session with a CPA specialized in U.S. tax",
          "Personalized analysis of your situation",
          "Documented written recommendations (if requested)"
        ],
        isActive: true,
        status: "ACTIVE",
        sortOrder: 6
      }
    ]
  }
];
