"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, EmptyState, Badge, money, area } from "@/components/ui";
import type { Terreno, TerrenoStatus, Implantação } from "@/domain/types";
import { newId } from "@/domain/store";

const STATUS_FLOW: TerrenoStatus[] = [
  "descoberta",
  "visita",
  "diligencia",
  "finalista",
  "descartado",
  "adquirido",
];

const blankTerreno = (): Omit<Terreno, "id" | "criterioIds" | "implantacaoIds" | "createdAt"> => ({
  nome: "",
  local: "",
  area: 0,
  topografia: "",
  agua: "",
  acesso: "",
  orientacao: "",
  ruido: "",
  restricoesAmbientais: "",
  fotos: [],
  mapas: [],
  documentos: [],
  contatos: [],
  status: "descoberta",
});

export default function TerrenosPage() {
  const { state, dispatch, helpers, ready, pode } = useStore();
  const podeWrite = pode("terreno:write");
  const podeDelete = pode("terreno:delete");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blankTerreno());
  const [selected, setSelected] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { terrenos, implantacoes, criterios, principios } = state;

  function startCreate() {
    setForm(blankTerreno());
    setEditId(null);
    setShowForm(true);
  }
  function startEdit(t: Terreno) {
    const { id, criterioIds, implantacaoIds, createdAt, ...rest } = t;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  }
  function submitForm() {
    if (!form.nome.trim()) return;
    if (editId) {
      const existing = terrenos.find((t) => t.id === editId)!;
      dispatch({ type: "UPDATE_TERRENO", terreno: { ...existing, ...form } });
    } else {
      helpers.addTerreno(form);
    }
    setShowForm(false);
    setEditId(null);
  }

  function cycleStatus(id: string) {
    const t = terrenos.find((x) => x.id === id);
    if (!t) return;
    const idx = STATUS_FLOW.indexOf(t.status);
    const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
    dispatch({ type: "UPDATE_TERRENO", terreno: { ...t, status: next } });
  }

  function addCriterion(terrenoId: string, principioId: string) {
    const exists = criterios.find((c) => c.terrenoId === terrenoId && c.principioId === principioId);
    if (exists) return;
    dispatch({
      type: "ADD_CRITERIO",
      criterio: {
        id: newId("crit"),
        terrenoId,
        principioId,
        peso: 1,
        resultado: "pendente",
      },
    });
  }

  function addCriterionForDetail(principioId: string) {
    if (detailId) addCriterion(detailId, principioId);
  }

  function addImplantacaoForDetail() {
    if (!detailId) return;
    const variante = String.fromCharCode(65 + implantacoes.filter((i) => i.terrenoId === detailId).length);
    const imp: Implantação = {
      id: newId("impl"),
      terrenoId: detailId,
      variante,
      deslocamentos: "",
      conflitos: [],
      custoEstimado: 0,
      custoMoeda: "BRL",
      ativa: false,
      notas: "",
    };
    dispatch({ type: "ADD_IMPLANTACAO", implantacao: imp });
  }

  const detail = detailId ? terrenos.find((t) => t.id === detailId) : null;
  const detailImplantacoes = detailId ? implantacoes.filter((i) => i.terrenoId === detailId) : [];
  const detailCriterios = detailId ? criterios.filter((c) => c.terrenoId === detailId) : [];

  const comparar = selected.length === 2 ? selected.map((id) => terrenos.find((t) => t.id === id)!) : [];

  return (
    <div>
      <PageHeader
        title="Terrenos candidatos"
        subtitle="Avalie o terreno contra a casa, não contra o terreno sozinho. Checklist canônico, implantações e comparação lado a lado."
        action={
          <div className="flex gap-2">
            {selected.length === 2 && (
              <span className="chip bg-leaf-500/15 text-leaf-700">{selected.length} selecionados — comparar</span>
            )}
            {podeWrite ? (
              <button onClick={startCreate} className="btn-primary">
                + Novo terreno
              </button>
            ) : (
              <span className="text-xs italic text-mineral-400">Sem permissão (terreno:write)</span>
            )}
          </div>
        }
      />

      {showForm && (
        <div className="mb-6 card card-pad">
          <h2 className="section-title mb-4">{editId ? "Editar terreno" : "Novo terreno"}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label">Nome *</label>
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Local</label>
              <input className="input" value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Área (m²)</label>
              <input
                type="number"
                className="input"
                value={form.area || ""}
                onChange={(e) => setForm({ ...form, area: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">Topografia</label>
              <input className="input" value={form.topografia} onChange={(e) => setForm({ ...form, topografia: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Água</label>
              <input className="input" value={form.agua} onChange={(e) => setForm({ ...form, agua: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Acesso</label>
              <input className="input" value={form.acesso} onChange={(e) => setForm({ ...form, acesso: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Orientação</label>
              <input className="input" value={form.orientacao} onChange={(e) => setForm({ ...form, orientacao: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Ruído</label>
              <input className="input" value={form.ruido} onChange={(e) => setForm({ ...form, ruido: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Restrições ambientais</label>
              <input
                className="input"
                value={form.restricoesAmbientais}
                onChange={(e) => setForm({ ...form, restricoesAmbientais: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TerrenoStatus })}
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submitForm} className="btn-primary">
              {editId ? "Salvar" : "Criar"}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {terrenos.length === 0 && !showForm ? (
        <EmptyState message="Nenhum terreno cadastrado. Comece pela descoberta de uma propriedade candidata." />
      ) : (
        <div className="space-y-3">
          {terrenos.map((t) => {
            const impls = implantacoes.filter((i) => i.terrenoId === t.id);
            const activeImpl = impls.find((i) => i.ativa);
            return (
              <div key={t.id} className="card card-pad">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selected.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelected([...selected.filter((s) => s !== t.id), t.id].slice(-2));
                        else setSelected(selected.filter((s) => s !== t.id));
                      }}
                    />
                    <div>
                      <button
                        className="font-serif text-lg text-mineral-800 hover:text-leaf-700"
                        onClick={() => setDetailId(t.id)}
                      >
                        {t.nome}
                      </button>
                      <div className="text-sm text-mineral-500">{t.local}</div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-mineral-400">
                        <span>{area(t.area)}</span>
                        {t.agua && <span>💧 {t.agua}</span>}
                        {t.acesso && <span>🛣️ {t.acesso}</span>}
                        {t.restricoesAmbientais && <span>⚠ {t.restricoesAmbientais}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeImpl && <Badge tone="ok">Variante {activeImpl.variante} · {money(activeImpl.custoEstimado, activeImpl.custoMoeda)}</Badge>}
                    <button onClick={() => cycleStatus(t.id)} title="Clicar para avançar status">
                      <StatusChip status={t.status} />
                    </button>
                    {podeWrite && (
                      <button onClick={() => startEdit(t)} className="btn-ghost text-xs">Editar</button>
                    )}
                    {podeDelete && (
                      <button
                        onClick={() => dispatch({ type: "REMOVE_TERRENO", id: t.id })}
                        className="btn-danger text-xs"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
                {impls.length > 0 && (
                  <div className="mt-3 border-t border-mineral-100 pt-2 text-xs text-mineral-400">
                    {impls.length} implantação(ões): {impls.map((i) => `${i.variante}${i.ativa ? " (ativa)" : ""}`).join(" · ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Compare */}
      {comparar.length === 2 && (
        <div className="mt-8">
          <h2 className="section-title mb-3">Comparação lado a lado</h2>
          <div className="overflow-x-auto">
            <table className="card w-full text-sm">
              <tbody>
                {(["nome", "local", "area", "agua", "acesso", "orientacao", "ruido", "restricoesAmbientais", "status"] as const).map((field) => (
                  <tr key={field} className="border-b border-mineral-100 last:border-0">
                    <td className="label w-40 p-3 align-top">{field}</td>
                    {comparar.map((t) => (
                      <td key={t.id} className="p-3 align-top text-mineral-700">
                        {field === "area" ? area(t[field]) : field === "status" ? <StatusChip status={t[field]} /> : String(t[field] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-mineral-900/30" onClick={() => setDetailId(null)}>
          <div
            className="h-full w-full max-w-xl overflow-y-auto bg-mineral-50 p-6 shadow-xl scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-xl text-mineral-800">{detail.nome}</h2>
              <button onClick={() => setDetailId(null)} className="btn-ghost text-xs">Fechar ✕</button>
            </div>
            <StatusChip status={detail.status} />
            <div className="mt-4 space-y-1 text-sm text-mineral-600">
              <div><span className="text-mineral-400">Local:</span> {detail.local || "—"}</div>
              <div><span className="text-mineral-400">Área:</span> {area(detail.area)}</div>
              <div><span className="text-mineral-400">Topografia:</span> {detail.topografia || "—"}</div>
              <div><span className="text-mineral-400">Água:</span> {detail.agua || "—"}</div>
              <div><span className="text-mineral-400">Acesso:</span> {detail.acesso || "—"}</div>
              <div><span className="text-mineral-400">Orientação:</span> {detail.orientacao || "—"}</div>
              <div><span className="text-mineral-400">Ruído:</span> {detail.ruido || "—"}</div>
              <div><span className="text-mineral-400">Restrições ambientais:</span> {detail.restricoesAmbientais || "—"}</div>
            </div>

            {/* Checklist canônico */}
            <div className="mt-6">
              <h3 className="section-title mb-2">Checklist canônico</h3>
              <p className="mb-3 text-xs text-mineral-400">Avalie o terreno contra cada princípio canônico.</p>
              <div className="space-y-1">
                {principios.map((p) => {
                  const crit = detailCriterios.find((c) => c.principioId === p.id);
                  return (
                    <div key={p.id} className="flex items-start gap-2 rounded-md border border-mineral-100 bg-white p-2 text-sm">
                      <span className="mt-0.5 text-leaf-600">◆</span>
                      <div className="flex-1">
                        <div className="text-mineral-700">{p.enunciado}</div>
                        {crit ? (
                          <div className="mt-1">
                            <select className="input py-1 text-xs" value={crit.resultado} disabled>
                              <option value="pendente">pendente</option>
                              <option value="aprovado">aprovado</option>
                              <option value="parcial">parcial</option>
                              <option value="reprovado">reprovado</option>
                            </select>
                          </div>
                        ) : (
                          <button onClick={() => addCriterionForDetail(p.id)} className="mt-1 text-xs text-mineral-500 hover:text-leaf-700">
                            + avaliar contra este princípio
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Implantações */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="section-title">Implantações</h3>
                <button onClick={addImplantacaoForDetail} className="btn-ghost text-xs">+ Variante</button>
              </div>
              <div className="space-y-2">
                {detailImplantacoes.map((imp) => (
                  <div key={imp.id} className={`card card-pad ${imp.ativa ? "border-l-4 border-l-leaf-500" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-mineral-800">Variante {imp.variante}{imp.ativa ? " · ativa" : ""}</div>
                      <div className="text-sm text-mineral-600">{money(imp.custoEstimado, imp.custoMoeda)}</div>
                    </div>
                    <div className="mt-1 text-xs text-mineral-500">{imp.deslocamentos || "Deslocamentos a definir"}</div>
                    {imp.conflitos.length > 0 && (
                      <div className="mt-2">
                        {imp.conflitos.map((c, i) => (
                          <Badge key={i} tone="danger">{c}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {detailImplantacoes.length === 0 && <div className="text-sm text-mineral-400">Nenhuma implantação. Adicione variantes para comparar.</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
