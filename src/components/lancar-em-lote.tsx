import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { hojeISO, brl } from "@/lib/erp";
const nova = () => ({ id: crypto.randomUUID(), descricao: "", valor: "", data: hojeISO(), categoria: "", parceiro: "", conta: "" });
type Linha = ReturnType<typeof nova>;
export function LancarEmLote({ destino }: { destino: "contas" | "financeiro" }) {
  const [open, setOpen] = useState(false);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [tipo, setTipo] = useState("pagar");
  const qc = useQueryClient();
  const alterar = (id: string, campo: keyof Linha, valor: string) => setLinhas((l) => l.map((r) => r.id === id ? { ...r, [campo]: valor } : r));
  const salvar = useMutation({
    mutationFn: async () => {
      if (!linhas.length) throw new Error("Adicione pelo menos um lançamento.");
      for (const [i, l] of linhas.entries()) {
        if (!l.descricao.trim() || !l.data || !Number.isFinite(Number(l.valor)) || Number(l.valor) <= 0 || (destino === "financeiro" && !l.categoria.trim())) throw new Error(`Linha ${i + 1}: preencha descrição, data, valor positivo${destino === "financeiro" ? " e categoria" : ""}.`);
      }
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) throw new Error("Entre novamente para salvar os lançamentos.");
      const uid = data.user.id;
      const resultado = destino === "contas"
        ? await supabase.from("contas").insert(linhas.map((l) => ({ tipo, descricao: l.descricao.trim(), valor: Number(l.valor), vencimento: l.data, parceiro: l.parceiro.trim() || null, categoria: l.categoria.trim() || null, conta_bancaria: l.conta.trim() || null, status: "aberto", recorrencia: "nenhuma", created_by: uid })))
        : await supabase.from("lancamentos_financeiros").insert(linhas.map((l) => ({ tipo_fluxo: tipo === "pagar" ? "despesa" : "receita", descricao: l.descricao.trim(), valor: Number(l.valor), data_competencia: l.data, vencimento: l.data, categoria: l.categoria.trim(), conta_bancaria: l.conta.trim() || null, status: "pendente", recorrencia: "nenhuma", created_by: uid })));
      if (resultado.error) throw resultado.error;
    },
    onSuccess: () => { toast.success(`${linhas.length} lançamentos salvos.`); setOpen(false); setLinhas([]); qc.invalidateQueries({ queryKey: [destino === "contas" ? "contas" : "lancamentos_financeiros"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return <Dialog open={open} onOpenChange={(v) => { if (salvar.isPending) return; setOpen(v); if (v && !linhas.length) setLinhas([nova(), nova()]); }}>
    <DialogTrigger asChild><Button variant="outline"><Layers /> Lançar em lote</Button></DialogTrigger>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
      <DialogHeader><DialogTitle>Lançar em lote</DialogTitle><DialogDescription>{destino === "contas" ? "Contas a pagar e receber" : "Lançamentos financeiros"}</DialogDescription></DialogHeader>
      <Field label="Tipo"><Select value={tipo} onValueChange={setTipo} disabled={salvar.isPending}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pagar">{destino === "contas" ? "A pagar" : "Despesa"}</SelectItem><SelectItem value="receber">{destino === "contas" ? "A receber" : "Receita"}</SelectItem></SelectContent></Select></Field>
      <fieldset disabled={salvar.isPending} className="space-y-4">{linhas.map((l, i) => <div key={l.id} className="grid gap-3 border-b pb-4 sm:grid-cols-3">
        <Field label={`Descrição · ${i + 1}`}><Input aria-label={`Descrição ${i + 1}`} value={l.descricao} onChange={(e) => alterar(l.id,"descricao",e.target.value)} /></Field>
        <Field label="Valor (R$)"><Input aria-label={`Valor ${i + 1}`} type="number" min="0.01" step="0.01" value={l.valor} onChange={(e) => alterar(l.id,"valor",e.target.value)} /></Field>
        <Field label={destino === "contas" ? "Vencimento" : "Competência / vencimento"}><Input type="date" value={l.data} onChange={(e) => alterar(l.id,"data",e.target.value)} /></Field>
        <Field label="Categoria"><Input value={l.categoria} onChange={(e) => alterar(l.id,"categoria",e.target.value)} /></Field>
        {destino === "contas" && <Field label="Beneficiário / cliente"><Input value={l.parceiro} onChange={(e) => alterar(l.id,"parceiro",e.target.value)} /></Field>}
        <Field label={tipo === "pagar" ? "Conta de saída" : "Conta de entrada"}><Input value={l.conta} onChange={(e) => alterar(l.id,"conta",e.target.value)} /></Field>
        <Button variant="ghost" size="icon" aria-label={`Remover linha ${i + 1}`} onClick={() => setLinhas((r) => r.filter((x) => x.id !== l.id))}><Trash2 /></Button>
      </div>)}<Button variant="outline" onClick={() => setLinhas((r) => [...r, nova()])}><Plus /> Adicionar lançamento</Button></fieldset>
      <DialogFooter className="items-center"><span className="mr-auto text-sm font-semibold">Total: {brl(linhas.reduce((s,l) => s + (Number(l.valor) || 0),0))}</span><Button disabled={salvar.isPending} onClick={() => salvar.mutate()}>{salvar.isPending ? "Salvando…" : "Salvar lote"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
