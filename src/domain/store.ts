import { CANONICAL_PRINCIPLES, CANONICAL_ETAPAS, CANONICAL_PROGRAMA, CANONICAL_RISCOS, REFERENCE_PRANCHAS } from "./seed";
import type { SiheyuanState, Terreno, Decisão, Material, Implantação, Critério, Tarefa, Risco, Fornecedor, Cotação, Ambiente, Artefato, Documento } from "./types";

export function emptyState(): SiheyuanState {
  return {
    principios: CANONICAL_PRINCIPLES,
    terrenos: [],
    criterios: [],
    implantacoes: [],
    programaAreas: CANONICAL_PROGRAMA,
    pranchas: REFERENCE_PRANCHAS,
    etapas: CANONICAL_ETAPAS,
    tarefas: [],
    decisoes: [],
    fornecedores: [],
    cotacoes: [],
    materiais: [],
    ambientes: [],
    artefatos: [],
    documentos: [],
    riscos: CANONICAL_RISCOS,
    usuarios: [
      { id: "user-001", nome: "Guardião do briefing", papel: "guardiao" },
      { id: "user-002", nome: "Arquiteto", papel: "arquiteto" },
      { id: "user-003", nome: "Gestor de obra", papel: "gestor-obra" },
    ],
    versao: 1,
  };
}

let counter = 100;
export function newId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

const STORAGE_KEY = "siheyuan-project-os:v1";

export function loadState(): SiheyuanState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as SiheyuanState;
    if (!parsed.principios || parsed.principios.length === 0) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

export function saveState(state: SiheyuanState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors in MVP
  }
}

export function resetState(): SiheyuanState {
  const s = emptyState();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  return s;
}

export type StatePatch = Partial<SiheyuanState>;

export type Action =
  | { type: "ADD_TERRENO"; terreno: Terreno }
  | { type: "UPDATE_TERRENO"; terreno: Terreno }
  | { type: "REMOVE_TERRENO"; id: string }
  | { type: "ADD_CRITERIO"; criterio: Critério }
  | { type: "ADD_IMPLANTACAO"; implantacao: Implantação }
  | { type: "UPDATE_IMPLANTACAO"; implantacao: Implantação }
  | { type: "REMOVE_IMPLANTACAO"; id: string }
  | { type: "ADD_DECISAO"; decisao: Decisão }
  | { type: "UPDATE_DECISAO"; decisao: Decisão }
  | { type: "REMOVE_DECISAO"; id: string }
  | { type: "ADD_MATERIAL"; material: Material }
  | { type: "UPDATE_MATERIAL"; material: Material }
  | { type: "REMOVE_MATERIAL"; id: string }
  | { type: "ADD_TAREFA"; tarefa: Tarefa }
  | { type: "UPDATE_TAREFA"; tarefa: Tarefa }
  | { type: "REMOVE_TAREFA"; id: string }
  | { type: "SET_ETAPA_STATUS"; id: string; status: Etapa["status"] }
  | { type: "ADD_RISCO"; risco: Risco }
  | { type: "TOGGLE_RISCO_RESOLVIDO"; id: string }
  | { type: "ADD_FORNECEDOR"; fornecedor: Fornecedor }
  | { type: "UPDATE_FORNECEDOR"; fornecedor: Fornecedor }
  | { type: "REMOVE_FORNECEDOR"; id: string }
  | { type: "ADD_COTACAO"; cotacao: Cotação }
  | { type: "UPDATE_COTACAO"; cotacao: Cotação }
  | { type: "REMOVE_COTACAO"; id: string }
  | { type: "ADD_AMBIENTE"; ambiente: Ambiente }
  | { type: "UPDATE_AMBIENTE"; ambiente: Ambiente }
  | { type: "ADD_ARTEFATO"; artefato: Artefato }
  | { type: "UPDATE_ARTEFATO"; artefato: Artefato }
  | { type: "ADD_DOCUMENTO"; documento: Documento }
  | { type: "SET_STATE"; state: SiheyuanState }
  | { type: "RESET" };

import type { Etapa } from "./types";

