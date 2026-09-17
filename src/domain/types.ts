// Siheyuan Project OS — Domain entity types.
// Canonical, exhaustive definitions of every entity that the system protects.

export type ID = string;

export type ISODate = string;

export type TerrenoStatus =
  | "descoberta"
  | "visita"
  | "diligencia"
  | "finalista"
  | "descartado"
  | "adquirido";

export type AmbienteCategoria =
  | "nucleo"
  | "patio"
  | "hospitalidade"
  | "rural"
  | "infraestrutura"
  | "espiritual"
  | "interior";

export type PavilhaoKey =
  | "portal"
  | "chegada"
  | "patio-chegada"
  | "patio-domestico"
  | "greenhouse-library"
  | "patio-social"
  | "patio-oficios"
  | "jardim-aromatico"
  | "jardim-contemplacao"
  | "pavilhao-a"
  | "pavilhao-b"
  | "laboratorio-perfumaria"
  | "pavilhao-c"
  | "capela-domestica"
  | "capela-externa"
  | "bosque"
  | "zona-produtiva"
  | "infra-rural"
  | "interiores-artefatos";

export type PranchaStatus = "conceito" | "aprovado" | "em-revisao" | "executado";

export type EtapaStatus =
  | "nao-iniciada"
  | "em-andamento"
  | "concluida"
  | "bloqueada";

export type TarefaStatus =
  | "a-fazer"
  | "em-andamento"
  | "concluida"
  | "bloqueada";

export type MaterialStatus =
  | "conceito"
  | "cotado"
  | "amostra"
  | "aprovado"
  | "pedido"
  | "recebido"
  | "instalado"
  | "garantia";

export type ArtefatoStatus = "pendente" | "conceito" | "aprovado" | "executado";

export type DecisaoStatus = "pendente" | "aprovada" | "rejeitada" | "proibida";

export type Reversibilidade = "reversivel" | "parcial" | "irreversivel";

export type Criticidade = "baixa" | "media" | "alta" | "canonica";

export type PrincipoCategoria =
  | "essencia"
  | "espacial"
  | "carater"
  | "resiliencia"
  | "hierarquia";

export interface PrincípioCanônico {
  id: ID;
  enunciado: string;
  categoria: PrincipoCategoria;
  imutavel: boolean;
  descricao?: string;
}

export interface Critério {
  id: ID;
  terrenoId: ID;
  principioId: ID;
  peso: number;
  resultado: "aprovado" | "parcial" | "reprovado" | "pendente";
  evidencia?: string;
}

export interface Implantação {
  id: ID;
  terrenoId: ID;
  variante: string;
  deslocamentos: string;
  conflitos: string[];
  custoEstimado: number;
  custoMoeda: string;
  ativa: boolean;
  notas?: string;
}

export interface Terreno {
  id: ID;
  nome: string;
  local: string;
  area: number;
  topografia?: string;
  agua?: string;
  acesso?: string;
  orientacao?: string;
  ruido?: string;
  restricoesAmbientais?: string;
  fotos: string[];
  mapas: string[];
  documentos: string[];
  contatos: string[];
  status: TerrenoStatus;
  criterioIds: ID[];
  implantacaoIds: ID[];
  createdAt: ISODate;
}

export interface ProgramaArea {
  id: ID;
  ambienteKey: PavilhaoKey;
  nome: string;
  pavilhao: string;
  area: number;
  versao: string;
  notas?: string;
}

export interface Prancha {
  id: ID;
  ambienteKey: PavilhaoKey;
  titulo: string;
  intencaoEspacial: string;
  intencaoEmocional: string;
  principioIds: ID[];
  materiais: string;
  referencias: string;
  status: PranchaStatus;
  orcamentoVinculado?: number;
  fornecedorId?: ID;
  etapaId?: ID;
  alternativas: string;
  createdAt: ISODate;
}

export interface Etapa {
  id: ID;
  nome: string;
  ordem: number;
  descricao?: string;
  responsaveis: string[];
  dependencias: ID[];
  documentoIds: ID[];
  orcamento: number;
  custoReal: number;
  riscos: string[];
  status: EtapaStatus;
  criteriosConclusao: string[];
  inicioPrevisto?: ISODate;
  fimPrevisto?: ISODate;
}

export interface Tarefa {
  id: ID;
  etapaId: ID;
  titulo: string;
  responsavel?: string;
  prazo?: ISODate;
  status: TarefaStatus;
}

export interface Decisão {
  id: ID;
  titulo: string;
  descricao: string;
  opcoes: string[];
  impactoPrograma: string;
  custo: number;
  custoMoeda: string;
  risco: string;
  aprovador?: string;
  data?: ISODate;
  reversibilidade: Reversibilidade;
  principioIds: ID[];
  conflitos: string[];
  perguntaCentral: string;
  respostaPerguntaCentral?: string;
  status: DecisaoStatus;
  ambienteKey?: PavilhaoKey;
  implantacaoId?: ID;
  createdAt: ISODate;
}

export interface Fornecedor {
  id: ID;
  nome: string;
  categoria: string;
  contatos: string[];
  avaliacao?: string;
}

export interface Cotação {
  id: ID;
  fornecedorId: ID;
  materialId: ID;
  preco: number;
  moeda: string;
  validade?: ISODate;
  prazo?: string;
  temAmostra: boolean;
}

export interface Material {
  id: ID;
  referencia: string;
  descricao: string;
  ambienteKey?: PavilhaoKey;
  alternativasEquivalentes: string[];
  preco?: number;
  moeda: string;
  status: MaterialStatus;
  fornecedorId?: ID;
  etapaId?: ID;
  garantia?: string;
  manutencao?: string;
}

export interface Ambiente {
  id: ID;
  ambienteKey: PavilhaoKey;
  nome: string;
  pavilhao: string;
  categoria: AmbienteCategoria;
  checklistEntrega: string[];
  artefatoIds: ID[];
}

export interface Artefato {
  id: ID;
  nome: string;
  ambienteKey: PavilhaoKey;
  referencia?: string;
  status: ArtefatoStatus;
  decisaoId?: ID;
  materialId?: ID;
}

export interface Documento {
  id: ID;
  tipo: string;
  titulo: string;
  entidadeVinculada?: ID;
  versao: number;
  url?: string;
}

export interface Risco {
  id: ID;
  descricao: string;
  probabilidade: "baixa" | "media" | "alta";
  impacto: "baixo" | "medio" | "alto";
  mitigacao: string;
  canonico: boolean;
  principioId?: ID;
  etapaId?: ID;
  resolvido: boolean;
}

export interface Usuario {
  id: ID;
  nome: string;
  papel:
    | "guardiao"
    | "arquiteto"
    | "gestor-obra"
    | "comprador"
    | "consultor"
    | "aprovador";
}

export interface SiheyuanState {
  principios: PrincípioCanônico[];
  terrenos: Terreno[];
  criterios: Critério[];
  implantacoes: Implantação[];
  programaAreas: ProgramaArea[];
  pranchas: Prancha[];
  etapas: Etapa[];
  tarefas: Tarefa[];
  decisoes: Decisão[];
  fornecedores: Fornecedor[];
  cotacoes: Cotação[];
  materiais: Material[];
  ambientes: Ambiente[];
  artefatos: Artefato[];
  documentos: Documento[];
  riscos: Risco[];
  usuarios: Usuario[];
  versao: number;
}
