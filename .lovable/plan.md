# Atualização do ERP Splash Jardim do Trevo

## Objetivo
Completar os sete módulos solicitados, aproveitando os recursos existentes sem duplicar registros, telas ou movimentações financeiras.

## 1. Interface e instalação no celular
- Padronizar pesquisa e filtros em todas as listagens, inclusive seletores de cadastros.
- Adicionar expansão/redução aos modais e aos cards de trabalho, sem afetar documentos de impressão.
- Abrir criação de registros em modais, preservando os links atuais para consulta e histórico.
- Corrigir contraste no tema escuro e aplicar cores distintas aos gráficos.
- Atualizar o nome do aplicativo para Splash Jardim do Trevo e validar instalação pelo ícone no celular. Manter o endereço inicial existente e não adicionar funcionamento offline, que não foi solicitado.

## 2. Vendas e faturamento
- Completar endereço de entrega/instalação por pedido, múltiplas condições e formas de pagamento, reaproveitando os formulários atuais.
- Disponibilizar impressão/PDF e assinatura manual no histórico do pedido, com identificação do signatário e registro de data.
- Não tratar senha mestra interna como assinatura do cliente. GOV.BR exige integração oficial: não simular assinatura nem afirmar validade jurídica equivalente.
- Incluir acesso à emissão de NF-e pelo pedido e aproveitar a integração Focus NFe existente. Completar envio seguro do certificado A1 conforme os recursos autorizados pelo provedor, sem expor token, senha ou certificado ao restante da equipe.
- Unificar a automação OUT para criar/vincular obra e compromisso da equipe sem duplicidades. Compromissos externos com Google dependem da conexão autorizada.

## 3. Financeiro
- Manter o rateio visível nos dois modais, exigindo que as categorias somem exatamente o total; salvar lançamento e divisões juntos.
- Vincular despesas a pedido/obra como centro de custo e exibir custo e resultado por projeto.
- Adicionar seleção e cadastro rápido de cliente/fornecedor em recebimentos, além de número de documento/NF-e.
- Criar despesas mensais recorrentes com início, vencimento, término opcional e controle de ativação. A geração deverá funcionar sem alguém abrir o sistema e impedir parcelas duplicadas.
- Acrescentar período personalizado e agrupamento trimestral ao DRE; separar folha fixa e comissões variáveis.
- Distinguir valor bruto, juros e taxas de cartão: DRE reconhece receita bruta e juros, com taxas como despesas; caixa considera o recebimento líquido. Evitar contar duas vezes valores espelhados entre módulos.

## 4. Compras e estoque
- Completar a seleção de itens de vários pedidos para uma OC por fornecedor, com edição de quantidades e identificação do cliente/pedido por item.
- Preservar o fluxo Pendente → Enviada → Faturada → Concluída, sem gerar dívida antes do faturamento.
- Gerar PDF antes do envio. Envio real com anexo exige serviço de e-mail autorizado; não apresentar abertura do aplicativo de e-mail como envio concluído.
- Validar conversões de compra para unidade de estoque e ajustes manuais com motivo e responsável.
- Ajustar os documentos existentes de inventário e estoque às colunas solicitadas, com assinaturas e impressão legível.

## 5. Operações e Flight Board
- Aplicar visual de painel de aeroporto, preservando leitura no celular e contraste.
- Mostrar data, temperatura e condição climática de Campinas, com indicação de indisponibilidade quando o serviço de clima falhar.
- Exibir cliente, data do pedido, faturamento, limite de entrega e datas editáveis de início/término. Usar data real de faturamento, não uma estimativa disfarçada.
- Agrupar serviços da mesma obra/pedido em uma linha por cliente, mantendo serviços extras isolados e histórico, sem apagar registros existentes.
- Adicionar ícone de informações para consultar os serviços e respectivos status.
- Registrar materiais utilizados e horas trabalhadas na OS. Materiais devem movimentar estoque uma única vez.

## 6. Equipe externa
- Permitir consulta e atualização das OS pelo celular, com atualização compartilhada enquanto houver conexão.
- Criar modal de conclusão com técnico, data, observações e aceite final do cliente.
- Permitir câmera/galeria para fotos da entrega, com armazenamento privado e acesso autorizado. Foto obrigatória por padrão para conclusão, com configuração explícita caso a empresa queira torná-la opcional.
- Em falha de conexão, informar que a gravação não ocorreu; não prometer sincronização offline.

## 7. RH
- Aproveitar o documento de holerite existente e completar impressão individual e em lote por competência, com separação correta das páginas.

## Detalhes técnicos e segurança
- Evoluir o banco por migrações com permissões explícitas e controle de acesso; fotos e credenciais não serão públicas.
- Usar operações atômicas e chaves únicas para rateios, recorrências e automações, evitando gravações parciais e duplicidade em cliques simultâneos.
- Implementar integrações internas no servidor existente e validar permissões em cada operação sensível.
- Atualizar metadados das páginas e preservar o logotipo e o padrão de impressão já adotados.

## Validação e dependências
- Testar criação em modais, filtros, expansão, rateio divergente/correto, recorrência sem duplicidade, pedido OUT, compra agrupada, conversão de estoque, aceite com fotos e PDFs.
- Verificar computador e celular, além de atualização entre duas sessões conectadas.
- Emissão fiscal real, envio de e-mail e assinatura GOV.BR dependem de autorização/credenciais dos respectivos serviços; nenhuma dessas integrações será apresentada como concluída sem teste real.
- A instalação seguirá a skill PWA, sem cache offline adicional.
