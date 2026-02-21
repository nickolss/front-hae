export const COURSE_OPTIONS = [
  {
    value: "Análise e Desenvolvimento de Sistemas AMS",
    label: "Análise e Desenvolvimento de Sistemas AMS",
  },
  {
    value: "Análise e Desenvolvimento de Sistemas",
    label: "Análise e Desenvolvimento de Sistemas",
  },
  { value: "Comercio Exterior", label: "Comércio Exterior" },
  {
    value: "Desenvolvimento de Produtos Plásticos",
    label: "Desenvolvimento de Produtos Plásticos",
  },
  {
    value: "Desenvolvimento de Software Multiplataforma",
    label: "Desenvolvimento de Software Multiplataforma",
  },
  { value: "Gestão de Recursos Humanos", label: "Gestão de Recursos Humanos" },
  { value: "Gestão Empresarial", label: "Gestão Empresarial" },
  { value: "Gestão Empresarial EAD", label: "Gestão Empresarial EAD" },
  { value: "Logística", label: "Logística" },
  { value: "Polímeros", label: "Polímeros" },
];

export const HAE_TYPE_OPTIONS = [
  { value: "ApoioDirecao", label: "Apoio à Direção" },
  { value: "Estagio", label: "Estágio" },
  { value: "TCC", label: "Trabalho de Conclusão de Curso" },
];

export const STATUS_OPTIONS = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REPROVADO", label: "Reprovado" },
  { value: "FECHAMENTO_SOLICITADO", label: "Fechamento Solicitado" },
  { value: "COMPLETO", label: "Completo" },
];

export const MODALITY_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "HIBRIDO", label: "Híbrido" },
  { value: "ONLINE", label: "Online" },
];

export const VIEWED_OPTIONS = [
  { value: "true", label: "Visualizadas" },
  { value: "false", label: "Não Visualizadas" },
];

export const DIMENSAO_OPTIONS = [
  {
    value: "DIMENSAO_1_DIDATICO_PEDAGOGICO",
    label: "Dimensão 1: Didático-Pedagógico",
  },
  {
    value: "DIMENSAO_2_LABORATORIOS_ENSINO_E_EQUIPAMENTOS",
    label: "Dimensão 2: Laboratórios - Ensino e Equipamentos",
  },
  {
    value: "DIMENSAO_3_PESQUISA_E_EXTENSAO_EQUIPAMENTOS_E_LABORATORIOS",
    label: "Dimensão 3: Pesquisa e Extensão - Equipamentos e Laboratórios",
  },
  {
    value: "DIMENSAO_4_ATIVIDADES_FORMATIVAS",
    label:
      "Dimensão 4: Atividades Formativas (IC, PCIs, Projetos de alunos, etc)",
  },
  {
    value: "DIMENSAO_5_INFRAESTRUTURA",
    label: "Dimensão 5: Infraestrutura (Água, pisos, ventilação, refrigeração)",
  },
  {
    value: "DIMENSAO_6_DESENVOLVIMENTO_DE_PESSOAS",
    label:
      "Dimensão 6: Desenvolvimento de Pessoas (Capacitação, engetec, cursos livres)",
  },
  {
    value: "DIMENSAO_7_CONVENIOS_E_PARCEIRAS_INSTITUCIONAIS",
    label:
      "Dimensão 7: Convênios e Parcerias (IBM, JA, Parcerias com empresários)",
  },
  {
    value: "DIMENSAO_8_IMPLANTACAO_DE_CURSOS",
    label:
      "Dimensão 8: Implantação de Cursos (Novos cursos superiores, AMS Design, outros)",
  },
  {
    value: "DIMENSAO_9_GESTAO_DA_ROTINA",
    label:
      "Dimensão 9: Gestão da Rotina (NDE, CEPE, CPA, ENADE, WebSai, inclusão, acessibilidade, atendimento ao aluno)",
  },
];

export const DIMENSAO_LABELS: Record<string, string> = DIMENSAO_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>
);

export const HAE_TYPE_LABELS: Record<string, string> = HAE_TYPE_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>
);