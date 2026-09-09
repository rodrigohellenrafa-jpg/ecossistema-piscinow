import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, PackagePlus, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

export const Route = createFileRoute("/notas-compra")({
  head: () => ({
    meta: [
      { title: "Notas de Compra | Piscinow ERP" },
      {
        name: "description",
        content:
          "Lance notas fiscais de entrada, guarde a chave de acesso e consulte a nota direto no portal da SEFAZ.",
      },
      { property: "og:title", content: "Notas de Compra | Piscinow ERP" },
      {
        property: "og:description",
        content: "Entrada de notas fiscais de compra com consulta na SEFAZ pela chave de acesso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NotasCompra />
    </RequireAuth>
  ),
});

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PORTAL_NFE = "https://www.nfe.fazenda.gov.br/portal/consultaResumo.aspx";

/** Somente dígitos da chave de acesso (44 posições). */
const soDigitos = (v: string) => v.replace(/\D/g, "").slice(0, 44);

const chaveValida = (v: string) => soDigitos(v).length === 44;

const STATUS = ["pendente", "conferida", "lancada", "cancelada"] as const;

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  conferida: "Conferida",
  lancada: "Lançada",
  cancelada: "Cancelada",
};

const vazio = {
  chave_acesso: "",
  numero: "",
  serie: "",
  fornecedor: "",
  fornecedor_cnpj: "",
  natureza_operacao: "",
  data_emissao: "",
  data_entrada: new Date().toISOString().slice(0, 10),
  valor_produtos: "0",
  valor_frete: "0",
  valor_total: "0",
  status: "pendente",
  observacoes: "",
};

/** Lê os dados principais de um XML de NF-e (procNFe ou NFe). */
function lerXmlNfe(texto: string) {
  const doc = new DOMParser().parseFromString(texto, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Arquivo XML inválido");

  const txt = (tag: string, escopo: Element | Document = doc) => {
    const el = escopo.getElementsByTagName(tag)[0];
    return el?.textContent?.trim() ?? "";
  };

  const infNFe = doc.getElementsByTagName("infNFe")[0];
  if (!infNFe) throw new Error("Este XML não parece ser uma NF-e");

  const emit = infNFe.getElementsByTagName("emit")[0];
  const ide = infNFe.getElementsByTagName("ide")[0];
  const icmsTot = infNFe.getElementsByTagName("ICMSTot")[0];

  const chave = soDigitos(infNFe.getAttribute("Id") ?? txt("chNFe"));
  const emissao = (ide ? txt("dhEmi", ide) || txt("dEmi", ide) : "").slice(0, 10);

  return {
    chave_acesso: chave,
    numero: ide ? txt("nNF", ide) : "",
    serie: ide ? txt("serie", ide) : "",
    natureza_operacao: ide ? txt("natOp", ide) : "",
    fornecedor: emit ? txt("xNome", emit) : "",
    fornecedor_cnpj: emit ? txt("CNPJ", emit) : "",
    data_emissao: /^\d{4}-\d{2}-\d{2}$/.test(emissao) ? emissao : "",
    valor_produtos: icmsTot ? txt("vProd", icmsTot) : "",
    valor_frete: icmsTot ? txt("vFrete", icmsTot) : "",
    valor_total: icmsTot ? txt("vNF", icmsTot) : "",
  };
}

export type ItemXml = {
  codigo: string;
  ean: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number;
  ncm: string;
  cfop: string;
};

/** Lê os itens (produtos) de um XML de NF-e. */
function lerItensXml(texto: string): ItemXml[] {
  const doc = new DOMParser().parseFromString(texto, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  const dets = Array.from(doc.getElementsByTagName("det"));
  return dets.map((det) => {
    const t = (tag: string) => det.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
    return {
      codigo: t("cProd"),
      ean: t("cEAN") && t("cEAN") !== "SEM GTIN" ? t("cEAN") : "",
      descricao: t("xProd"),
      unidade: t("uCom") || "UN",
      quantidade: Number(t("qCom") || 0),
      valor_unitario: Number(t("vUnCom") || 0),
      ncm: t("NCM"),
      cfop: t("CFOP"),
    };
  });
}

type ProdutoSimples = { id: string; codigo: string | null; nome: string };

function LancarEstoque({
  nota,
  onPronto,
}: {
  nota: { id: string; fornecedor: string; numero: string | null; xml: string | null };
  onPronto: () => void;
}) {
  const itens = useMemo(() => (nota.xml ? lerItensXml(nota.xml) : []), [nota.xml]);
  const [destinos, setDestinos] = useState<Record<number, string>>({});
  const [salvando, setSalvando] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "lista-simples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, codigo, nome")
        .order("nome");
      if (error) throw error;
      return data as ProdutoSimples[];
    },
  });

  const sugestao = (item: ItemXml) => {
    const porCodigo = produtos.find(
      (p) => p.codigo && item.codigo && p.codigo.toLowerCase() === item.codigo.toLowerCase(),
    );
    if (porCodigo) return porCodigo.id;
    const porNome = produtos.find(
      (p) => p.nome.trim().toLowerCase() === item.descricao.trim().toLowerCase(),
    );
    return porNome ? porNome.id : "novo";
  };

  const valor = (idx: number, item: ItemXml) => destinos[idx] ?? sugestao(item);

  const confirmar = async () => {
    if (itens.length === 0) return;
    setSalvando(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id ?? null;
      const documento = `NF ${nota.numero ?? ""} - ${nota.fornecedor}`.trim();
      const movimentos: Record<string, unknown>[] = [];

      for (const [idx, item] of itens.entries()) {
        const alvo = valor(idx, item);
        if (alvo === "ignorar" || item.quantidade <= 0) continue;

        let produtoId = alvo;
        if (alvo === "novo") {
          const { data: criado, error } = await supabase
            .from("produtos")
            .insert({
              codigo: item.codigo || null,
              nome: item.descricao || "Produto sem descrição",
              unidade: item.unidade || "UN",
              tipo: "produto",
              preco_custo: item.valor_unitario,
              preco_venda: 0,
              estoque_atual: 0,
              ncm: item.ncm || null,
              cfop: item.cfop || null,
              created_by: userId,
            } as never)
            .select("id")
            .single();
          if (error) throw error;
          produtoId = criado.id;
        }

        movimentos.push({
          produto_id: produtoId,
          tipo: "entrada",
          quantidade: item.quantidade,
          origem: "Compra",
          documento,
          observacoes: `Entrada pela nota de compra ${nota.numero ?? nota.id}`,
          created_by: userId,
        });
      }

      if (movimentos.length === 0) throw new Error("Nenhum item selecionado para lançar");

      const { error: erroMov } = await supabase
        .from("estoque_movimentos")
        .insert(movimentos as never);
      if (erroMov) throw erroMov;

      const { error: erroNota } = await supabase
        .from("notas_compra")
        .update({ status: "lancada" })
        .eq("id", nota.id);
      if (erroNota) throw erroNota;

      toast.success(`${movimentos.length} item(ns) somados ao estoque`);
      onPronto();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível lançar no estoque");
    } finally {
      setSalvando(false);
    }
  };

  if (itens.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        Esta nota não tem XML com itens. Lance a entrada manualmente em Estoque → Entradas e Saídas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item da nota</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead>Vai entrar em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item, idx) => (
              <TableRow key={`${item.codigo}-${idx}`}>
                <TableCell className="font-medium">
                  {item.descricao}
                  <span className="block text-xs text-muted-foreground">
                    {item.codigo} · {item.unidade} · {brl(item.valor_unitario)}
                  </span>
                </TableCell>
                <TableCell className="text-right">{item.quantidade}</TableCell>
                <TableCell className="min-w-56">
                  <Select
                    value={valor(idx, item)}
                    onValueChange={(v) => setDestinos((d) => ({ ...d, [idx]: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Cadastrar novo produto</SelectItem>
                      <SelectItem value="ignorar">Não lançar</SelectItem>
                      {produtos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.codigo ? `${p.codigo} — ` : ""}
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button onClick={() => void confirmar()} disabled={salvando}>
        Somar ao estoque
      </Button>
    </div>
  );
}

function NotasCompra() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(vazio);
  const [xml, setXml] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [estoqueNota, setEstoqueNota] = useState<string | null>(null);

  async function importarXml(file: File) {
    try {
      const texto = await file.text();
      const dados = lerXmlNfe(texto);
      setXml(texto);
      setArquivo(file.name);
      setForm((f) => ({
        ...f,
        ...dados,
        valor_produtos: dados.valor_produtos || f.valor_produtos,
        valor_frete: dados.valor_frete || f.valor_frete,
        valor_total: dados.valor_total || f.valor_total,
        status: "conferida",
      }));
      toast.success("XML lido — confira os dados e salve.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ler o XML");
    }
  }

  const set = (campo: keyof typeof vazio, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const { data = [] } = useQuery({
    queryKey: ["notas_compra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notas_compra")
        .select("*")
        .order("data_entrada", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalMes = useMemo(() => {
    const mes = new Date().toISOString().slice(0, 7);
    return data
      .filter((n) => (n.data_entrada ?? "").startsWith(mes))
      .reduce((s, n) => s + Number(n.valor_total ?? 0), 0);
  }, [data]);

  const salvar = useMutation({
    mutationFn: async () => {
      if (!form.fornecedor.trim()) throw new Error("Informe o fornecedor");
      if (form.chave_acesso && !chaveValida(form.chave_acesso)) {
        throw new Error("A chave de acesso precisa ter 44 dígitos");
      }
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("notas_compra").insert({
        chave_acesso: form.chave_acesso ? soDigitos(form.chave_acesso) : null,
        numero: form.numero || null,
        serie: form.serie || null,
        fornecedor: form.fornecedor.trim(),
        fornecedor_cnpj: form.fornecedor_cnpj || null,
        natureza_operacao: form.natureza_operacao || null,
        data_emissao: form.data_emissao || null,
        data_entrada: form.data_entrada || new Date().toISOString().slice(0, 10),
        valor_produtos: Number(form.valor_produtos) || 0,
        valor_frete: Number(form.valor_frete) || 0,
        valor_total: Number(form.valor_total) || 0,
        status: form.status,
        observacoes: form.observacoes || null,
        xml,
        created_by: auth.user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota de compra lançada");
      qc.invalidateQueries({ queryKey: ["notas_compra"] });
      setForm(vazio);
      setXml(null);
      setArquivo(null);
      setOpen(false);
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("duplicate") ? "Esta chave de acesso já foi lançada" : e.message,
      ),
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notas_compra").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nota removida");
      qc.invalidateQueries({ queryKey: ["notas_compra"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const abrirSefaz = (chave?: string | null) => {
    if (chave) {
      void navigator.clipboard?.writeText(chave).catch(() => undefined);
      toast.info("Chave copiada — cole no campo do portal da SEFAZ");
    }
    window.open(PORTAL_NFE, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notas de Compra</h1>
          <p className="text-sm text-muted-foreground">
            Lance as notas de entrada e consulte cada uma no portal da SEFAZ.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => abrirSefaz(null)}>
            <ExternalLink /> Portal SEFAZ
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Nova nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Lançar nota de compra</DialogTitle>
                <DialogDescription>
                  Informe a chave de acesso de 44 dígitos para poder consultar a nota na SEFAZ.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-dashed p-3">
                <label className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-medium">
                    <Upload className="size-4" /> Enviar XML da nota
                  </span>
                  <input
                    type="file"
                    accept=".xml,text/xml,application/xml"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void importarXml(file);
                      e.target.value = "";
                    }}
                  />
                  <span className="text-muted-foreground">
                    {arquivo ?? "Preenche fornecedor, chave, datas e valores automaticamente."}
                  </span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Chave de acesso (44 dígitos)" className="sm:col-span-2">
                  <Input
                    value={form.chave_acesso}
                    onChange={(e) => set("chave_acesso", soDigitos(e.target.value))}
                    placeholder="Somente números"
                    inputMode="numeric"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    {soDigitos(form.chave_acesso).length}/44
                  </p>
                </Field>
                <Field label="Fornecedor *">
                  <Input
                    value={form.fornecedor}
                    onChange={(e) => set("fornecedor", e.target.value)}
                  />
                </Field>
                <Field label="CNPJ do fornecedor">
                  <Input
                    value={form.fornecedor_cnpj}
                    onChange={(e) => set("fornecedor_cnpj", e.target.value)}
                  />
                </Field>
                <Field label="Número">
                  <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} />
                </Field>
                <Field label="Série">
                  <Input value={form.serie} onChange={(e) => set("serie", e.target.value)} />
                </Field>
                <Field label="Natureza da operação" className="sm:col-span-2">
                  <Input
                    value={form.natureza_operacao}
                    onChange={(e) => set("natureza_operacao", e.target.value)}
                    placeholder="Compra para revenda, remessa, devolução..."
                  />
                </Field>
                <Field label="Emissão">
                  <Input
                    type="date"
                    value={form.data_emissao}
                    onChange={(e) => set("data_emissao", e.target.value)}
                  />
                </Field>
                <Field label="Entrada">
                  <Input
                    type="date"
                    value={form.data_entrada}
                    onChange={(e) => set("data_entrada", e.target.value)}
                  />
                </Field>
                <Field label="Valor dos produtos">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor_produtos}
                    onChange={(e) => set("valor_produtos", e.target.value)}
                  />
                </Field>
                <Field label="Frete">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor_frete}
                    onChange={(e) => set("valor_frete", e.target.value)}
                  />
                </Field>
                <Field label="Valor total">
                  <Input
                    type="number"
                    step="0.01"
                    value={form.valor_total}
                    onChange={(e) => set("valor_total", e.target.value)}
                  />
                </Field>
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {statusLabel[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Observações" className="sm:col-span-2">
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) => set("observacoes", e.target.value)}
                  />
                </Field>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  disabled={!chaveValida(form.chave_acesso)}
                  onClick={() => abrirSefaz(soDigitos(form.chave_acesso))}
                >
                  <ExternalLink /> Consultar na SEFAZ
                </Button>
                <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                  Salvar nota
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Notas lançadas <Badge variant="secondary">{data.length}</Badge>
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              Entradas do mês: <span className="font-medium">{brl(totalMes)}</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma nota de compra lançada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Nº / Série</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">SEFAZ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        {n.data_entrada
                          ? new Date(`${n.data_entrada}T00:00:00`).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell className="font-medium">{n.fornecedor}</TableCell>
                      <TableCell>
                        {n.numero ?? "—"}
                        {n.serie ? ` / ${n.serie}` : ""}
                      </TableCell>
                      <TableCell className="max-w-40 truncate font-mono text-xs">
                        {n.chave_acesso ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={n.status === "cancelada" ? "destructive" : "secondary"}>
                          {statusLabel[n.status] ?? n.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {brl(Number(n.valor_total ?? 0))}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Lançar itens no estoque"
                          disabled={!n.xml}
                          onClick={() => setEstoqueNota(n.id)}
                        >
                          <PackagePlus className={n.status === "lancada" ? "" : "text-primary"} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Consultar na SEFAZ"
                          disabled={!n.chave_acesso}
                          onClick={() => abrirSefaz(n.chave_acesso)}
                        >
                          <ExternalLink />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Excluir"
                          onClick={() => excluir.mutate(n.id)}
                        >
                          <Trash2 className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!estoqueNota} onOpenChange={(v) => !v && setEstoqueNota(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lançar itens da nota no estoque</DialogTitle>
            <DialogDescription>
              Confira para qual produto cada item da nota vai entrar e confirme.
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const nota = data.find((n) => n.id === estoqueNota);
            if (!nota) return null;
            return (
              <LancarEstoque
                nota={nota}
                onPronto={() => {
                  setEstoqueNota(null);
                  qc.invalidateQueries({ queryKey: ["notas_compra"] });
                  qc.invalidateQueries({ queryKey: ["produtos"] });
                  qc.invalidateQueries({ queryKey: ["estoque_movimentos"] });
                }}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
