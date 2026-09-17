"use client";

import { useStore } from "@/app/StoreProvider";
import { PageHeader, Badge, area } from "@/components/ui";
import { detectCanonicalConflicts } from "@/domain/conflicts";
import { useState } from "react";
import type { Decisão } from "@/domain/types";

const TEST_DECISAO: Decisão = {
  id: "test",
  titulo: "Reduzir a Greenhouse Library para cortar custo",
  descricao: "Estudo de reduzir a Greenhouse Library.",
  opcoes: ["Manter", "Reduzir a Greenhouse Library"],
  impactoPrograma: "",
  custo: 0,
  custoMoeda: "BRL",
  risco: "",
  reversibilidade: "irreversivel",
  principioIds: [],
  conflitos: [],
  perguntaCentral: "",
  status: "pendente",
  createdAt: "",
};

export default function BriefingPage() {
  const { state, ready } = useStore();
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<string[]>([]);

  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  function runTest() {
    const d: Decisão = { ...TEST_DECISAO, titulo: testText, descricao: testText };
    setTestResult(detectCanonicalConflicts(d));
  }

  return (
    <div>
      <PageHeader
        title="Briefing canônico"
        subtitle="Princípios protegidos, programa de áreas e a lógica espacial da propriedade-cidadela."
      />

      <div className="mb-6 card card-pad border-l-4 border-l-ocher-500 bg-mineral-50">
        <div className="label mb-1">Máxima</div>
        <p className="font-serif text-base italic text-mineral-700">
          “Nada é escondido de quem habita a casa. Quase tudo é escondido de quem está fora dela.”
        </p>
      </div>

      <h2 className="section-title mb-3">Princípios canônicos ({state.principios.length})</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {state.principios.map((p) => (
          <div key={p.id} className="card card-pad">
            <div className="flex items-start gap-2">
              <span className="mt-1 text-leaf-600">◆</span>
              <div className="flex-1">
                <p className="text-sm text-mineral-700">{p.enunciado}</p>
                {p.descricao && <p className="mt-1 text-xs text-mineral-400">{p.descricao}</p>}
                <div className="mt-2 flex gap-1">
                  <Badge>{p.categoria}</Badge>
                  {p.imutavel && <Badge tone="danger">imutável</Badge>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3 mt-8">Programa de áreas</h2>
      <div className="overflow-x-auto">
        <table className="card w-full text-sm">
          <thead>
            <tr className="border-b border-mineral-200 text-left">
              <th className="label p-3">Ambiente</th>
              <th className="label p-3">Pavilhão</th>
              <th className="label p-3 text-right">Área</th>
              <th className="label p-3">Versão</th>
            </tr>
          </thead>
          <tbody>
            {state.programaAreas.map((p) => (
              <tr key={p.id} className="border-b border-mineral-100 last:border-0">
                <td className="p-3 text-mineral-700">{p.nome}</td>
                <td className="p-3 text-mineral-500">{p.pavilhao}</td>
                <td className="p-3 text-right text-mineral-700">{area(p.area)}</td>
                <td className="p-3 text-mineral-400">{p.versao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title mb-3 mt-8">Simulador de conflito canônico</h2>
      <div className="card card-pad">
        <p className="mb-3 text-sm text-mineral-500">
          Digite uma frase de decisão para ver se ela ameaça algum princípio canônico.
        </p>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Ex: reduzir a Greenhouse Library"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
          />
          <button onClick={runTest} className="btn-ghost">Verificar</button>
        </div>
        {testResult.length > 0 && (
          <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3">
            <div className="mb-1 text-sm font-medium text-red-700">⚠ Conflito canônico</div>
            {testResult.map((c, i) => <div key={i} className="text-sm text-red-600">• {c}</div>)}
          </div>
        )}
        {testText && testResult.length === 0 && (
          <div className="mt-3 rounded-md border border-leaf-500/40 bg-leaf-500/10 p-3 text-sm text-leaf-700">
            ✓ Nenhum conflito canônico detectado.
          </div>
        )}
      </div>
    </div>
  );
}
