import "server-only";

export interface LocalizedServiceCategory {
  name: string;
  description: string | null;
}

export function localizeServiceCategory(args: {
  code: string;
  name: string;
  description: string | null;
}): LocalizedServiceCategory {
  switch (args.code) {
    case "formation":
      return {
        name: "Abertura e estrutura societária",
        description: "Abertura de empresa, estrutura offshore e serviços bancários empresariais."
      };
    case "registered_agent":
      return {
        name: "Registered Agent",
        description: "Cobertura estadual de Registered Agent e endereço legal da empresa."
      };
    case "compliance":
      return {
        name: "Compliance anual",
        description: "Renovação, manutenção anual e regularidade societária."
      };
    case "corporate_changes":
      return {
        name: "Alterações societárias",
        description: "Alterações de entidade, dissolução e documentos societários sob medida."
      };
    case "visas":
      return {
        name: "Vistos e imigração",
        description: "Petições migratórias, respostas e reapresentações."
      };
    case "specialized":
      return {
        name: "Serviços especializados",
        description: "Tributário, marca, apostila, Business Plan e consultoria com CPA."
      };
    default:
      return {
        name: args.name,
        description: args.description
      };
  }
}
