"use client";

import { useStore } from "@/app/StoreProvider";
import { PageHeader, Badge } from "@/components/ui";

const PAPEIS: Array<{ key: string; nome: string; descricao: string }> = [
  { key: "guardiao", nome: "Guardião do briefing", descricao: "Edita princípios canônicos (com auditoria imutável), aprova decisões com conflito, encerra o projeto." },
  { key: "arquiteto", nome: "Arquiteto", descricao: "Edita pranchas, implantações, programa de áreas e etapas." },
  { key: "gestor-obra", nome: "Gestor de obra", descricao: "Edita tarefas, cronograma, riscos e recebimento de materiais." },
  { key: "comprador", nome: "Comprador", descricao: "Edita fornecedores, cotações e pedidos." },
  { key: "consultor", nome: "Consultor (leitura)", descricao: "Visualiza tudo, sem edição." },
  { key: "aprovador", nome: "Aprovador", descricao: "Apenas assina decisões atribuídas." },
];

export default function Page() {
  const { state, ready } = useStore();
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  return (
    <div>
      <PageHeader
        title="Configuração / permissões"
        subtitle="Papéis e permissões do sistema. Princípios canônicos são imutáveis por design: alteração exige motivo registrado e mantém histórico completo."
      />

      <h2 className="section-title mb-3">Papéis</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {PAPEIS.map((p) => (
          <div key={p.key} className="card card-pad">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-mineral-800">{p.nome}</div>
              <Badge>{p.key}</Badge>
            </div>
            <div className="mt-1 text-xs text-mineral-500">{p.descricao}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3 mt-8">Usuários</h2>
      <div className="space-y-2">
        {state.usuarios.map((u) => (
          <div key={u.id} className="card card-pad flex items-center justify-between">
            <div className="text-sm text-mineral-700">{u.nome}</div>
            <Badge>{PAPEIS.find((p) => p.key === u.papel)?.nome ?? u.papel}</Badge>
          </div>
        ))}
      </div>

      <h2 className="section-title mb-3 mt-8">Sobre o sistema</h2>
      <div className="card card-pad text-sm text-mineral-600">
        <p>
          <strong>Siheyuan Project OS</strong> — sistema vivo para proteger e realizar a intenção arquitetônica.
          Não é um Trello sofisticado: protege a intenção contra decisões locais, atrasos, fornecedores e
          improvisações de obra.
        </p>
        <p className="mt-3 font-serif italic text-mineral-500">
          O briefing define a filosofia · as pranchas mostram a intenção · os terrenos são avaliados contra o
          núcleo canônico · as decisões registram compromissos · o cronograma acompanha a evolução · compras e
          materiais conectam conceito à execução · a obra termina apenas quando o último artefato estiver implantado.
        </p>
      </div>
    </div>
  );
}
