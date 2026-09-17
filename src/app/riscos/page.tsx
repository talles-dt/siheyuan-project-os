"use client";

import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge } from "@/components/ui";

export default function RiscosPage() {
  const { state, dispatch, ready } = useStore();
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { riscos, decisoes, principios } = state;

  const conflitosDecisao = decisoes.filter((d) => d.conflitos.length > 0);
  const riscosCanonicos = riscos.filter((r) => r.canonico);
  const riscosOperacionais = riscos.filter((r) => !r.canonico);

  return (
    <div>
      <PageHeader
        title="Riscos e conflitos canônicos"
        subtitle="Painel dedicado de alertas. O sistema protege a intenção arquitetônica contra decisões locais, atrasos, fornecedores e improvisações."
      />

      {conflitosDecisao.length === 0 && riscosCanonicos.filter((r) => !r.resolvido).length === 0 ? (
        <div className="mb-6 card card-pad border-l-4 border-l-leaf-500">
          <div className="text-sm font-medium text-leaf-700">✓ Nenhum conflito canônico ativo</div>
          <div className="mt-1 text-xs text-mineral-400">A intenção arquitetônica está protegida.</div>
        </div>
      ) : (
        <div className="mb-6 card card-pad border-l-4 border-l-red-400">
          <div className="text-sm font-medium text-red-700">
            {conflitosDecisao.length + riscosCanonicos.filter((r) => !r.resolvido).length} alerta(s) canônico(s) ativo(s)
          </div>
        </div>
      )}

      {conflitosDecisao.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title mb-3">Conflitos em decisões</h2>
          <div className="space-y-2">
            {conflitosDecisao.map((d) => (
              <div key={d.id} className="card card-pad">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-mineral-800">{d.titulo}</div>
                  <StatusChip status={d.status} />
                </div>
                <div className="mt-2 space-y-1">
                  {d.conflitos.map((c, i) => (
                    <Badge key={i} tone="danger">{c}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="section-title mb-3">Riscos canônicos</h2>
      <div className="space-y-2">
        {riscosCanonicos.map((r) => {
          const principio = principios.find((p) => p.id === r.principioId);
          return (
            <div key={r.id} className={`card card-pad ${r.resolvido ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-mineral-800">{r.descricao}</div>
                  {principio && <div className="mt-1 text-xs text-mineral-400">Princípio: {principio.enunciado}</div>}
                  <div className="mt-1 text-xs text-mineral-500">Mitigação: {r.mitigacao}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <Badge>{r.probabilidade}/{r.impacto}</Badge>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_RISCO_RESOLVIDO", id: r.id })}
                    className="btn-ghost text-xs"
                  >
                    {r.resolvido ? "Reabrir" : "Resolver"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {riscosOperacionais.length > 0 && (
        <>
          <h2 className="section-title mb-3 mt-6">Riscos operacionais</h2>
          <div className="space-y-2">
            {riscosOperacionais.map((r) => (
              <div key={r.id} className={`card card-pad ${r.resolvido ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-mineral-700">{r.descricao}</div>
                  <button onClick={() => dispatch({ type: "TOGGLE_RISCO_RESOLVIDO", id: r.id })} className="btn-ghost text-xs">
                    {r.resolvido ? "Reabrir" : "Resolver"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
