"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge, money } from "@/components/ui";
import type { EtapaStatus, Tarefa, TarefaStatus } from "@/domain/types";
import { newId } from "@/domain/store";

const ETAPA_STATUS: EtapaStatus[] = ["nao-iniciada", "em-andamento", "concluida", "bloqueada"];

export default function RoadmapPage() {
  const { state, dispatch, ready } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTarefa, setNewTarefa] = useState<{ etapaId: string; titulo: string }>({ etapaId: "", titulo: "" });

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { etapas, tarefas, riscos } = state;

  const totalOrcamento = etapas.reduce((s, e) => s + e.orcamento, 0);
  const totalCusto = etapas.reduce((s, e) => s + e.custoReal, 0);
  const etapasConcluidas = etapas.filter((e) => e.status === "concluida").length;
  const riscosEtapa = riscos.filter((r) => r.etapaId);

  function setStatus(id: string, status: EtapaStatus) {
    dispatch({ type: "SET_ETAPA_STATUS", id, status });
  }
  function addTarefa() {
    if (!newTarefa.titulo.trim() || !newTarefa.etapaId) return;
    const t: Tarefa = {
      id: newId("tarefa"),
      etapaId: newTarefa.etapaId,
      titulo: newTarefa.titulo,
      status: "a-fazer",
    };
    dispatch({ type: "ADD_TAREFA", tarefa: t });
    setNewTarefa({ etapaId: "", titulo: "" });
  }
  function cycleTarefaStatus(id: string) {
    const t = tarefas.find((x) => x.id === id);
    if (!t) return;
    const order: TarefaStatus[] = ["a-fazer", "em-andamento", "concluida", "bloqueada"];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    dispatch({ type: "UPDATE_TAREFA", tarefa: { ...t, status: next } });
  }

  return (
    <div>
      <PageHeader
        title="Roadmap do projeto"
        subtitle="Linha do tempo até a implantação do último artefato. Cada etapa com responsáveis, dependências, orçamento, riscos e critérios de conclusão."
        action={
          <div className="flex gap-2 text-sm">
            <span className="chip bg-mineral-100 text-mineral-600">
              {etapasConcluidas}/{etapas.length} concluídas
            </span>
            <span className="chip bg-leaf-500/15 text-leaf-700">{money(totalOrcamento)}</span>
          </div>
        }
      />

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-xs text-mineral-400">
          <span>Progresso</span>
          <span>{Math.round((etapasConcluidas / etapas.length) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-mineral-200">
          <div
            className="h-full bg-leaf-500 transition-all"
            style={{ width: `${(etapasConcluidas / etapas.length) * 100}%` }}
          />
        </div>
      </div>

      <ol className="space-y-2">
        {etapas.map((e) => {
          const expanded = expandedId === e.id;
          const etapaTarefas = tarefas.filter((t) => t.etapaId === e.id);
          const depNomes = e.dependencias.map((d) => etapas.find((x) => x.id === d)?.nome).filter(Boolean);
          return (
            <li key={e.id} className="card">
              <div className="card-pad">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                        e.status === "concluida"
                          ? "bg-leaf-500 text-white"
                          : e.status === "em-andamento"
                            ? "bg-blue-500 text-white"
                            : e.status === "bloqueada"
                              ? "bg-red-500 text-white"
                              : "bg-mineral-200 text-mineral-600"
                      }`}
                    >
                      {e.ordem}
                    </div>
                    <div>
                      <button
                        className="font-serif text-base text-mineral-800 hover:text-leaf-700"
                        onClick={() => setExpandedId(expanded ? null : e.id)}
                      >
                        {e.nome}
                      </button>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mineral-400">
                        <span>👥 {e.responsaveis.join(", ")}</span>
                        {depNomes.length > 0 && <span>↳ dep.: {depNomes.join(", ")}</span>}
                        <span>💰 {money(e.orcamento)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <select
                      className="input py-1 text-xs"
                      value={e.status}
                      onChange={(ev) => setStatus(e.id, ev.target.value as EtapaStatus)}
                    >
                      {ETAPA_STATUS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => setExpandedId(expanded ? null : e.id)} className="btn-ghost px-2 text-xs">
                      {expanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>
                {/* Riscos da etapa */}
                {e.riscos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.riscos.map((r, i) => (
                      <Badge key={i}>⚠ {r}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {expanded && (
                <div className="border-t border-mineral-100 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="label mb-1">Critérios de conclusão</div>
                      <ul className="space-y-1 text-sm text-mineral-600">
                        {e.criteriosConclusao.map((c, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 text-mineral-300">○</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="label mb-1">Orçamento</div>
                      <div className="text-sm text-mineral-700">
                        Previsto: {money(e.orcamento)} · Real: {money(e.custoReal)}
                      </div>
                    </div>
                  </div>

                  {/* Tarefas */}
                  <div className="mt-4">
                    <div className="label mb-2">Tarefas</div>
                    <div className="space-y-1">
                      {etapaTarefas.map((t) => (
                        <div key={t.id} className="flex items-center justify-between rounded-md border border-mineral-100 bg-white p-2 text-sm">
                          <span className="text-mineral-700">{t.titulo}</span>
                          <div className="flex items-center gap-2">
                            {t.responsavel && <span className="text-xs text-mineral-400">{t.responsavel}</span>}
                            <button onClick={() => cycleTarefaStatus(t.id)} title="Clicar para avançar">
                              <StatusChip status={t.status} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {etapaTarefas.length === 0 && <div className="text-xs text-mineral-400">Nenhuma tarefa.</div>}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        className="input flex-1 text-sm"
                        placeholder="Nova tarefa…"
                        value={expandedId === e.id && newTarefa.etapaId === e.id ? newTarefa.titulo : ""}
                        onChange={(ev) => setNewTarefa({ etapaId: e.id, titulo: ev.target.value })}
                        onKeyDown={(ev) => ev.key === "Enter" && addTarefa()}
                      />
                      <button onClick={addTarefa} className="btn-ghost text-xs">+ Tarefa</button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Riscos canônicos da etapa */}
      {riscosEtapa.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title mb-3">Riscos das etapas</h2>
          <div className="space-y-2">
            {riscosEtapa.map((r) => (
              <div key={r.id} className="card card-pad">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-mineral-800">{r.descricao}</div>
                  {r.canonico && <Badge tone="danger">canônico</Badge>}
                </div>
                <div className="mt-1 text-xs text-mineral-400">
                  {r.probabilidade}/{r.impacto} — {r.mitigacao}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
