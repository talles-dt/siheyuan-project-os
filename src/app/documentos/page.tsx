"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import type { Documento } from "@/domain/types";

const TIPOS = [
  "Contrato",
  "Projeto legal",
  "Projeto executivo",
  "Licença",
  "Orçamento",
  "Garantia",
  "Manual",
  "Mapa de infraestrutura",
  "Registro fotográfico",
  "Outro",
];

const blankDoc = (): Omit<Documento, "id"> => ({
  tipo: "Outro",
  titulo: "",
  entidadeVinculada: "",
  versao: 1,
  url: "",
});

export default function DocumentosPage() {
  const { state, dispatch, ready, pode } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankDoc());
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const podeWrite = pode("documento:write");

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { documentos, terrenos, etapas, decisoes, ambientes, materiais } = state;

  function submitForm() {
    if (!form.titulo.trim()) return;
    const doc: Documento = { ...form, id: crypto.randomUUID() };
    dispatch({ type: "ADD_DOCUMENTO", documento: doc });
    setForm(blankDoc());
    setShowForm(false);
  }

  function vinculoNome(id?: string): string | null {
    if (!id) return null;
    const t = terrenos.find((x) => x.id === id);
    if (t) return `Terreno: ${t.nome}`;
    const e = etapas.find((x) => x.id === id);
    if (e) return `Etapa: ${e.nome}`;
    const d = decisoes.find((x) => x.id === id);
    if (d) return `Decisão: ${d.titulo}`;
    const a = ambientes.find((x) => x.id === id);
    if (a) return `Ambiente: ${a.nome}`;
    const m = materiais.find((x) => x.id === id);
    if (m) return `Material: ${m.referencia}`;
    return `Entidade: ${id}`;
  }

  const tiposUsados = Array.from(new Set(documentos.map((d) => d.tipo)));
  const filtrados = filterTipo === "todos" ? documentos : documentos.filter((d) => d.tipo === filterTipo);
  const porTipo = (tipo: string) => documentos.filter((d) => d.tipo === tipo).length;

  const vinculados = documentos.filter((d) => d.entidadeVinculada).length;

  return (
    <div>
      <PageHeader
        title="Documentos e acervo"
        subtitle="Repositório versionado de documentos vinculados a terrenos, etapas, decisões, ambientes e materiais. Memória operacional completa até o último artefato."
        action={
          podeWrite ? (
            <button onClick={() => setShowForm((v) => !v)} className="btn-primary">+ Novo documento</button>
          ) : (
            <span className="text-xs italic text-mineral-400">Sem permissão (documento:write)</span>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card card-pad">
          <div className="label">Total de documentos</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{documentos.length}</div>
        </div>
        <div className="card card-pad">
          <div className="label">Vinculados a entidades</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{vinculados}</div>
          <div className="mt-1 text-xs text-mineral-400">{documentos.length - vinculados} sem vínculo</div>
        </div>
        <div className="card card-pad">
          <div className="label">Tipos distintos</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{tiposUsados.length}</div>
        </div>
      </div>

      {showForm && podeWrite && (
        <div className="mb-6 card card-pad">
          <h2 className="section-title mb-4">Novo documento</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="field-label">Tipo</label>
              <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Título *</label>
              <input className="input" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Versão</label>
              <input type="number" className="input" value={form.versao} onChange={(e) => setForm({ ...form, versao: Number(e.target.value) })} />
            </div>
            <div>
              <label className="field-label">URL / caminho</label>
              <input className="input" value={form.url ?? ""} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://... ou /caminho/arquivo.pdf" />
            </div>
            <div>
              <label className="field-label">Vincular a entidade (ID)</label>
              <input className="input" value={form.entidadeVinculada ?? ""} onChange={(e) => setForm({ ...form, entidadeVinculada: e.target.value })} placeholder="ID do terreno, etapa, decisão..." />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submitForm} className="btn-primary">Adicionar</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {tiposUsados.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTipo("todos")}
            className={`chip ${filterTipo === "todos" ? "bg-mineral-800 text-white" : "bg-mineral-100 text-mineral-600"}`}
          >
            Todos ({documentos.length})
          </button>
          {tiposUsados.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTipo(t)}
              className={`chip ${filterTipo === t ? "bg-mineral-800 text-white" : "bg-mineral-100 text-mineral-600"}`}
            >
              {t} ({porTipo(t)})
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <EmptyState message={documentos.length === 0 ? "Nenhum documento no acervo. Adicione contratos, projetos, licenças, manuais e registros fotográficos." : "Nenhum documento deste tipo."} />
      ) : (
        <div className="overflow-x-auto">
          <table className="card w-full text-sm">
            <thead>
              <tr className="border-b border-mineral-200 text-left">
                <th className="label p-3">Título</th>
                <th className="label p-3">Tipo</th>
                <th className="label p-3">Versão</th>
                <th className="label p-3">Vínculo</th>
                <th className="label p-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((d) => {
                const vinculo = vinculoNome(d.entidadeVinculada);
                return (
                  <tr key={d.id} className="border-b border-mineral-100 last:border-0">
                    <td className="p-3 text-mineral-700">{d.titulo}</td>
                    <td className="p-3"><Badge>{d.tipo}</Badge></td>
                    <td className="p-3 text-mineral-400">v{d.versao}</td>
                    <td className="p-3 text-xs text-mineral-500">{vinculo ?? "—"}</td>
                    <td className="p-3">
                      {d.url ? (
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-leaf-700 hover:underline">
                          Abrir ↗
                        </a>
                      ) : (
                        <span className="text-xs text-mineral-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
