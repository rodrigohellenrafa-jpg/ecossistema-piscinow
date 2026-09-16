import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownCircle, ArrowUpCircle, FileInput } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { dataBR } from "@/lib/erp";
import { useAbrirModal } from "@/hooks/use-abrir-modal";

export const Route = createFileRoute("/estoque/entradas")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Entradas e Saídas de Estoque | Piscinow ERP" },
      {
        name: "description",
        content:
          "Registre entradas e saídas de mercadoria, vincule notas de compra e acompanhe o histórico de movimentações.",
      },
      { property: "og:title", content: "Entradas e Saídas de Estoque | Piscinow ERP" },
      {
        property: "og:description",
        content: "Movimentações de estoque com atualização automática das quantidades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EstoqueEntradas />
    </RequireAuth>
  ),
});

const ORIGENS_ENTRADA = ["Compra", "Devolução", "Ajuste", "Produção"] as const;
const ORIGENS_SAIDA = ["Venda", "Ajuste", "Perda", "Produção"] as const;

type Produto = { id: string; codigo: string | null; nome: string; unidade: string };
type Movimento = {
  id: string;
  produto_id: string;
  tipo: string;
  quantidade: number;
  origem: string | null;
  documento: string | null;
  observacoes: string | null;
  created_at: string;
};
type NotaCompra = {
  id: string;
  fornecedor: string;
  numero: string | null;
  data_entrada: string;
  valor_total: number;
};

const formVazio = {
  produto_id: "",
  quantidade: "0",
  origem: "",
  documento: "",
  observacoes: "",
};

