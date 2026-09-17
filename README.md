# Siheyuan Project OS

Sistema vivo para proteger e realizar a intenção arquitetônica da cidadela doméstica siheyuan. Não é um Trello sofisticado — protege a intenção contra decisões locais, atrasos, fornecedores e improvisações de obra.

> O briefing define a filosofia · as pranchas mostram a intenção · os terrenos são avaliados contra o núcleo canônico · as decisões registram compromissos · o cronograma acompanha a evolução · compras e materiais conectam conceito à execução · a obra termina apenas quando o último artefato estiver implantado.

## Como executar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
npm run start    # servir build de produção
npm run lint     # eslint
npm test        # testes do conflicts.ts (node:test, zero dependências)
```

Os dados são persistidos em `localStorage` sob a chave `siheyuan-project-os:v1`. O primeiro carregamento injeta dados de demonstração (Fazenda X com variante B, três decisões e conflito canônico de exemplo).

## Arquitetura

```
src/
  domain/
    types.ts        # 18 entidades tipadas (Terreno, Critério, Implantação,
                    #   PrincípioCanônico, ProgramaArea, Prancha, Etapa, Tarefa,
                    #   Decisão, Fornecedor, Cotação, Material, Ambiente,
                    #   Artefato, Documento, Risco, Usuario + SiheyuanState)
    seed.ts         # princípios canônicos imutáveis, 12 etapas, programa de áreas, riscos
    conflicts.ts    # detecção de conflito canônico em decisões e implantações
    permissions.ts   # matriz de papéis × ações com enforcement
    store.ts        # reducer + actions + persistência (localStorage)
  app/
    StoreProvider.tsx   # React Context: state + dispatch + helpers + seed de demonstração
    layout.tsx          # shell + StoreProvider
    globals.css         # design system (cores mineral/leaf/ocher)
    api/state/route.ts  # endpoint server-side (snapshot do estado canônico)
    page.tsx            # MVP: Dashboard geral
    terrenos/           # MVP: Terrenos candidatos
    roadmap/            # MVP: Roadmap do projeto
    compras-decisoes/   # MVP: Compras & Decisões
    briefing/           # núcleo completo
    riscos/             # núcleo completo
    pranchas/           # núcleo completo (pranchas-mãe de referência no seed)
    fornecedores/       # núcleo completo (fornecedores + cotações comparativas)
    config/             # núcleo completo (papéis/permissões com matriz enforcement)
    implantacoes/ decisoes/ fornecedores/ ambientes/
    operacao/ documentos/   # prontos para expansão (entidades já definidas)
  components/
    AppShell.tsx        # layout + navegação (14 telas agrupadas por MVP/Núcleos/Sistema)
    ui.tsx              # primitivas: StatusChip, StatCard, Badge, money(), area()
    NucleoPlaceholder.tsx
```

## Diferencial central

O sistema **protege a intenção arquitetônica**. Toda decisão registrada passa por `detectCanonicalConflicts`, que verifica o texto da decisão contra regras canônicas. Decisões que ameaçam, por exemplo, **reduzir a Greenhouse Library** ou **dissolver a cidadela doméstica** geram alerta imediato. O mesmo mecanismo se aplica a implantações de terreno.

A pergunta central aparece em cada decisão:
> “Esta escolha ajuda a construir uma vida mais profunda, mais bela, mais tranquila e mais significativa?”

## Entidades do modelo de dados

| Entidade | Papel |
|---|---|
| Terreno | Propriedade candidata (topografia, água, acesso, orientação, ruído, restrições) |
| Critério | Item do checklist canônico aplicado ao terreno |
| Implantação | Variante de assentamento do núcleo num terreno |
| PrincípioCanônico | Verdade protegida e imutável |
| ProgramaArea | Programa de áreas e versões por ambiente |
| Prancha | Vista arquitetônica de um ambiente |
| Etapa | Fase do cronograma (12 etapas canônicas) |
| Tarefa | Atividade dentro de uma etapa |
| Decisão | Registro de compromisso (com pergunta central e reversibilidade) |
| Fornecedor / Cotação / Material | Camada de compras |
| Ambiente / Artefato | Unidades de entrega até o último objeto |
| Documento / Risco | Acervo versionado e ameaças |
| Usuario | Papel (guardião, arquiteto, gestor, comprador, consultor, aprovador) |

## MVP (4 telas)

1. **Dashboard geral** — card vivo do terreno ativo (Fazenda X · variante B · Greenhouse preservada · Pavilhão B deslocado 18 m · custo atualizado · decisões pendentes · conflitos canônicos).
2. **Terrenos candidatos** — CRUD + checklist canônico + implantações + comparação lado a lado + status (descoberta → visita → diligência → finalista → descartado → adquirido).
3. **Roadmap do projeto** — 12 etapas canônicas com status, responsáveis, dependências, orçamento, riscos, critérios de conclusão e tarefas.
4. **Compras & Decisões** — diário de decisões (com pergunta central, reversibilidade e detecção de conflito) + materiais (conceito → garantia, sem virar decisão irrevogável).

## Expansão

Os núcleos restantes (ambiente por ambiente, operação e entrega, documentos) têm entidades e reducers prontos; as telas são placeholders com contexto da estrutura prevista.

## Qualidade

- **Testes** — `tests/conflicts.test.ts` cobre detecção de conflito canônico (16 testes via `node:test`, zero dependências).
- **Permissões** — `src/domain/permissions.ts` define a matriz 6 papéis × 20 ações com enforcement real.
- **CI** — `.github/workflows/ci.yml` roda lint + test + build em cada push/PR para `main`.
