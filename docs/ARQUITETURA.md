# Arquitetura — Progressive BJJ Design Lab

Plataforma interna de inteligência criativa: uma camiseta original por dia, com frente e costas,
mockups, estampas isoladas, briefing e arquivos técnicos de impressão tendo a YouDraw como referência.
A aprovação é sempre humana.

**Fora do escopo:** e-commerce, checkout, pagamentos, pedidos na YouDraw e publicação automática.

## Visão geral

```
┌──────────────────────────── Next.js 16 (App Router, Vercel) ───────────────────────────┐
│                                                                                         │
│  Interface (React 19 + Tailwind 4)          Servidor (Server Components / Actions)      │
│  ─ Visão geral (dashboard)                  ─ lib/data/*      leitura por bloco          │
│  ─ Daily Drop · Creative Studio             ─ lib/pipeline/*  (etapa 2) orquestração     │
│  ─ Aprovações · Biblioteca · Coleções       ─ lib/engines/*   (etapa 4) Mockup e Print   │
│  ─ Brand Memory · Versões · Exportação                                                    │
│                                                                                         │
└───────────────┬──────────────────────────┬─────────────────────────────┬────────────────┘
                │                          │                             │
        Supabase Postgres          Supabase Storage              APIs externas
        (dados + regras)           mockups/ prints/ exports/     Claude API (briefing, conceito)
        RLS + gatilhos             privados, URL assinada        Provedor de imagens (estampas)
                                                                 Sharp (composição local)
```

## O fluxo de uma criação (alvo das etapas 2 a 5)

1. **Disparo** — o diretor criativo clica em *Gerar criação do dia* (ou um cron diário cria o pedido).
   `creations.drop_date` é único: uma criação por dia, no fuso de São Paulo.
2. **Contexto** — o pipeline lê a Brand Memory ativa (princípios, preferências, o que evitar e os
   aprendizados das últimas decisões) e as últimas criações, para não repetir.
3. **Briefing** — a Claude API devolve um briefing estruturado (conceito, título, frente, costas,
   cores, tipografia, prompts de imagem). Fica em `creation_versions.briefing` e `prompts`.
4. **Estampas** — o provedor de imagens gera a estampa frontal e a traseira. Arquivos vão para o
   bucket `prints/`, com metadados em `assets`.
5. **Mockups** — o Mockup Engine (Sharp) compõe as estampas sobre as bases de camiseta e salva em `mockups/`.
6. **Arquivos técnicos** — o Print Engine (Sharp) gera as versões de impressão conferidas contra
   `print_specs` (medidas da YouDraw cadastradas e verificadas por uma pessoa).
7. **Revisão** — a criação vai para `ready_for_review`. Nada é aprovado automaticamente.
8. **Decisão** — o diretor aprova, rejeita ou pede ajustes, com motivo. A decisão fica em `approvals`.
9. **Aprendizado** — o motivo vira uma linha `learning` na Brand Memory, com referência à decisão.
10. **Nova versão** — um pedido de ajuste gera uma nova linha em `creation_versions` (versões são imutáveis).

Cada chamada externa grava uma linha em `generation_runs` (entrada, saída, erro, custo).

## Banco de dados

Arquivos em `supabase/migrations/`. Tabelas:

| Tabela | Papel |
| --- | --- |
| `creations` | Uma por dia. Status, título, conceito, coleção, versão atual. |
| `creation_versions` | Versões imutáveis: briefing, prompts, modelos usados, instrução do diretor. |
| `assets` | Arquivos de cada versão no Storage, com dimensões, DPI, modo de cor e checksum. |
| `approvals` | Decisões humanas: aprovar, rejeitar, pedir ajustes, com motivo e tags. |
| `brand_memory` | Memória persistente: princípios, preferências, evitar, referências, aprendizados. |
| `collections` | Agrupamento de criações. View `collections_with_counts` para o dashboard. |
| `generation_runs` | Auditoria e custo de cada etapa do pipeline. |
| `print_specs` | Especificações de impressão (YouDraw), cadastradas e verificadas manualmente. |

### Regras garantidas no banco (testadas)

- **Uma criação por dia:** `unique (drop_date)`.
- **Aprovação exclusivamente humana:** o gatilho `approvals_human_only` exige `auth.uid()` e
  `decided_by = auth.uid()`. A chave de serviço (usada pelo pipeline) não tem `auth.uid()`, então não
  consegue aprovar. O gatilho `creations_status_guard` impede mudar o status para
  aprovado/rejeitado/ajustes sem a decisão humana correspondente na versão atual.
- **Versões imutáveis:** `creation_versions_immutable` bloqueia `update`.
- **RLS ligado em todas as tabelas:** só usuários autenticados leem e escrevem.
- **Storage privado:** buckets `mockups`, `prints`, `exports` sem acesso público.

As migrations foram executadas num Postgres em WebAssembly (PGlite) com esquemas `auth` e `storage`
simulados, e cada regra acima foi testada (ver docs/ACOMPANHAMENTO.md). Ainda **não** foram aplicadas
num projeto Supabase real.

## Estrutura de pastas

```
src/
  app/
    layout.tsx              moldura do app (fonte, metadados)
    page.tsx                visão geral (dashboard)
    [module]/page.tsx       tela de cada módulo (estado e roadmap)
    globals.css             tokens visuais
  components/
    shell/                  barra lateral, barra superior, breadcrumb, logo provisório
    dashboard/              blocos da visão geral
    ui/                     Card, Pill
  lib/
    env.ts                  leitura das variáveis e status das integrações (só servidor)
    nav.ts                  mapa dos 11 módulos, grupos e etapas
    types.ts                tipos que espelham o banco
    dates.ts                datas no fuso de São Paulo
    brand/identity.ts       identidade e base inicial da Brand Memory
    supabase/server.ts      cliente Supabase com sessão (RLS)
    data/dashboard.ts       leitura do dashboard, bloco a bloco
supabase/migrations/        esquema, regras e seed
docs/                       arquitetura, decisões, acompanhamento
```

## Como cada bloco se comporta sem credenciais

Cada bloco do dashboard tem três estados: `ok` (dados do banco, mesmo que zero linhas),
`unconfigured` (Supabase sem credenciais) e `error` (o banco respondeu com erro; a mensagem aparece
dentro do bloco). Sem banco, a Memória criativa mostra a base inicial transcrita do briefing e diz isso.
O status das integrações é lido das variáveis de ambiente; nenhum valor de chave chega à interface.
