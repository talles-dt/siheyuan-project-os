"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge, EmptyState, area } from "@/components/ui";
import type { Ambiente, Artefato, AmbienteCategoria, PavilhaoKey, ArtefatoStatus } from "@/domain/types";

const CATEGORIAS: AmbienteCategoria[] = [
  "nucleo",
  "patio",
  "hospitalidade",
  "rural",
  "infraestrutura",
  "espiritual",
  "interior",
];

const PAVILHAO_KEYS: PavilhaoKey[] = [
  "portal",
  "chegada",
  "patio-chegada",
  "patio-domestico",
  "greenhouse-library",
  "patio-social",
  "patio-oficios",
  "jardim-aromatico",
  "jardim-contemplacao",
  "pavilhao-a",
  "pavilhao-b",
  "laboratorio-perfumaria",
  "pavilhao-c",
  "capela-domestica",
  "capela-externa",
  "bosque",
  "zona-produtiva",
  "infra-rural",
  "interiores-artefatos",
];

const blankAmbiente = (): Omit<Ambiente, "id" | "artefatoIds"> => ({
  ambienteKey: "pavilhao-a",
  nome: "",
  pavilhao: "",
  categoria: "nucleo",
  checklistEntrega: [],
});

const blankArtefato = (): Omit<Artefato, "id"> => ({
  nome: "",
  ambienteKey: "pavilhao-a",
  status: "pendente",
});

