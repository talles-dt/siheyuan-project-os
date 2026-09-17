"use client";

import { useRef, useState } from "react";
import { useStore } from "@/app/StoreProvider";
import { PageHeader, Badge } from "@/components/ui";
import { PAPEIS } from "@/domain/permissions";
import { exportState, parseBackup } from "@/domain/store";

export default function Page() {
  const { state, ready, dispatch, papel, setPapel } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const handleExport = () => {
    const json = exportState(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `siheyuan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Backup exportado. Guarde o arquivo em local seguro." });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const raw = await file.text();
      const imported = parseBackup(raw);
      dispatch({ type: "SET_STATE", state: imported });
      setMsg({ ok: true, text: `Backup restaurado: ${imported.terrenos.length} terreno(s), ${imported.decisoes.length} decisão(ões).` });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Falha ao importar backup." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        title="Configuração / permissões"
        subtitle="Papéis e permissões do sistema. Princípios canônicos são imutáveis por design: alteração exige motivo registrado e mantém histórico completo."
      />

      <h2 className="section-title mb-3">Sua sessão</h2>
      <div className="card card-pad">
        <label className="field-label">Atuando como</label>
        <select
          className="input mt-1 max-w-xs"
          value={papel}
          onChange={(e) => setPapel(e.target.value as typeof papel)}
        >
          {PAPEIS.map((p) => (
            <option key={p.key} value={p.key}>{p.nome}</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-mineral-500">
          O papel selecionado é persistido neste navegador e determina quais ações ficam disponíveis nos formulários
          de edição. {PAPEIS.find((p) => p.key === papel)?.acoes.length ?? 0} ações permitidas.
        </p>
      </div>

      <h2 className="section-title mb-3 mt-8">Papéis e permissões</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {PAPEIS.map((p) => (
          <div key={p.key} className="card card-pad">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-mineral-800">{p.nome}</div>
              <Badge>{p.key}</Badge>
              <Badge>{p.acoes.length} ações</Badge>
            </div>
            <div className="mt-1 text-xs text-mineral-500">{p.descricao}</div>
            {p.acoes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {p.acoes.map((a) => (
                  <span key={a} className="chip bg-mineral-100 text-mineral-500 text-[10px]">{a}</span>
                ))}
              </div>
            )}
            {p.acoes.length === 0 && (
              <div className="mt-2 text-xs italic text-mineral-400">Somente leitura</div>
            )}
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

      <h2 className="section-title mb-3 mt-8">Backup e restauração</h2>
      <div className="card card-pad">
        <p className="text-sm text-mineral-600">
          Todo o estado do projeto vive no <code className="rounded bg-mineral-100 px-1">localStorage</code> deste
          navegador. Exporte um backup JSON regularmente para não perder o histórico da casa ao limpar cache,
          trocar de dispositivo ou navegador. Use <strong>Restaurar</strong> para importar um backup anterior
          (isso substitui o estado atual).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleExport} className="btn-primary text-sm">
            ⤓ Exportar backup
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost border border-mineral-200 text-sm"
          >
            ⤒ Restaurar backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
        {msg && (
          <div
            className={`mt-3 rounded-md px-3 py-2 text-sm ${
              msg.ok ? "bg-leaf-500/10 text-leaf-700" : "bg-red-100 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
