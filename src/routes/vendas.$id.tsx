import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, FORMAS_PAGAMENTO, STATUS_PEDIDO } from "@/lib/erp";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/vendas/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do Pedido | Piscinow ERP" },
      {
        name: "description",
        content: "Consulte o espelho fiscal do pedido, condições de pagamento e status de produção.",
      },
      { property: "og:title", content: "Detalhe do Pedido | Piscinow ERP" },
      {
        property: "og:description",
        content: "Espelho de impressão estilo DANFE com totais, ICMS e parcelas do pedido.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DetalhePedido />
    </RequireAuth>
  ),
});

const STATUS_LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_PAGAMENTO_LABEL: Record<string, string> = {
  pendente: "Pendente",
  parcial: "Parcialmente pago",
  pago: "Pago / Liquidado",
};

const hoje = () => new Date().toISOString().slice(0, 10);

function DetalhePedido() {
  const { id } = useParams({ from: "/vendas/$id" });
  const qc = useQueryClient();
  const { user } = useAuth();
  const [aliquotaIcms, setAliquotaIcms] = useState(18);
  const [pdfLink, setPdfLink] = useState("");
  const [novoPag, setNovoPag] = useState({
    data_pagamento: hoje(),
    forma_pagamento: "Pix",
    conta_bancaria: "",
    valor: "",
    observacoes: "",
  });

  const { data: venda } = useQuery({
    queryKey: ["venda", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendas").select("*").eq("id", id).single();
      if (error) throw error;
      setPdfLink(data.pdf_link ?? "");
      return data;
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["venda-itens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("*, produtos(ncm, cst, cfop, unidade)")
        .eq("venda_id", id);
      if (error) throw error;
      return data as Array<{
        id: string;
        sku: string | null;
        descricao: string;
        quantidade: number;
        preco_unitario: number;
        total: number;
        produtos: { ncm: string | null; cst: string | null; cfop: string | null; unidade: string | null } | null;
      }>;
    },
  });

  const { data: kit } = useQuery({
    queryKey: ["venda-kit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("venda_kit").select("*").eq("venda_id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: cliente } = useQuery({
    queryKey: ["venda-cliente", venda?.cliente_id],
    enabled: !!venda?.cliente_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", venda!.cliente_id!).single();
      if (error) throw error;
      return data;
    },
  });
  const { data: ordens = [] } = useQuery({
    queryKey: ["venda-ordens", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select("id, numero, tipo_servico, status")
        .eq("venda_id", id);
      if (error) throw error;
      return data;
    },
  });


  const { data: parcelas = [] } = useQuery({
    queryKey: ["venda-parcelas", venda?.numero],
    enabled: !!venda?.numero,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .ilike("descricao", `Pedido ${venda!.numero} -%`)
        .order("vencimento");
      if (error) throw error;
      return data;
    },
  });

  const { data: pagamentos = [] } = useQuery({
    queryKey: ["venda-pagamentos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_pagamentos")
        .select("*")
        .eq("venda_id", id)
        .order("data_pagamento");
      if (error) throw error;
      return data;
    },
  });

  const invalidarFinanceiro = () => {
    qc.invalidateQueries({ queryKey: ["venda-pagamentos", id] });
    qc.invalidateQueries({ queryKey: ["venda", id] });
    qc.invalidateQueries({ queryKey: ["vendas"] });
    qc.invalidateQueries({ queryKey: ["fluxo-caixa"] });
    qc.invalidateQueries({ queryKey: ["lancamentos"] });
  };

  const adicionarPagamento = useMutation({
    mutationFn: async () => {
      const valor = Number(String(novoPag.valor).replace(",", "."));
      if (!valor || valor <= 0) throw new Error("Informe um valor maior que zero.");
      const { error } = await supabase.from("venda_pagamentos").insert({
        venda_id: id,
        data_pagamento: novoPag.data_pagamento,
        forma_pagamento: novoPag.forma_pagamento,
        conta_bancaria: novoPag.conta_bancaria || null,
        valor,
        observacoes: novoPag.observacoes || null,
        created_by: user?.id ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento registrado!");
      setNovoPag({
        data_pagamento: hoje(),
        forma_pagamento: "Pix",
        conta_bancaria: "",
        valor: "",
        observacoes: "",
      });
      invalidarFinanceiro();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerPagamento = useMutation({
    mutationFn: async (pagamentoId: string) => {
      const { error } = await supabase.from("venda_pagamentos").delete().eq("id", pagamentoId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pagamento removido.");
      invalidarFinanceiro();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("vendas").update({ status_pedido: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status atualizado!");
      qc.invalidateQueries({ queryKey: ["venda", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const salvarPdfLink = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("vendas").update({ pdf_link: pdfLink || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Link do contrato salvo!");
      qc.invalidateQueries({ queryKey: ["venda", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const linhas = useMemo(() => {
    const itensGrade = itens.map((i) => ({
      cod: i.sku ?? "—",
      descricao: i.descricao,
      ncm: i.produtos?.ncm ?? "—",
      cst: i.produtos?.cst ?? "—",
      cfop: i.produtos?.cfop ?? "—",
      un: i.produtos?.unidade ?? "UN",
      qtd: i.quantidade,
      vlrUnit: i.preco_unitario,
      vlrTotal: i.total,
    }));
    if (kit && kit.preco_venda_kit > 0) {
      itensGrade.push({
        cod: "KIT",
        descricao: "Kit Piscina (casco + filtro + acessórios)",
        ncm: "—",
        cst: "—",
        cfop: "—",
        un: "UN",
        qtd: 1,
        vlrUnit: kit.preco_venda_kit,
        vlrTotal: kit.preco_venda_kit,
      });
    }
    return itensGrade;
  }, [itens, kit]);

  const baseIcms = linhas.reduce((s, l) => s + l.vlrTotal, 0);
  const valorIcms = baseIcms * (aliquotaIcms / 100);
  const baseIcmsSt = 0;
  const valorIcmsSt = 0;

  const totalPago = pagamentos.reduce((s, p) => s + Number(p.valor ?? 0), 0);
  const totalVenda = Number(venda?.valor_total ?? 0);
  const saldoAberto = Math.max(totalVenda - totalPago, 0);
  const statusPag = totalPago <= 0 ? "pendente" : saldoAberto <= 0.005 ? "pago" : "parcial";

  if (!venda) {
    return <p className="text-muted-foreground">Carregando pedido...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="ghost" asChild>
          <Link to="/vendas">
            <ArrowLeft /> Voltar
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={venda.status_pedido} onValueChange={(v) => atualizarStatus.mutate(v)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_PEDIDO.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => window.print()}>
            <Printer /> Imprimir / Exportar PDF
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Contrato / documentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <Field label="Link do contrato (PDF)" className="min-w-72 flex-1">
            <Input value={pdfLink} onChange={(e) => setPdfLink(e.target.value)} placeholder="https://..." />
          </Field>
          <Button variant="outline" onClick={() => salvarPdfLink.mutate()} disabled={salvarPdfLink.isPending}>
            Salvar link
          </Button>
          {venda.pdf_link && (
            <Button variant="link" asChild>
              <a href={venda.pdf_link} target="_blank" rel="noreferrer">
                Abrir contrato
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Aliquota de ICMS (padrão configurável)</CardTitle>
        </CardHeader>
        <CardContent>
          <Field label="Alíquota ICMS (%)" className="max-w-40">
            <Input
              type="number"
              step="0.1"
              value={aliquotaIcms}
              onChange={(e) => setAliquotaIcms(Number(e.target.value) || 0)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>
            {venda.tipo_atendimento === "out"
              ? "OUT · Venda com serviço externo"
              : "IN · Venda de balcão"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {venda.tipo_atendimento === "out" ? (
            ordens.length > 0 ? (
              ordens.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{o.numero}</Badge>
                  <span>{o.tipo_servico}</span>
                  <Badge variant="secondary">{o.status}</Badge>
                  <Button variant="link" asChild className="px-1">
                    <Link to="/ordens">Abrir ordens de serviço</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                Nenhuma ordem de serviço vinculada a este pedido.
              </p>
            )
          ) : (
            <p className="text-muted-foreground">
              Pedido de balcão: os itens já saíram do estoque e não geram obra.
            </p>
          )}
        </CardContent>
      </Card>


      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-3">
            Pagamentos do pedido
            <Badge variant={statusPag === "pago" ? "default" : "secondary"}>
              {STATUS_PAGAMENTO_LABEL[statusPag]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Valor total da venda</p>
              <p className="font-medium">{brl(totalVenda)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total pago</p>
              <p className="font-medium">{brl(totalPago)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo devedor</p>
              <p className="text-lg font-semibold">{brl(saldoAberto)}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Field label="Data do pagamento">
              <Input
                type="date"
                value={novoPag.data_pagamento}
                onChange={(e) => setNovoPag({ ...novoPag, data_pagamento: e.target.value })}
              />
            </Field>
            <Field label="Forma de pagamento">
              <Select
                value={novoPag.forma_pagamento}
                onValueChange={(v) => setNovoPag({ ...novoPag, forma_pagamento: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cartão / conta (ex.: Cartão A)">
              <Input
                value={novoPag.conta_bancaria}
                onChange={(e) => setNovoPag({ ...novoPag, conta_bancaria: e.target.value })}
                placeholder="Cartão A"
              />
            </Field>
            <Field label="Valor (R$)">
              <Input
                type="number"
                step="0.01"
                value={novoPag.valor}
                onChange={(e) => setNovoPag({ ...novoPag, valor: e.target.value })}
                placeholder="0,00"
              />
            </Field>
            <Field label="Observações">
              <Input
                value={novoPag.observacoes}
                onChange={(e) => setNovoPag({ ...novoPag, observacoes: e.target.value })}
                placeholder="Opcional"
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => adicionarPagamento.mutate()}
              disabled={adicionarPagamento.isPending}
            >
              <Plus /> Adicionar pagamento
            </Button>
            {saldoAberto > 0 && (
              <Button
                variant="outline"
                onClick={() => setNovoPag({ ...novoPag, valor: saldoAberto.toFixed(2) })}
              >
                Usar saldo devedor ({brl(saldoAberto)})
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Forma</TableHead>
                <TableHead>Cartão / conta</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{dataBR(p.data_pagamento)}</TableCell>
                  <TableCell>{p.forma_pagamento}</TableCell>
                  <TableCell>{p.conta_bancaria ?? "—"}</TableCell>
                  <TableCell>{p.observacoes ?? "—"}</TableCell>
                  <TableCell className="text-right">{brl(Number(p.valor))}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerPagamento.mutate(p.id)}
                      aria-label="Remover pagamento"
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {pagamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    Nenhum pagamento registrado. O pedido está em aberto.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="print:block rounded-xl border border-border bg-card p-6 text-sm">
        <div className="mb-6 flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="text-lg font-semibold">Piscinow</p>
            <p className="text-muted-foreground">Comércio e Instalação de Piscinas</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Pedido {venda.numero}</p>
            <p className="text-muted-foreground">Emissão: {dataBR(venda.data)}</p>
            <Badge>{STATUS_LABEL[venda.status_pedido] ?? venda.status_pedido}</Badge>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold">Destinatário</p>
            <p>{cliente?.nome ?? venda.cliente_nome ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.documento ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.telefone ?? "—"}</p>
            <p className="text-muted-foreground">{cliente?.email ?? "—"}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold">Endereço da obra</p>
            <p className="text-muted-foreground">
              {cliente?.endereco_obra ||
                [cliente?.logradouro, cliente?.numero, cliente?.bairro, cliente?.cidade, cliente?.estado, cliente?.cep]
                  .filter(Boolean)
                  .join(", ") ||
                "—"}
            </p>
            <p className="mt-2 text-muted-foreground">Vendedor: {venda.vendedor ?? "—"}</p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto">
          <p className="mb-2 font-semibold">Grade fiscal</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cód</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>NCM/SH</TableHead>
                <TableHead>CST</TableHead>
                <TableHead>CFOP</TableHead>
                <TableHead>Un</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
                <TableHead className="text-right">Vlr Unit</TableHead>
                <TableHead className="text-right">Vlr Total</TableHead>
                <TableHead className="text-right">Base ICMS</TableHead>
                <TableHead className="text-right">Vlr ICMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((l, idx) => (
                <TableRow key={idx}>
                  <TableCell>{l.cod}</TableCell>
                  <TableCell>{l.descricao}</TableCell>
                  <TableCell>{l.ncm}</TableCell>
                  <TableCell>{l.cst}</TableCell>
                  <TableCell>{l.cfop}</TableCell>
                  <TableCell>{l.un}</TableCell>
                  <TableCell className="text-right">{l.qtd}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrUnit)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal)}</TableCell>
                  <TableCell className="text-right">{brl(l.vlrTotal * (aliquotaIcms / 100))}</TableCell>
                </TableRow>
              ))}
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="py-6 text-center text-muted-foreground">
                    Nenhum item.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Base ICMS</p>
            <p className="font-medium">{brl(baseIcms)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor ICMS</p>
            <p className="font-medium">{brl(valorIcms)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Base ICMS ST</p>
            <p className="font-medium">{brl(baseIcmsSt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valor ICMS ST</p>
            <p className="font-medium">{brl(valorIcmsSt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frete</p>
            <p className="font-medium">{brl(venda.valor_frete)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mão de obra</p>
            <p className="font-medium">{brl(venda.valor_mao_obra)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Valor total do pedido</p>
            <p className="text-lg font-semibold">{brl(venda.valor_total)}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold">Condição de pagamento</p>
          <p className="mb-2 text-muted-foreground">
            {venda.forma_pagamento ?? "—"} · Entrada: {brl(venda.valor_entrada)} · Saldo: {brl(venda.saldo_devedor)}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcelas.map((p, idx) => (
                <TableRow key={p.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{dataBR(p.vencimento)}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "pago" ? "default" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{brl(p.valor)}</TableCell>
                </TableRow>
              ))}
              {parcelas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    Sem parcelas geradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {venda.observacoes && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-1 font-semibold">Observações</p>
            <p className="text-muted-foreground">{venda.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
