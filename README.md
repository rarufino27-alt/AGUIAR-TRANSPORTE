# FELMOR Transporte de Empresas

Calculadora estática para orçamentos corporativos. Publique a pasta na raiz do GitHub Pages ou abra `index.html`.

## Regras implementadas
- R$/km e R$/h são configurados em cada orçamento.
- Ida e volta duplica distância e tempo de percurso.
- Pedágios, estacionamento, alimentação/diária e outros custos são informados manualmente como totais do trajeto (inclua os dois sentidos quando ida e volta).
- Espera pode ser cobrada por hora (com tarifa própria), por valor fixo ou desconsiderada.
- Imposto opcional calculado por dentro: total = subtotal / (1 - percentual/100). Ex.: R$ 100 / 0,90 = R$ 111,11 para 10%.
- O PDF é gerado pela impressão do navegador; selecione “Salvar como PDF”. Não emite nota fiscal.
- Tema claro padrão, com opção escura e preferência salva localmente.
- Não há backend, envio automático ou integração externa.
