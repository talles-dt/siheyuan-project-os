"use client";

import Link from "next/link";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge, EmptyState } from "@/components/ui";

export default function OperacaoPage() {
  const { state, ready, pode } = useStore();
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { ambientes, artefatos, materiais, documentos, fornecedores, etapas, riscos } = state;

  const artefatosPendentes = artefatos.filter((a) => a.status !== "executado");
  const artefatosExecutados = artefatos.filter((a) => a.status === "executado");

  const materiaisComGarantia = materiais.filter((m) => m.garantia);
  const materiaisComManutencao = materiais.filter((m) => m.manutencao);

  const docManuais = documentos.filter((d) => d.tipo === "Manual");
  const docGarantias = documentos.filter((d) => d.tipo === "Garantia");
  const docMapas = documentos.filter((d) => d.tipo === "Mapa de infraestrutura");
  const docFotos = documentos.filter((d) => d.tipo === "Registro fotográfico");

  const etapasConcluidas = etapas.filter((e) => e.status === "concluida").length;
  const etapasPendentes = etapas.filter((e) => e.status !== "concluida");

  const riscosAbertos = riscos.filter((r) => !r.resolvido);

  const checklistAmbientesIncompletos = ambientes.filter(
    (a) => artefatos.filter((art) => art.ambienteKey === a.ambienteKey && art.status !== "executado").length > 0
  );
  const ambientesCompletos = ambientes.length - checklistAmbientesIncompletos.length;

  const podeEncerrar = pode("projeto:encerrar");

  const prontaParaEncerrar =
    artefatosPendentes.length === 0 &&
    etapasPendentes.length === 0 &&
    riscosAbertos.length === 0 &&
    ambientes.length > 0;

  return (
    <div>
      <PageHeader
        title="Operação e entrega final"
        subtitle="Manual da propriedade, manutenção de sistemas, inventário de equipamentos, documentos de garantia, mapas de infraestrutura, checklist de entrega por ambiente e encerramento formal do projeto."
      />

      {/* Encerramento status */}
      <div className={`mb-6 card card-pad border-l-4 ${prontaParaEncerrar ? "border-l-leaf-500" : "border-l-ocher-500"}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-mineral-800">
              {prontaParaEncerrar ? "✓ Projeto pronto para encerramento formal" : "Projeto não pronto para encerramento"}
            </div>
            <div className="mt-1 text-xs text-mineral-500">
              Encerramento exige: 0 artefatos pendentes, todas as etapas concluídas, 0 riscos abertos e ambientes cadastrados.
            </div>
          </div>
          {podeEncerrar && prontaParaEncerrar && (
            <button className="btn-primary">Encerrar projeto</button>
          )}
          {!podeEncerrar && (
            <span className="text-xs italic text-mineral-400">Sem permissão (projeto:encerrar)</span>
          )}
        </div>
      </div>

      {/* Status grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card card-pad">
          <div className="label">Artefatos pendentes</div>
          <div className={`mt-1 font-serif text-2xl ${artefatosPendentes.length > 0 ? "text-ocher-600" : "text-leaf-700"}`}>
            {artefatosPendentes.length}
          </div>
          <div className="mt-1 text-xs text-mineral-400">{artefatosExecutados.length} executados</div>
        </div>
        <div className="card card-pad">
          <div className="label">Etapas concluídas</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{etapasConcluidas}/{etapas.length}</div>
          <div className="mt-1 text-xs text-mineral-400">{etapasPendentes.length} pendentes</div>
        </div>
        <div className="card card-pad">
          <div className="label">Ambientes entregues</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{ambientesCompletos}/{ambientes.length}</div>
          <div className="mt-1 text-xs text-mineral-400">{checklistAmbientesIncompletos.length} com artefatos pendentes</div>
        </div>
        <div className="card card-pad">
          <div className="label">Riscos abertos</div>
          <div className={`mt-1 font-serif text-2xl ${riscosAbertos.length > 0 ? "text-red-700" : "text-leaf-700"}`}>
            {riscosAbertos.length}
          </div>
        </div>
      </div>

      {/* Artefatos pendentes */}
      <div className="mb-8">
        <h2 className="section-title mb-3">Artefatos decorativos pendentes</h2>
        <div className="mb-2 rounded-md border border-mineral-200 bg-mineral-50 p-3 text-xs text-mineral-500">
          A obra só termina quando o conjunto — inclusive o último artefato decorativo — estiver implantado (princípio canônico 10).
        </div>
        {artefatosPendentes.length === 0 ? (
          <div className="card card-pad text-sm text-leaf-700">
            {artefatos.length === 0 ? "Nenhum artefato registrado." : "✓ Todos os artefatos executados."}
          </div>
        ) : (
          <div className="space-y-2">
            {artefatosPendentes.map((a) => (
              <div key={a.id} className="card card-pad flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-mineral-800">{a.nome}</div>
                  <div className="text-xs text-mineral-400">{a.ambienteKey}{a.referencia ? ` · ${a.referencia}` : ""}</div>
                </div>
                <StatusChip status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist de entrega por ambiente */}
      <div className="mb-8">
        <h2 className="section-title mb-3">Checklist de entrega por ambiente</h2>
        {ambientes.length === 0 ? (
          <EmptyState message="Nenhum ambiente cadastrado. Cadastre ambientes com checklist de entrega em Ambiente por ambiente." />
        ) : (
          <div className="space-y-2">
            {ambientes.map((a) => {
              const aArtefatos = artefatos.filter((art) => art.ambienteKey === a.ambienteKey);
              const pendentes = aArtefatos.filter((art) => art.status !== "executado");
              const completo = pendentes.length === 0 && aArtefatos.length > 0;
              return (
                <div key={a.id} className="card card-pad">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-mineral-800">{a.nome}</div>
                      <Badge>{a.categoria}</Badge>
                    </div>
                    {completo ? (
                      <Badge tone="ok">✓ entregue</Badge>
                    ) : pendentes.length > 0 ? (
                      <Badge tone="danger">{pendentes.length} pendente(s)</Badge>
                    ) : (
                      <Badge>sem artefatos</Badge>
                    )}
                  </div>
                  {a.checklistEntrega.length > 0 && (
                    <div className="mt-2 text-xs text-mineral-500">
                      {a.checklistEntrega.length} item(ns) de checklist
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manutenção e garantia */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="section-title mb-3">Manutenção de sistemas</h2>
          {materiaisComManutencao.length === 0 ? (
            <div className="card card-pad text-sm text-mineral-400">Nenhum material com manutenção registrada.</div>
          ) : (
            <div className="space-y-2">
              {materiaisComManutencao.map((m) => (
                <div key={m.id} className="card card-pad">
                  <div className="text-sm font-medium text-mineral-800">{m.referencia}</div>
                  <div className="mt-1 text-xs text-mineral-500">{m.manutencao}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="section-title mb-3">Garantias</h2>
          {materiaisComGarantia.length === 0 ? (
            <div className="card card-pad text-sm text-mineral-400">Nenhum material com garantia registrada.</div>
          ) : (
            <div className="space-y-2">
              {materiaisComGarantia.map((m) => (
                <div key={m.id} className="card card-pad flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-mineral-800">{m.referencia}</div>
                    <div className="text-xs text-mineral-500">{m.garantia}</div>
                  </div>
                  <StatusChip status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventário de equipamentos */}
      <div className="mb-8">
        <h2 className="section-title mb-3">Inventário de equipamentos (materiais)</h2>
        {materiais.length === 0 ? (
          <EmptyState message="Nenhum material registrado. Gerencie materiais em Compras & Decisões." />
        ) : (
          <div className="overflow-x-auto">
            <table className="card w-full text-sm">
              <thead>
                <tr className="border-b border-mineral-200 text-left">
                  <th className="label p-3">Referência</th>
                  <th className="label p-3">Ambiente</th>
                  <th className="label p-3">Status</th>
                  <th className="label p-3">Garantia</th>
                  <th className="label p-3">Manutenção</th>
                </tr>
              </thead>
              <tbody>
                {materiais.map((m) => (
                  <tr key={m.id} className="border-b border-mineral-100 last:border-0">
                    <td className="p-3 text-mineral-700">{m.referencia}</td>
                    <td className="p-3 text-mineral-400">{m.ambienteKey ?? "—"}</td>
                    <td className="p-3"><StatusChip status={m.status} /></td>
                    <td className="p-3 text-xs text-mineral-500">{m.garantia ?? "—"}</td>
                    <td className="p-3 text-xs text-mineral-500">{m.manutencao ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentos de operação */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card card-pad">
          <div className="label">Manuais</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{docManuais.length}</div>
          {docManuais.length === 0 && <div className="mt-1 text-xs text-mineral-400">Nenhum manual</div>}
        </div>
        <div className="card card-pad">
          <div className="label">Garantias (docs)</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{docGarantias.length}</div>
        </div>
        <div className="card card-pad">
          <div className="label">Mapas de infraestrutura</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{docMapas.length}</div>
        </div>
        <div className="card card-pad">
          <div className="label">Registros fotográficos</div>
          <div className="mt-1 font-serif text-2xl text-mineral-800">{docFotos.length}</div>
        </div>
      </div>

      {/* Fornecedores */}
      <div className="mb-8">
        <h2 className="section-title mb-3">Fornecedores de contato</h2>
        {fornecedores.length === 0 ? (
          <EmptyState message="Nenhum fornecedor cadastrado." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fornecedores.map((f) => (
              <div key={f.id} className="card card-pad">
                <div className="text-sm font-medium text-mineral-800">{f.nome}</div>
                {f.categoria && <div className="mt-1 text-xs text-mineral-400">{f.categoria}</div>}
                {f.contatos.length > 0 && <div className="mt-1 text-xs text-mineral-500">{f.contatos.join(" · ")}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Etapas pendentes (blockers for closure) */}
      {etapasPendentes.length > 0 && (
        <div className="mb-8">
          <h2 className="section-title mb-3">Etapas pendentes (bloqueiam encerramento)</h2>
          <div className="space-y-2">
            {etapasPendentes.map((e) => (
              <div key={e.id} className="card card-pad flex items-center justify-between">
                <div className="text-sm text-mineral-700">{e.ordem}. {e.nome}</div>
                <StatusChip status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/ambientes" className="btn-ghost text-xs">Ambientes →</Link>
        <Link href="/documentos" className="btn-ghost text-xs">Documentos →</Link>
        <Link href="/compras-decisoes" className="btn-ghost text-xs">Materiais →</Link>
        <Link href="/fornecedores" className="btn-ghost text-xs">Fornecedores →</Link>
      </div>
    </div>
  );
}
