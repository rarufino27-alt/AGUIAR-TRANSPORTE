# AGUIAR TRANSPORTE

Aplicativo estático de orçamentos corporativos com seleção inicial de modalidade e navegação em etapas.

## Modalidades
- Transporte de pessoas.
- Transporte de materiais, com valor manual de mão de obra.
- Compras para empresa, com valor da nota e foto anexada ao PDF.

## Tarifas automáticas para todas as modalidades
- R$ 2,25 por quilômetro.
- R$ 0,083 por minuto trabalhado.
- Mínimo de 18 km cobrados (R$ 40,50).
- A distância de ida informada é duplicada na opção ida e volta; depois aplica-se o mínimo de 18 km.
- O tempo trabalhado é calculado pela diferença entre hora inicial e hora final. Se a hora final for menor que a inicial, considera-se que a viagem terminou no dia seguinte.
- A distância percorrida em km continua sendo informada pelo usuário; o horário não permite deduzir a distância.

## Demais regras preservadas
- Espera por hora, valor fixo ou sem espera.
- Pedágios e outras despesas informados manualmente como total da viagem.
- Imposto por dentro: subtotal ÷ (1 - percentual/100).
- Histórico permite salvar, carregar para edição e excluir.
- Revisão final, geração de PDF e tema laranja/branco com opção escura.

O histórico e anexos ficam armazenados localmente no navegador. Não há sincronização em nuvem nem emissão de nota fiscal.
