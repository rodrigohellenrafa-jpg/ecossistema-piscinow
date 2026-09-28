import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";

export const Route = createFileRoute("/resumo-periodo")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Resumo do Período | Piscinow ERP" },
      { name: "description", content: "Resumo completo de um período: entradas, saídas, vendas, compras, estoque e contas em aberto." },
      { property: "og:title", content: "Resumo do Período | Piscinow ERP" },
      { property: "og:description", content: "Tudo o que aconteceu no período escolhido, com exportação em PDF e planilha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ResumoPeriodo />
    </RequireAuth>
  ),
});

type R = Record<string, any>;
const hoje = () => new Date().toISOString().slice(0, 10);
const inicioMes = () => hoje().slice(0, 8) + "01";
const n = (v: unknown) => Number(v ?? 0) || 0;

async function tudo(tabela: string, campos: string) {
  const { data, error } = await supabase.from(tabela as any).select(campos);
  if (error) throw error;
  return (data ?? []) as unknown as R[];
}

type Secao = { titulo: string; colunas: string[]; linhas: (string | number)[][]; total?: (string | number)[] };

function ResumoPeriodo() {
  const [de, setDe] = useState("2026-09-01");
  const [ate, setAte] = useState(hoje());

  const { data, isLoading } = useQuery({
    queryKey: ["resumo-periodo-base"],
    queryFn: async () => {
      const [contas, lancs, vendas, ocs, ocPags, estoque, produtos, saldos] = await Promise.all([
        tudo("contas", "id,tipo,descricao,parceiro,categoria,valor,valor_pago,vencimento,data_pagamento,status,conta_bancaria"),
        tudo("lancamentos_financeiros", "id,tipo_fluxo,categoria,descricao,valor,data_pagamento,vencimento,data_competencia,status,conta_bancaria,forma_pagamento"),
        tudo("vendas", "id,numero,cliente_nome,data,valor_total,valor_entrada,saldo_devedor,status_pagamento,status_pedido"),
        tudo("ordens_compra", "id,numero,fornecedor_nome,data_pedido,valor_total,valor_pago,status"),
        tudo("ordem_compra_pagamentos", "id,ordem_id,data_pagamento,valor,conta_bancaria,forma_pagamento"),
        tudo("estoque_movimentos", "id,produto_id,tipo,quantidade,origem,documento,created_at"),
        tudo("produtos", "id,nome"),
        tudo("saldos_bancarios", "conta,saldo,data_saldo"),
      ]);
      return { contas, lancs, vendas, ocs, ocPags, estoque, produtos, saldos };
    },
  });

  const r = useMemo(() => {
    if (!data) return null;
    const dentro = (d?: string | null) => !!d && d.slice(0, 10) >= de && d.slice(0, 10) <= ate;
    type Mov = { data: string; descricao: string; origem: string; categoria: string; conta: string; forma: string; valor: number };
    const entradas: Mov[] = [];
    const saidas: Mov[] = [];

    for (const c of data.contas) {
      if (c.status !== "pago" || !dentro(c.data_pagamento)) continue;
      const m = { data: c.data_pagamento, descricao: c.descricao, origem: c.tipo === "receber" ? "Conta a receber" : "Conta a pagar", categoria: c.categoria ?? "—", conta: c.conta_bancaria ?? "—", forma: "—", valor: n(c.valor_pago) || n(c.valor) };
      (c.tipo === "receber" ? entradas : saidas).push(m);
    }
    for (const l of data.lancs) {
      if (l.status !== "Pago") continue;
      const d = l.data_pagamento ?? l.vencimento ?? l.data_competencia;
      if (!dentro(d)) continue;
      const m = { data: d, descricao: l.descricao, origem: l.tipo_fluxo === "receita" ? "Receita lançada" : "Despesa lançada", categoria: l.categoria ?? "—", conta: l.conta_bancaria ?? "—", forma: l.forma_pagamento ?? "—", valor: n(l.valor) };
      (l.tipo_fluxo === "receita" ? entradas : saidas).push(m);
    }
    const ord = (a: Mov, b: Mov) => (a.data < b.data ? -1 : 1);
    entradas.sort(ord); saidas.sort(ord);
    const totE = entradas.reduce((s, m) => s + m.valor, 0);
    const totS = saidas.reduce((s, m) => s + m.valor, 0);

    const porConta = new Map<string, { e: number; s: number }>();
    entradas.forEach((m) => { const x = porConta.get(m.conta) ?? { e: 0, s: 0 }; x.e += m.valor; porConta.set(m.conta, x); });
    saidas.forEach((m) => { const x = porConta.get(m.conta) ?? { e: 0, s: 0 }; x.s += m.valor; porConta.set(m.conta, x); });
    const porCat = new Map<string, number>();
    saidas.forEach((m) => porCat.set(m.categoria, (porCat.get(m.categoria) ?? 0) + m.valor));

    const vendas = data.vendas.filter((v) => dentro(v.data)).sort((a, b) => (a.data < b.data ? -1 : 1));
    const ocs = data.ocs.filter((o) => dentro(o.data_pedido));
    const ocNum = new Map(data.ocs.map((o) => [o.id, `${o.numero ?? "—"} ${o.fornecedor_nome ?? ""}`]));
    const ocPags = data.ocPags.filter((p) => dentro(p.data_pagamento));
    const prod = new Map(data.produtos.map((p) => [p.id, p.nome]));
    const estoque = data.estoque.filter((m) => dentro(m.created_at));
    const abertos = data.contas.filter((c) => c.status !== "pago" && c.status !== "cancelado");

    const secoes: Secao[] = [
      { titulo: "Resumo por conta", colunas: ["Conta", "Entradas", "Saídas", "Resultado"],
        linhas: [...porConta].map(([k, v]) => [k, v.e, v.s, v.e - v.s]), total: ["Total", totE, totS, totE - totS] },
      { titulo: "Saldos atuais das contas", colunas: ["Conta", "Saldo", "Atualizado em"],
        linhas: data.saldos.map((s) => [s.conta, n(s.saldo), dataBR(s.data_saldo)]) },
      { titulo: "Saídas por categoria", colunas: ["Categoria", "Valor"],
        linhas: [...porCat].sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v]), total: ["Total", totS] },
      { titulo: "Entradas", colunas: ["Data", "Descrição", "Origem", "Categoria", "Conta", "Forma", "Valor"],
        linhas: entradas.map((m) => [dataBR(m.data), m.descricao, m.origem, m.categoria, m.conta, m.forma, m.valor]), total: ["", "", "", "", "", "Total", totE] },
      { titulo: "Saídas", colunas: ["Data", "Descrição", "Origem", "Categoria", "Conta", "Forma", "Valor"],
        linhas: saidas.map((m) => [dataBR(m.data), m.descricao, m.origem, m.categoria, m.conta, m.forma, m.valor]), total: ["", "", "", "", "", "Total", totS] },
      { titulo: "Vendas do período", colunas: ["Data", "Pedido", "Cliente", "Total", "Entrada", "Saldo devedor", "Pagamento"],
        linhas: vendas.map((v) => [dataBR(v.data), v.numero ?? "—", v.cliente_nome ?? "—", n(v.valor_total), n(v.valor_entrada), n(v.saldo_devedor), v.status_pagamento]),
        total: ["", "", "Total", vendas.reduce((s, v) => s + n(v.valor_total), 0), vendas.reduce((s, v) => s + n(v.valor_entrada), 0), vendas.reduce((s, v) => s + n(v.saldo_devedor), 0), ""] },
      { titulo: "Ordens de compra do período", colunas: ["Data", "O.C.", "Fornecedor", "Total", "Pago", "Status"],
        linhas: ocs.map((o) => [dataBR(o.data_pedido), o.numero ?? "—", o.fornecedor_nome ?? "—", n(o.valor_total), n(o.valor_pago), o.status]) },
      { titulo: "Pagamentos de ordens de compra", colunas: ["Data", "O.C.", "Conta", "Forma", "Valor"],
        linhas: ocPags.map((p) => [dataBR(p.data_pagamento), ocNum.get(p.ordem_id) ?? "—", p.conta_bancaria ?? "—", p.forma_pagamento, n(p.valor)]) },
      { titulo: "Movimentos de estoque", colunas: ["Data", "Produto", "Tipo", "Qtde", "Origem", "Documento"],
        linhas: estoque.map((m) => [dataBR(m.created_at), prod.get(m.produto_id) ?? "—", m.tipo, n(m.quantidade), m.origem ?? "—", m.documento ?? "—"]) },
      { titulo: "Contas em aberto (hoje)", colunas: ["Vencimento", "Tipo", "Descrição", "Parceiro", "Em aberto"],
        linhas: abertos.sort((a, b) => (a.vencimento < b.vencimento ? -1 : 1)).map((c) => [dataBR(c.vencimento), c.tipo === "receber" ? "A receber" : "A pagar", c.descricao, c.parceiro ?? "—", n(c.valor) - n(c.valor_pago)]) },
    ];
    return { totE, totS, vendasTot: vendas.reduce((s, v) => s + n(v.valor_total), 0), qtdVendas: vendas.length, secoes };
  }, [data, de, ate]);

  const fmt = (v: string | number) => (typeof v === "number" ? brl(v) : v);
  const nomeArq = `resumo-${de}-a-${ate}`;

  const exportarXlsx = () => {
    if (!r) return;
    const wb = XLSX.utils.book_new();
    for (const s of r.secoes) {
      const ws = XLSX.utils.aoa_to_sheet([s.colunas, ...s.linhas, ...(s.total ? [s.total] : [])]);
      XLSX.utils.book_append_sheet(wb, ws, s.titulo.slice(0, 31));
    }
    XLSX.writeFile(wb, `${nomeArq}.xlsx`);
  };

  const exportarPdf = () => {
    if (!r) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(`Piscinow — Resumo de ${dataBR(de)} a ${dataBR(ate)}`, 14, 14);
    doc.setFontSize(10);
    doc.text(`Entradas ${brl(r.totE)}  ·  Saídas ${brl(r.totS)}  ·  Resultado ${brl(r.totE - r.totS)}  ·  Vendido ${brl(r.vendasTot)}`, 14, 21);
    let y = 27;
    for (const s of r.secoes) {
      doc.setFontSize(11);
      doc.text(s.titulo, 14, y + 4);
      autoTable(doc, {
        startY: y + 6,
        head: [s.colunas],
        body: s.linhas.length ? s.linhas.map((l) => l.map(fmt)) : [[{ content: "Nada no período", colSpan: s.colunas.length }]],
        foot: s.total ? [s.total.map(fmt)] : undefined,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [14, 116, 144] },
        footStyles: { fillColor: [230, 230, 230], textColor: 20 },
      });
      y = (doc as any).lastAutoTable.finalY + 6;
      if (y > 180) { doc.addPage(); y = 14; }
    }
    doc.save(`${nomeArq}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Resumo do período" subtitle="Tudo o que entrou, saiu, foi vendido, comprado e movimentado no estoque no período escolhido." />
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div><label className="text-xs text-muted-foreground">De</label><Input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Até</label><Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
          <Button variant="outline" onClick={() => { setDe(inicioMes()); setAte(hoje()); }}>Este mês</Button>
          <Button variant="outline" onClick={() => { setDe("2020-01-01"); setAte(hoje()); }}>Desde o início</Button>
          <div className="ml-auto flex gap-2">
            <Button onClick={exportarPdf} disabled={!r}><FileDown className="mr-2 h-4 w-4" />Baixar PDF</Button>
            <Button variant="secondary" onClick={exportarXlsx} disabled={!r}><FileSpreadsheet className="mr-2 h-4 w-4" />Baixar planilha</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading || !r ? <p className="text-muted-foreground">Carregando…</p> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Entradas" value={brl(r.totE)} />
            <Kpi label="Saídas" value={brl(r.totS)} />
            <Kpi label="Resultado" value={brl(r.totE - r.totS)} />
            <Kpi label={`Vendido (${r.qtdVendas} pedidos)`} value={brl(r.vendasTot)} />
          </div>
          {r.secoes.map((s) => (
            <Card key={s.titulo}>
              <CardHeader><CardTitle className="text-base">{s.titulo} <span className="text-sm font-normal text-muted-foreground">({s.linhas.length})</span></CardTitle></CardHeader>
              <CardContent className="max-h-[420px] overflow-auto">
                <Table>
                  <TableHeader><TableRow>{s.colunas.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {s.linhas.length === 0 && <TableRow><TableCell colSpan={s.colunas.length} className="text-muted-foreground">Nada no período</TableCell></TableRow>}
                    {s.linhas.map((l, i) => <TableRow key={i}>{l.map((v, j) => <TableCell key={j} className={typeof v === "number" ? "text-right tabular-nums" : ""}>{fmt(v)}</TableCell>)}</TableRow>)}
                    {s.total && <TableRow className="font-semibold">{s.total.map((v, j) => <TableCell key={j} className={typeof v === "number" ? "text-right tabular-nums" : ""}>{fmt(v)}</TableCell>)}</TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
