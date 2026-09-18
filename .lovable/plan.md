# Controle de acesso por tela e senha mestra

## Permissões individuais
- Substituir a matriz por módulo por uma lista de telas e subtelas com **checkboxes por funcionário**, agrupadas apenas para facilitar a localização.
- Incluir marcar/desmarcar o grupo, salvar alterações, indicação de alterações pendentes e expansão da janela.
- Preservar inicialmente os acessos atuais de cada funcionário; após a configuração, somente as telas marcadas ficam disponíveis. Administradores continuam com acesso total e a gestão das permissões permanece exclusiva deles.
- Aplicar as permissões nos menus, endereços diretos, abas e operações protegidas, não apenas esconder botões.

## Telas e subtelas da lista
- **Geral:** painel inicial e Agenda da Equipe.
- **Cadastros:** clientes, produtos, precificação, fornecedores e colaboradores.
- **Vendas:** novo pedido, histórico de pedidos, orçamentos, detalhe/edição do pedido, pagamentos, histórico do cliente/pedido e reativação.
- **Operação:** Flight Board, detalhes da obra, ordens de serviço e formulário da O.S.
- **Compras e estoque:** reposição, ordens de compra, notas de compra, entradas, inventário e relatório de estoque.
- **Financeiro:** Contas a Pagar e Contas a Receber separadas; lançamentos financeiros; conciliação bancária; saldos e importação de extrato; Fluxo de Caixa com projeção diária, extrato realizado e resumo mensal; relatório de contas; DRE; indicadores.
- **Fiscal:** NF-e, NFS-e e configuração fiscal.
- **Pessoal e administração:** holerites/comissões, importação com suas categorias, atalhos e Controle de Acesso.
- Formulários e ações comuns de uma tela seguem sua permissão; as subtelas financeiras e os detalhes indicados acima têm seleção própria.

## Troca da senha mestra
- Adicionar em Controle de Acesso os campos **senha mestra atual**, **nova senha** e **confirmar nova senha**, com botão Salvar.
- Exigir administrador autenticado e conferir a senha atual no servidor; guardar somente uma representação criptográfica da nova senha, nunca o texto original.
- Remover a possibilidade de um sinalizador no navegador transformar um funcionário em administrador. A senha mestra não poderá contornar permissões individuais; confirmações sensíveis continuarão sujeitas às permissões do usuário.

## Detalhes técnicos
- Criar um catálogo central de permissões e tabelas separadas para concessões individuais e configuração protegida da senha mestra, com migrações, GRANTs e RLS.
- Migrar os acessos atuais para concessões explícitas. Novos usuários não recebem telas por padrão sem liberação.
- Ajustar as políticas de dados e as funções protegidas para as concessões por tela, preservando as dependências necessárias: por exemplo, escolher um cliente ao vender não libera a gestão completa de clientes.
- Separar Pagar/Receber e NF-e/NFS-e também nas regras dos registros; manter sincronizações automáticas autorizadas entre venda, estoque, histórico e financeiro.
- Atualizar o menu, a proteção de navegação e as abas sem depender de armazenamento local para autorização; mudanças de acesso devem ser refletidas em sessões abertas.
- Se a Agenda não estiver liberada, encaminhar o funcionário após login à primeira tela permitida; sem telas, mostrar acesso aguardando liberação.

## Validação
- Testar salvar e reabrir checkboxes, acesso por endereço direto e tentativa de operação sem permissão.
- Conferir perfis com apenas Contas a Receber, apenas Agenda e apenas vendas, incluindo o fechamento de pedido sem bloqueio indevido.
- Verificar troca de senha, senha atual incorreta, confirmação divergente e tentativa de alteração por não administrador.
- Conferir a apresentação no computador e celular, mantendo os botões de ação e expansão.
