import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { brl, clientes, produtos, vendedores } from "@/lib/mock-data";

interface Item {
  sku: string;
  descricao: string;
  qtde: number;
  preco: number;
}

const PAGAMENTOS = ["PIX", "Dinheiro", "Cartão 1x", "Cartão 6x", "Boleto 3x", "Transferência"];

export const Route = createFileRoute("/vendas/novo")({
  head: () => ({
    meta: [
      { title: "Novo Pedido (PDV) | Piscinow ERP" },
      {
        name: "description",
        content:
          "Ponto de venda Piscinow: selecione cliente, adicione produtos e feche o pedido com cálculo automático.",
      },
      { property: "og:title", content: "Novo Pedido (PDV) | Piscinow ERP" },
      {
        property: "og:description",
        content: "Feche pedidos de piscinas com cálculo automático de totais e impostos.",
      },
    ],
  }),
  component: NovoPedido,
});

function NovoPedido() {
  const [cliente, setCliente] = useState("");
  const [vendedor, setVendedor] = useState(vendedores[0]);
  const [pagamento, setPagamento] = useState(PAGAMENTOS[0]);
  const [descontoPct, setDescontoPct] = useState(0);
  const [skuSel, setSkuSel] = useState("");
  const [qtde, setQtde] = useState(1);
  const [itens, setItens] = useState<Item[]>([]);

  const subtotal = useMemo(
    () => itens.reduce((s, i) => s + i.qtde * i.preco, 0),
    [itens],
  );
  const desconto = (subtotal * descontoPct) / 100;
  const impostos = (subtotal - desconto) * 0.06;
  const total = subtotal - desconto + impostos;

  const adicionar = () => {
    const p = produtos.find((x) => x.sku === skuSel);
    if (!p) return toast.error("Selecione um produto");
    if (qtde < 1) return toast.error("Quantidade inválida");
    setItens((prev) => {
      const existe = prev.find((i) => i.sku === p.sku);
      if (existe) {
        return prev.map((i) =>
          i.sku === p.sku ? { ...i, qtde: i.qtde + qtde } : i,
        );
      }
      return [...prev, { sku: p.sku, descricao: p.descricao, qtde, preco: p.precoVenda }];
    });
    setQtde(1);
  };

  const finalizar = () => {
    if (!cliente) return toast.error("Selecione o cliente");
    if (itens.length === 0) return toast.error("Adicione ao menos um produto");
    toast.success(`Pedido de ${brl(total)} registrado para ${cliente}`);
    setItens([]);
    setCliente("");
    setDescontoPct(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo Pedido (PDV)</h1>
        <p className="text-sm text-muted-foreground">
          Monte o pedido e feche a venda em poucos cliques.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do pedido</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label>Cliente *</Label>
                <Select value={cliente} onValueChange={setCliente}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vendedor</Label>
                <Select value={vendedor} onValueChange={setVendedor}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {vendedores.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <Select value={skuSel} onValueChange={setSkuSel}>
                  <SelectTrigger><SelectValue placeholder="Produto" /></SelectTrigger>
                  <SelectContent>
                    {produtos.map((p) => (
                      <SelectItem key={p.sku} value={p.sku}>
                        {p.descricao} — {brl(p.precoVenda)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={qtde}
                  onChange={(e) => setQtde(Number(e.target.value))}
                  className="sm:w-24"
                />
                <Button onClick={adicionar}>
                  <Plus /> Adicionar
                </Button>
              </div>

              {itens.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nenhum item no pedido ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtde</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itens.map((i) => (
                      <TableRow key={i.sku}>
                        <TableCell>{i.descricao}</TableCell>
                        <TableCell className="text-right">{i.qtde}</TableCell>
                        <TableCell className="text-right">{brl(i.preco)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {brl(i.qtde * i.preco)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setItens((prev) => prev.filter((x) => x.sku !== i.sku))
                            }
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Select value={pagamento} onValueChange={setPagamento}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGAMENTOS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={descontoPct}
                onChange={(e) => setDescontoPct(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1 border-t border-border pt-3 text-sm">
              <Row label="Subtotal" value={brl(subtotal)} />
              <Row label={`Desconto (${descontoPct}%)`} value={`- ${brl(desconto)}`} />
              <Row label="Impostos (6%)" value={brl(impostos)} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">Total líquido</span>
              <span className="text-xl font-semibold text-primary">{brl(total)}</span>
            </div>

            <Button className="w-full" onClick={finalizar}>
              Finalizar pedido
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
