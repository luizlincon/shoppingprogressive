/**
 * Mapa dos módulos do Design Lab.
 * Cada módulo é uma tela própria. `stage` diz em que etapa do roadmap ele entra
 * (ver docs/ACOMPANHAMENTO.md) e `status` diz o que existe hoje, sem exagero.
 */
export type ModuleStatus = "ativo" | "estrutura" | "planejado";

export type AppModule = {
  slug: string;
  label: string;
  group: "Criação" | "Acervo" | "Motores" | "Saída";
  summary: string;
  delivers: string[];
  stage: number;
  status: ModuleStatus;
};

export const MODULES: AppModule[] = [
  {
    slug: "daily-drop",
    label: "Daily Drop",
    group: "Criação",
    summary: "A criação do dia: uma proposta completa por execução, frente e costas.",
    delivers: [
      "Disparo manual da criação do dia (uma por data)",
      "Proposta completa: conceito, estampas, mockups e briefing",
      "Envio para Aprovações, nunca publicação automática",
    ],
    stage: 2,
    status: "planejado",
  },
  {
    slug: "creative-studio",
    label: "Creative Studio",
    group: "Criação",
    summary: "Onde o diretor criativo pede variações, ajusta o briefing e compara versões.",
    delivers: [
      "Edição do briefing criativo antes de gerar",
      "Pedido de nova versão com instrução escrita",
      "Comparação lado a lado entre versões",
    ],
    stage: 3,
    status: "planejado",
  },
  {
    slug: "aprovacoes",
    label: "Aprovações",
    group: "Criação",
    summary: "Fila de decisões. Só uma pessoa aprova; o sistema nunca aprova sozinho.",
    delivers: [
      "Aprovar, rejeitar ou pedir ajustes com motivo",
      "Motivo e tags alimentam a Brand Memory",
      "Bloqueio no banco: aprovação exige usuário humano autenticado",
    ],
    stage: 2,
    status: "estrutura",
  },
  {
    slug: "biblioteca",
    label: "Biblioteca",
    group: "Acervo",
    summary: "Todas as criações, filtráveis por status, coleção e data.",
    delivers: ["Grade de criações com mockups", "Filtros por status, coleção e período"],
    stage: 3,
    status: "estrutura",
  },
  {
    slug: "colecoes",
    label: "Coleções",
    group: "Acervo",
    summary: "Agrupamentos de criações aprovadas em linhas e temporadas.",
    delivers: ["Criar e nomear coleções", "Associar criações aprovadas"],
    stage: 3,
    status: "estrutura",
  },
  {
    slug: "versoes",
    label: "Histórico de versões",
    group: "Acervo",
    summary: "Cada geração é uma versão imutável, com prompt, modelo e arquivos.",
    delivers: ["Linha do tempo de versões por criação", "Prompt, modelo e custo de cada versão"],
    stage: 3,
    status: "estrutura",
  },
  {
    slug: "brand-memory",
    label: "Brand Memory",
    group: "Motores",
    summary: "Memória persistente da marca: princípios, preferências e o que evitar.",
    delivers: [
      "Base inicial vinda do briefing da marca",
      "Aprendizado a partir de aprovações e rejeições",
      "Contexto injetado em cada geração via Claude API",
    ],
    stage: 2,
    status: "estrutura",
  },
  {
    slug: "mockup-engine",
    label: "Mockup Engine",
    group: "Motores",
    summary: "Composição das estampas sobre bases de camiseta, frente e costas.",
    delivers: ["Bases de camiseta por cor", "Composição com Sharp", "Saída em PNG para revisão"],
    stage: 4,
    status: "planejado",
  },
  {
    slug: "print-engine",
    label: "Print Engine",
    group: "Motores",
    summary: "Estampas isoladas em alta resolução, prontas para conferência técnica.",
    delivers: [
      "Estampa frontal e traseira isoladas, fundo transparente",
      "Conferência de DPI, dimensões e modo de cor",
    ],
    stage: 4,
    status: "planejado",
  },
  {
    slug: "exportacao",
    label: "Exportação",
    group: "Saída",
    summary: "Pacote de arquivos de uma criação aprovada para download.",
    delivers: ["ZIP com estampas, mockups e briefing", "Nomes de arquivo padronizados"],
    stage: 5,
    status: "planejado",
  },
  {
    slug: "youdraw",
    label: "YouDraw",
    group: "Saída",
    summary: "Referência técnica de impressão. Sem pedidos, sem integração de compra.",
    delivers: [
      "Especificações de área de impressão conferidas manualmente",
      "Validação dos arquivos contra essas especificações",
    ],
    stage: 5,
    status: "estrutura",
  },
];

export const NAV_GROUPS = ["Criação", "Acervo", "Motores", "Saída"] as const;

export function findModule(slug: string) {
  return MODULES.find((m) => m.slug === slug);
}
