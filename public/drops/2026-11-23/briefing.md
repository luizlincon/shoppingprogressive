# Drop 001 — Grau por Grau

**Data:** 23/11/2026 · **Versão:** 2 · **Status:** aguardando decisão do diretor criativo
**Origem:** criação assistida na sessão de desenvolvimento (o pipeline automático é a etapa 2).
**Versão anterior:** `v1/briefing.md` (aprovada como direção; pedidos de ajuste abaixo).

## O que mudou da v1 para a v2 (pedido do diretor criativo)
1. Estampa do peito maior: de 10 cm para **14 cm** de largura.
2. **Cada faixa na sua cor**, nas costas e na frente.
3. **Uma camiseta por faixa:** quem é faixa marrom compra a do peito marrom, e assim por diante.
   Todas com os quatro graus.

## Conceito
Progredir no Jiu-Jitsu é ganhar um grau de cada vez. A frente diz quem você é hoje (a sua faixa,
com os quatro graus); as costas mostram o caminho inteiro, da branca à preta. A mesma camiseta
serve a todo o tatame, e cada um veste a sua cor.

## Linha
| Variação | Frente | Costas |
| --- | --- | --- |
| Faixa branca | PROGRESSIVE + faixa branca, ponteira preta, 4 graus | Escada colorida |
| Faixa azul | PROGRESSIVE + faixa azul, ponteira preta, 4 graus | Escada colorida |
| Faixa roxa | PROGRESSIVE + faixa roxa, ponteira preta, 4 graus | Escada colorida |
| Faixa marrom | PROGRESSIVE + faixa marrom, ponteira preta, 4 graus | Escada colorida |
| Faixa preta | PROGRESSIVE + faixa preta com contorno branco, ponteira vermelha, 4 graus | Escada colorida |

Camiseta preta em todas. A ponteira preta das faixas coloridas fica vazada (é a própria camiseta).
A faixa preta ganha um contorno branco fino para não sumir no tecido, e a ponteira vermelha, como
a faixa de verdade.

## Cores de impressão
| Uso | Cor |
| --- | --- |
| Textos e graus | Branco `#ffffff` |
| Faixa branca | `#f2f2ee` |
| Faixa azul | `#2f6fd0` |
| Faixa roxa | `#7b4bb3` |
| Faixa marrom | `#9a6238` |
| Faixa preta | `#141414` com contorno branco |
| Ponteira da preta | Vermelho `#c8262c` |

Valores em tela (RGB). Antes de produzir, confirmar com a YouDraw como eles reproduzem essas cores
em tecido preto (pode ser preciso ajustar o azul e o marrom, que escurecem em tecido escuro).

## Arquivos (pasta `v2/`)
| Arquivo | O que é |
| --- | --- |
| `print-front-<faixa>.png` / `.svg` | Estampa frontal de cada faixa, 140 × 41 mm, 300 DPI, fundo transparente |
| `print-back.png` / `.svg` | Estampa traseira, igual nas 5, 300 × 322 mm, 300 DPI, fundo transparente |
| `mockup-front-<faixa>.png` | Mockup plano da frente de cada faixa |
| `mockup-back.png` | Mockup plano das costas |

**Atenção técnica:** medidas provisórias até a conferência na documentação da YouDraw.
