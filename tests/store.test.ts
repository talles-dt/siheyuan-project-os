import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { reducer, emptyState, exportState, parseBackup } from "../src/domain/store.ts";
import type { Terreno, Decisão, Fornecedor, Cotação, Material, Implantação, Tarefa } from "../src/domain/types.ts";

const baseTerreno = (overrides: Partial<Terreno> = {}): Terreno => ({
  id: "t-1",
  nome: "Fazenda Teste",
  local: "Zona rural",
  area: 100000,
  fotos: [],
  mapas: [],
  documentos: [],
  contatos: [],
  status: "descoberta",
  criterioIds: [],
  implantacaoIds: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const baseDecisao = (overrides: Partial<Decisão> = {}): Decisão => ({
  id: "dec-1",
  titulo: "Decisão de teste",
  descricao: "",
  opcoes: [],
  impactoPrograma: "",
  custo: 0,
  custoMoeda: "BRL",
  risco: "",
  reversibilidade: "reversivel",
  principioIds: [],
  conflitos: [],
  perguntaCentral: "",
  status: "pendente",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const baseFornecedor = (overrides: Partial<Fornecedor> = {}): Fornecedor => ({
  id: "forn-1",
  nome: "Fornecedor Teste",
  categoria: "Materiais",
  contatos: [],
  ...overrides,
});

const baseCotacao = (overrides: Partial<Cotação> = {}): Cotação => ({
  id: "cot-1",
  fornecedorId: "forn-1",
  materialId: "mat-1",
  preco: 100,
  moeda: "BRL",
  temAmostra: false,
  ...overrides,
});

const baseImplantacao = (overrides: Partial<Implantação> = {}): Implantação => ({
  id: "impl-1",
  terrenoId: "t-1",
  variante: "A",
  deslocamentos: "",
  conflitos: [],
  custoEstimado: 0,
  custoMoeda: "BRL",
  ativa: true,
  ...overrides,
});

const baseTarefa = (overrides: Partial<Tarefa> = {}): Tarefa => ({
  id: "task-1",
  etapaId: "etapa-001",
  titulo: "Tarefa teste",
  status: "a-fazer",
  ...overrides,
});

describe("reducer — SET_STATE e RESET", () => {
  it("SET_STATE substitui todo o estado", () => {
    const s0 = emptyState();
    const novo = { ...s0, versao: 99 };
    const s1 = reducer(s0, { type: "SET_STATE", state: novo });
    assert.equal(s1.versao, 99);
  });

  it("SET_STATE com estado de backup restaurado (round-trip)", () => {
    const s0 = emptyState();
    const t = baseTerreno();
    const s1 = reducer(s0, { type: "ADD_TERRENO", terreno: t });
    const exported = exportState(s1);
    const parsed = parseBackup(exported);
    const s2 = reducer(s0, { type: "SET_STATE", state: parsed });
    assert.equal(s2.terrenos.length, 1);
    assert.equal(s2.terrenos[0].nome, "Fazenda Teste");
  });

  it("RESET retorna emptyState com princípios canônicos intactos", () => {
    const s0 = reducer(emptyState(), { type: "ADD_TERRENO", terreno: baseTerreno() });
    assert.ok(s0.terrenos.length > 0);
    const s1 = reducer(s0, { type: "RESET" });
    assert.equal(s1.terrenos.length, 0);
    assert.ok(s1.principios.length > 0, "RESET não deve zerar princípios canônicos");
  });
});

describe("reducer — Terrenos", () => {
  it("ADD_TERRENO adiciona à lista", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, { type: "ADD_TERRENO", terreno: baseTerreno() });
    assert.equal(s1.terrenos.length, 1);
  });

  it("UPDATE_TERRENO substitui pelo id", () => {
    const s0 = reducer(emptyState(), { type: "ADD_TERRENO", terreno: baseTerreno() });
    const s1 = reducer(s0, { type: "UPDATE_TERRENO", terreno: baseTerreno({ nome: "Renomeado" }) });
    assert.equal(s1.terrenos[0].nome, "Renomeado");
  });

  it("REMOVE_TERRENO remove terreno E em cascata critérios e implantações", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, { type: "ADD_TERRENO", terreno: baseTerreno({ id: "t-x" }) });
    const s2 = reducer(s1, {
      type: "ADD_IMPLANTACAO",
      implantacao: baseImplantacao({ id: "impl-x", terrenoId: "t-x" }),
    });
    assert.equal(s2.implantacoes.length, 1);
    const s3 = reducer(s2, { type: "REMOVE_TERRENO", id: "t-x" });
    assert.equal(s3.terrenos.length, 0);
    assert.equal(s3.implantacoes.length, 0, "implantações devem ser removidas em cascata");
  });
});

