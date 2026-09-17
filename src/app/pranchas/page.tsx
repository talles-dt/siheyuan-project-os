"use client";

import { useStore } from "@/app/StoreProvider";
import { PageHeader, StatusChip, Badge } from "@/components/ui";
import type { PavilhaoKey } from "@/domain/types";

const PRANCHA_GROUPS: Array<{ key: string; titulo: string; ambientes: PavilhaoKey[] }> = [
  { key: "entrada", titulo: "Vista externa e portal de entrada", ambientes: ["portal", "chegada"] },
  { key: "pativeis", titulo: "Pátios do siheyuan", ambientes: ["patio-chegada", "patio-domestico", "patio-social", "patio-oficios", "jardim-aromatico", "jardim-contemplacao"] },
  { key: "pavA", titulo: "Pavilhão A — Casa Principal", ambientes: ["pavilhao-a", "capela-domestica"] },
  { key: "greenhouse", titulo: "Greenhouse Library", ambientes: ["greenhouse-library"] },
  { key: "pavB", titulo: "Pavilhão B — Corpus, Mens, Ars e Otium", ambientes: ["pavilhao-b", "laboratorio-perfumaria"] },
  { key: "pavC", titulo: "Pavilhão C — Ofícios Alimentares", ambientes: ["pavilhao-c"] },
  { key: "capela-ext", titulo: "Capela externa", ambientes: ["capela-externa"] },
  { key: "rural", titulo: "Bosque e Zona Produtiva", ambientes: ["zona-produtiva"] },
  { key: "infra", titulo: "Infraestrutura rural", ambientes: ["infra-rural"] },
  { key: "interiores", titulo: "Interiores e artefatos decorativos", ambientes: ["interiores-artefatos"] },
];

export default function PranchasPage() {
  const { state, ready } = useStore();
  if (!ready) return <div className="p-8 text-mineral-400">Carregando…</div>;

  const { pranchas, programaAreas, principios } = state;

  return (
    <div>
      <PageHeader
        title="Pranchas e vistas"
        subtitle="Documentos vivos ligados ao briefing, às decisões, ao orçamento e à execução. Cada ambiente tem narrativa visual própria sob o mesmo sistema de identidade."
      />

      <div className="mb-4 rounded-md border border-mineral-200 bg-mineral-50 p-3 text-xs text-mineral-500">
        Organização por ambiente, conforme a lógica do projeto de perfumaria: narrativa visual própria, mas mesmo
        sistema de identidade, materialidade, atmosfera e hierarquia. Permite comparar o mesmo núcleo siheyuan em
        terrenos diferentes sem redesenhar a filosofia.
      </div>

      {PRANCHA_GROUPS.map((group) => {
        const groupPranchas = pranchas.filter((p) => group.ambientes.includes(p.ambienteKey));
        const groupProgramas = programaAreas.filter((pa) => group.ambientes.includes(pa.ambienteKey));
        return (
          <div key={group.key} className="mb-6">
            <h2 className="section-title mb-2">{group.titulo}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groupProgramas.map((pa) => {
                const prancha = groupPranchas.find((p) => p.ambienteKey === pa.ambienteKey);
                return (
                  <div key={pa.id} className="card card-pad">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-mineral-800">{pa.nome}</div>
                      {prancha ? <StatusChip status={prancha.status} /> : <Badge>sem prancha</Badge>}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-mineral-400">
                      <div>Pavilhão: {pa.pavilhao}</div>
                      {pa.area > 0 && <div>Área: {pa.area} m²</div>}
                      {prancha ? (
                        <>
                          <div className="text-mineral-600">{prancha.intencaoEspacial}</div>
                          {prancha.principioIds.length > 0 && (
                            <div className="mt-1">
                              {prancha.principioIds.map((pid) => {
                                const pr = principios.find((p) => p.id === pid);
                                return pr ? <Badge key={pid}>◆ {pr.categoria}</Badge> : null;
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="italic">Prancha a ser criada</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {pranchas.length === 0 && (
        <div className="card card-pad mt-4 text-sm text-mineral-400">
          Nenhuma prancha criada ainda. As pranchas-mãe de referência (camadas da propriedade, planta conceitual do
          núcleo, sequência de chegada, zoneamento rural) serão as primeiras, com status “aprovado” e vinculadas ao
          briefing canônico.
        </div>
      )}
    </div>
  );
}
