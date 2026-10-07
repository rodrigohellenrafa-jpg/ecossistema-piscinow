export const TELAS = [
 ['Geral','dashboard','Painel inicial','/'],['Geral','agenda','Agenda da Equipe','/agenda'],
 ...[['clientes','Clientes'],['produtos','Produtos'],['precificacao','Precificação'],['fornecedores','Fornecedores'],['funcionarios','Colaboradores']].map(([id,label])=>['Cadastros',id,label,`/${id}`]),
 ['Vendas','vendas.novo','Novo pedido','/vendas/novo'],['Vendas','vendas.lista','Histórico de pedidos','/vendas'],['Vendas','vendas.orcamentos','Orçamentos','/vendas/orcamentos'],['Vendas','vendas.detalhe','Detalhe e edição do pedido','/vendas/$id'],['Vendas','vendas.pagamentos','Pagamentos do pedido',''],['Vendas','vendas.historico','Histórico do cliente e pedido',''],['Vendas','reativacao','Reativação','/reativacao'],
 ['Operação','obras.detalhe','Detalhes da obra','/obras/$id'],['Operação','ordens','Ordens de serviço','/ordens'],['Operação','os.formulario','Formulário da O.S.','/os/formulario'],
 ...[['compras','Central de reposição'],['ordens-compra','Ordens de compra'],['notas-compra','Notas de compra'],['estoque.entradas','Entradas de estoque'],['estoque.inventario','Inventário'],['estoque.relatorio','Relatório de estoque']].map(([id,label])=>['Compras e estoque',id,label,`/${id.replaceAll('.','/')}`]),
 ...[['movimentacoes','Movimentações','/movimentacoes'],['resumo-periodo','Resumo do período','/resumo-periodo'],['contas.pagar','Contas a Pagar','/contas'],['contas.receber','Contas a Receber','/contas'],['financeiro.lancamentos','Lançamentos financeiros','/financeiro'],['financeiro.conciliacao','Conciliação bancária','/financeiro'],['saldos','Saldos bancários','/fluxo-caixa'],['extrato.importar','Importar extrato','/fluxo-caixa'],['fluxo.agenda','Projeção diária','/fluxo-caixa'],['fluxo.extrato','Extrato realizado','/fluxo-caixa'],['fluxo.mensal','Resumo mensal','/fluxo-caixa'],['relatorio-contas','Relatório de contas','/relatorio-contas'],['dre','DRE','/dre'],['indicadores','Indicadores','/indicadores']].map(row=>['Financeiro',...row]),
 ['Fiscal','fiscal.nfe','NF-e','/fiscal'],['Fiscal','fiscal.nfse','NFS-e','/fiscal'],['Fiscal','fiscal.config','Configuração fiscal','/fiscal/config'],
 ['Administração','holerite','Holerites e comissões','/holerite'],['Administração','acessos','Controle de Acesso','/acessos'],['Administração','atalhos','Atalhos','/atalhos'],
 ...[['usuarios','Usuários'],['clientes','Clientes'],['produtos','Produtos'],['vendas','Vendas'],['financeiro','Contas'],['lancamentos','Lançamentos']].map(([id,label])=>['Importação',`importacao.${id}`,`Importar ${label}`,'/importacao']),
].map(([grupo,id,nome,path])=>({grupo,id,nome,path}));
export const ABAS: Record<string,Record<string,string>> = {
 '/contas':{pagar:'contas.pagar',receber:'contas.receber'}, '/financeiro':{lancamentos:'financeiro.lancamentos',conciliacao:'financeiro.conciliacao'},
 '/fluxo-caixa':{agenda:'fluxo.agenda',extrato:'fluxo.extrato',mensal:'fluxo.mensal'},'/fiscal':{nfe:'fiscal.nfe',nfse:'fiscal.nfse'},'/vendas':{pedidos:'vendas.lista',orcamentos:'vendas.orcamentos'},
 '/importacao':Object.fromEntries(TELAS.filter(t=>t.grupo==='Importação').map(t=>[t.id.split('.')[1],t.id])),
};
export function telasDaRota(path:string) {
 const exact=TELAS.filter(t=>t.path===path);
 if(exact.length) return exact.map(t=>t.id);
 return TELAS.filter(t=>t.path.includes('$id') && path.startsWith(t.path.replace('$id',''))).map(t=>t.id);
}
