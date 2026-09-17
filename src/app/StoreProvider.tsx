"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { emptyState, loadState, saveState, reducer, newId, exportState, type Action } from "@/domain/store";
import type { SiheyuanState, Terreno, Implantação, Decisão } from "@/domain/types";
import type { Papel } from "@/domain/permissions";
import { pode } from "@/domain/permissions";
import type { Acao } from "@/domain/permissions";
import { detectCanonicalConflicts, detectImplantacaoConflicts } from "@/domain/conflicts";

const PERGUNTA_CENTRAL =
  "Esta escolha ajuda a construir uma vida mais profunda, mais bela, mais tranquila e mais significativa?";

interface StoreContextValue {
  state: SiheyuanState;
  dispatch: (action: Action) => void;
  ready: boolean;
  perguntaCentral: string;
  papel: Papel;
  setPapel: (p: Papel) => void;
  pode: (acao: Acao) => boolean;
  helpers: {
    addTerreno: (t: Omit<Terreno, "id" | "criterioIds" | "implantacaoIds" | "createdAt">) => Terreno;
    addImplantacao: (i: Omit<Implantação, "id" | "conflitos">) => Implantação;
    addDecisao: (d: Omit<Decisão, "id" | "createdAt" | "perguntaCentral" | "conflitos">) => Decisão;
    conflictsForDecisao: (d: Decisão) => string[];
    conflictsForImplantacao: (i: Implantação) => string[];
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

function seedDemo(state: SiheyuanState): SiheyuanState {
  if (state.terrenos.length > 0) return state;
  const terrenoId = newId("terreno");
  const implAId = newId("impl");
  const implBId = newId("impl");
  const decId1 = newId("dec");
  const decId2 = newId("dec");
  const decId3 = newId("dec");

  const fazendaX: Terreno = {
    id: terrenoId,
    nome: "Fazenda X",
    local: "Zona rural, município a definir",
    area: 240000,
    topografia: "Suave, platô central com declive ao sul",
    agua: "Nascente própria + córrego perene",
    acesso: "Estrada municipal de terra, 1,2 km da rodovia",
    orientacao: "Largo platô com orientação norte favorável",
    ruido: "Baixo; somente vento e fauna",
    restricoesAmbientais: "APP marginal ao córrego; sem mata primária",
    fotos: [],
    mapas: [],
    documentos: [],
    contatos: ["Corretor — a confirmar"],
    status: "diligencia",
    criterioIds: [],
    implantacaoIds: [implAId, implBId],
    createdAt: new Date().toISOString(),
  };

  const implA: Implantação = {
    id: implAId,
    terrenoId,
    variante: "A",
    deslocamentos: "Greenhouse Library central; Pavilhão B adjacente",
    conflitos: [],
    custoEstimado: 4200000,
    custoMoeda: "BRL",
    ativa: false,
    notas: "Implantação canônica de referência.",
  };
  const implB: Implantação = {
    id: implBId,
    terrenoId,
    variante: "B",
    deslocamentos: "Pavilhão B deslocado 18 m; jardim aromático ampliado; Greenhouse Library preservada",
    conflitos: [],
    custoEstimado: 4380000,
    custoMoeda: "BRL",
    ativa: true,
    notas: "Variante ativa — adapta topografia mantendo a Greenhouse Library.",
  };

  const dec1: Decisão = {
    id: decId1,
    titulo: "Adotar implantação alternativa B na Fazenda X",
    descricao: "Deslocar o Pavilhão B 18 m para acomodar declive e ampliar o jardim aromático.",
    opcoes: ["Variante A — referência", "Variante B — deslocar Pavilhão B 18 m"],
    impactoPrograma: "Jardim aromático ampliado; Greenhouse Library preservada.",
    custo: 180000,
    custoMoeda: "BRL",
    risco: "Baixo. Reversível até a fundação.",
    aprovador: "Guardião do briefing",
    data: new Date().toISOString(),
    reversibilidade: "parcial",
    principioIds: ["princ-001", "princ-004"],
    conflitos: [],
    perguntaCentral: PERGUNTA_CENTRAL,
    respostaPerguntaCentral: "Sim — preserva o coração e melhora a relação com o jardim aromático.",
    status: "aprovada",
    ambienteKey: "jardim-aromatico",
    implantacaoId: implBId,
    createdAt: new Date().toISOString(),
  };
  const dec2Draft: Decisão = {
    id: decId2,
    titulo: "Avaliar redução da Greenhouse Library para cortar custo",
    descricao: "Estudo de reduzir a Greenhouse Library para diminuir custo de vidro especial.",
    opcoes: ["Manter 180 m²", "Reduzir para 120 m²"],
    impactoPrograma: "Reduzir a Greenhouse Library comprometeria o coração da experiência.",
    custo: -90000,
    custoMoeda: "BRL",
    risco: "Canônico.",
    reversibilidade: "irreversivel",
    principioIds: ["princ-001"],
    conflitos: [],
    perguntaCentral: PERGUNTA_CENTRAL,
    status: "proibida",
    createdAt: new Date().toISOString(),
  };
  dec2Draft.conflitos = detectCanonicalConflicts(dec2Draft);
  const dec3: Decisão = {
    id: decId3,
    titulo: "Definir forro da capela externa",
    descricao: "Selecionar entre madeira tratada e lambris de cal.",
    opcoes: ["Madeira tratada", "Lambris de cal"],
    impactoPrograma: "Apenas materialidade; sem impacto canônico.",
    custo: 24000,
    custoMoeda: "BRL",
    risco: "Baixo.",
    reversibilidade: "reversivel",
    principioIds: ["princ-009"],
    conflitos: [],
    perguntaCentral: PERGUNTA_CENTRAL,
    status: "pendente",
    ambienteKey: "capela-externa",
    createdAt: new Date().toISOString(),
  };

  let s = state;
  s = reducer(s, { type: "ADD_TERRENO", terreno: fazendaX });
  s = reducer(s, { type: "ADD_IMPLANTACAO", implantacao: implA });
  s = reducer(s, { type: "ADD_IMPLANTACAO", implantacao: implB });
  s = reducer(s, { type: "ADD_DECISAO", decisao: dec1 });
  s = reducer(s, { type: "ADD_DECISAO", decisao: dec2Draft });
  s = reducer(s, { type: "ADD_DECISAO", decisao: dec3 });
  return s;
}

const PAPEL_KEY = "siheyuan-project-os:papel";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, emptyState);
  const [ready, setReady] = useState(false);
  const [papel, setPapelState] = useState<Papel>("guardiao");
  const remoteSynced = useRef(false);
  const lastSync = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(PAPEL_KEY);
      if (saved) setPapelState(saved as Papel);
    }
  }, []);

  const setPapel = (p: Papel) => {
    setPapelState(p);
    if (typeof window !== "undefined") window.localStorage.setItem(PAPEL_KEY, p);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loaded = loadState();
      try {
        const res = await fetch("/api/state");
        if (res.ok) {
          const data = await res.json();
          if (data.source === "neon" && data.state) {
            loaded = data.state as SiheyuanState;
          }
        }
      } catch {
        // network or DB unavailable — continue with localStorage
      }
      if (cancelled) return;
      const seeded = seedDemo(loaded);
      dispatch({ type: "SET_STATE", state: seeded });
      lastSync.current = JSON.stringify(seeded);
      setReady(true);
      remoteSynced.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
    if (!remoteSynced.current) return;
    const serialized = JSON.stringify(state);
    if (serialized === lastSync.current) return;
    lastSync.current = serialized;
    const timer = setTimeout(() => {
      fetch("/api/state", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: exportState(state),
      }).catch(() => {});
    }, 1200);
    return () => clearTimeout(timer);
  }, [state, ready]);

  const value = useMemo<StoreContextValue>(() => {
    const addTerreno: StoreContextValue["helpers"]["addTerreno"] = (t) => {
      const terreno: Terreno = {
        ...t,
        id: newId("terreno"),
        criterioIds: [],
        implantacaoIds: [],
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TERRENO", terreno });
      return terreno;
    };
    const addImplantacao: StoreContextValue["helpers"]["addImplantacao"] = (i) => {
      const conflitos = detectImplantacaoConflicts(
        { ...i, id: newId("impl"), conflitos: [] },
        state.programaAreas
      );
      const implantacao: Implantação = { ...i, id: newId("impl"), conflitos };
      dispatch({ type: "ADD_IMPLANTACAO", implantacao });
      return implantacao;
    };
    const addDecisao: StoreContextValue["helpers"]["addDecisao"] = (d) => {
      const decisao: Decisão = {
        ...d,
        id: newId("dec"),
        perguntaCentral: PERGUNTA_CENTRAL,
        conflitos: [],
        createdAt: new Date().toISOString(),
      };
      decisao.conflitos = detectCanonicalConflicts(decisao);
      dispatch({ type: "ADD_DECISAO", decisao });
      return decisao;
    };
    return {
      state,
      dispatch,
      ready,
      perguntaCentral: PERGUNTA_CENTRAL,
      papel,
      setPapel,
      pode: (acao: Acao) => pode(papel, acao),
      helpers: {
        addTerreno,
        addImplantacao,
        addDecisao,
        conflictsForDecisao: detectCanonicalConflicts,
        conflictsForImplantacao: (i) => detectImplantacaoConflicts(i, state.programaAreas),
      },
    };
  }, [state, ready, papel]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de StoreProvider");
  return ctx;
}