export function reducer(state: SiheyuanState, action: Action): SiheyuanState {
  switch (action.type) {
    case "SET_STATE":
      return action.state;
    case "ADD_TERRENO":
      return { ...state, terrenos: [...state.terrenos, action.terreno] };
    case "UPDATE_TERRENO":
      return {
        ...state,
        terrenos: state.terrenos.map((t) => (t.id === action.terreno.id ? action.terreno : t)),
      };
    case "REMOVE_TERRENO":
      return {
        ...state,
        terrenos: state.terrenos.filter((t) => t.id !== action.id),
        criterios: state.criterios.filter((c) => c.terrenoId !== action.id),
        implantacoes: state.implantacoes.filter((i) => i.terrenoId !== action.id),
      };
    case "ADD_CRITERIO":
      return { ...state, criterios: [...state.criterios, action.criterio] };
    case "ADD_IMPLANTACAO":
      return {
        ...state,
        implantacoes: [...state.implantacoes, action.implantacao],
        terrenos: state.terrenos.map((t) =>
          t.id === action.implantacao.terrenoId
            ? { ...t, implantacaoIds: [...t.implantacaoIds, action.implantacao.id] }
            : t
        ),
      };
    case "UPDATE_IMPLANTACAO":
      return {
        ...state,
        implantacoes: state.implantacoes.map((i) =>
          i.id === action.implantacao.id ? action.implantacao : i
        ),
      };
    case "REMOVE_IMPLANTACAO":
      return {
        ...state,
        implantacoes: state.implantacoes.map((i) =>
          i.id === action.id ? { ...i, ativa: false } : i
        ),
      };
    case "ADD_DECISAO":
      return { ...state, decisoes: [...state.decisoes, action.decisao] };
    case "UPDATE_DECISAO":
      return {
        ...state,
        decisoes: state.decisoes.map((d) => (d.id === action.decisao.id ? action.decisao : d)),
      };
    case "REMOVE_DECISAO":
      return { ...state, decisoes: state.decisoes.filter((d) => d.id !== action.id) };
    case "ADD_MATERIAL":
      return { ...state, materiais: [...state.materiais, action.material] };
    case "UPDATE_MATERIAL":
      return {
        ...state,
        materiais: state.materiais.map((m) => (m.id === action.material.id ? action.material : m)),
      };
    case "REMOVE_MATERIAL":
      return { ...state, materiais: state.materiais.filter((m) => m.id !== action.id) };
    case "ADD_TAREFA":
      return { ...state, tarefas: [...state.tarefas, action.tarefa] };
    case "UPDATE_TAREFA":
      return {
        ...state,
        tarefas: state.tarefas.map((t) => (t.id === action.tarefa.id ? action.tarefa : t)),
      };
    case "REMOVE_TAREFA":
      return { ...state, tarefas: state.tarefas.filter((t) => t.id !== action.id) };
    case "SET_ETAPA_STATUS":
      return {
        ...state,
        etapas: state.etapas.map((e) =>
          e.id === action.id ? { ...e, status: action.status } : e
        ),
      };
    case "ADD_RISCO":
      return { ...state, riscos: [...state.riscos, action.risco] };
    case "TOGGLE_RISCO_RESOLVIDO":
      return {
        ...state,
        riscos: state.riscos.map((r) =>
          r.id === action.id ? { ...r, resolvido: !r.resolvido } : r
        ),
      };
    case "ADD_FORNECEDOR":
      return { ...state, fornecedores: [...state.fornecedores, action.fornecedor] };
    case "UPDATE_FORNECEDOR":
      return {
        ...state,
        fornecedores: state.fornecedores.map((f) => (f.id === action.fornecedor.id ? action.fornecedor : f)),
      };
    case "REMOVE_FORNECEDOR":
      return {
        ...state,
        fornecedores: state.fornecedores.filter((f) => f.id !== action.id),
        cotacoes: state.cotacoes.filter((c) => c.fornecedorId !== action.id),
      };
    case "ADD_COTACAO":
      return { ...state, cotacoes: [...state.cotacoes, action.cotacao] };
    case "UPDATE_COTACAO":
      return {
        ...state,
        cotacoes: state.cotacoes.map((c) => (c.id === action.cotacao.id ? action.cotacao : c)),
      };
    case "REMOVE_COTACAO":
      return { ...state, cotacoes: state.cotacoes.filter((c) => c.id !== action.id) };
    case "ADD_AMBIENTE":
      return { ...state, ambientes: [...state.ambientes, action.ambiente] };
    case "UPDATE_AMBIENTE":
      return {
        ...state,
        ambientes: state.ambientes.map((a) => (a.id === action.ambiente.id ? action.ambiente : a)),
      };
    case "ADD_ARTEFATO":
      return { ...state, artefatos: [...state.artefatos, action.artefato] };
    case "UPDATE_ARTEFATO":
      return {
        ...state,
        artefatos: state.artefatos.map((a) => (a.id === action.artefato.id ? action.artefato : a)),
      };
    case "ADD_DOCUMENTO":
      return { ...state, documentos: [...state.documentos, action.documento] };
    case "RESET":
      return resetState();
    default:
      return state;
  }
}
