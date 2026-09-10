import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { brl, dataBR } from "@/lib/erp";

export const Route = createFileRoute("/holerite")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Holerite e Comissões | Piscinow ERP" },
      {
        name: "description",
        content: "Cálculo de holerite mensal com comissões por categoria de produto e descontos.",
      },
      { property: "og:title", content: "Holerite e Comissões | Piscinow ERP" },
      {
        property: "og:description",
        content: "Salário base, comissões, benefícios e descontos por funcionário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Holerite />
    </RequireAuth>
  ),
});

function mesAtualISO() {
  return new Date().toISOString().slice(0, 7);
}

function Holerite() {
  const [mes, setMes] = useState(mesAtualISO());
  const [funcionarioId, setFuncionarioId] = useState("todos");

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-holerite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select(
          "id, nome, cargo, salario_base, vt, vr, inss_perc, irrf_perc, sindicato, bonificacao, comissao_piscinas, comissao_acessorios, comissao_quimicos, ativo",
        )
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-holerite", mes],
    queryFn: async () => {
      const inicio = `${mes}-01`;
      const [ano, m] = mes.split("-").map(Number);
      const fim = new Date(ano, m, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, data, cliente_nome, vendedor_id, valor_total")
        .gte("data", inicio)
        .lte("data", fim);
      if (error) throw error;
      return data;
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["itens-holerite", vendas.map((v) => v.id).join(",")],
    enabled: vendas.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("id, venda_id, produto_id, descricao, quantidade, total, custo_unitario, produtos(categoria)")
        .in(
          "venda_id",
          vendas.map((v) => v.id),
        );
      if (error) throw error;
      return data as Array<{
        id: string;
        venda_id: string;
        descricao: string;
        total: number;
        produtos: { categoria: string | null } | null;
      }>;
    },
  });

  const funcionariosFiltrados = funcionarios.filter(
    (f) => funcionarioId === "todos" || f.id === funcionarioId,
  );

  const holerites = useMemo(() => {
    return funcionariosFiltrados.map((f) => {
      const vendasFunc = vendas.filter((v) => v.vendedor_id === f.id);
      const linhasVenda = vendasFunc.map((v) => {
        const itensVenda = itens.filter((i) => i.venda_id === v.id);
        let comissaoVenda = 0;
        for (const item of itensVenda) {
          const categoria = item.produtos?.categoria ?? "";
          const valorItem = Number(item.total);
          if (categoria === "Piscinas") comissaoVenda += valorItem * (Number(f.comissao_piscinas) / 100);
          else if (categoria === "Químicos") comissaoVenda += valorItem * (Number(f.comissao_quimicos) / 100);
          else comissaoVenda += valorItem * (Number(f.comissao_acessorios) / 100);
        }
        return { venda: v, comissao: comissaoVenda };
      });
      const comissaoTotal = linhasVenda.reduce((s, l) => s + l.comissao, 0);

      const salarioBase = Number(f.salario_base);
      const bonificacao = Number(f.bonificacao);
      const vt = Number(f.vt);
      const vr = Number(f.vr);
      const inss = salarioBase * (Number(f.inss_perc) / 100);
      const irrf = salarioBase * (Number(f.irrf_perc) / 100);
      const sindicato = Number(f.sindicato);

      const bruto = salarioBase + comissaoTotal + bonificacao;
      const descontos = vt + vr + inss + irrf + sindicato;
      const liquido = bruto - descontos;

      return {
        funcionario: f,
        linhasVenda,
        comissaoTotal,
        salarioBase,
        bonificacao,
        vt,
        vr,
        inss,
        irrf,
        sindicato,
        bruto,
        descontos,
        liquido,
      };
    });
  }, [funcionariosFiltrados, vendas, itens]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Holerite e Comissões"
        subtitle="Cálculo mensal de salário, comissões por categoria e descontos."
        actions={
          <Button className="print:hidden" variant="outline" onClick={() => window.print()}>
            <Printer /> Imprimir
          </Button>
        }
      />

      <Card className="print:hidden">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Field label="Mês de referência">
            <input
              type="month"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </Field>
          <Field label="Funcionário">
            <Select value={funcionarioId} onValueChange={setFuncionarioId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {funcionarios.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {holerites.map((h) => (
          <Card key={h.funcionario.id} className="break-inside-avoid">
            <CardHeader>
              <CardTitle>
                {h.funcionario.nome} — {h.funcionario.cargo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Proventos</p>
                  <Row label="Salário base" valor={h.salarioBase} />
                  <Row label="Comissões" valor={h.comissaoTotal} />
                  <Row label="Bonificação" valor={h.bonificacao} />
                  <Row label="Bruto" valor={h.bruto} destaque />
                </div>
                <div className="space-y-1 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Descontos</p>
                  <Row label="Vale transporte" valor={-h.vt} />
                  <Row label="Vale refeição" valor={-h.vr} />
                  <Row label="INSS" valor={-h.inss} />
                  <Row label="IRRF" valor={-h.irrf} />
                  <Row label="Sindicato" valor={-h.sindicato} />
                  <Row label="Total de descontos" valor={-h.descontos} destaque />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="font-semibold">Total líquido</span>
                <span className="text-lg font-semibold tabular-nums">{brl(h.liquido)}</span>
              </div>

              {h.linhasVenda.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Vendas consideradas no mês</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {h.linhasVenda.map(({ venda, comissao }) => (
                        <TableRow key={venda.id}>
                          <TableCell>{venda.numero ?? venda.id.slice(0, 8)}</TableCell>
                          <TableCell>{dataBR(venda.data)}</TableCell>
                          <TableCell>{venda.cliente_nome ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">{brl(venda.valor_total)}</TableCell>
                          <TableCell className="text-right tabular-nums">{brl(comissao)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {holerites.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum funcionário encontrado.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, valor, destaque }: { label: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={destaque ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${destaque ? "font-semibold" : ""}`}>{brl(valor)}</span>
    </div>
  );
}