export default function AmbientesPage() {
  const { state, dispatch, ready, pode } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(blankAmbiente());
  const [checklistText, setChecklistText] = useState("");
  const [artefatoForm, setArtefatoForm] = useState(blankArtefato());
  const [showArtefato, setShowArtefato] = useState(false);

  const podeAmbiente = pode("ambiente:write");
  const podeArtefato = pode("artefato:write");

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { ambientes, artefatos, programaAreas, pranchas, materiais } = state;

  function startCreate() {
    setForm(blankAmbiente());
    setChecklistText("");
    setEditId(null);
    setShowForm(true);
  }

  function startEdit(a: Ambiente) {
    setForm({ ...a });
    setChecklistText(a.checklistEntrega.join("\n"));
    setEditId(a.id);
    setShowForm(true);
  }

  function submitForm() {
    if (!form.nome.trim()) return;
    const checklistEntrega = checklistText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { ...form, checklistEntrega };
    if (editId) {
      const existing = ambientes.find((a) => a.id === editId)!;
      dispatch({ type: "UPDATE_AMBIENTE", ambiente: { ...existing, ...payload, id: editId } });
    } else {
      const ambiente: Ambiente = {
        ...payload,
        id: crypto.randomUUID(),
        artefatoIds: [],
      };
      dispatch({ type: "ADD_AMBIENTE", ambiente });
    }
    setShowForm(false);
    setEditId(null);
  }

  function submitArtefato() {
    if (!artefatoForm.nome.trim()) return;
    const artefato: Artefato = { ...artefatoForm, id: crypto.randomUUID() };
    dispatch({ type: "ADD_ARTEFATO", artefato });
    setArtefatoForm(blankArtefato());
    setShowArtefato(false);
  }

  function programaNome(key: PavilhaoKey): string {
    return programaAreas.find((p) => p.ambienteKey === key)?.nome ?? "";
  }
  function programaAreaVal(key: PavilhaoKey): number {
    return programaAreas.find((p) => p.ambienteKey === key)?.area ?? 0;
  }
  function pranchaStatus(key: PavilhaoKey): string | null {
    const pr = pranchas.find((p) => p.ambienteKey === key);
    return pr ? pr.status : null;
  }

  const pendentes = artefatos.filter((a) => a.status !== "executado");
  const totalChecklist = ambientes.reduce((s, a) => s + a.checklistEntrega.length, 0);

  return (
    <div>
      <PageHeader
        title="Ambiente por ambiente"
        subtitle="Checklist de entrega por ambiente e artefatos decorativos ainda pendentes. A obra só encerra quando o último artefato estiver implantado."
        action={
          podeAmbiente ? (
            <button onClick={startCreate} className="btn-primary">+ Novo ambiente</button>
          ) : (
            <span className="text-xs italic text-mineral-400">Sem permissão (ambiente:write)</span>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card card-pad">
          <div className="label">Ambientes</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{ambientes.length}</div>
          <div className="mt-1 text-xs text-mineral-400">{totalChecklist} itens de checklist</div>
        </div>
        <div className="card card-pad">
          <div className="label">Artefatos pendentes</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{pendentes.length}</div>
          <div className="mt-1 text-xs text-mineral-400">{artefatos.length} artefato(s) no total</div>
        </div>
        <div className="card card-pad">
          <div className="label">Artefatos executados</div>
          <div className="mt-1 font-serif text-2xl text-leaf-700">
            {artefatos.filter((a) => a.status === "executado").length}
          </div>
          <div className="mt-1 text-xs text-mineral-400">
            {artefatos.length > 0
              ? `${Math.round((artefatos.filter((a) => a.status === "executado").length / artefatos.length) * 100)}% completo`
              : "—"}
          </div>
        </div>
      </div>

      {showForm && podeAmbiente && (
        <div className="mb-6 card card-pad">
          <h2 className="section-title mb-4">{editId ? "Editar ambiente" : "Novo ambiente"}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label">Nome *</label>
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Pavilhão</label>
              <input className="input" value={form.pavilhao} onChange={(e) => setForm({ ...form, pavilhao: e.target.value })} placeholder="Pavilhão A, Pátios, Espiritual..." />
            </div>
            <div>
              <label className="field-label">Categoria</label>
              <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as AmbienteCategoria })}>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Ambiente canônico</label>
              <select className="input" value={form.ambienteKey} onChange={(e) => setForm({ ...form, ambienteKey: e.target.value as PavilhaoKey })}>
                {PAVILHAO_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              {programaNome(form.ambienteKey) && (
                <div className="mt-1 text-xs text-mineral-400">{programaNome(form.ambienteKey)}</div>
              )}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="field-label">Checklist de entrega (um item por linha)</label>
              <textarea className="input" rows={4} value={checklistText} onChange={(e) => setChecklistText(e.target.value)} placeholder={"Iluminação instalada\nAcabamento aprovado\nArtefatos decorativos no lugar"} />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submitForm} className="btn-primary">{editId ? "Salvar" : "Criar"}</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {ambientes.length === 0 ? (
        <EmptyState message="Nenhum ambiente cadastrado. Crie ambientes para definir checklist de entrega e vincular artefatos decorativos." />
      ) : (
        <div className="space-y-3">
          {ambientes.map((a) => {
            const aArtefatos = artefatos.filter((art) => art.ambienteKey === a.ambienteKey);
            const pendentesLocal = aArtefatos.filter((art) => art.status !== "executado");
            const prStatus = pranchaStatus(a.ambienteKey);
            const progArea = programaAreaVal(a.ambienteKey);
            return (
              <div key={a.id} className="card card-pad">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium text-mineral-800">{a.nome}</div>
                      <Badge>{a.categoria}</Badge>
                      {a.pavilhao && <Badge>{a.pavilhao}</Badge>}
                      {prStatus && <StatusChip status={prStatus} />}
                    </div>
                    {progArea > 0 && <div className="mt-1 text-xs text-mineral-400">{area(progArea)} (programa canônico)</div>}
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    {podeAmbiente && <button onClick={() => startEdit(a)} className="btn-ghost text-xs">Editar</button>}
                  </div>
                </div>

                {a.checklistEntrega.length > 0 && (
                  <div className="mt-3">
                    <div className="label mb-1">Checklist de entrega</div>
                    <ul className="space-y-1">
                      {a.checklistEntrega.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-mineral-600">
                          <span className="text-mineral-300">▢</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aArtefatos.length > 0 && (
                  <div className="mt-3 border-t border-mineral-100 pt-2">
                    <div className="label mb-1">Artefatos decorativos ({aArtefatos.length})</div>
                    <div className="space-y-1">
                      {aArtefatos.map((art) => {
                        const mat = materiais.find((m) => m.id === art.materialId);
                        return (
                          <div key={art.id} className="flex items-center justify-between text-xs">
                            <span className="text-mineral-600">
                              {art.nome}
                              {art.referencia && <span className="text-mineral-400"> · {art.referencia}</span>}
                              {mat && <span className="text-mineral-400"> · {mat.referencia}</span>}
                            </span>
                            <StatusChip status={art.status} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {pendentesLocal.length > 0 && (
                  <div className="mt-2">
                    <Badge tone="danger">{pendentesLocal.length} artefato(s) pendente(s)</Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add artefact section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="section-title mb-3">Registrar artefato decorativo</h2>
          {podeArtefato ? (
            <button onClick={() => setShowArtefato((v) => !v)} className="btn-ghost text-xs">+ Artefato</button>
          ) : (
            <span className="text-xs italic text-mineral-400">Sem permissão (artefato:write)</span>
          )}
        </div>
        {showArtefato && podeArtefato && (
          <div className="card card-pad">
            <p className="mb-3 text-xs text-mineral-400">
              O último artefato instalado marca o encerramento formal do projeto (princípio canônico 10).
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="field-label">Nome *</label>
                <input className="input" value={artefatoForm.nome} onChange={(e) => setArtefatoForm({ ...artefatoForm, nome: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Ambiente</label>
                <select className="input" value={artefatoForm.ambienteKey} onChange={(e) => setArtefatoForm({ ...artefatoForm, ambienteKey: e.target.value as PavilhaoKey })}>
                  {PAVILHAO_KEYS.map((k) => <option key={k} value={k}>{programaNome(k) || k}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Referência</label>
                <input className="input" value={artefatoForm.referencia ?? ""} onChange={(e) => setArtefatoForm({ ...artefatoForm, referencia: e.target.value })} placeholder="Modelo, fornecedor..." />
              </div>
              <div>
                <label className="field-label">Status</label>
                <select className="input" value={artefatoForm.status} onChange={(e) => setArtefatoForm({ ...artefatoForm, status: e.target.value as ArtefatoStatus })}>
                  <option value="pendente">pendente</option>
                  <option value="conceito">conceito</option>
                  <option value="aprovado">aprovado</option>
                  <option value="executado">executado</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={submitArtefato} className="btn-primary">Adicionar artefato</button>
              <button onClick={() => setShowArtefato(false)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        )}
        {artefatos.length > 0 && !showArtefato && (
          <div className="card card-pad">
            <div className="space-y-1">
              {artefatos.map((art) => {
                const progN = programaNome(art.ambienteKey);
                return (
                  <div key={art.id} className="flex items-center justify-between text-xs">
                    <span className="text-mineral-600">{art.nome} <span className="text-mineral-400">· {progN || art.ambienteKey}</span></span>
                    <StatusChip status={art.status} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
