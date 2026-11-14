export type Role = "PROFESSOR" | "COORDENADOR" | "DIRETOR" | "ADMIN" | "DEV";
export type HaeStatus = "PENDENTE" | "APROVADO" | "REPROVADO" | "FECHAMENTO_SOLICITADO" | "COMPLETO";
export type HaeType = "APOIO_DIRECAO" | "ESTAGIO" | "TCC";
export type Modality = "PRESENCIAL" | "HIBRIDO" | "ONLINE";
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type Dimension =
  | "DIMENSAO_1_DIDATICO_PEDAGOGICO"
  | "DIMENSAO_2_LABORATORIOS_ENSINO_E_EQUIPAMENTOS"
  | "DIMENSAO_3_PESQUISA_E_EXTENSAO_EQUIPAMENTOS_E_LABORATORIOS"
  | "DIMENSAO_4_ATIVIDADES_FORMATIVAS"
  | "DIMENSAO_5_INFRAESTRUTURA"
  | "DIMENSAO_6_DESENVOLVIMENTO_DE_PESSOAS"
  | "DIMENSAO_7_CONVENIOS_E_PARCEIRAS_INSTITUCIONAIS"
  | "DIMENSAO_8_IMPLANTACAO_DE_CURSOS"
  | "DIMENSAO_9_GESTAO_DA_ROTINA";

export const ROLE_LABELS: Record<Role, string> = {
  PROFESSOR: "Professor(a)",
  COORDENADOR: "Coordenador(a)",
  DIRETOR: "Diretor(a)",
  ADMIN: "Administrador(a)",
  DEV: "Desenvolvedor(a)",
};

export const STATUS_LABELS: Record<HaeStatus, string> = {
  PENDENTE: "Aguardando avaliação",
  APROVADO: "Aprovada",
  REPROVADO: "Reprovada",
  FECHAMENTO_SOLICITADO: "Fechamento em análise",
  COMPLETO: "Concluída",
};

export const STATUS_HINTS: Record<HaeStatus, string> = {
  PENDENTE: "A coordenação ainda vai avaliar esta HAE.",
  APROVADO: "Execute as atividades e, ao final, envie o relatório de fechamento.",
  REPROVADO: "Veja o motivo, ajuste a HAE e envie novamente.",
  FECHAMENTO_SOLICITADO: "A coordenação está avaliando o relatório de fechamento.",
  COMPLETO: "HAE encerrada. Nenhuma ação pendente.",
};

export const TYPE_LABELS: Record<HaeType, string> = {
  APOIO_DIRECAO: "Apoio à Direção",
  ESTAGIO: "Estágio",
  TCC: "Trabalho de Conclusão de Curso (TCC)",
};

export const MODALITY_LABELS: Record<Modality, string> = {
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
  ONLINE: "Online",
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Segunda-feira",
  TUESDAY: "Terça-feira",
  WEDNESDAY: "Quarta-feira",
  THURSDAY: "Quinta-feira",
  FRIDAY: "Sexta-feira",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

export const DIMENSION_LABELS: Record<Dimension, string> = {
  DIMENSAO_1_DIDATICO_PEDAGOGICO: "1 · Didático-pedagógico",
  DIMENSAO_2_LABORATORIOS_ENSINO_E_EQUIPAMENTOS: "2 · Laboratórios de ensino e equipamentos",
  DIMENSAO_3_PESQUISA_E_EXTENSAO_EQUIPAMENTOS_E_LABORATORIOS: "3 · Pesquisa e extensão",
  DIMENSAO_4_ATIVIDADES_FORMATIVAS: "4 · Atividades formativas (IC, projetos de alunos…)",
  DIMENSAO_5_INFRAESTRUTURA: "5 · Infraestrutura",
  DIMENSAO_6_DESENVOLVIMENTO_DE_PESSOAS: "6 · Desenvolvimento de pessoas (capacitação, cursos livres…)",
  DIMENSAO_7_CONVENIOS_E_PARCEIRAS_INSTITUCIONAIS: "7 · Convênios e parcerias institucionais",
  DIMENSAO_8_IMPLANTACAO_DE_CURSOS: "8 · Implantação de cursos",
  DIMENSAO_9_GESTAO_DA_ROTINA: "9 · Gestão da rotina (NDE, CPA, ENADE, atendimento…)",
};

export const options = <K extends string>(labels: Record<K, string>) =>
  (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));

/** Papéis que enxergam HAEs de toda a instituição. */
export const canViewInstitution = (role: Role) => role !== "PROFESSOR";
export const canReview = (role: Role) => role === "COORDENADOR" || role === "ADMIN" || role === "DEV";
export const canManageInstitution = (role: Role) => role === "DIRETOR" || role === "ADMIN" || role === "DEV";
export const isGlobal = (role: Role) => role === "ADMIN" || role === "DEV";
