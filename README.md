# AGUIAR Transporte de Empresas

Calculadora estática para orçamentos corporativos. Publique a pasta na raiz do GitHub Pages ou abra `index.html`.

## Regras implementadas
- R$/km e R$/h são configurados em cada orçamento.
- Ida e volta duplica distância e tempo de percurso.
- Pedágios, estacionamento, alimentação/diária e outros custos são informados manualmente como totais do trajeto (inclua os dois sentidos quando ida e volta).
- Espera pode ser cobrada por hora (com tarifa própria), por valor fixo ou desconsiderada.
- Imposto opcional calculado por dentro: total = subtotal / (1 - percentual/100). Ex.: R$ 100 / 0,99 (1%) = R$ 101,01; / 0,98 (2%) = R$ 102,04; / 0,97 (3%) = R$ 103,09; / 0,96 (4%) = R$ 104,17; / 0,95 (5%) = R$ 105,26; e assim sucessivamente.
- O PDF é gerado pela impressão do navegador; selecione “Salvar como PDF”. Não emite nota fiscal.
- Tema claro padrão, com opção escura e preferência salva localmente.
- Não há backend, envio automático ou integração externa.

- Identidade visual em laranja e branco, com tema escuro opcional.
- Histórico local de viagens/orçamentos: salvar, carregar para editar e excluir.
- O histórico fica armazenado no navegador/dispositivo usado; não sincroniza entre aparelhos nem possui backup em nuvem.
