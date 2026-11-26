# AGUIAR TRANSPORTE

Aplicativo estático de orçamentos corporativos, com seleção inicial do tipo de orçamento e navegação em etapas.

## Modalidades
- **Transporte de pessoas:** mantém cálculo por quilômetro e hora, modalidade ida/ida e volta, espera, pedágios e demais despesas.
- **Transporte de materiais:** mantém os custos de transporte e acrescenta valor manual de mão de obra.
- **Compras para empresa:** mantém os custos de deslocamento e acrescenta o valor da nota da compra; permite anexar foto da nota/comprovante, incluída no PDF.

## Regras
- Ida e volta duplica automaticamente a distância e o tempo do percurso.
- Pedágios e demais despesas são informados manualmente como total da viagem.
- Espera por hora, valor fixo ou sem espera.
- Imposto por dentro: subtotal ÷ (1 - percentual/100).
- Histórico permite salvar, carregar para edição e excluir.
- O resumo aparece na última etapa; o PDF é gerado pela impressão do navegador.
- Tema laranja e branco com opção escura.

O histórico e a foto anexada ficam armazenados localmente no navegador. Fotos são redimensionadas/comprimidas antes de salvar. Não há sincronização em nuvem nem emissão de nota fiscal.
