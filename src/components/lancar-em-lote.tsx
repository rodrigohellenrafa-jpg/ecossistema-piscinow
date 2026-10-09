import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { VinculoField, parseVinculo } from "@/components/centro-custo-field";
import { hojeISO, brl } from "@/lib/erp";
import {
  AlertaDuplicidadeDialog,
  encontrarDuplicidades,
  type ItemLancamentoComparacao,
} from "@/components/alerta-duplicidade-dialog";
const nova = () => ({ id: crypto.randomUUID(), descricao: "", valor: "", data: hojeISO(), categoria: "", parceiro: "", conta: "", vinculo: "" });
type Linha = ReturnType<typeof nova>;
export function LancarEmLote({ destino }: { destino: "contas" | "financeiro" }) {
  const [open, setOpen] = useState(false);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [tipo, setTipo] = useState("pagar");
  const [duplicidadesLote, setDuplicidadesLote] = useState<ItemLancamentoComparacao[]>([]);
  const [alertaDuplicidadeLoteAberto, setAlertaDuplicidadeLoteAberto] = useState(false);
  const qc = useQueryClient();
  const alterar = (id: string, campo: keyof Linha, valor: string) => setLinhas((l) => l.map((r) => r.id === id ? { ...r, [campo]: valor } : r));
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categorias_financeiras").select("id, nome, tipo").order("nome");
      if (error) throw error;
      return data;
    },
  });
  const { data: contasBancarias = [] } = useQuery({
    queryKey: ["saldos-bancarios"],
    queryFn: async () => {
      const { data, error } = await supabase.from("saldos_bancarios").select("id, banco, conta").order("conta");
      if (error) throw error;
      return data;
    },
  });
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-lote"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fornecedores").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });
  const { data: colaboradores = [] } = useQuery({
    queryKey: ["funcionarios-lote"],
    queryFn: async () => {
      const { data, error } = await supabase.from("funcionarios").select("id, nome, cargo").eq("ativo", true).order("nome");
      if (error) throw error;
      return data;
    },
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes-lote"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome").eq("ativo", true).order("nome");
      if (error) throw error;
      return data;
    },
  });
  const salvar = useMutation({
    mutationFn: async () => {
      if (!linhas.length) throw new Error("Adicione pelo menos um lançamento.");
      for (const [i, l] of linhas.entries()) {
        if (!l.descricao.trim() || !l.data || !Number.isFinite(Number(l.valor)) || Number(l.valor) <= 0 || (destino === "financeiro" && !l.categoria.trim())) throw new Error(`Linha ${i + 1}: preencha descrição, data, valor positivo${destino === "financeiro" ? " e categoria" : ""}.`);
      }
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Entre novamente para salvar os lançamentos.");
      const uid = data.user.id;
      const vinculos = linhas.map((l) => parseVinculo(l.vinculo));
      const resultado = destino === "contas"
        ? await supabase.from("contas").insert(linhas.map((l, i) => ({ tipo, descricao: l.descricao.trim(), valor: Number(l.valor), vencimento: l.data, parceiro: l.parceiro.trim() || null, categoria: l.categoria.trim() || null, conta_bancaria: l.conta.trim() || null, status: "aberto", recorrencia: "nenhuma", obra_id: vinculos[i].obra_id, funcionario_id: vinculos[i].funcionario_id, cliente_id: vinculos[i].cliente_id, created_by: uid })))
        : await supabase.from("lancamentos_financeiros").insert(linhas.map((l, i) => ({ tipo_fluxo: tipo === "pagar" ? "despesa" : "receita", descricao: l.descricao.trim(), valor: Number(l.valor), data_competencia: l.data, vencimento: l.data, categoria: l.categoria.trim(), conta_bancaria: l.conta.trim() || null, status: "Pendente", recorrencia: "nenhuma", obra_id: vinculos[i].obra_id, funcionario_id: vinculos[i].funcionario_id, cliente_id: vinculos[i].cliente_id, created_by: uid })));
      if (resultado.error) throw resultado.error;
    },
    onSuccess: () => { toast.success(`${linhas.length} lançamentos salvos.`); setOpen(false); setLinhas([]); qc.invalidateQueries({ queryKey: [destino === "contas" ? "contas" : "lancamentos_financeiros"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const acionarSalvarLote = async () => {
    if (!linhas.length) {
      toast.error("Adicione pelo menos um lançamento.");
      return;
    }
    for (const [i, l] of linhas.entries()) {
      if (
        !l.descricao.trim() ||
        !l.data ||
        !Number.isFinite(Number(l.valor)) ||
        Number(l.valor) <= 0 ||
        (destino === "financeiro" && !l.categoria.trim())
      ) {
        toast.error(
          `Linha ${i + 1}: preencha descrição, data, valor positivo${destino === "financeiro" ? " e categoria" : ""}.`,
        );
        return;
      }
    }

    try {
      const tabela = destino === "contas" ? "contas" : "lancamentos_financeiros";
      const { data: existentes = [] } = await supabase
        .from(tabela)
        .select("id, tipo, descricao, valor, vencimento, data_competencia, parceiro, status");

      const dupesEncontradas: ItemLancamentoComparacao[] = [];
      for (const linha of linhas) {
        const d = encontrarDuplicidades(
          {
            tipo,
            descricao: linha.descricao,
            valor: Number(linha.valor) || 0,
            data: linha.data,
            parceiro: linha.parceiro,
          },
          (existentes || []) as never,
        );
        dupesEncontradas.push(...d);
      }

      if (dupesEncontradas.length > 0) {
        const unicos = [
          ...new Map(dupesEncontradas.map((item) => [item.id ?? item.descricao, item])).values(),
        ];
        setDuplicidadesLote(unicos);
        setAlertaDuplicidadeLoteAberto(true);
        return;
      }
    } catch (err) {
      console.warn("Verificação de duplicidade lote:", err);
    }

    salvar.mutate();
  };

  const categoriasFiltradas = categorias.filter((c) => c.tipo === "ambas" || c.tipo === tipo);
  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (salvar.isPending) return; setOpen(v); if (v && !linhas.length) setLinhas([nova(), nova()]); }}>
        <DialogTrigger asChild><Button variant="outline"><Layers /> Lançar em lote</Button></DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader><DialogTitle>Lançar em lote</DialogTitle><DialogDescription>{destino === "contas" ? "Contas a pagar e receber" : "Lançamentos financeiros"}</DialogDescription></DialogHeader>
          <Field label="Tipo"><Select value={tipo} onValueChange={setTipo} disabled={salvar.isPending}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pagar">{destino === "contas" ? "A pagar" : "Despesa"}</SelectItem><SelectItem value="receber">{destino === "contas" ? "A receber" : "Receita"}</SelectItem></SelectContent></Select></Field>
          <fieldset disabled={salvar.isPending} className="space-y-4">{linhas.map((l, i) => <div key={l.id} className="grid gap-3 border-b pb-4 sm:grid-cols-3">
            <Field label={`Descrição · ${i + 1}`}><Input aria-label={`Descrição ${i + 1}`} value={l.descricao} onChange={(e) => alterar(l.id,"descricao",e.target.value)} /></Field>
            <Field label="Valor (R$)"><Input aria-label={`Valor ${i + 1}`} type="number" min="0.01" step="0.01" value={l.valor} onChange={(e) => alterar(l.id,"valor",e.target.value)} /></Field>
            <Field label={destino === "contas" ? "Vencimento" : "Competência / vencimento"}><Input type="date" value={l.data} onChange={(e) => alterar(l.id,"data",e.target.value)} /></Field>
            <Field label="Categoria">
              <Select value={l.categoria || "nenhuma"} onValueChange={(v) => alterar(l.id, "categoria", v === "nenhuma" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem categoria</SelectItem>
                  {categoriasFiltradas.map((c) => <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            {destino === "contas" && <Field label="Beneficiário / cliente">
              <Select value={l.parceiro || "nenhum"} onValueChange={(v) => alterar(l.id, "parceiro", v === "nenhum" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Sem vínculo</SelectItem>
                  {fornecedores.length > 0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Fornecedores</div>}
                  {fornecedores.map((f) => <SelectItem key={`forn:${f.id}`} value={f.nome}>{f.nome}</SelectItem>)}
                  {colaboradores.length > 0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Colaboradores</div>}
                  {colaboradores.map((c) => <SelectItem key={`func:${c.id}`} value={c.nome}>{c.nome}{c.cargo ? ` — ${c.cargo}` : ""}</SelectItem>)}
                  {clientes.length > 0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Clientes</div>}
                  {clientes.map((c) => <SelectItem key={`cli:${c.id}`} value={c.nome}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>}
            <VinculoField value={l.vinculo} onChange={(v) => alterar(l.id, "vinculo", v)} />
            <Field label={tipo === "pagar" ? "Conta de saída" : "Conta de entrada"}>
              <Select value={l.conta || "nenhuma"} onValueChange={(v) => alterar(l.id, "conta", v === "nenhuma" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem conta</SelectItem>
                  {contasBancarias.map((c) => <SelectItem key={c.id} value={c.conta}>{c.conta}{c.banco ? ` — ${c.banco}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Button variant="ghost" size="icon" aria-label={`Remover linha ${i + 1}`} onClick={() => setLinhas((r) => r.filter((x) => x.id !== l.id))}><Trash2 /></Button>
          </div>)}<Button variant="outline" onClick={() => setLinhas((r) => [...r, nova()])}><Plus /> Adicionar lançamento</Button></fieldset>
          <DialogFooter className="items-center"><span className="mr-auto text-sm font-semibold">Total: {brl(linhas.reduce((s,l) => s + (Number(l.valor) || 0),0))}</span><Button disabled={salvar.isPending} onClick={acionarSalvarLote}>{salvar.isPending ? "Salvando…" : "Salvar lote"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertaDuplicidadeDialog
        aberto={alertaDuplicidadeLoteAberto}
        onCancelar={() => setAlertaDuplicidadeLoteAberto(false)}
        onConfirmar={() => {
          setAlertaDuplicidadeLoteAberto(false);
          salvar.mutate();
        }}
        titulo="Possível lançamento em duplicidade no lote"
        subtitulo={`Identificamos ${duplicidadesLote.length} lançamento(s) correspondente(s) já existente(s) no sistema.`}
        tentado={{
          tipo,
          descricao: `Lote com ${linhas.length} itens`,
          valor: linhas.reduce((s, l) => s + (Number(l.valor) || 0), 0),
          data: linhas[0]?.data || hojeISO(),
        }}
        duplicados={duplicidadesLote}
      />
    </>
  );
}
