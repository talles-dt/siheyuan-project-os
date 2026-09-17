import type { Decisão, Implantação, PrincípioCanônico, ProgramaArea } from "./types";

type Rule = {
  principioId: string;
  verbs: string[];
  keywords: string[];
  msg: string;
};

const NEGATION = [
  "não vamos",
  "nao vamos",
  "não reduz",
  "nao reduz",
  "não diminui",
  "nao diminui",
  "não remover",
  "nao remover",
  "não eliminar",
  "nao eliminar",
  "não dissolve",
  "nao dissolve",
  "não insere",
  "nao insere",
  "não converte",
  "nao converte",
  "não torna",
  "nao torna",
  "sem reduzir",
  "sem remover",
  "sem eliminar",
  "sem dissolver",
  "mantém",
  "mantem",
  "preserva",
  "preservar",
  "preservada",
  "preservado",
];

const RULES: Rule[] = [
  {
    principioId: "princ-001",
    verbs: ["reduz", "reduzir", "menor", "encolh", "diminu", "diminuir", "corta", "cortar", "elimina", "eliminar", "remov", "remover", "suprim", "suprimir", "excluir"],
    keywords: ["greenhouse", "estufa-biblioteca", "estufa biblioteca", "biblioteca de vidro"],
    msg: "Decisão ameaça reduzir/remover a Greenhouse Library (princípio canônico 1).",
  },
  {
    principioId: "princ-002",
    verbs: ["dissolv", "dissolver", "espalh", "espalhar", "dispers", "dispersar", "fragment", "fragmentar"],
    keywords: ["cidadela", "núcleo", "nucleo", "conjunto principal", "cidadela doméstica"],
    msg: "Decisão ameaça dissolver a cidadela doméstica (princípio canônico 2).",
  },
  {
    principioId: "princ-003",
    verbs: ["inser", "inserir", "colocar", "transformar", "converter", "tornar", "passa a ser", "virar"],
    keywords: ["ateliê", "atelie", "laboratório", "laboratorio", "laboratório de perfumaria", "ofício", "oficio", "ofícios", "oficios"],
    msg: "Decisão insere ateliê/laboratório no Pavilhão A (princípio canônico 3).",
  },
  {
    principioId: "princ-004",
    verbs: ["desloc", "deslocar", "remov", "remover", "separar", "destacar", "independizar"],
    keywords: ["pavilhão b", "pavilhao b", "pavilhão b — ofícios", "pavilhão b - ofícios"],
    msg: "Decisão desloca/separa o Pavilhão B do conjunto (princípio canônico 4).",
  },
  {
    principioId: "princ-005",
    verbs: ["converter", "tornar", "transformar", "virar", "passa a ser"],
    keywords: ["hospitalidade", "hospedagem", "hóspedes", "hospedes"],
    msg: "Decisão converte hospitalidade em hotel/alojamento (princípio canônico 5).",
  },
  {
    principioId: "princ-005",
    verbs: ["hotel", "alojamento", "institucional"],
    keywords: ["hospitalidade", "hospedagem", "hóspedes", "hospedes"],
    msg: "Decisão converte hospitalidade em hotel/alojamento (princípio canônico 5).",
  },
  {
    principioId: "princ-006",
    verbs: ["elimina", "eliminar", "remov", "remover", "suprim", "suprimir", "cortar", "corta"],
    keywords: ["pátio", "patio", "pátios", "patios", "sequência de pátios", "siheyuan"],
    msg: "Decisão elimina a estrutura de pátios do siheyuan (princípio canônico 6).",
  },
  {
    principioId: "princ-007",
    verbs: ["vidro", "transparente", "aberto", "exposto", "vidraça", "vidraca", "envidraçar"],
    keywords: ["exterior", "fachada", "parede externa", "muro", "portal"],
    msg: "Decisão torna o exterior transparente (princípio canônico 7).",
  },
  {
    principioId: "princ-008",
    verbs: ["expor", "exibir", "destacar visualmente", "evidenciar", "mostrar"],
    keywords: ["resiliência", "resiliencia", "infraestrutura técnica", "camada técnica", "sistemas críticos", "bunker", "subsolo"],
    msg: "Decisão expõe a infraestrutura técnica como tema visual (princípio canônico 8).",
  },
  {
    principioId: "princ-009",
    verbs: ["substituir", "trocar", "usar", "adotar"],
    keywords: ["alumínio", "aluminio", "plástico", "plastico", "pvc", "vidro reflexivo", "aço inox", "concreto aparente", "fibrocimento"],
    msg: "Decisão introduz materialidade fora do cânone (princípio canônico 9).",
  },
  {
    principioId: "princ-010",
    verbs: ["encerrar", "finalizar", "considerar pronto", "considerar concluído", "encerrar antes", "parar"],
    keywords: ["projeto", "obra", "entrega", "artefato"],
    msg: "Decisão encerra o projeto antes do último artefato (princípio canônico 10).",
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isNegated(text: string, verb: string, keyword: string): boolean {
  for (const neg of NEGATION) {
    if (text.includes(neg)) {
      const idx = text.indexOf(neg);
      const window = text.slice(idx, idx + 80);
      if (window.includes(verb) && window.includes(keyword)) return true;
    }
  }
  return false;
}

function matchRule(text: string, rule: Rule): boolean {
  for (const verb of rule.verbs) {
    for (const keyword of rule.keywords) {
      const hasVerb = text.includes(verb);
      const hasKey = text.includes(keyword);
      if (!hasVerb || !hasKey) continue;
      if (isNegated(text, verb, keyword)) continue;
      const re = new RegExp(`(${verb}).{0,30}(${keyword})|(${keyword}).{0,30}(${verb})`, "i");
      if (re.test(text)) return true;
    }
  }
  return false;
}

export function detectCanonicalConflicts(decisao: Decisão): string[] {
  const text = normalize(
    `${decisao.titulo} ${decisao.descricao} ${decisao.impactoPrograma} ${decisao.opcoes.join(" ")}`
  );
  const conflicts: string[] = [];
  for (const rule of RULES) {
    if (matchRule(text, rule)) conflicts.push(rule.msg);
  }
  return Array.from(new Set(conflicts));
}

export function detectImplantacaoConflicts(
  imp: Implantação,
  programa: ProgramaArea[]
): string[] {
  const conflicts: string[] = [];
  const greenhouse = programa.find((p) => p.ambienteKey === "greenhouse-library");
  const text = normalize(`${imp.deslocamentos} ${imp.notas ?? ""} ${imp.conflitos.join(" ")}`);
  if (greenhouse) {
    const ghRule = RULES.find((r) => r.principioId === "princ-001");
    if (ghRule && matchRule(text, ghRule)) {
      conflicts.push("Implantação reduz/remove a Greenhouse Library (canônico 1).");
    }
  }
  const citRule = RULES.find((r) => r.principioId === "princ-002");
  if (citRule && matchRule(text, citRule)) {
    conflicts.push("Implantação dissolve a cidadela doméstica (canônico 2).");
  }
  return Array.from(new Set([...conflicts, ...imp.conflitos]));
}

export function principleById(
  principios: PrincípioCanônico[],
  id: string
): PrincípioCanônico | undefined {
  return principios.find((p) => p.id === id);
}

export function allProtectedPrincipleIds(): string[] {
  return Array.from(new Set(RULES.map((r) => r.principioId)));
}
