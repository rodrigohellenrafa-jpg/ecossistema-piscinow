import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, hojeISO, num, proximoCodigo } from "@/lib/erp";

type Linha = {
  chave: string;
  produto_id: string;
  codigo: string | null;
  nome: string;
  unidade: string;
  ncm: string | null;
  cst: string | null;
  cor: string | null;
  pastilha: string | null;
  vendida: number;
  jaComprada: number;
  estoque: number;
  custo: number;
  fornecedor_id: string;
  servico: boolean;
};

type Edicao = { marcado: boolean; qtd: string; custo: string; fornecedor_id: string; destino: "pedido" | "estoque" };

const SEM = "sem-fornecedor";

export function GerarCompraPedido({
  vendaId,
  vendaNumero,
  clienteId,
  clienteNome,
}: {
  vendaId: string;
  vendaNumero: string | null;
  clienteId: string | null;
  clienteNome: string | null;
}) {
  const qc = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [ed, setEd] = useState<Record<string, Edicao>>({});

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores", "compra-pedido"],
    enabled: aberto,
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, nome").eq("ativo", true).order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: linhas = [], isLoading } = useQuery({
    queryKey: ["compra-pedido", vendaId],
    enabled: aberto,
    queryFn: async (): Promise<Linha[]> => {
      const { data: itens, error } = await supabase
        .from("venda_itens")
        .select("produto_id, quantidade, produtos(id, codigo, nome, unidade, ncm, cst, categoria, tipo, preco_custo, estoque_atual, fornecedor_id, cor_pastilha, modelo_pastilha)")
        .eq("venda_id", vendaId);
      if (error) throw error;
      const { data: comprados, error: e2 } = await supabase
        .from("ordem_compra_itens")
        .select("produto_id, quantidade")
        .eq("venda_id", vendaId);
      if (e2) throw e2;
      const jaPorProduto = new Map<string, number>();
      for (const c of comprados ?? []) {
        if (c.produto_id) jaPorProduto.set(c.produto_id, (jaPorProduto.get(c.produto_id) ?? 0) + Number(c.quantidade));
      }
      const mapa = new Map<string, Linha>();
      for (const it of itens ?? []) {
        const p = it.produtos as unknown as {
          id: string; codigo: string | null; nome: string; unidade: string; ncm: string | null; cst: string | null;
          categoria: string | null; tipo: string; preco_custo: number; estoque_atual: number; fornecedor_id: string | null;
          cor_pastilha: string | null; modelo_pastilha: string | null;
        } | null;
        if (!p) continue;
        const atual = mapa.get(p.id);
        if (atual) { atual.vendida += Number(it.quantidade); continue; }
        mapa.set(p.id, {
          chave: p.id,
          produto_id: p.id,
          codigo: p.codigo,
          nome: p.nome,
          unidade: p.unidade,
          ncm: p.ncm,
          cst: p.cst,
          cor: p.cor_pastilha,
          pastilha: p.modelo_pastilha,
          vendida: Number(it.quantidade),
          jaComprada: jaPorProduto.get(p.id) ?? 0,
          estoque: Number(p.estoque_atual ?? 0),
          custo: Number(p.preco_custo ?? 0),
          fornecedor_id: p.fornecedor_id ?? SEM,
          servico: /servi/i.test(`${p.tipo} ${p.categoria ?? ""}`),
        });
      }
      return [...mapa.values()];
    },
  });

  // Sugestão inicial: compra só o que falta (vendido − já comprado − estoque disponível).
  useEffect(() => {
    if (!aberto) return;
    const novo: Record<string, Edicao> = {};
    for (const l of linhas) {
      const falta = Math.max(0, l.vendida - l.jaComprada - Math.max(0, l.estoque));
      novo[l.chave] = {
        marcado: falta > 0 && !l.servico,
        qtd: String(falta > 0 ? falta : 0),
        custo: String(l.custo),
        fornecedor_id: l.fornecedor_id,
        destino: "pedido",
      };
    }
    setEd(novo);
  }, [linhas, aberto]);

  const upd = (k: string, p: Partial<Edicao>) => setEd((s) => ({ ...s, [k]: { ...s[k], ...p } }));

  const selecionadas = linhas.filter((l) => ed[l.chave]?.marcado && num(ed[l.chave]?.qtd) > 0);
  const total = selecionadas.reduce((s, l) => s + num(ed[l.chave].qtd) * num(ed[l.chave].custo), 0);
  const qtdFornecedores = new Set(selecionadas.map((l) => ed[l.chave].fornecedor_id)).size;
  const nomeFornecedor = useMemo(() => new Map(fornecedores.map((f) => [f.id, f.nome])), [fornecedores]);

  const gerar = useMutation({
    mutationFn: async () => {
      if (selecionadas.length === 0) throw new Error("Marque ao menos um produto com quantidade");
      if (selecionadas.some((l) => ed[l.chave].fornecedor_id === SEM))
        throw new Error("Escolha o fornecedor de todos os produtos marcados");
      const { data: auth } = await supabase.auth.getUser();
      const { data: existentes, error: eN } = await supabase.from("ordens_compra").select("numero");
      if (eN) throw eN;
      const numeros = (existentes ?? []).map((o) => o.numero);
      const grupos = new Map<string, Linha[]>();
      for (const l of selecionadas) {
        const f = ed[l.chave].fornecedor_id;
        grupos.set(f, [...(grupos.get(f) ?? []), l]);
      }
      const criadas: string[] = [];
      for (const [fornecedorId, itens] of grupos) {
        const numero = proximoCodigo("OC", numeros);
        numeros.push(numero);
        const valor = itens.reduce((s, l) => s + num(ed[l.chave].qtd) * num(ed[l.chave].custo), 0);
        const { data: ordem, error } = await supabase
          .from("ordens_compra")
          .insert({
            numero,
            fornecedor_id: fornecedorId,
            fornecedor_nome: nomeFornecedor.get(fornecedorId) ?? "Fornecedor",
            data_pedido: hojeISO(),
            valor_produtos: valor,
            desconto: 0,
            icms_base: valor,
            icms_valor: valor * 0.18,
            icms_st_base: 0,
            icms_st_valor: 0,
            valor_total: valor,
            status: "pendente",
            observacoes: `Gerada a partir do pedido ${vendaNumero ?? ""}`.trim(),
            created_by: auth.user?.id ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        // Uma linha por unidade, igual à grade de Ordens de compra (cada unidade com seu vínculo).
        const payload = itens.flatMap((l) => {
          const e = ed[l.chave];
          const qtd = Math.round(num(e.qtd));
          const custo = num(e.custo);
          const paraPedido = e.destino === "pedido";
          return Array.from({ length: qtd }, () => ({
            ordem_id: ordem.id,
            produto_id: l.produto_id,
            codigo: l.codigo,
            descricao: l.nome,
            ncm: l.ncm,
            cst: l.cst,
            unidade: l.unidade,
            quantidade: 1,
            valor_unitario: custo,
            desconto: 0,
            total: custo,
            cliente_id: paraPedido ? clienteId : null,
            cliente_nome: paraPedido ? clienteNome : null,
            venda_id: paraPedido ? vendaId : null,
            cor: l.cor,
            pastilha: l.pastilha,
          }));
        });
        const { error: eI } = await supabase.from("ordem_compra_itens").insert(payload);
        if (eI) throw eI;
        criadas.push(numero);
      }
      return criadas;
    },
    onSuccess: (criadas) => {
      toast.success(`Ordem(ns) criada(s): ${criadas.join(", ")}`);
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["compra-pedido", vendaId] });
      setAberto(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <Button variant="outline" onClick={() => setAberto(true)}>
        <ShoppingBag /> Gerar compra
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Gerar compra do pedido {vendaNumero ?? ""}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Já vem marcado só o que falta comprar (vendido − já comprado − estoque). Ajuste o que quiser.
            Será criada uma ordem de compra para cada fornecedor.
          </p>
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>
          ) : linhas.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Este pedido não tem produtos.</p>
          ) : (
            <div className="max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Vendido</TableHead>
                    <TableHead className="text-right">Já comprado</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Comprar</TableHead>
                    <TableHead className="text-right">Custo un.</TableHead>
                    <TableHead>Destino</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.map((l) => {
                    const e = ed[l.chave];
                    if (!e) return null;
                    return (
                      <TableRow key={l.chave}>
                        <TableCell>
                          <Checkbox checked={e.marcado} onCheckedChange={(v) => upd(l.chave, { marcado: !!v })} />
                        </TableCell>
                        <TableCell className="min-w-48">
                          <div className="font-medium">{l.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {[l.codigo, l.cor, l.pastilha].filter(Boolean).join(" · ") || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{l.vendida}</TableCell>
                        <TableCell className="text-right">{l.jaComprada}</TableCell>
                        <TableCell className="text-right">{l.estoque}</TableCell>
                        <TableCell>
                          <Select value={e.fornecedor_id} onValueChange={(v) => upd(l.chave, { fornecedor_id: v })}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Escolha" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value={SEM}>— Escolha —</SelectItem>
                              {fornecedores.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Input type="number" min={0} step={1} className="ml-auto w-20 text-right" value={e.qtd}
                            onChange={(ev) => upd(l.chave, { qtd: ev.target.value })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input className="ml-auto w-24 text-right" value={e.custo}
                            onChange={(ev) => upd(l.chave, { custo: ev.target.value })} />
                        </TableCell>
                        <TableCell>
                          <Select value={e.destino} onValueChange={(v) => upd(l.chave, { destino: v as Edicao["destino"] })}>
                            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pedido">Este pedido</SelectItem>
                              <SelectItem value="estoque">Estoque</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter className="items-center gap-3 sm:justify-between">
            <span className="text-sm">
              {selecionadas.length} produto(s) · {qtdFornecedores} fornecedor(es) · <strong>{brl(total)}</strong>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button onClick={() => gerar.mutate()} disabled={gerar.isPending || selecionadas.length === 0}>
                <ShoppingBag /> Executar ordem(ns)
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
