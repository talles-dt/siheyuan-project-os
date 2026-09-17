"use client";

import { useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, EmptyState, Badge, money } from "@/components/ui";
import type { Fornecedor, Cotação } from "@/domain/types";

const blankFornecedor = () => ({
  nome: "",
  categoria: "",
  contatos: "",
  avaliacao: "",
});

const blankCotacao = () => ({
  fornecedorId: "",
  materialId: "",
  preco: 0,
  moeda: "BRL",
  validade: "",
  prazo: "",
  temAmostra: false,
});

export default function FornecedoresPage() {
  const { state, dispatch, ready } = useStore();
  const [showFornForm, setShowFornForm] = useState(false);
  const [showCotForm, setShowCotForm] = useState(false);
  const [fornForm, setFornForm] = useState(blankFornecedor());
  const [cotForm, setCotForm] = useState(blankCotacao());
  const [editFornId, setEditFornId] = useState<string | null>(null);

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { fornecedores, cotacoes, materiais } = state;

  function submitFornecedor() {
    if (!fornForm.nome.trim()) return;
    const contatos = fornForm.contatos.split("\n").filter(Boolean);
    if (editFornId) {
      const existing = fornecedores.find((f) => f.id === editFornId)!;
      dispatch({
        type: "UPDATE_FORNECEDOR",
        fornecedor: {
          ...existing,
          nome: fornForm.nome,
          categoria: fornForm.categoria,
          contatos,
          avaliacao: fornForm.avaliacao || undefined,
        },
      });
    } else {
      const f: Fornecedor = {
        id: `forn-${Date.now().toString(36)}`,
        nome: fornForm.nome,
        categoria: fornForm.categoria,
        contatos,
        avaliacao: fornForm.avaliacao || undefined,
      };
      dispatch({ type: "ADD_FORNECEDOR", fornecedor: f });
    }
    setFornForm(blankFornecedor());
    setEditFornId(null);
    setShowFornForm(false);
  }

  function startEditFornecedor(f: Fornecedor) {
    setFornForm({
      nome: f.nome,
      categoria: f.categoria,
      contatos: f.contatos.join("\n"),
      avaliacao: f.avaliacao ?? "",
    });
    setEditFornId(f.id);
    setShowFornForm(true);
  }

  function submitCotacao() {
    if (!cotForm.fornecedorId || !cotForm.materialId) return;
    const c: Cotação = {
      id: `cot-${Date.now().toString(36)}`,
      fornecedorId: cotForm.fornecedorId,
      materialId: cotForm.materialId,
      preco: cotForm.preco,
      moeda: cotForm.moeda,
      validade: cotForm.validade || undefined,
      prazo: cotForm.prazo || undefined,
      temAmostra: cotForm.temAmostra,
    };
    dispatch({ type: "ADD_COTACAO", cotacao: c });
    setCotForm(blankCotacao());
    setShowCotForm(false);
  }

  function materialNome(id: string): string {
    return materiais.find((m) => m.id === id)?.referencia ?? "—";
  }
  function fornecedorNome(id: string): string {
    return fornecedores.find((f) => f.id === id)?.nome ?? "—";
  }

  function cotacoesDoFornecedor(fornecedorId: string): Cotação[] {
    return cotacoes.filter((c) => c.fornecedorId === fornecedorId);
  }

  function cotacoesDoMaterial(materialId: string): Cotação[] {
    const cs = cotacoes.filter((c) => c.materialId === materialId);
    return [...cs].sort((a, b) => a.preco - b.preco);
  }

  return (
    <div>
      <PageHeader
        title="Fornecedores e cotações"
        subtitle="Cotações comparativas, alternativas equivalentes, preços, validade, prazos e amostras. Uma referência não vira decisão irrevogável."
        action={
          <div className="flex gap-2">
            <button onClick={() => { setShowCotForm((v) => !v); setShowFornForm(false); }} className="btn-ghost">
              + Cotação
            </button>
            <button onClick={() => { setShowFornForm((v) => !v); setShowCotForm(false); }} className="btn-primary">
              + Fornecedor
            </button>
          </div>
        }
      />

      <div className="mb-4 rounded-md border border-mineral-200 bg-mineral-50 p-3 text-xs text-mineral-500">
        Cotações são vinculadas a <strong>materiais</strong> (cadastrados em Compras &amp; Decisões) e permitem
        comparar preços entre fornecedores. A mais barata não é automaticamente a escolhida — aprovação estética/técnica
        e amostra vêm antes do pedido.
      </div>

      {showFornForm && (
        <div className="mb-6 card card-pad">
          <h2 className="section-title mb-4">{editFornId ? "Editar fornecedor" : "Novo fornecedor"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Nome *</label>
              <input className="input" value={fornForm.nome} onChange={(e) => setFornForm({ ...fornForm, nome: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Categoria</label>
              <input className="input" value={fornForm.categoria} onChange={(e) => setFornForm({ ...fornForm, categoria: e.target.value })} placeholder="Vidro, Madeira, Pedra..." />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Contatos (um por linha)</label>
              <textarea className="input" rows={2} value={fornForm.contatos} onChange={(e) => setFornForm({ ...fornForm, contatos: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Avaliação</label>
              <input className="input" value={fornForm.avaliacao} onChange={(e) => setFornForm({ ...fornForm, avaliacao: e.target.value })} placeholder="Boa reputação, prazo cumprido..." />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={submitFornecedor} className="btn-primary">{editFornId ? "Salvar" : "Criar"}</button>
            <button onClick={() => { setShowFornForm(false); setEditFornId(null); }} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {showCotForm && (
        <div className="mb-6 card card-pad">
          <h2 className="section-title mb-4">Nova cotação</h2>
          {materiais.length === 0 ? (
            <div className="text-sm text-mineral-400">
              Nenhum material cadastrado. Registre materiais em Compras &amp; Decisões antes de cotações.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Material *</label>
                  <select className="input" value={cotForm.materialId} onChange={(e) => setCotForm({ ...cotForm, materialId: e.target.value })}>
                    <option value="">—</option>
                    {materiais.map((m) => (
                      <option key={m.id} value={m.id}>{m.referencia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Fornecedor *</label>
                  <select className="input" value={cotForm.fornecedorId} onChange={(e) => setCotForm({ ...cotForm, fornecedorId: e.target.value })}>
                    <option value="">—</option>
                    {fornecedores.map((f) => (
                      <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Preço</label>
                  <input type="number" className="input" value={cotForm.preco || ""} onChange={(e) => setCotForm({ ...cotForm, preco: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="field-label">Moeda</label>
                  <input className="input" value={cotForm.moeda} onChange={(e) => setCotForm({ ...cotForm, moeda: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Validade</label>
                  <input type="date" className="input" value={cotForm.validade} onChange={(e) => setCotForm({ ...cotForm, validade: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Prazo de entrega</label>
                  <input className="input" value={cotForm.prazo} onChange={(e) => setCotForm({ ...cotForm, prazo: e.target.value })} placeholder="30 dias, 8 semanas..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cotForm.temAmostra}
                      onChange={(e) => setCotForm({ ...cotForm, temAmostra: e.target.checked })}
                    />
                    Tem amostra física disponível
                  </label>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={submitCotacao} className="btn-primary">Registrar cotação</button>
                <button onClick={() => setShowCotForm(false)} className="btn-ghost">Cancelar</button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Fornecedores */}
      <h2 className="section-title mb-3">Fornecedores ({fornecedores.length})</h2>
      {fornecedores.length === 0 ? (
        <EmptyState message="Nenhum fornecedor cadastrado." />
      ) : (
        <div className="space-y-3">
          {fornecedores.map((f) => {
            const fcots = cotacoesDoFornecedor(f.id);
            return (
              <div key={f.id} className="card card-pad">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-medium text-mineral-800">{f.nome}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-mineral-400">
                      {f.categoria && <Badge>{f.categoria}</Badge>}
                      {f.avaliacao && <span>{f.avaliacao}</span>}
                      <span>{f.contatos.join(" · ")}</span>
                    </div>
                    <div className="mt-1 text-xs text-mineral-400">{fcots.length} cotação(ões)</div>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button onClick={() => startEditFornecedor(f)} className="btn-ghost text-xs">Editar</button>
                    <button onClick={() => dispatch({ type: "REMOVE_FORNECEDOR", id: f.id })} className="btn-danger text-xs">Excluir</button>
                  </div>
                </div>
                {fcots.length > 0 && (
                  <div className="mt-3 border-t border-mineral-100 pt-2">
                    <div className="space-y-1">
                      {fcots.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs">
                          <span className="text-mineral-600">{materialNome(c.materialId)}</span>
                          <span className="flex items-center gap-2">
                            {c.temAmostra && <Badge>amostra</Badge>}
                            {c.prazo && <span className="text-mineral-400">{c.prazo}</span>}
                            <span className="font-medium text-mineral-700">{money(c.preco, c.moeda)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparação de cotações por material */}
      {cotacoes.length > 0 && (
        <div className="mt-8">
          <h2 className="section-title mb-3">Comparação de cotações por material</h2>
          <div className="space-y-4">
            {materiais.filter((m) => cotacoes.some((c) => c.materialId === m.id)).map((m) => {
              const cs = cotacoesDoMaterial(m.id);
              const menor = cs[0];
              return (
                <div key={m.id} className="card card-pad">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-mineral-800">{m.referencia}</div>
                    <div className="text-xs text-mineral-400">
                      {cs.length} cotação(ões) · menor: {money(menor?.preco ?? 0, menor?.moeda ?? "BRL")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    {cs.map((c, idx) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between rounded-md p-2 text-sm ${
                          idx === 0 ? "bg-leaf-500/10" : "bg-mineral-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {idx === 0 && <span className="text-leaf-600">★</span>}
                          <span className="text-mineral-700">{fornecedorNome(c.fornecedorId)}</span>
                          {c.temAmostra && <Badge>amostra</Badge>}
                          {c.prazo && <span className="text-xs text-mineral-400">{c.prazo}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {c.validade && <span className="text-xs text-mineral-400">válido até {c.validade}</span>}
                          <span className={`font-medium ${idx === 0 ? "text-leaf-700" : "text-mineral-700"}`}>
                            {money(c.preco, c.moeda)}
                          </span>
                          <button
                            onClick={() => dispatch({ type: "REMOVE_COTACAO", id: c.id })}
                            className="btn-ghost px-1 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {m.alternativasEquivalentes.length > 0 && (
                    <div className="mt-2 text-xs text-mineral-400">
                      Alternativas equivalentes: {m.alternativasEquivalentes.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
