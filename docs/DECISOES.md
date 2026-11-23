# Registro de decisões

Cada decisão tem contexto, escolha e consequência. Decisões novas entram no fim.

## D-001 — Next.js 16 com App Router e Cache Components
**Data:** 23/11/2026
**Contexto:** a stack pedida é Next.js + React + TypeScript + Tailwind, com deploy na Vercel.
**Escolha:** `create-next-app@16.4.6` com `src/`, App Router, Turbopack e `cacheComponents: true`
(padrão do template). Dados do dia são lidos com `connection()` dentro de `<Suspense>`; a moldura
é pré-renderizada e o conteúdo dinâmico chega por streaming.
**Consequência:** a config de segmento `dynamicParams` não é compatível com Cache Components e foi
removida; módulos desconhecidos caem em `notFound()`.

## D-002 — Supabase como banco, autenticação e Storage
**Contexto:** precisamos de memória persistente, histórico de versões e arquivos grandes.
**Escolha:** Postgres do Supabase com RLS em todas as tabelas; Storage com buckets privados
(`mockups`, `prints`, `exports`) e URLs assinadas. Migrations em SQL puro em `supabase/migrations/`.
**Consequência:** sem a CLI do Supabase instalada, as migrations são aplicadas pelo SQL Editor do
painel (ou pela CLI, depois de instalada).

## D-003 — Aprovação humana garantida no banco, não só na interface
**Contexto:** "Não aprovar criações automaticamente" é regra central.
**Escolha:** gatilhos em `approvals` e `creations` exigem `auth.uid()`. O pipeline de geração usa a
chave de serviço, que não tem `auth.uid()`; portanto ele pode criar e atualizar até `ready_for_review`,
mas nunca aprovar.
**Consequência:** mesmo um bug no código do pipeline não consegue aprovar uma criação.

## D-004 — Versões imutáveis
**Contexto:** histórico de versões e aprendizado precisam de rastreabilidade.
**Escolha:** cada geração ou ajuste cria uma linha nova em `creation_versions`; `update` é bloqueado.
A criação aponta para a versão atual (`current_version_id`).

## D-005 — Provedor de imagens independente e ainda não escolhido
**Contexto:** o briefing pede um provedor de imagens independente da Claude API.
**Escolha:** o código só referencia `IMAGE_PROVIDER` e `IMAGE_PROVIDER_API_KEY`. A escolha (critérios:
qualidade de tipografia em estampas, saída em alta resolução, fundo transparente, custo por imagem,
termos de uso comercial) fica para o início da etapa 2.
**Consequência:** nenhuma integração de imagem foi simulada.

## D-006 — Identidade visual da interface
**Contexto:** interface profissional, moderna, minimalista e voltada à criação visual, para desktop.
**Escolha:** estilo "moldura tingida, folha branca" (skill de direção de arte, seed 1779691102):
barra lateral e barra superior num cinza de tatame (`#f3f4f2`), o trabalho numa folha branca recuada
8px, sem sombras nem gradientes. Fonte IBM Plex Sans (400/500/600). A cor da marca na interface é o
**azul de faixa** (`#1f4f8f`), usado só nos dados (criação aprovada, estado selecionado); o botão
principal é quase preto. O elemento-assinatura é a **faixa dos últimos 30 dias**: cada dia é um
segmento, e hoje fica marcado na ponta.
**Consequência:** as criações (mockups coloridos) são o que tem cor na tela; a interface recua.
O logotipo na barra lateral é provisório (uma faixa preta com ponteira) até chegar o logo oficial.

## D-007 — YouDraw só como referência técnica
**Contexto:** não criar pedidos nem integração de compra na YouDraw.
**Escolha:** tabela `print_specs` sem valores semeados. As medidas (área de impressão, DPI, formato,
modo de cor) serão conferidas na documentação oficial da YouDraw e cadastradas por uma pessoa, com
`verified = true` e a URL da fonte.
**Consequência:** a área de estampa desenhada nos moldes do dashboard é provisória e está rotulada assim.

## D-008 — Ambiente de desenvolvimento
Verificado em 23/11/2026: Node 26.13.0, npm 11.20.0, git 2.56.1, GitHub CLI autenticado.
Não instalados: CLI do Supabase, CLI da Vercel, pnpm, Docker, Postgres. Usamos npm.
