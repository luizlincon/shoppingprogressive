-- Aprendizados do Drop 001 "Grau por Grau" (23/11/2026)
-- v1: ajustes pedidos · v2: aprovada pelo diretor criativo.
-- A decisão foi dada no chat da sessão de desenvolvimento, antes de existir login; por isso não há
-- linha em approvals (que exige auth.uid()). Ao migrar o drop para o banco, registrar a decisão pela
-- tela de Aprovações e ligar source_approval_id.
-- Mesma lista de src/lib/brand/identity.ts.

insert into brand_memory (kind, content, source) values
  ('learning', 'Aprovado (Drop 001): a faixa e os graus como linguagem visual da marca. O nome Progressive conversa com a progressão de graduação.', 'approval'),
  ('learning', 'Aprovado (Drop 001): uma camiseta por faixa. O atleta compra a da sua graduação; vale pensar linhas com variações por faixa.', 'approval'),
  ('learning', 'Aprovado (Drop 001): cores reais das faixas (branca, azul, roxa, marrom, preta com ponteira vermelha), sempre com os 4 graus.', 'approval'),
  ('learning', 'Ajuste pedido (Drop 001 v1): estampa de peito de 10 cm ficou pequena; o diretor prefere cerca de 14 cm de largura no peito.', 'rejection');
