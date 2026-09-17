import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectCanonicalConflicts, detectImplantacaoConflicts, principleById } from "../src/domain/conflicts.ts";
import type { Decisão, Implantação, PrincípioCanônico, ProgramaArea } from "../src/domain/types.ts";

const baseDecisao = (overrides: Partial<Decisão> = {}): Decisão => ({
  id: "test",
  titulo: "",
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
  createdAt: "",
  ...overrides,
});

const baseImplantacao = (overrides: Partial<Implantação> = {}): Implantação => ({
  id: "test",
  terrenoId: "terreno-1",
  variante: "A",
  deslocamentos: "",
  conflitos: [],
  custoEstimado: 0,
  custoMoeda: "BRL",
  ativa: false,
  ...overrides,
});

const basePrograma: ProgramaArea[] = [
  { id: "pa-1", ambienteKey: "greenhouse-library", nome: "Greenhouse Library", pavilhao: "Coração", area: 180, versao: "v1" },
  { id: "pa-2", ambienteKey: "pavilhao-a", nome: "Pavilhão A", pavilhao: "Pavilhão A", area: 600, versao: "v1" },
];

describe("detectCanonicalConflicts", () => {
  it("detecta redução da Greenhouse Library no título", () => {
    const d = baseDecisao({ titulo: "Reduzir a Greenhouse Library para cortar custo" });
    const conflicts = detectCanonicalConflicts(d);
    assert.ok(conflicts.length > 0);
    assert.ok(conflicts.some((c) => c.includes("Greenhouse Library")));
  });

  it("detecta redução da Greenhouse Library na descrição", () => {
    const d = baseDecisao({ titulo: "Estudo de área", descricao: "Diminuir a greenhouse para 120 m²" });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("detecta eliminação da Greenhouse Library nas opções", () => {
    const d = baseDecisao({ titulo: "Revisão", opcoes: ["Manter", "Eliminar a greenhouse"] });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("não detecta conflito em texto neutro sobre a Greenhouse", () => {
    const d = baseDecisao({ titulo: "Preservar a Greenhouse Library na implantação B" });
    assert.equal(detectCanonicalConflicts(d).length, 0);
  });

  it("detecta dissolução da cidadela doméstica", () => {
    const d = baseDecisao({ titulo: "Espalhar a cidadela pelo terreno" });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("detecta ateliê no Pavilhão A", () => {
    const d = baseDecisao({ titulo: "Inserir ateliê no Pavilhão A" });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("detecta hospitalidade convertida em hotel", () => {
    const d = baseDecisao({ titulo: "Tornar a hospitalidade em alojamento institucional" });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("detecta exterior transparente", () => {
    const d = baseDecisao({ titulo: "Tornar o exterior de vidro" });
    assert.ok(detectCanonicalConflicts(d).length > 0);
  });

  it("retorna array vazio para decisão canonicamente segura", () => {
    const d = baseDecisao({ titulo: "Definir forro da capela externa", descricao: "Madeira tratada vs lambris de cal" });
    assert.equal(detectCanonicalConflicts(d).length, 0);
  });

  it("deduplica conflitos repetidos", () => {
    const d = baseDecisao({
      titulo: "Reduzir a greenhouse e diminuir a greenhouse",
      descricao: "Cortar a greenhouse",
    });
    const conflicts = detectCanonicalConflicts(d);
    const unique = new Set(conflicts);
    assert.equal(conflicts.length, unique.size);
  });
});

describe("detectImplantacaoConflicts", () => {
  it("detecta redução da Greenhouse Library na implantação", () => {
    const imp = baseImplantacao({ deslocamentos: "Reduzir a greenhouse para caber no terreno" });
    assert.ok(detectImplantacaoConflicts(imp, basePrograma).length > 0);
  });

  it("detecta dissolução da cidadela na implantação", () => {
    const imp = baseImplantacao({ deslocamentos: "Fragmentar a cidadela em pavilhões espalhados" });
    assert.ok(detectImplantacaoConflicts(imp, basePrograma).length > 0);
  });

  it("preserva conflitos já marcados na implantação", () => {
    const imp = baseImplantacao({ conflitos: ["Conflito pré-existente"] });
    const result = detectImplantacaoConflicts(imp, basePrograma);
    assert.ok(result.includes("Conflito pré-existente"));
  });

  it("não gera conflito para implantação canonicamente segura", () => {
    const imp = baseImplantacao({ deslocamentos: "Pavilhão B deslocado 18 m; Greenhouse Library preservada" });
    assert.equal(detectImplantacaoConflicts(imp, basePrograma).length, 0);
  });
});

describe("principleById", () => {
  it("encontra o princípio pelo id", () => {
    const principios: PrincípioCanônico[] = [
      { id: "princ-001", enunciado: "Greenhouse", categoria: "essencia", imutavel: true },
    ];
    assert.ok(principleById(principios, "princ-001"));
  });

  it("retorna undefined para id inexistente", () => {
    assert.equal(principleById([], "princ-999"), undefined);
  });
});
