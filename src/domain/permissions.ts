import type { Usuario, DecisaoStatus } from "./types";

export type Papel = Usuario["papel"];

export type Acao =
  | "terreno:write"
  | "terreno:delete"
  | "criterio:write"
  | "implantacao:write"
  | "prancha:write"
  | "programa:write"
  | "etapa:status"
  | "tarefa:write"
  | "decisao:write"
  | "decisao:aprovar_conflito"
  | "material:write"
  | "fornecedor:write"
  | "cotacao:write"
  | "ambiente:write"
  | "artefato:write"
  | "documento:write"
  | "risco:write"
  | "risco:resolve"
  | "principio:write"
  | "projeto:encerrar";

const PERMISSOES: Record<Papel, Acao[]> = {
  guardiao: [
    "terreno:write",
    "criterio:write",
    "implantacao:write",
    "prancha:write",
    "programa:write",
    "etapa:status",
    "tarefa:write",
    "decisao:write",
    "decisao:aprovar_conflito",
    "material:write",
    "fornecedor:write",
    "cotacao:write",
    "ambiente:write",
    "artefato:write",
    "documento:write",
    "risco:write",
    "risco:resolve",
    "principio:write",
    "projeto:encerrar",
    "terreno:delete",
  ],
  arquiteto: [
    "terreno:write",
    "criterio:write",
    "implantacao:write",
    "prancha:write",
    "programa:write",
    "etapa:status",
    "tarefa:write",
    "material:write",
    "fornecedor:write",
    "cotacao:write",
    "ambiente:write",
    "artefato:write",
    "documento:write",
    "risco:write",
  ],
  "gestor-obra": [
    "etapa:status",
    "tarefa:write",
    "material:write",
    "fornecedor:write",
    "cotacao:write",
    "ambiente:write",
    "artefato:write",
    "documento:write",
    "risco:write",
    "risco:resolve",
  ],
  comprador: [
    "material:write",
    "fornecedor:write",
    "cotacao:write",
    "documento:write",
  ],
  consultor: [],
  aprovador: [
    "decisao:write",
  ],
};

export function pode(papel: Papel, acao: Acao): boolean {
  return PERMISSOES[papel]?.includes(acao) ?? false;
}

export function podeEditarDecisao(papel: Papel, status: DecisaoStatus, temConflito: boolean): boolean {
  if (!pode(papel, "decisao:write")) return false;
  if (temConflito && status !== "proibida") {
    return pode(papel, "decisao:aprovar_conflito");
  }
  return true;
}

export function podeEncerrarProjeto(papel: Papel): boolean {
  return pode(papel, "projeto:encerrar");
}

export const PAPEIS: Array<{ key: Papel; nome: string; descricao: string; acoes: Acao[] }> = [
  { key: "guardiao", nome: "Guardião do briefing", descricao: "Edita princípios canônicos (com auditoria), aprova decisões com conflito, encerra o projeto.", acoes: PERMISSOES.guardiao },
  { key: "arquiteto", nome: "Arquiteto", descricao: "Edita pranchas, implantações, programa de áreas e etapas.", acoes: PERMISSOES.arquiteto },
  { key: "gestor-obra", nome: "Gestor de obra", descricao: "Edita tarefas, cronograma, riscos e recebimento de materiais.", acoes: PERMISSOES["gestor-obra"] },
  { key: "comprador", nome: "Comprador", descricao: "Edita fornecedores, cotações e pedidos.", acoes: PERMISSOES.comprador },
  { key: "consultor", nome: "Consultor (leitura)", descricao: "Visualiza tudo, sem edição.", acoes: PERMISSOES.consultor },
  { key: "aprovador", nome: "Aprovador", descricao: "Apenas assina decisões atribuídas.", acoes: PERMISSOES.aprovador },
];