describe("reducer — Decisões", () => {
  it("ADD/UPDATE/REMOVE decisão", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, { type: "ADD_DECISAO", decisao: baseDecisao({ id: "d-1" }) });
    assert.equal(s1.decisoes.length, 1);
    const s2 = reducer(s1, { type: "UPDATE_DECISAO", decisao: baseDecisao({ id: "d-1", titulo: "Alterada" }) });
    assert.equal(s2.decisoes[0].titulo, "Alterada");
    const s3 = reducer(s2, { type: "REMOVE_DECISAO", id: "d-1" });
    assert.equal(s3.decisoes.length, 0);
  });
});

describe("reducer — Fornecedores e cotações (cascata)", () => {
  it("REMOVE_FORNECEDOR remove fornecedor E suas cotações em cascata", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, { type: "ADD_FORNECEDOR", fornecedor: baseFornecedor({ id: "forn-x" }) });
    const s2 = reducer(s1, { type: "ADD_COTACAO", cotacao: baseCotacao({ id: "cot-x", fornecedorId: "forn-x" }) });
    assert.equal(s2.cotacoes.length, 1);
    const s3 = reducer(s2, { type: "REMOVE_FORNECEDOR", id: "forn-x" });
    assert.equal(s3.fornecedores.length, 0);
    assert.equal(s3.cotacoes.length, 0, "cotações do fornecedor removido devem ser removidas em cascata");
  });
});

describe("reducer — Materiais", () => {
  it("ADD/REMOVE material", () => {
    const s0 = emptyState();
    const m: Material = {
      id: "mat-1", referencia: "Ref", descricao: "Desc", alternativasEquivalentes: [],
      moeda: "BRL", status: "conceito",
    };
    const s1 = reducer(s0, { type: "ADD_MATERIAL", material: m });
    assert.equal(s1.materiais.length, 1);
    const s2 = reducer(s1, { type: "REMOVE_MATERIAL", id: "mat-1" });
    assert.equal(s2.materiais.length, 0);
  });
});

describe("reducer — Etapas e tarefas", () => {
  it("SET_ETAPA_STATUS atualiza apenas a etapa alvo", () => {
    const s0 = emptyState();
    assert.ok(s0.etapas.length >= 1);
    const id = s0.etapas[0].id;
    const s1 = reducer(s0, { type: "SET_ETAPA_STATUS", id, status: "em-andamento" });
    assert.equal(s1.etapas[0].status, "em-andamento");
  });

  it("ADD/UPDATE/REMOVE tarefa", () => {
    const s0 = emptyState();
    const t = baseTarefa();
    const s1 = reducer(s0, { type: "ADD_TAREFA", tarefa: t });
    assert.equal(s1.tarefas.length, 1);
    const s2 = reducer(s1, { type: "UPDATE_TAREFA", tarefa: { ...t, titulo: "Alt" } });
    assert.equal(s2.tarefas[0].titulo, "Alt");
    const s3 = reducer(s2, { type: "REMOVE_TAREFA", id: "task-1" });
    assert.equal(s3.tarefas.length, 0);
  });
});

describe("reducer — Riscos", () => {
  it("ADD_RISCO e TOGGLE_RISCO_RESOLVIDO", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, {
      type: "ADD_RISCO",
      risco: {
        id: "r-1", descricao: "Risco de teste", probabilidade: "media", impacto: "alto",
        mitigacao: "Mit", canonico: false, resolvido: false,
      },
    });
    assert.ok(s1.riscos.some((r) => r.id === "r-1"), "risco adicionado deve estar na lista");
    const s2 = reducer(s1, { type: "TOGGLE_RISCO_RESOLVIDO", id: "r-1" });
    assert.equal(s2.riscos.find((r) => r.id === "r-1")?.resolvido, true);
  });
});

describe("reducer — Ação desconhecida não altera estado", () => {
  it("retorna o mesmo estado para ação não tratada", () => {
    const s0 = emptyState();
    const s1 = reducer(s0, { type: "UNKNOWN" as never });
    assert.strictEqual(s1, s0);
  });
});

describe("exportState / parseBackup", () => {
  it("exportState gera JSON com metadados", () => {
    const json = exportState(emptyState());
    const parsed = JSON.parse(json);
    assert.equal(parsed.app, "siheyuan-project-os");
    assert.ok(parsed.exportadoEm);
    assert.ok(parsed.state.principios.length > 0);
  });

  it("parseBackup rejeita JSON malformado", () => {
    assert.throws(() => parseBackup("{ não é json"));
  });

  it("parseBackup rejeita estado sem princípios canônicos", () => {
    const bad = JSON.stringify({ ...emptyState(), principios: [] });
    assert.throws(() => parseBackup(bad));
  });

  it("parseBackup rejeita estado com chave ausente", () => {
    const partial = JSON.stringify({ principios: [], versao: 1 });
    assert.throws(() => parseBackup(partial));
  });

  it("parseBackup aceita payload com envelope (app/versao/exportadoEm/state)", () => {
    const exported = exportState(emptyState());
    const parsed = parseBackup(exported);
    assert.ok(parsed.principios.length > 0);
  });

  it("parseBackup aceita estado puro sem envelope", () => {
    const raw = JSON.stringify(emptyState());
    const parsed = parseBackup(raw);
    assert.ok(parsed.principios.length > 0);
  });
});
