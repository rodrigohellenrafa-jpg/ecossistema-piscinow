# Ordem de compra por produto

## Objetivo
Transformar a tela de Ordens de Compra em uma lista operacional simples, com uma linha por produto e seleção individual da quantidade a comprar.

## O que será alterado
- Exibir cada item em uma única grade no formato: checkbox, O.C., fornecedor, SKU, produto, quantidade, valor unitário, desconto %, total a pagar, vínculo e status.
- Permitir marcar qualquer combinação de produtos, ajustar a quantidade e clicar em **Comprar** para gerar as ordens apenas dos itens selecionados.
- Agrupar automaticamente a compra selecionada por fornecedor, criando uma O.C. para cada fornecedor envolvido.
- Aplicar a regra de fornecedor pelo cadastro do produto:
  - Piscinas → Analandia.
  - Peças e acessórios → Progeu.
  - Serviços → Splash Jardim do Trevo.
- Manter o vínculo com pedido/cliente ou identificar como estoque.
- Preservar edição, impressão/PDF, faturamento e evolução de status das ordens já criadas.
- Usar o percentual como desconto do item; o total será quantidade × valor unitário, menos o desconto percentual.

## Validação
- Conferir seleção individual e seleção de todos.
- Conferir alteração de quantidade, preço, percentual e total calculado.
- Confirmar a separação automática das ordens por fornecedor.
- Verificar a grade no computador e no celular.
- Confirmar que abrir uma O.C. continua permitindo imprimir, editar, faturar e atualizar o status.

## Detalhes técnicos
- Reaproveitar os registros atuais de produtos, fornecedores, pedidos e itens de compra.
- Não duplicar itens já comprados nem alterar ordens antigas ao preparar uma nova compra.
- Manter o fluxo Pendente → Enviada → Faturada → Concluída.
