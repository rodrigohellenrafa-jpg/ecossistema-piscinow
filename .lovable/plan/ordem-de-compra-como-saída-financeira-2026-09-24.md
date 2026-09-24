# Ordem de compra como saída financeira

## Resultado
- Trocar o destaque verde das ordens executadas por vermelho, identificando visualmente uma saída.
- Ao executar uma ordem, criar imediatamente um único título pendente em **Contas a Pagar**, ligado à O.C., sem descontar saldo bancário nesse momento.
- Impedir título duplicado para a mesma O.C.
- Ao marcar a O.C. como **Comprado**, abrir a confirmação de pagamento para escolher conta, data e valor; só então baixar o título e descontar a conta escolhida.
- Ao dar baixa pelo **Contas a Pagar**, atualizar a mesma O.C. e seus valores pagos, sem criar outra despesa ou descontar o saldo duas vezes.
- Pagamentos parciais permanecem registrados, mantendo o saldo restante em aberto.

## Ajustes técnicos
- Centralizar a sincronização entre `ordens_compra`, `contas` e `ordem_compra_pagamentos` no banco para funcionar em qualquer tela.
- Usar vínculos únicos entre O.C., título e pagamento para tornar as operações repetidas seguras.
- Preservar estorno, edição e exclusão de pagamentos com recomposição correta do saldo.
- Validar execução, baixa pela O.C. e baixa por Contas a Pagar em um fluxo completo.
