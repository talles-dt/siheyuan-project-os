"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge, money } from "@/components/ui";
import type { Decisão, DecisaoStatus, Reversibilidade, Material, MaterialStatus, PavilhaoKey } from "@/domain/types";

const DECISAO_STATUS: DecisaoStatus[] = ["pendente", "aprovada", "rejeitada", "proibida"];
const REVERSIBILIDADE: Reversibilidade[] = ["reversivel", "parcial", "irreversivel"];
const MATERIAL_STATUS: MaterialStatus[] = [
  "conceito",
  "cotado",
  "amostra",
  "aprovado",
  "pedido",
  "recebido",
  "instalado",
  "garantia",
];

const AMBIENTES: PavilhaoKey[] = [
  "portal",
  "chegada",
  "pavilhao-a",
  "greenhouse-library",
  "pavilhao-b",
  "laboratorio-perfumaria",
  "pavilhao-c",
  "patio-social",
  "jardim-aromatico",
  "capela-domestica",
  "capela-externa",
  "zona-produtiva",
  "infra-rural",
  "interiores-artefatos",
];

const blankDecisao = () => ({
  titulo: "",
  descricao: "",
  opcoes: "",
  impactoPrograma: "",
  custo: 0,
  custoMoeda: "BRL",
  risco: "",
  aprovador: "",
  reversibilidade: "reversivel" as Reversibilidade,
  principioIds: "",
  status: "pendente" as DecisaoStatus,
  ambienteKey: "" as PavilhaoKey | "",
  respostaPerguntaCentral: "",
});

const blankMaterial = () => ({
  referencia: "",
  descricao: "",
  ambienteKey: "" as PavilhaoKey | "",
  alternativas: "",
  preco: 0,
  moeda: "BRL",
  status: "conceito" as MaterialStatus,
});

