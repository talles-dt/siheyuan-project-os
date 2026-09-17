import type { Decisão, Implantação, PrincípioCanônico, ProgramaArea } from "./types";

const CONFLICT_KEYWORDS: Array<{
  principioId: string;
  match: RegExp;
  msg: string;
}> = [
  {
    principioId: "princ-001",
    match: /(reduz|menor|encolh|diminu|corta|elimina).{0,20}greenhouse/i,
    msg: "Decisão ameaça reduzir a Greenhouse Library (princípio canônico 1).",
  },
  {
    principioId: "princ-001",
    match: /greenhouse.*(reduz|menor|encolh|diminu|corta|elimina)/i,
    msg: "Decisão ameaça reduzir a Greenhouse Library (princípio canônico 1).",
  },
  {
    principioId: "princ-001",
    match: /(remov|excluir|suprim|eliminar).{0,20}greenhouse/i,
    msg: "Decisão ameaça remover a Greenhouse Library (princípio canônico 1).",
  },
  {
    principioId: "princ-001",
    match: /greenhouse.*(remov|excluir|suprim|eliminar)/i,
    msg: "Decisão ameaça remover a Greenhouse Library (princípio canônico 1).",
  },
  {
    principioId: "princ-002",
    match: /(cidadela|n[uú]cleo).*(dissolv|espalh|dispers|fragment)/i,
    msg: "Decisão ameaça dissolver a cidadela doméstica (princípio canônico 2).",
  },
  {
    principioId: "princ-002",
    match: /(dissolv|espalh|dispers|fragment).{0,20}(cidadela|n[uú]cleo)/i,
    msg: "Decisão ameaça dissolver a cidadela doméstica (princípio canônico 2).",
  },
  {
    principioId: "princ-003",
    match: /pavilh[aã]o\s*a.*(ateli[eê]|laborat[oó]rio|of[ií]cio)/i,
    msg: "Decisão insere ateliê/laboratório no Pavilhão A (princípio canônico 3).",
  },
  {
    principioId: "princ-003",
    match: /(ateli[eê]|laborat[oó]rio|of[ií]cio).{0,20}pavilh[aã]o\s*a/i,
    msg: "Decisão insere ateliê/laboratório no Pavilhão A (princípio canônico 3).",
  },
  {
    principioId: "princ-005",
    match: /hospitalidade.*(hotel|alojamento|institucional)/i,
    msg: "Decisão converte hospitalidade em hotel/alojamento (princípio canônico 5).",
  },
  {
    principioId: "princ-007",
    match: /exterior.*(vidro|transparente|aberto|exposto)/i,
    msg: "Decisão torna o exterior transparente, violando o princípio 7.",
  },
];

export function detectCanonicalConflicts(decisao: Decisão): string[] {
  const text = `${decisao.titulo} ${decisao.descricao} ${decisao.impactoPrograma} ${decisao.opcoes.join(" ")}`;
  const conflicts: string[] = [];
  for (const rule of CONFLICT_KEYWORDS) {
    if (rule.match.test(text)) conflicts.push(rule.msg);
  }
  return Array.from(new Set(conflicts));
}

export function detectImplantacaoConflicts(
  imp: Implantação,
  programa: ProgramaArea[]
): string[] {
  const conflicts: string[] = [];
  const greenhouse = programa.find((p) => p.ambienteKey === "greenhouse-library");
  const text = `${imp.deslocamentos} ${imp.notas ?? ""} ${imp.conflitos.join(" ")}`;
  if (greenhouse && /(reduz|remov|elimina|encolh|diminu|corta).{0,20}greenhouse/i.test(text)) {
    conflicts.push("Implantação reduz a Greenhouse Library (canônico 1).");
  }
  if (greenhouse && /greenhouse.*(reduz|remov|elimina|encolh|diminu|corta)/i.test(text)) {
    conflicts.push("Implantação reduz a Greenhouse Library (canônico 1).");
  }
  if (/(dissolv|espalh|fragment).{0,20}(cidadela|n[uú]cleo)/i.test(text)) {
    conflicts.push("Implantação dissolve a cidadela doméstica (canônico 2).");
  }
  if (/(cidadela|n[uú]cleo).*(dissolv|espalh|fragment)/i.test(text)) {
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
