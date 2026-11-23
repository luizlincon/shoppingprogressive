# Progressive BJJ Design Lab

Plataforma interna de inteligência criativa da Progressive BJJ: uma camiseta original por dia, com
mockups de frente e costas, estampas isoladas, briefing criativo e arquivos técnicos de impressão
(com a YouDraw como referência). Quem aprova é sempre o diretor criativo.

Não é e-commerce: sem checkout, sem pagamentos, sem pedidos na YouDraw e sem publicação automática.

## Rodar localmente

Requer Node 20+ (testado com Node 26) e npm.

```bash
npm install
cp .env.example .env.local   # preencha quando tiver as credenciais
npm run dev
```

Abra http://localhost:3000. Sem credenciais, o app funciona e mostra os estados vazios reais.

## Banco de dados (Supabase)

1. Crie um projeto em supabase.com.
2. No SQL Editor, rode em ordem `supabase/migrations/0001_init.sql` e `0002_seed_brand_memory.sql`.
3. Copie a URL e as chaves (Project Settings › API) para `.env.local`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (inclui checagem de tipos) |
| `npm run start` | Serve o build de produção |
| `npm run lint` | ESLint |

## Documentação

- [Arquitetura](docs/ARQUITETURA.md): módulos, fluxo de uma criação, banco e regras.
- [Decisões](docs/DECISOES.md): o que foi decidido e por quê.
- [Acompanhamento](docs/ACOMPANHAMENTO.md): estado de cada etapa e próximos passos.