export default function ComprasDecisoesPage() {
  const { state, dispatch, helpers, ready, pode } = useStore();
  const podeDecisao = pode("decisao:write");
  const podeMaterial = pode("material:write");
  const [tab, setTab] = useState<"decisoes" | "materiais">("decisoes");
  const [showDecForm, setShowDecForm] = useState(false);
  const [showMatForm, setShowMatForm] = useState(false);
  const [decForm, setDecForm] = useState(blankDecisao());
  const [matForm, setMatForm] = useState(blankMaterial());
  const [previewConflicts, setPreviewConflicts] = useState<string[]>([]);

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { decisoes, materiais } = state;

  function previewDecisao() {
    const draft: Decisão = {
      id: "preview",
      titulo: decForm.titulo,
      descricao: decForm.descricao,
      opcoes: decForm.opcoes.split("\n").filter(Boolean),
      impactoPrograma: decForm.impactoPrograma,
      custo: decForm.custo,
      custoMoeda: decForm.custoMoeda,
      risco: decForm.risco,
      reversibilidade: decForm.reversibilidade,
      principioIds: decForm.principioIds ? decForm.principioIds.split(",").map((s) => s.trim()) : [],
      conflitos: [],
      perguntaCentral: "",
      status: decForm.status,
      createdAt: new Date().toISOString(),
      ambienteKey: decForm.ambienteKey || undefined,
    };
    setPreviewConflicts(helpers.conflictsForDecisao(draft));
  }

  function submitDecisao() {
    if (!decForm.titulo.trim()) return;
    helpers.addDecisao({
      titulo: decForm.titulo,
      descricao: decForm.descricao,
      opcoes: decForm.opcoes.split("\n").filter(Boolean),
      impactoPrograma: decForm.impactoPrograma,
      custo: decForm.custo,
      custoMoeda: decForm.custoMoeda,
      risco: decForm.risco,
      aprovador: decForm.aprovador || undefined,
      data: new Date().toISOString(),
      reversibilidade: decForm.reversibilidade,
      principioIds: decForm.principioIds ? decForm.principioIds.split(",").map((s) => s.trim()) : [],
      status: decForm.status,
      ambienteKey: decForm.ambienteKey || undefined,
      respostaPerguntaCentral: decForm.respostaPerguntaCentral || undefined,
    });
    setDecForm(blankDecisao());
    setPreviewConflicts([]);
    setShowDecForm(false);
  }

  function submitMaterial() {
    if (!matForm.referencia.trim()) return;
    const m: Material = {
      id: `mat-${Date.now().toString(36)}`,
      referencia: matForm.referencia,
      descricao: matForm.descricao,
      ambienteKey: matForm.ambienteKey || undefined,
      alternativasEquivalentes: matForm.alternativas.split("\n").filter(Boolean),
      preco: matForm.preco || undefined,
      moeda: matForm.moeda,
      status: matForm.status,
    };
    dispatch({ type: "ADD_MATERIAL", material: m });
    setMatForm(blankMaterial());
    setShowMatForm(false);
  }

  return (
    <div>
      <PageHeader
        title="Compras & Decisões"
        subtitle="Diário de decisões com pergunta central e reversibilidade, e gestão de materiais — referências podem ser registradas sem virar decisão irrevogável."
        action={
          tab === "decisoes" ? (
            podeDecisao ? (
              <button onClick={() => setShowDecForm((v) => !v)} className="btn-primary">
                + Nova decisão
              </button>
            ) : (
              <span className="text-xs italic text-mineral-400">Sem permissão (decisao:write)</span>
            )
          ) : podeMaterial ? (
            <button onClick={() => setShowMatForm((v) => !v)} className="btn-primary">
              + Novo material
            </button>
          ) : (
            <span className="text-xs italic text-mineral-400">Sem permissão (material:write)</span>
          )
        }
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-mineral-200 bg-white p-1">
        <button
          onClick={() => setTab("decisoes")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "decisoes" ? "bg-mineral-800 text-white" : "text-mineral-500 hover:text-mineral-800"
          }`}
        >
          Decisões ({decisoes.length})
        </button>
        <button
          onClick={() => setTab("materiais")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "materiais" ? "bg-mineral-800 text-white" : "text-mineral-500 hover:text-mineral-800"
          }`}
        >
          Materiais ({materiais.length})
        </button>
      </div>

      {tab === "decisoes" && (
        <div>
          {/* Pergunta central banner */}
          <div className="mb-4 card card-pad border-l-4 border-l-ocher-500 bg-mineral-50">
            <div className="label mb-1">Pergunta central</div>
            <p className="font-serif text-base italic text-mineral-700">
              “Esta escolha ajuda a construir uma vida mais profunda, mais bela, mais tranquila e mais significativa?”
            </p>
          </div>

          {showDecForm && (
            <div className="mb-6 card card-pad">
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label">Título *</label>
                  <input className="input" value={decForm.titulo} onChange={(e) => setDecForm({ ...decForm, titulo: e.target.value })} onBlur={previewDecisao} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Descrição</label>
                  <textarea className="input" rows={2} value={decForm.descricao} onChange={(e) => setDecForm({ ...decForm, descricao: e.target.value })} onBlur={previewDecisao} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Opções (uma por linha)</label>
                  <textarea className="input" rows={2} value={decForm.opcoes} onChange={(e) => setDecForm({ ...decForm, opcoes: e.target.value })} placeholder={"Opção A\nOpção B"} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Impacto no programa</label>
                  <input className="input" value={decForm.impactoPrograma} onChange={(e) => setDecForm({ ...decForm, impactoPrograma: e.target.value })} onBlur={previewDecisao} />
                </div>
                <div>
                  <label className="field-label">Custo</label>
                  <input type="number" className="input" value={decForm.custo || ""} onChange={(e) => setDecForm({ ...decForm, custo: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="field-label">Risco</label>
                  <input className="input" value={decForm.risco} onChange={(e) => setDecForm({ ...decForm, risco: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Quem aprova</label>
                  <input className="input" value={decForm.aprovador} onChange={(e) => setDecForm({ ...decForm, aprovador: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Reversibilidade</label>
                  <select className="input" value={decForm.reversibilidade} onChange={(e) => setDecForm({ ...decForm, reversibilidade: e.target.value as Reversibilidade })}>
                    {REVERSIBILIDADE.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Status</label>
                  <select className="input" value={decForm.status} onChange={(e) => setDecForm({ ...decForm, status: e.target.value as DecisaoStatus })}>
                    {DECISAO_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Ambiente</label>
                  <select className="input" value={decForm.ambienteKey} onChange={(e) => setDecForm({ ...decForm, ambienteKey: e.target.value as PavilhaoKey })}>
                    <option value="">—</option>
                    {AMBIENTES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Princípios vinculados (IDs separados por vírgula)</label>
                  <input className="input" value={decForm.principioIds} onChange={(e) => setDecForm({ ...decForm, principioIds: e.target.value })} placeholder="princ-001, princ-004" />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Resposta à pergunta central</label>
                  <textarea className="input" rows={2} value={decForm.respostaPerguntaCentral} onChange={(e) => setDecForm({ ...decForm, respostaPerguntaCentral: e.target.value })} />
                </div>
              </div>

              {previewConflicts.length > 0 && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3">
                  <div className="mb-1 text-sm font-medium text-red-700">⚠ Conflito canônico detectado</div>
                  {previewConflicts.map((c, i) => <div key={i} className="text-sm text-red-600">• {c}</div>)}
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={submitDecisao} className="btn-primary">Registrar decisão</button>
                <button onClick={previewDecisao} className="btn-ghost">Verificar conflitos</button>
                <button onClick={() => setShowDecForm(false)} className="btn-ghost">Cancelar</button>
              </div>
            </div>
          )}

          {/* Decisões list */}
          <div className="space-y-3">
            {decisoes.slice().reverse().map((d) => (
              <div key={d.id} className="card card-pad">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-mineral-800">{d.titulo}</div>
                    {d.descricao && <div className="mt-1 text-sm text-mineral-600">{d.descricao}</div>}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mineral-400">
                      <span>{money(d.custo, d.custoMoeda)}</span>
                      <span>reversibilidade: {d.reversibilidade}</span>
                      {d.aprovador && <span>aprovação: {d.aprovador}</span>}
                      {d.ambienteKey && <span>ambiente: {d.ambienteKey}</span>}
                    </div>
                    {d.opcoes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.opcoes.map((o, i) => <Badge key={i}>{o}</Badge>)}
                      </div>
                    )}
                    {d.respostaPerguntaCentral && (
                      <div className="mt-2 rounded-md bg-mineral-50 p-2 text-xs italic text-mineral-500">
                        “{d.respostaPerguntaCentral}”
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <StatusChip status={d.status} />
                    {d.conflitos.length > 0 && (
                      <div className="flex flex-col items-end gap-1">
                        {d.conflitos.map((c, i) => <Badge key={i} tone="danger">{c}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {decisoes.length === 0 && (
              <div className="text-sm text-mineral-400">Nenhuma decisão registrada. O diário protege a intenção contra improvisações.</div>
            )}
          </div>
        </div>
      )}

      {tab === "materiais" && (
        <div>
          <div className="mb-4 rounded-md border border-mineral-200 bg-mineral-50 p-3 text-xs text-mineral-500">
            Uma referência de equipamento ou material pode ser registrada como <strong>conceito</strong> sem transformar-se em decisão irrevogável.
            O status avança: conceito → cotado → amostra → aprovado → pedido → recebido → instalado → garantia.
          </div>

          {showMatForm && (
            <div className="mb-6 card card-pad">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="field-label">Referência *</label>
                  <input className="input" value={matForm.referencia} onChange={(e) => setMatForm({ ...matForm, referencia: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Descrição</label>
                  <input className="input" value={matForm.descricao} onChange={(e) => setMatForm({ ...matForm, descricao: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Ambiente</label>
                  <select className="input" value={matForm.ambienteKey} onChange={(e) => setMatForm({ ...matForm, ambienteKey: e.target.value as PavilhaoKey })}>
                    <option value="">—</option>
                    {AMBIENTES.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Preço</label>
                  <input type="number" className="input" value={matForm.preco || ""} onChange={(e) => setMatForm({ ...matForm, preco: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="field-label">Status</label>
                  <select className="input" value={matForm.status} onChange={(e) => setMatForm({ ...matForm, status: e.target.value as MaterialStatus })}>
                    {MATERIAL_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label">Alternativas equivalentes (uma por linha)</label>
                  <textarea className="input" rows={2} value={matForm.alternativas} onChange={(e) => setMatForm({ ...matForm, alternativas: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={submitMaterial} className="btn-primary">Registrar material</button>
                <button onClick={() => setShowMatForm(false)} className="btn-ghost">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {materiais.map((m) => (
              <div key={m.id} className="card card-pad flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-mineral-800">{m.referencia}</div>
                  <div className="text-xs text-mineral-400">
                    {m.descricao}{m.ambienteKey && ` · ${m.ambienteKey}`}{m.preco && ` · ${money(m.preco, m.moeda)}`}
                  </div>
                  {m.alternativasEquivalentes.length > 0 && (
                    <div className="mt-1 text-xs text-mineral-400">Alternativas: {m.alternativasEquivalentes.join(", ")}</div>
                  )}
                </div>
                <StatusChip status={m.status} />
              </div>
            ))}
            {materiais.length === 0 && (
              <div className="text-sm text-mineral-400">Nenhum material registrado. Referências de conceito não viram decisão.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
