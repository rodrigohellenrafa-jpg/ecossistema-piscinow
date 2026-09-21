# Ordem de compra em uma única grade

## Resultado
- Manter produtos disponíveis e itens de ordens já executadas na mesma grade.
- Exibir uma linha por produto com O.C., fornecedor, SKU, produto, cor, modelo, quantidade, valor, desconto, total, vínculo, NF e status.
- Enquanto a compra não for executada, as linhas selecionáveis ficam identificadas como **Nova**.
- Ao clicar em **Executar ordem**, gravar os itens selecionados, atribuir o número da O.C. e limpar a seleção para iniciar a próxima ordem.
- Preservar alteração de status, registro de NF, impressão, PDF e envio ao fornecedor.

## Organização da tela
- Remover a seção separada “Ordens já criadas”.
- Colocar filtros, totais, crédito do fabricante e ações junto da grade única.
- Ordens anteriores continuam consultáveis e editáveis pelas próprias linhas, sem navegar para outra página.

## Detalhes técnicos
- Reaproveitar o salvamento automático já existente nos itens ainda não executados.
- Unificar os dados de produtos e itens comprados em uma apresentação tabular única.
- Após executar, atualizar os dados da grade e abrir uma nova seleção vazia, sem reutilizar o número anterior.
- Validar a tela em computador e celular e confirmar o fluxo completo de execução de uma ordem.
