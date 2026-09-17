"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge, EmptyState, money } from "@/components/ui";
import type { Implantação } from "@/domain/types";

const blankImpl = (terrenoId: string): Omit<Implantação, "id" | "conflitos"> => ({
  terrenoId,
  variante: "",
  deslocamentos: "",
  custoEstimado: 0,
  custoMoeda: "BRL",
  ativa: false,
  notas: "",
});

export default function ImplantacoesPage() {
  const { state, dispatch, ready, pode, helpers } = useStore();
  const [terrenoFiltro, setTerrenoFiltro] = useState<string>("todos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Implantação, "id" | "conflitos">>(blankImpl(""));

  const podeWrite = pode("implantacao:write");

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { implantacoes, terrenos, decisoes } = state;

  function startCreate(terrenoId: string) {
    setForm(blankImpl(terrenoId));
    setShowForm(true);
  }

  function submitForm() {
    if (!form.variante.trim() || !form.terrenoId) return;
    helpers.addImplantacao(form);
    setShowForm(false);
  }

  function ativar(impl: Implantação) {
    const outras = implantacoes.filter((i) => i.terrenoId === impl.terrenoId && i.id !== impl.id);
    outras.forEach((o) => dispatch({ type: "UPDATE_IMPLANTACAO", implantacao: { ...o, ativa: false } }));
    dispatch({ type: "UPDATE_IMPLANTACAO", implantacao: { ...impl, ativa: true } });
  }

  function desativar(impl: Implantação) {
    dispatch({ type: "UPDATE_IMPLANTACAO", implantacao: { ...impl, ativa: false } });
  }

  function decisoesDeImplantacao(implId: string) {
    return decisoes.filter((d) => d.implantacaoId === implId);
  }

  const terrenosAtivos = terrenos.filter((t) => t.status !== "descartado");
  const filtradas = terrenoFiltro === "todos" ? implantacoes : implantacoes.filter((i) => i.terrenoId === terrenoFiltro);

  const custoMin = implantacoes.length > 0 ? Math.min(...implantacoes.map((i) => i.custoEstimado)) : 0;
  const custoMax = implantacoes.length > 0 ? Math.max(...implantacoes.map((i) => i.custoEstimado)) : 0;
  const totalConflitos = implantacoes.reduce((s, i) => s + i.conflitos.length, 0);

  return (
    <div>
      <PageHeader
        title="Terrenos & implantações"
        subtitle="Visão cruzada: núcleo canônico × terrenos × variantes × custo × conflitos. Comparar o mesmo núcleo siheyuan em terrenos diferentes sem redesenhar a filosofia."
        action={
          podeWrite && terrenosAtivos.length > 0 ? (
            <select
              className="input max-w-xs"
              value=""
              onChange={(e) => { if (e.target.value) startCreate(e.target.value); }}
            >
              <option value="">+ Nova variante em…</option>
              {terrenosAtivos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          ) : podeWrite ? (
            <span className="text-xs italic text-mineral-400">Cadastre um terreno primeiro</span>
          ) : (
            <span className="text-xs italic text-mineral-400">Sem permissão (implantacao:write)</span>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <div className="card card-pad">
          <div className="label">Terrenos ativos</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{terrenosAtivos.length}</div>
        </div>
        <div className="card card-pad">
          <div className="label">Variantes</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{implantacoes.length}</div>
        </div>
        <div className="card card-pad">
          <div className="label">Faixa de custo</div>
          <div className="mt-1 font-serif text-sm text-mineral-800">
            {money(custoMin)} – {money(custoMax)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="label">Conflitos canônicos</div>
          <div className={`mt-1 font-serif text-2xl ${totalConflitos > 0 ? "text-red-700" : "text-leaf-700"}`}>{totalConflitos}</div>
        </div>
      </div>

      {terrenos.length === 0 ? (
        <EmptyState message="Nenhum terreno cadastrado. Cadastre terrenos candidatos para gerar e comparar implantações alternativas." />
      ) : (
        <>
          {terrenos.length > 1 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTerrenoFiltro("todos")}
                className={`chip ${terrenoFiltro === "todos" ? "bg-mineral-800 text-white" : "bg-mineral-100 text-mineral-600"}`}
              >
                Todos
              </button>
              {terrenos.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTerrenoFiltro(t.id)}
                  className={`chip ${terrenoFiltro === t.id ? "bg-mineral-800 text-white" : "bg-mineral-100 text-mineral-600"}`}
                >
                  {t.nome}
                </button>
              ))}
            </div>
          )}

          {showForm && podeWrite && (
            <div className="mb-6 card card-pad">
              <h2 className="section-title mb-4">Nova variante de implantação</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="field-label">Terreno</label>
                  <input className="input" disabled value={terrenos.find((t) => t.id === form.terrenoId)?.nome ?? ""} />
                </div>
                <div>
                  <label className="field-label">Variante *</label>
                  <input className="input" value={form.variante} onChange={(e) => setForm({ ...form, variante: e.target.value })} placeholder="A, B, C..." />
                </div>
                <div>
                  <label className="field-label">Custo estimado</label>
                  <input type="number" className="input" value={form.custoEstimado} onChange={(e) => setForm({ ...form, custoEstimado: Number(e.target.value) })} />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="field-label">Deslocamentos</label>
                  <textarea className="input" rows={2} value={form.deslocamentos} onChange={(e) => setForm({ ...form, deslocamentos: e.target.value })} placeholder="Pavilhão B deslocado 18 m; Greenhouse Library preservada; jardim aromático ampliado" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="field-label">Notas</label>
                  <textarea className="input" rows={2} value={form.notas ?? ""} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={submitForm} className="btn-primary">Criar variante</button>
                <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
              </div>
            </div>
          )}

          {filtradas.length === 0 ? (
            <EmptyState message="Nenhuma variante de implantação para este terreno." />
          ) : (
            <div className="space-y-4">
              {terrenos
                .filter((t) => terrenoFiltro === "todos" || t.id === terrenoFiltro)
                .filter((t) => t.status !== "descartado" || terrenoFiltro === t.id)
                .map((t) => {
                  const tImpls = filtradas.filter((i) => i.terrenoId === t.id);
                  if (tImpls.length === 0) return null;
                  return (
                    <div key={t.id}>
                      <div className="mb-2 flex items-center gap-2">
                        <h2 className="section-title">{t.nome}</h2>
                        <StatusChip status={t.status} />
                        <Badge>{tImpls.length} variante(s)</Badge>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {tImpls.map((impl) => {
                          const implDecisoes = decisoesDeImplantacao(impl.id);
                          return (
                            <div key={impl.id} className={`card card-pad ${impl.ativa ? "border-l-4 border-l-leaf-500" : ""}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="font-serif text-lg text-mineral-800">Variante {impl.variante}</div>
                                  {impl.ativa && <Badge tone="ok">ativa</Badge>}
                                </div>
                                {podeWrite && (impl.ativa ? (
                                  <button onClick={() => desativar(impl)} className="btn-ghost text-xs">Desativar</button>
                                ) : (
                                  <button onClick={() => ativar(impl)} className="btn-ghost text-xs">Ativar</button>
                                ))}
                              </div>
                              <div className="mt-2 text-xs text-mineral-400">{impl.deslocamentos || "Sem deslocamentos"}</div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="text-sm font-medium text-mineral-800">{money(impl.custoEstimado, impl.custoMoeda)}</div>
                              </div>
                              {impl.notas && <div className="mt-2 text-xs text-mineral-500">{impl.notas}</div>}
                              {impl.conflitos.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {impl.conflitos.map((c, i) => (
                                    <Badge key={i} tone="danger">⚠ {c}</Badge>
                                  ))}
                                </div>
                              )}
                              {implDecisoes.length > 0 && (
                                <div className="mt-3 border-t border-mineral-100 pt-2">
                                  <div className="label mb-1">Decisões vinculadas ({implDecisoes.length})</div>
                                  <div className="space-y-1">
                                    {implDecisoes.map((d) => (
                                      <div key={d.id} className="flex items-center justify-between text-xs">
                                        <span className="truncate text-mineral-600">{d.titulo}</span>
                                        <StatusChip status={d.status} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Cross-terrain comparison table */}
          {implantacoes.length > 0 && terrenosAtivos.length > 1 && (
            <div className="mt-8">
              <h2 className="section-title mb-3">Comparação cruzada de custo</h2>
              <div className="overflow-x-auto">
                <table className="card w-full text-sm">
                  <thead>
                    <tr className="border-b border-mineral-200 text-left">
                      <th className="label p-3">Terreno</th>
                      <th className="label p-3">Variante</th>
                      <th className="label p-3 text-right">Custo</th>
                      <th className="label p-3">Ativa</th>
                      <th className="label p-3">Conflitos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map((impl) => {
                      const t = terrenos.find((x) => x.id === impl.terrenoId);
                      return (
                        <tr key={impl.id} className={`border-b border-mineral-100 last:border-0 ${impl.ativa ? "bg-leaf-500/5" : ""}`}>
                          <td className="p-3 text-mineral-700">{t?.nome ?? "—"}</td>
                          <td className="p-3 text-mineral-600">{impl.variante}</td>
                          <td className="p-3 text-right font-medium text-mineral-800">{money(impl.custoEstimado, impl.custoMoeda)}</td>
                          <td className="p-3">{impl.ativa ? <Badge tone="ok">sim</Badge> : <span className="text-mineral-300">—</span>}</td>
                          <td className="p-3">
                            {impl.conflitos.length > 0 ? (
                              <Badge tone="danger">{impl.conflitos.length}</Badge>
                            ) : (
                              <Badge tone="ok">0</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
