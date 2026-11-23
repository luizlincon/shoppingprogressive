# Acompanhamento do desenvolvimento

Arquivo vivo: atualizar ao fim de cada etapa. Legenda: ✅ feito e verificado · 🟡 parcial · ⬜ não iniciado.

## Etapas

| Etapa | Objetivo | Estado |
| --- | --- | --- |
| 1 | Fundação: ambiente, arquitetura, estrutura, identidade visual, dashboard, banco, documentação | ✅ |
| 2 | Pipeline do Daily Drop: Claude API (briefing) + provedor de imagens (estampas) + fila de Aprovações + login | ⬜ |
| 3 | Creative Studio, Biblioteca, Coleções e Histórico de versões | ⬜ |
| 4 | Mockup Engine e Print Engine (Sharp), conferência técnica contra `print_specs` | ⬜ |
| 5 | Exportação (ZIP) e referência técnica YouDraw; deploy na Vercel; cron diário | ⬜ |

## Etapa 1 — 23/11/2026

### Feito
- ✅ Ambiente analisado (Node 26, npm 11, git, gh autenticado; sem CLIs de Supabase/Vercel).
- ✅ Projeto Next.js 16.4.6 + React 19.3 + TypeScript + Tailwind 4 no repositório `luizlincon/shoppingprogressive`.
- ✅ Dependências: `@supabase/supabase-js`, `@supabase/ssr`, `sharp`, `@anthropic-ai/sdk`, `zod`, `server-only`.
- ✅ Identidade visual da interface (tokens em `src/app/globals.css`, decisão D-006).
- ✅ Moldura do app com os 11 módulos na navegação, agrupados em Criação, Acervo, Motores e Saída.
- ✅ Dashboard: criação do dia (moldes frente e costas), sua decisão (6 entregáveis), coleções,
  faixa dos últimos 30 dias, memória criativa, ambiente e integrações.
- ✅ Tela de cada módulo dizendo o que ele vai entregar e em que etapa.
- ✅ Banco: 8 tabelas, 1 view, gatilhos, RLS e buckets em `supabase/migrations/`.
- ✅ Documentação: README, ARQUITETURA, DECISOES, este arquivo, `.env.example`.

### Verificado
- `npm run build` sem erros (TypeScript incluído).
- `npm run lint` sem erros.
- Migrations executadas no PGlite (Postgres 17 em WebAssembly) com `auth` e `storage` simulados:
  - duas criações no mesmo dia → bloqueado;
  - aprovar pela chave de serviço (sem usuário) → bloqueado;
  - registrar aprovação sem usuário autenticado → bloqueado;
  - editar uma versão existente → bloqueado;
  - aprovação por usuário autenticado → aceita.
- Dashboard aberto no navegador em 1440 px e em largura de celular, sem erros no console.

### O que ainda não funciona (de propósito)
- Gerar a criação do dia: botão desabilitado, com o motivo na tela. O pipeline é a etapa 2.
- Aprovar e Rejeitar: desabilitados até existir login e criação para decidir.
- O dashboard lê o banco quando há credenciais; sem elas, mostra os estados vazios reais.

### Depende de credenciais externas
- Supabase: URL, chave pública e chave de serviço; aplicar as migrations no projeto.
- Claude API: `ANTHROPIC_API_KEY`.
- Provedor de imagens: escolher (D-005) e definir `IMAGE_PROVIDER` e a chave.
- Vercel: conectar o repositório para o deploy.
- YouDraw: conferir e cadastrar as medidas reais de impressão (D-007).

## Referências — 23/11/2026
- ✅ R-1 Art of Jiu Jitsu (Adult Apparel) analisada e registrada: `docs/REFERENCIAS.md`,
  `supabase/migrations/0003_reference_art_of_jiu_jitsu.sql` e a base local em `src/lib/brand/identity.ts`
  (5 entradas: 1 referência, 3 preferências, 1 regra de não copiar).
- ⬜ Faltam dados da Progressive BJJ para esse caminho: cidade, academias, ano de fundação, sigla e logotipo.

## Drop 001 — Grau por Grau — 23/11/2026
- ✅ Primeira criação, feita de forma assistida nesta sessão (o pipeline automático continua sendo a etapa 2).
- ✅ Estampas desenhadas em vetor (`scripts/render-drop-001.mjs`), texto em curvas, Barlow Condensed (OFL).
- ✅ Arquivos em `public/drops/2026-11-23/`: estampas frente (1181 × 709 px) e costas (3543 × 3803 px)
  em PNG transparente a 300 DPI e em SVG, mockups planos de frente e costas, `briefing.md` e `drop.json`.
- ✅ Dashboard lê a criação dos arquivos locais enquanto o banco não está conectado.
- ✅ v1 aprovada como direção, com ajustes pedidos.
- ✅ v2: peito de 10 para 14 cm; faixas coloridas na frente e nas costas; 5 variações (uma por faixa),
  todas com 4 graus. Script `scripts/render-drop-001-v2.mjs`, ferramentas em `scripts/lib/print-kit.mjs`.
  v1 guardada em `public/drops/2026-11-23/v1/`.
- ✅ Dashboard: seletor de faixa troca o mockup da frente.
- ⬜ Decisão do diretor criativo sobre a v2.
- ⬜ Medidas e reprodução de cor na YouDraw a conferir antes de imprimir.

## Próxima etapa recomendada (2)
1. Criar o projeto Supabase, aplicar as migrations e preencher `.env.local`.
2. Login por link mágico (Supabase Auth) para um único diretor criativo.
3. Escolher o provedor de imagens (D-005) com um teste de 3 estampas.
4. Pipeline: Brand Memory → Claude (briefing estruturado com `zod`) → estampas → `ready_for_review`.
5. Tela de Aprovações: aprovar, rejeitar, pedir ajustes com motivo → aprendizado na Brand Memory.
