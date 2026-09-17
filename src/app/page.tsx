"use client";

import Link from "next/link";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatCard, StatusChip, Badge, money, area } from "@/components/ui";

export default function DashboardPage() {
  const { state, ready } = useStore();
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { terrenos, implantacoes, decisoes, etapas, materiais, riscos, programaAreas } = state;

  const terrenoAtivo = terrenos.find((t) => t.status !== "descartado");
  const implantacaoAtiva = terrenoAtivo
    ? implantacoes.find((i) => i.terrenoId === terrenoAtivo.id && i.ativa)
    : undefined;
  const outrasImplantacoes = terrenoAtivo
    ? implantacoes.filter((i) => i.terrenoId === terrenoAtivo.id && !i.ativa)
    : [];

  const decisoesPendentes = decisoes.filter((d) => d.status === "pendente");
  const conflitosAtivos = decisoes.filter((d) => d.conflitos.length > 0);
  const riscosCanonicos = riscos.filter((r) => r.canonico && !r.resolvido);

  const etapaAtual = etapas.find((e) => e.status === "em-andamento") ?? etapas.find((e) => e.status !== "concluida");
  const etapasConcluidas = etapas.filter((e) => e.status === "concluida").length;
  const totalEtapas = etapas.length;

  const custoEstimado = implantacaoAtiva?.custoEstimado ?? 0;

  const areaConstruida = programaAreas.reduce((sum, p) => sum + (p.area || 0), 0);

  return (
    <div>
      <PageHeader
        title="Dashboard geral"
        subtitle="Visão consolidada de saúde do projeto — terreno ativo, custos, decisões e conflitos canônicos."
      />

      {/* Fazenda X live card */}
      {terrenoAtivo && (
        <div className="mb-8 card card-pad border-l-4 border-l-mineral-800">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="label">Terreno ativo</div>
              <div className="font-serif text-xl text-mineral-800">
                {terrenoAtivo.nome} · Implantação {implantacaoAtiva?.variante ?? "—"}
              </div>
            </div>
            <StatusChip status={terrenoAtivo.status} />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-mineral-600 sm:grid-cols-2">
            <div>
              <span className="text-mineral-400">Deslocamentos: </span>
              {implantacaoAtiva?.deslocamentos ?? "—"}
            </div>
            <div>
              <span className="text-mineral-400">Custo estimado: </span>
              <span className="font-medium text-mineral-800">
                {money(implantacaoAtiva?.custoEstimado ?? 0, implantacaoAtiva?.custoMoeda ?? "BRL")}
              </span>
            </div>
            <div>
              <span className="text-mineral-400">Área do terreno: </span>
              {area(terrenoAtivo.area)}
            </div>
            <div>
              <span className="text-mineral-400">Programa de áreas: </span>
              {area(areaConstruida)} construídos
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="ok">Greenhouse Library preservada</Badge>
            {implantacaoAtiva?.deslocamentos.includes("Pavilhão B") && (
              <Badge>Pavilhão B deslocado 18 m</Badge>
            )}
            {implantacaoAtiva?.deslocamentos.includes("jardim aromático") && (
              <Badge>Jardim aromático ampliado</Badge>
            )}
            <Badge>{decisoesPendentes.length} decisões pendentes</Badge>
            {conflitosAtivos.length > 0 ? (
              <Badge tone="danger">{conflitosAtivos.length} conflito(s) canônico(s)</Badge>
            ) : (
              <Badge tone="ok">0 conflitos canônicos</Badge>
            )}
          </div>
          {outrasImplantacoes.length > 0 && (
            <div className="mt-4 border-t border-mineral-100 pt-3 text-xs text-mineral-400">
              Outras variantes:{" "}
              {outrasImplantacoes.map((i) => (
                <span key={i.id} className="mr-2">
                  {i.variante} — {money(i.custoEstimado, i.custoMoeda)}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Link href="/terrenos" className="btn-ghost text-xs">
              Ver terreno →
            </Link>
            <Link href="/compras-decisoes" className="btn-ghost text-xs">
              Decisões →
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Etapa atual"
          value={etapaAtual ? `${etapaAtual.ordem}. ${etapaAtual.nome}` : "—"}
          hint={`${etapasConcluidas}/${totalEtapas} etapas concluídas`}
        />
        <StatCard
          label="Custo estimado"
          value={money(custoEstimado)}
          hint="Variante ativa do terreno"
          tone={custoEstimado > 0 ? "ok" : "default"}
        />
        <StatCard
          label="Decisões pendentes"
          value={decisoesPendentes.length}
          hint={`${decisoes.length} decisões registradas`}
          tone={decisoesPendentes.length > 0 ? "warn" : "ok"}
        />
        <StatCard
          label="Conflitos canônicos"
          value={conflitosAtivos.length + riscosCanonicos.length}
          hint={`${conflitosAtivos.length} por decisão · ${riscosCanonicos.length} riscos`}
          tone={conflitosAtivos.length + riscosCanonicos.length > 0 ? "danger" : "ok"}
        />
      </div>

      {/* Canonical principles */}
      <div className="mt-8">
        <h2 className="section-title mb-3">Princípios canônicos protegidos</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {state.principios.slice(0, 6).map((p) => (
            <div key={p.id} className="card card-pad">
              <div className="flex items-start gap-2">
                <span className="mt-1 text-leaf-600">◆</span>
                <div>
                  <p className="text-sm text-mineral-700">{p.enunciado}</p>
                  {p.descricao && <p className="mt-1 text-xs text-mineral-400">{p.descricao}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link href="/briefing" className="mt-3 inline-block text-sm text-mineral-500 hover:text-mineral-800">
          Ver todos os {state.principios.length} princípios →
        </Link>
      </div>

      {/* Pergunta central */}
      <div className="mt-8 card card-pad border-l-4 border-l-ocher-500 bg-mineral-50">
        <div className="label mb-2">Pergunta central</div>
        <p className="font-serif text-lg italic text-mineral-700">
          “Esta escolha ajuda a construir uma vida mais profunda, mais bela, mais tranquila e mais significativa?”
        </p>
        <p className="mt-2 text-xs text-mineral-400">
          Esta pergunta aparece em cada decisão registrada no sistema.
        </p>
      </div>

      {/* Recent decisions */}
      <div className="mt-8">
        <h2 className="section-title mb-3">Decisões recentes</h2>
        <div className="space-y-2">
          {decisoes.slice(-5).reverse().map((d) => (
            <div key={d.id} className="card card-pad flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-mineral-800">{d.titulo}</div>
                <div className="text-xs text-mineral-400">
                  {money(d.custo, d.custoMoeda)} · {d.reversibilidade}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {d.conflitos.length > 0 && <Badge tone="danger">conflito canônico</Badge>}
                <StatusChip status={d.status} />
              </div>
            </div>
          ))}
          {decisoes.length === 0 && (
            <div className="text-sm text-mineral-400">Nenhuma decisão registrada ainda.</div>
          )}
        </div>
      </div>

      {/* Materiais quick view */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="section-title mb-3">Materiais & compras</h2>
          <div className="card card-pad">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="label">Total</div>
                <div className="font-serif text-xl text-mineral-800">{materiais.length}</div>
              </div>
              <div>
                <div className="label">Conceito (não decisão)</div>
                <div className="font-serif text-xl text-mineral-800">
                  {materiais.filter((m) => m.status === "conceito").length}
                </div>
              </div>
            </div>
            <Link href="/compras-decisoes" className="mt-3 inline-block text-xs text-mineral-500 hover:text-mineral-800">
              Gerenciar compras →
            </Link>
          </div>
        </div>
        <div>
          <h2 className="section-title mb-3">Roadmap</h2>
          <div className="card card-pad">
            <ol className="space-y-1 text-sm">
              {etapas.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center justify-between">
                  <span className="text-mineral-600">
                    {e.ordem}. {e.nome}
                  </span>
                  <StatusChip status={e.status} />
                </li>
              ))}
            </ol>
            <Link href="/roadmap" className="mt-3 inline-block text-xs text-mineral-500 hover:text-mineral-800">
              Ver roadmap completo →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
