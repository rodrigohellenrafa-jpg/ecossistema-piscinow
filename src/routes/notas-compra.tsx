import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  CheckCircle2,
  Clock,
  ExternalLink,
  PackagePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAbrirModal } from "@/hooks/use-abrir-modal";
import { useSincronizarPecasEstoque } from "@/hooks/use-sincronizar-pecas-estoque";

export const Route = createFileRoute("/notas-compra")({
  staticData: { sitemap: false },
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

const normalizarTexto = (valor: string | null | undefined) =>
  (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  conferida: "Conferida (Fila)",
  lancada: "Confirmada / Lançada",
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

type ProdutoCatalogoNota = {
  id: string;
  codigo: string | null;
  nome: string;
  unidade: string;
  unidades_por_compra: number | null;
  preco_custo: number | null;
  ncm: string | null;
  cfop: string | null;
  fornecedor_id: string | null;
  descricao: string | null;
};

/** Sugere automaticamente o vínculo de um item da NF com o catálogo global (por SKU/código, EAN ou nome). */
function sugerirProdutoCatalogo(item: ItemXml, produtos: ProdutoCatalogoNota[]): string {
  const codItem = item.codigo.trim().toLowerCase();
  const eanItem = item.ean.trim().toLowerCase();
  const nomeItemNorm = normalizarTexto(item.descricao);

  if (codItem) {
    const porCodigo = produtos.find(
      (p) => p.codigo && p.codigo.trim().toLowerCase() === codItem,
    );
    if (porCodigo) return porCodigo.id;
  }

  if (eanItem) {
    const porEan = produtos.find(
      (p) =>
        (p.codigo && p.codigo.trim().toLowerCase() === eanItem) ||
        (p.descricao && p.descricao.toLowerCase().includes(eanItem)),
    );
    if (porEan) return porEan.id;
  }

  if (nomeItemNorm) {
    const porNome = produtos.find((p) => normalizarTexto(p.nome) === nomeItemNorm);
    if (porNome) return porNome.id;
  }

  return "novo";
}

/** Localiza ou cadastra o fornecedor da NF para vincular aos produtos. */
async function obterOuCriarFornecedorNota(
  nomeFornecedor: string,
  cnpjFornecedor: string | null | undefined,
  userId: string | null,
): Promise<string | null> {
  const nomeLimpo = nomeFornecedor.trim();
  if (!nomeLimpo) return null;
  const cnpjDigitos = (cnpjFornecedor ?? "").replace(/\D/g, "");

  const { data: existentes } = await supabase
    .from("fornecedores")
    .select("id, nome, cnpj");

  if (existentes && existentes.length > 0) {
    if (cnpjDigitos.length >= 11) {
      const porCnpj = existentes.find(
        (f) => (f.cnpj ?? "").replace(/\D/g, "") === cnpjDigitos,
      );
      if (porCnpj) return porCnpj.id;
    }
    const nomeNorm = normalizarTexto(nomeLimpo);
    const porNome = existentes.find((f) => normalizarTexto(f.nome) === nomeNorm);
    if (porNome) return porNome.id;
  }

  const { data: criado } = await supabase
    .from("fornecedores")
    .insert({
      nome: nomeLimpo,
      cnpj: cnpjFornecedor?.trim() || null,
      ativo: true,
      created_by: userId,
    })
    .select("id")
    .single();

  return criado?.id ?? null;
}

/**
 * Executa a confirmação da NF:
 * - Se o produto já existir no catálogo global, vincula-o e atualiza seus custos/dados fiscais/estoque.
 * - Se o produto for novo, cadastra-o automaticamente na tabela global `produtos` (`ativo: true`).
 * - Lança as entradas em `estoque_movimentos` e arquiva a NF com `status: "lancada"`.
 */
async function processarConfirmacaoNotaCompra({
  nota,
  itens,
  destinos,
  fatores,
  produtos,
}: {
  nota: {
    id: string;
    fornecedor: string;
    fornecedor_cnpj?: string | null;
    numero: string | null;
    status?: string | null;
  };
  itens: ItemXml[];
  destinos: Record<number, string>;
  fatores: Record<number, string>;
  produtos: ProdutoCatalogoNota[];
}): Promise<{ lancados: number; novosCadastrados: number; atualizados: number }> {
  if (nota.status === "lancada") {
    throw new Error("Esta Nota Fiscal já foi confirmada e arquivada no histórico.");
  }

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id ?? null;
  const documento = `NF ${nota.numero ?? ""} - ${nota.fornecedor}`.trim();
  const fornecedorId = await obterOuCriarFornecedorNota(
    nota.fornecedor,
    nota.fornecedor_cnpj,
    userId,
  );

  const movimentos: Record<string, unknown>[] = [];
  const produtosRecebidosIds: string[] = [];
  let novosCadastrados = 0;
  let atualizados = 0;

  for (const [idx, item] of itens.entries()) {
    const alvo = destinos[idx] ?? sugerirProdutoCatalogo(item, produtos);
    if (alvo === "ignorar" || item.quantidade <= 0) continue;

    const pExistente = produtos.find((x) => x.id === alvo);
    const fatorStr = fatores[idx] ?? String(pExistente?.unidades_por_compra ?? 1);
    const fNum = Number(String(fatorStr).replace(",", "."));
    const f = fNum > 0 ? fNum : 1;
    const quantidadeUnidades = item.quantidade * f;
    const custoUnitario =
      item.valor_unitario > 0 ? Number((item.valor_unitario / f).toFixed(4)) : 0;

    let produtoId = alvo;
    if (alvo === "novo") {
      const precoVendaSugerido =
        custoUnitario > 0 ? Number((custoUnitario * 1.5).toFixed(2)) : 0;
      const { data: criado, error } = await supabase
        .from("produtos")
        .insert({
          codigo: item.codigo.trim() || item.ean.trim() || null,
          nome: item.descricao.trim() || "Produto sem descrição",
          unidade: item.unidade.trim() || "UN",
          categoria: "Peças",
          tipo: "produto",
          preco_custo: custoUnitario,
          preco_venda: precoVendaSugerido,
          estoque_atual: 0,
          estoque_minimo: 0,
          unidades_por_compra: f,
          ncm: item.ncm.trim() || null,
          cfop: item.cfop.trim() || null,
          fornecedor_id: fornecedorId,
          ativo: true,
          sob_encomenda: false,
          status_compra: "recebida",
          created_by: userId,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      produtoId = criado.id;
      novosCadastrados++;
    } else if (pExistente) {
      const patchProduto: Record<string, unknown> = {
        unidades_por_compra: f,
        ativo: true,
        status_compra: "recebida",
      };
      if (custoUnitario > 0) {
        patchProduto.preco_custo = custoUnitario;
      }
      if (item.ncm?.trim()) {
        patchProduto.ncm = item.ncm.trim();
      }
      if (item.cfop?.trim()) {
        patchProduto.cfop = item.cfop.trim();
      }
      if (!pExistente.fornecedor_id && fornecedorId) {
        patchProduto.fornecedor_id = fornecedorId;
      }

      const { error: errUpdate } = await supabase
        .from("produtos")
        .update(patchProduto as never)
        .eq("id", alvo);
      if (errUpdate) throw errUpdate;
      atualizados++;
    }

    produtosRecebidosIds.push(produtoId);
    movimentos.push({
      produto_id: produtoId,
      tipo: "entrada",
      quantidade: quantidadeUnidades,
      origem: "Compra",
      documento,
      observacoes:
        f > 1
          ? `Entrada pela nota ${nota.numero ?? nota.id}: ${item.quantidade} x ${f} un.`
          : `Entrada pela nota de compra ${nota.numero ?? nota.id}`,
      created_by: userId,
    });
  }

  if (movimentos.length === 0) {
    throw new Error("Adicione ou selecione ao menos um item válido para confirmar a nota.");
  }

  const { error: erroMov } = await supabase
    .from("estoque_movimentos")
    .insert(movimentos as never);
  if (erroMov) throw erroMov;

  // Vincula o número da NF aos itens de ordem de compra em aberto correspondentes, se houver
  if (nota.numero && produtosRecebidosIds.length > 0) {
    await supabase
      .from("ordem_compra_itens")
      .update({ numero_nf: nota.numero })
      .in("produto_id", produtosRecebidosIds)
      .is("numero_nf", null);
  }

  const { error: erroNota } = await supabase
    .from("notas_compra")
    .update({ status: "lancada" })
    .eq("id", nota.id);
  if (erroNota) throw erroNota;

  return {
    lancados: movimentos.length,
    novosCadastrados,
    atualizados,
  };
}

function LancarEstoque({
  nota,
  onPronto,
}: {
  nota: {
    id: string;
    fornecedor: string;
    fornecedor_cnpj?: string | null;
    numero: string | null;
    xml: string | null;
    status?: string | null;
  };
  onPronto: () => void;
}) {
  const itensXml = useMemo(() => (nota.xml ? lerItensXml(nota.xml) : []), [nota.xml]);
  const [itensManuais, setItensManuais] = useState<ItemXml[]>([]);
  const [novoManual, setNovoManual] = useState({
    produto_id: "novo",
    codigo: "",
    descricao: "",
    unidade: "UN",
    quantidade: "1",
    valor_unitario: "0",
  });
  const itens = itensXml.length > 0 ? itensXml : itensManuais;

  const [destinos, setDestinos] = useState<Record<number, string>>({});
  const [fatores, setFatores] = useState<Record<number, string>>({});
  const [salvando, setSalvando] = useState(false);

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "catalogo-notas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          "id, codigo, nome, unidade, unidades_por_compra, preco_custo, ncm, cfop, fornecedor_id, descricao",
        )
        .order("nome");
      if (error) throw error;
      return data as ProdutoCatalogoNota[];
    },
  });

  const valor = (idx: number, item: ItemXml) =>
    destinos[idx] ?? sugerirProdutoCatalogo(item, produtos);

  /** Quantas unidades de venda vêm em cada volume da nota do fornecedor. */
  const fator = (idx: number, item: ItemXml) => {
    if (fatores[idx] !== undefined) return fatores[idx];
    const alvo = valor(idx, item);
    const p = produtos.find((x) => x.id === alvo);
    return String(p?.unidades_por_compra ?? 1);
  };

  const fatorNum = (idx: number, item: ItemXml) => {
    const n = Number(String(fator(idx, item)).replace(",", "."));
    return n > 0 ? n : 1;
  };

  const unidadeDestino = (idx: number, item: ItemXml) => {
    const p = produtos.find((x) => x.id === valor(idx, item));
    return p?.unidade ?? item.unidade ?? "UN";
  };

  const adicionarItemManual = () => {
    const qtd = Number(novoManual.quantidade) || 0;
    const vlr = Number(novoManual.valor_unitario) || 0;
    const prod = produtos.find((p) => p.id === novoManual.produto_id);
    const descricaoFinal = prod ? prod.nome : novoManual.descricao.trim();
    if (!descricaoFinal) {
      toast.error("Informe a descrição do produto ou selecione um item do catálogo.");
      return;
    }
    if (qtd <= 0) {
      toast.error("Informe uma quantidade maior que zero.");
      return;
    }
    const idxNovo = itensManuais.length;
    const novoItem: ItemXml = {
      codigo: prod?.codigo ?? novoManual.codigo.trim(),
      ean: "",
      descricao: descricaoFinal,
      unidade: prod?.unidade ?? (novoManual.unidade.trim() || "UN"),
      quantidade: qtd,
      valor_unitario: vlr > 0 ? vlr : Number(prod?.preco_custo ?? 0),
      ncm: prod?.ncm ?? "",
      cfop: prod?.cfop ?? "",
    };
    setItensManuais((prev) => [...prev, novoItem]);
    setDestinos((prev) => ({
      ...prev,
      [idxNovo]: prod ? prod.id : sugerirProdutoCatalogo(novoItem, produtos),
    }));
    setNovoManual({
      produto_id: "novo",
      codigo: "",
      descricao: "",
      unidade: "UN",
      quantidade: "1",
      valor_unitario: "0",
    });
  };

  const confirmar = async () => {
    if (itens.length === 0) return;
    setSalvando(true);
    try {
      const res = await processarConfirmacaoNotaCompra({
        nota,
        itens,
        destinos,
        fatores,
        produtos,
      });
      const detalhes = [
        `${res.lancados} item(ns) lançados no estoque`,
        res.novosCadastrados > 0
          ? `${res.novosCadastrados} novo(s) cadastrado(s) no catálogo global`
          : null,
        res.atualizados > 0 ? `${res.atualizados} produto(s) atualizado(s)` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      toast.success(`Nota Fiscal confirmada e movida para o Histórico! (${detalhes})`);
      onPronto();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível confirmar e lançar a nota");
    } finally {
      setSalvando(false);
    }
  };

  if (nota.status === "lancada") {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
        Esta Nota Fiscal já foi confirmada, seus produtos já foram vinculados/cadastrados no
        catálogo global e ela já se encontra arquivada no Histórico de NFs.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
        Ao confirmar a nota, produtos já existentes no catálogo terão seu custo e estoque
        atualizados automaticamente, e produtos novos serão cadastrados na tabela global de
        produtos para uso imediato em Vendas, Compras e Estoque. Em seguida, a NF será movida para
        o <strong>Histórico de Compras / Histórico de NFs</strong>.
      </p>

      {itensXml.length === 0 && (
        <div className="space-y-3 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">
            Adicionar itens da nota (nota sem XML anexado)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Produto do catálogo (ou cadastrar novo)" className="sm:col-span-2">
              <Select
                value={novoManual.produto_id}
                onValueChange={(v) => {
                  const p = produtos.find((x) => x.id === v);
                  setNovoManual((m) => ({
                    ...m,
                    produto_id: v,
                    codigo: p?.codigo ?? m.codigo,
                    descricao: p?.nome ?? m.descricao,
                    unidade: p?.unidade ?? m.unidade,
                    valor_unitario: p?.preco_custo ? String(p.preco_custo) : m.valor_unitario,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  <SelectItem value="novo">+ Cadastrar novo produto no catálogo global</SelectItem>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.codigo ? `${p.codigo} — ` : ""}
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Código / SKU">
              <Input
                value={novoManual.codigo}
                onChange={(e) => setNovoManual((m) => ({ ...m, codigo: e.target.value }))}
                placeholder="Opcional"
              />
            </Field>
            {novoManual.produto_id === "novo" && (
              <Field label="Nome do novo produto *" className="sm:col-span-2">
                <Input
                  value={novoManual.descricao}
                  onChange={(e) => setNovoManual((m) => ({ ...m, descricao: e.target.value }))}
                  placeholder="Descrição para cadastrar no catálogo global"
                />
              </Field>
            )}
            <Field label="Quantidade *">
              <Input
                type="number"
                min="0.001"
                step="any"
                value={novoManual.quantidade}
                onChange={(e) => setNovoManual((m) => ({ ...m, quantidade: e.target.value }))}
              />
            </Field>
            <Field label="Custo unitário na NF (R$)">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={novoManual.valor_unitario}
                onChange={(e) =>
                  setNovoManual((m) => ({ ...m, valor_unitario: e.target.value }))
                }
              />
            </Field>
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={adicionarItemManual}>
                <Plus className="size-4" /> Incluir item
              </Button>
            </div>
          </div>
        </div>
      )}

      {itens.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item da nota</TableHead>
                <TableHead className="text-right">Qtd. na nota</TableHead>
                <TableHead className="text-right">Unid. por caixa</TableHead>
                <TableHead className="text-right">Entra no estoque</TableHead>
                <TableHead>Vínculo no Catálogo Global</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item, idx) => (
                <TableRow key={`${item.codigo}-${idx}`}>
                  <TableCell className="font-medium">
                    {item.descricao}
                    <span className="block text-xs text-muted-foreground">
                      {item.codigo || "Sem SKU"} · {item.unidade} · {brl(item.valor_unitario)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.quantidade}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      className="ml-auto h-8 w-20 text-right"
                      value={fator(idx, item)}
                      onChange={(e) => setFatores((f) => ({ ...f, [idx]: e.target.value }))}
                      disabled={valor(idx, item) === "ignorar"}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {valor(idx, item) === "ignorar"
                      ? "—"
                      : `${item.quantidade * fatorNum(idx, item)} ${unidadeDestino(idx, item)}`}
                  </TableCell>
                  <TableCell className="min-w-64">
                    <Select
                      value={valor(idx, item)}
                      onValueChange={(v) => setDestinos((d) => ({ ...d, [idx]: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        <SelectItem value="novo">
                          + Cadastrar novo produto no catálogo global
                        </SelectItem>
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
      )}

      <div className="flex justify-end">
        <Button onClick={() => void confirmar()} disabled={salvando || itens.length === 0}>
          <CheckCircle2 className="size-4" />
          {salvando ? "Confirmando e lançando..." : "Confirmar Nota, Atualizar Catálogo e Arquivar"}
        </Button>
      </div>
    </div>
  );
}

function NotasCompra() {
  const qc = useQueryClient();
  useSincronizarPecasEstoque();
  const [abaAtiva, setAbaAtiva] = useState<"pendentes" | "historico">("pendentes");
  const [open, setOpen] = useState(false);
  useAbrirModal("novo", () => setOpen(true));
  const [form, setForm] = useState(vazio);
  const [xml, setXml] = useState<string | null>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [itensXmlModal, setItensXmlModal] = useState<ItemXml[]>([]);
  const [destinosModal, setDestinosModal] = useState<Record<number, string>>({});
  const [fatoresModal, setFatoresModal] = useState<Record<number, string>>({});
  const [estoqueNota, setEstoqueNota] = useState<string | null>(null);

  const { data: produtosCatalogo = [] } = useQuery({
    queryKey: ["produtos", "catalogo-notas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select(
          "id, codigo, nome, unidade, unidades_por_compra, preco_custo, ncm, cfop, fornecedor_id, descricao",
        )
        .order("nome");
      if (error) throw error;
      return data as ProdutoCatalogoNota[];
    },
  });

  const invalidarTudo = () => {
    qc.invalidateQueries({ queryKey: ["notas_compra"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
    qc.invalidateQueries({ queryKey: ["produtos-select"] });
    qc.invalidateQueries({ queryKey: ["estoque_movimentos"] });
    qc.invalidateQueries({ queryKey: ["ordens_compra"] });
    qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
    qc.invalidateQueries({ queryKey: ["fornecedores"] });
    qc.invalidateQueries({ queryKey: ["fornecedores-select"] });
  };

  async function importarXml(file: File) {
    try {
      const texto = await file.text();
      const dados = lerXmlNfe(texto);
      const itensLidos = lerItensXml(texto);
      setXml(texto);
      setArquivo(file.name);
      setItensXmlModal(itensLidos);
      setDestinosModal({});
      setFatoresModal({});
      setForm((f) => ({
        ...f,
        ...dados,
        valor_produtos: dados.valor_produtos || f.valor_produtos,
        valor_frete: dados.valor_frete || f.valor_frete,
        valor_total: dados.valor_total || f.valor_total,
        status: "conferida",
      }));
      toast.success(
        `XML lido (${itensLidos.length} item(ns)) — confira o vínculo com o catálogo e confirme a nota.`,
      );
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

  /** Fila ativa: apenas NFs pendentes/conferidas que ainda não foram confirmadas e lançadas no estoque. */
  const notasPendentes = useMemo(
    () => data.filter((n) => n.status !== "lancada" && n.status !== "cancelada"),
    [data],
  );

  /** Histórico arquivado: NFs já confirmadas/lançadas no sistema ou canceladas. */
  const notasHistorico = useMemo(
    () => data.filter((n) => n.status === "lancada" || n.status === "cancelada"),
    [data],
  );

  const totalMes = useMemo(() => {
    const mes = new Date().toISOString().slice(0, 7);
    return data
      .filter((n) => (n.data_entrada ?? "").startsWith(mes) && n.status !== "cancelada")
      .reduce((s, n) => s + Number(n.valor_total ?? 0), 0);
  }, [data]);

  const salvar = useMutation({
    mutationFn: async (modo: "fila" | "confirmar_e_lancar") => {
      if (!form.fornecedor.trim()) throw new Error("Informe o fornecedor");
      if (form.chave_acesso && !chaveValida(form.chave_acesso)) {
        throw new Error("A chave de acesso precisa ter 44 dígitos");
      }
      const { data: auth } = await supabase.auth.getUser();
      const statusInicial = modo === "confirmar_e_lancar" ? "conferida" : form.status === "lancada" ? "conferida" : form.status;

      const { data: notaCriada, error } = await supabase
        .from("notas_compra")
        .insert({
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
          status: statusInicial,
          observacoes: form.observacoes || null,
          xml,
          created_by: auth.user?.id ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;

      if (modo === "confirmar_e_lancar" && itensXmlModal.length > 0) {
        const res = await processarConfirmacaoNotaCompra({
          nota: notaCriada,
          itens: itensXmlModal,
          destinos: destinosModal,
          fatores: fatoresModal,
          produtos: produtosCatalogo,
        });
        return { modo, nota: notaCriada, res };
      }

      return { modo, nota: notaCriada, res: null };
    },
    onSuccess: (resultado) => {
      invalidarTudo();
      setForm(vazio);
      setXml(null);
      setArquivo(null);
      setItensXmlModal([]);
      setDestinosModal({});
      setFatoresModal({});
      setOpen(false);

      if (resultado.modo === "confirmar_e_lancar" && resultado.res) {
        setAbaAtiva("historico");
        toast.success(
          `Nota confirmada! ${resultado.res.lancados} item(ns) lançados no estoque/catálogo e NF arquivada no Histórico.`,
        );
      } else {
        setAbaAtiva("pendentes");
        toast.success("Nota adicionada à Fila de Pendências para conferência.");
      }
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
      invalidarTudo();
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
            Importe notas fiscais de fornecedor, sincronize produtos/custos no catálogo global e
            consulte o histórico arquivado.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => abrirSefaz(null)}>
            <ExternalLink /> Portal SEFAZ
          </Button>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setItensXmlModal([]);
                setDestinosModal({});
                setFatoresModal({});
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus /> Nova nota
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Importar / Incluir Nota Fiscal de Fornecedor</DialogTitle>
                <DialogDescription>
                  Envie o XML da NF-e para vincular ou cadastrar automaticamente os produtos no
                  catálogo global e lançar no estoque.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-dashed p-3">
                <label className="flex flex-wrap items-center gap-3 text-sm cursor-pointer">
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 font-medium hover:bg-muted/50">
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
                    {arquivo ?? "Preenche fornecedor, chave, datas, valores e itens automaticamente."}
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
                <Field label="Observações">
                  <Textarea
                    value={form.observacoes}
                    onChange={(e) => set("observacoes", e.target.value)}
                  />
                </Field>
              </div>

              {itensXmlModal.length > 0 && (
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      Itens identificados no XML ({itensXmlModal.length})
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Produtos existentes são vinculados automaticamente; novos são cadastrados no
                      catálogo global.
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto da NF</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Unid/Cx</TableHead>
                          <TableHead>Destino no Catálogo Global</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itensXmlModal.map((item, idx) => {
                          const alvo =
                            destinosModal[idx] ?? sugerirProdutoCatalogo(item, produtosCatalogo);
                          const pExistente = produtosCatalogo.find((x) => x.id === alvo);
                          const fatorAtual =
                            fatoresModal[idx] ?? String(pExistente?.unidades_por_compra ?? 1);
                          return (
                            <TableRow key={`${item.codigo}-${idx}`}>
                              <TableCell className="font-medium text-xs">
                                {item.descricao}
                                <span className="block text-[11px] text-muted-foreground">
                                  SKU: {item.codigo || "—"} · {brl(item.valor_unitario)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-xs">
                                {item.quantidade} {item.unidade}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="1"
                                  step="1"
                                  className="ml-auto h-7 w-16 text-right text-xs"
                                  value={fatorAtual}
                                  onChange={(e) =>
                                    setFatoresModal((f) => ({ ...f, [idx]: e.target.value }))
                                  }
                                  disabled={alvo === "ignorar"}
                                />
                              </TableCell>
                              <TableCell className="min-w-56">
                                <Select
                                  value={alvo}
                                  onValueChange={(v) =>
                                    setDestinosModal((d) => ({ ...d, [idx]: v }))
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-60">
                                    <SelectItem value="novo">
                                      + Cadastrar novo produto no catálogo
                                    </SelectItem>
                                    <SelectItem value="ignorar">Não lançar</SelectItem>
                                    {produtosCatalogo.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.codigo ? `${p.codigo} — ` : ""}
                                        {p.nome}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!chaveValida(form.chave_acesso)}
                  onClick={() => abrirSefaz(soDigitos(form.chave_acesso))}
                >
                  <ExternalLink /> Consultar na SEFAZ
                </Button>
                <Button
                  variant="outline"
                  onClick={() => salvar.mutate("fila")}
                  disabled={salvar.isPending}
                >
                  Salvar na Fila de Pendências
                </Button>
                {itensXmlModal.length > 0 && (
                  <Button
                    onClick={() => salvar.mutate("confirmar_e_lancar")}
                    disabled={salvar.isPending}
                  >
                    <CheckCircle2 className="size-4" />
                    Confirmar Nota, Lançar Itens e Arquivar
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        value={abaAtiva}
        onValueChange={(v) => setAbaAtiva(v as "pendentes" | "historico")}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="pendentes" className="gap-2">
              <Clock className="size-4" />
              Fila de Pendências / Importação
              <Badge variant="secondary" className="ml-1">
                {notasPendentes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="historico" className="gap-2">
              <Archive className="size-4" />
              Histórico de Compras / Histórico de NFs
              <Badge variant="secondary" className="ml-1">
                {notasHistorico.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <span className="text-sm text-muted-foreground">
            Entradas do mês: <span className="font-semibold text-foreground">{brl(totalMes)}</span>
          </span>
        </div>

        <TabsContent value="pendentes" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                Notas aguardando confirmação e lançamento de itens{" "}
                <Badge variant="secondary">{notasPendentes.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notasPendentes.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma nota pendente na fila de importação. Notas já confirmadas estão na aba{" "}
                  <strong>Histórico de Compras / Histórico de NFs</strong>.
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
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notasPendentes.map((n) => (
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
                            <Badge variant="secondary">{statusLabel[n.status] ?? n.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {brl(Number(n.valor_total ?? 0))}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="default"
                              className="mr-1 h-8 gap-1.5 text-xs"
                              title="Confirmar itens, atualizar catálogo/estoque e arquivar NF"
                              onClick={() => setEstoqueNota(n.id)}
                            >
                              <PackagePlus className="size-3.5" />
                              Confirmar e Lançar
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
        </TabsContent>

        <TabsContent value="historico" className="m-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                Histórico de Compras / Histórico de NFs Arquivadas{" "}
                <Badge variant="secondary">{notasHistorico.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notasHistorico.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma nota fiscal arquivada no histórico ainda.
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
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notasHistorico.map((n) => (
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
                            <Badge
                              variant={n.status === "cancelada" ? "destructive" : "default"}
                              className={
                                n.status === "lancada"
                                  ? "bg-emerald-600 hover:bg-emerald-600 text-white gap-1"
                                  : undefined
                              }
                            >
                              {n.status === "lancada" && <CheckCircle2 className="size-3" />}
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
        </TabsContent>
      </Tabs>

      <Dialog open={!!estoqueNota} onOpenChange={(v) => !v && setEstoqueNota(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirmar Nota Fiscal e Lançar Itens no Sistema</DialogTitle>
            <DialogDescription>
              Confira o vínculo de cada item com o catálogo global. Produtos novos serão
              cadastrados automaticamente e a nota será movida para o Histórico de NFs.
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
                  setAbaAtiva("historico");
                  invalidarTudo();
                }}
              />
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