function EstoqueEntradas() {
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [form, setForm] = useState(formVazio);
  const [importarOpen, setImportarOpen] = useState(false);
  useAbrirModal("novo", () => setImportarOpen(true));

  const set = (campo: keyof typeof formVazio, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "lista-simples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome, unidade")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });

  const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

  const { data: movimentos = [] } = useQuery({
    queryKey: ["estoque_movimentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("estoque_movimentos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Movimento[];
    },
  });

  const { data: notas = [] } = useQuery({
    queryKey: ["notas_compra", "recentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_compra")
        .select("id, fornecedor, numero, data_entrada, valor_total")
        .order("data_entrada", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as NotaCompra[];
    },
  });

  const registrar = useMutation({
    mutationFn: async (payload: typeof form & { tipo: "entrada" | "saida" }) => {
      if (!payload.produto_id) throw new Error("Selecione o produto");
      const quantidade = Number(payload.quantidade);
      if (!quantidade || quantidade <= 0) throw new Error("Informe uma quantidade válida");
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("estoque_movimentos").insert({
        produto_id: payload.produto_id,
        tipo: payload.tipo,
        quantidade,
        origem: payload.origem || null,
        documento: payload.documento || null,
        observacoes: payload.observacoes || null,
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(tipo === "entrada" ? "Entrada registrada" : "Saída registrada");
      setForm(formVazio);
      qc.invalidateQueries({ queryKey: ["estoque_movimentos"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lancarDaNota = async (nota: NotaCompra, produtoId: string, quantidade: number) => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("estoque_movimentos").insert({
      produto_id: produtoId,
      tipo: "entrada",
      quantidade,
      origem: "Compra",
      documento: `NF ${nota.numero ?? ""} - ${nota.fornecedor}`.trim(),
      observacoes: `Importado da nota de compra ${nota.numero ?? nota.id}`,
      created_by: auth.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Entrada lançada a partir da nota");
    qc.invalidateQueries({ queryKey: ["estoque_movimentos"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
  };

  const excluirMovimento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("estoque_movimentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Movimentação excluída");
      qc.invalidateQueries({ queryKey: ["estoque_movimentos"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entradas e Saídas de Estoque"
        subtitle="Registre movimentações e acompanhe o histórico recente."
        actions={
          <Dialog open={importarOpen} onOpenChange={setImportarOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileInput /> Importar itens de uma nota de compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Lançar entrada a partir de nota de compra</DialogTitle>
                <DialogDescription>
                  Selecione a nota, o produto recebido e a quantidade para lançar a entrada.
                </DialogDescription>
              </DialogHeader>
              <ImportarNota notas={notas} produtos={produtos} onLancar={lancarDaNota} />
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Registrar movimentação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={tipo === "entrada" ? "default" : "outline"}
              onClick={() => {
                setTipo("entrada");
                set("origem", "");
              }}
            >
              <ArrowDownCircle /> Entrada
            </Button>
            <Button
              type="button"
              variant={tipo === "saida" ? "default" : "outline"}
              onClick={() => {
                setTipo("saida");
                set("origem", "");
              }}
            >
              <ArrowUpCircle /> Saída
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Produto *" className="sm:col-span-2">
              <Select value={form.produto_id} onValueChange={(v) => set("produto_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo ? `${p.codigo} — ` : ""}
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Quantidade *">
              <Input
                type="number"
                min={0}
                value={form.quantidade}
                onChange={(e) => set("quantidade", e.target.value)}
              />
            </Field>
            <Field label="Origem">
              <Select value={form.origem} onValueChange={(v) => set("origem", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(tipo === "entrada" ? ORIGENS_ENTRADA : ORIGENS_SAIDA).map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Documento (nº da NF)">
              <Input value={form.documento} onChange={(e) => set("documento", e.target.value)} />
            </Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3">
              <Textarea
                value={form.observacoes}
                onChange={(e) => set("observacoes", e.target.value)}
              />
            </Field>
          </div>

          <Button
            onClick={() => registrar.mutate({ ...form, tipo })}
            disabled={registrar.isPending}
          >
            {tipo === "entrada" ? "Registrar entrada" : "Registrar saída"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Últimas movimentações <Badge variant="secondary">{movimentos.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movimentos.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Efeito no estoque</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Documento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((m) => {
                    const produto = produtoPorId.get(m.produto_id);
                    const entrada = m.tipo === "entrada";
                    return (
                      <TableRow key={m.id}>
                        <TableCell>{dataBR(m.created_at)}</TableCell>
                        <TableCell className="font-medium">
                          {produto ? `${produto.codigo ? produto.codigo + " — " : ""}${produto.nome}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entrada ? "default" : "destructive"}>
                            {entrada ? "Entrada" : "Saída"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${entrada ? "text-success" : "text-destructive"}`}
                        >
                          {entrada ? "+" : "-"}
                          {m.quantidade}
                        </TableCell>
                        <TableCell>{m.origem ?? "—"}</TableCell>
                        <TableCell>{m.documento ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ImportarNota({
  notas,
  produtos,
  onLancar,
}: {
  notas: NotaCompra[];
  produtos: Produto[];
  onLancar: (nota: NotaCompra, produtoId: string, quantidade: number) => void;
}) {
  const [notaId, setNotaId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("0");

  const nota = notas.find((n) => n.id === notaId);

  return (
    <div className="space-y-4">
      <Field label="Nota de compra">
        <Select value={notaId} onValueChange={setNotaId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a nota" />
          </SelectTrigger>
          <SelectContent>
            {notas.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {dataBR(n.data_entrada)} — {n.fornecedor} {n.numero ? `(NF ${n.numero})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Produto recebido">
        <Select value={produtoId} onValueChange={setProdutoId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o produto" />
          </SelectTrigger>
          <SelectContent>
            {produtos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.codigo ? `${p.codigo} — ` : ""}
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Quantidade">
        <Input type="number" min={0} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
      </Field>
      <Button
        disabled={!nota || !produtoId || Number(quantidade) <= 0}
        onClick={() => nota && onLancar(nota, produtoId, Number(quantidade))}
      >
        Lançar entrada
      </Button>
    </div>
  );
}
