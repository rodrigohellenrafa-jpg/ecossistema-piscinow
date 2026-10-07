import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Cli = { id: string; nome: string; documento: string | null; telefone: string | null; observacoes: string | null };

interface Props {
  lead: Cli | null;
  clientes: Cli[];
  onClose: () => void;
}

export function ConverterLeadDialog({ lead, clientes, onClose }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modo, setModo] = useState<"proprio" | "existente" | "novo">("proprio");
  const [busca, setBusca] = useState("");
  const [titularId, setTitularId] = useState("");
  const [novo, setNovo] = useState({ nome: "", documento: "", telefone: "", relacao: "" });
  const [relacao, setRelacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [expandido, setExpandido] = useState(false);

  const opcoes = useMemo(
    () =>
      clientes
        .filter((c) => c.id !== lead?.id)
        .filter((c) => `${c.nome} ${c.documento ?? ""}`.toLowerCase().includes(busca.toLowerCase()))
        .slice(0, 50),
    [clientes, busca, lead],
  );

  async function confirmar() {
    if (!lead) return;
    setSalvando(true);
    try {
      let id = lead.id;
      let nomeTitular = lead.nome;
      let rel = "";
      if (modo === "existente") {
        if (!titularId) throw new Error("Selecione o titular.");
        id = titularId;
        nomeTitular = clientes.find((c) => c.id === titularId)?.nome ?? "";
        rel = relacao;
      } else if (modo === "novo") {
        if (!novo.nome.trim()) throw new Error("Informe o nome do titular.");
        const { data: u } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from("clientes")
          .insert({
            nome: novo.nome.trim(),
            documento: novo.documento.trim() || null,
            telefone: novo.telefone.trim() || null,
            tipo: novo.documento.replace(/\D/g, "").length > 11 ? "PJ" : "PF",
            etapa: "Orçamento",
            ativo: true,
            created_by: u.user?.id ?? null,
            observacoes: `Contato de origem / indicador: ${lead.nome}${novo.relacao ? ` (${novo.relacao})` : ""}`,
          })
          .select("id")
          .single();
        if (error) throw error;
        id = data.id;
        nomeTitular = novo.nome.trim();
        rel = novo.relacao;
      }
      const hoje = new Date().toLocaleDateString("pt-BR");
      const notaLead =
        id === lead.id
          ? `[${hoje}] Convertido em orçamento (próprio lead como titular).`
          : `[${hoje}] Convertido para orçamento vinculado ao titular ${nomeTitular}${rel ? ` (${rel})` : ""}.`;
      const { error: e2 } = await supabase
        .from("clientes")
        .update({
          etapa: "Orçamento",
          observacoes: lead.observacoes ? `${lead.observacoes}\n${notaLead}` : notaLead,
        })
        .eq("id", lead.id);
      if (e2) throw e2;
      if (id !== lead.id) {
        await supabase.from("clientes").update({ etapa: "Orçamento" }).eq("id", id);
      }
      localStorage.setItem(
        "piscinow:conversao-lead",
        JSON.stringify({
          titularId: id,
          nota:
            id === lead.id
              ? undefined
              : `Contato de origem / indicador: ${lead.nome}${lead.telefone ? ` - ${lead.telefone}` : ""}${rel ? ` (${rel} do titular)` : ""}`,
        }),
      );
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(`Lead convertido. Titular: ${nomeTitular}.`);
      onClose();
      navigate({ to: "/vendas/novo" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao converter lead.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={expandido ? "max-w-[95vw] h-[95vh] overflow-auto" : "max-w-lg"}>
        <DialogHeader className="flex-row items-center justify-between gap-2 pr-8">
          <DialogTitle>Converter em cliente / gerar orçamento</DialogTitle>
          <Button size="icon" variant="ghost" onClick={() => setExpandido((v) => !v)} aria-label="Expandir">
            {expandido ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Lead: <span className="font-medium text-foreground">{lead?.nome}</span>
          {lead?.telefone ? ` · ${lead.telefone}` : ""}
        </p>
        <Field label="Quem é o titular da compra?">
          <Select value={modo} onValueChange={(v) => setModo(v as typeof modo)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="proprio">O próprio lead</SelectItem>
              <SelectItem value="existente">Outro titular já cadastrado</SelectItem>
              <SelectItem value="novo">Cadastrar novo titular / pagador</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {modo === "existente" && (
          <div className="grid gap-3">
            <Input placeholder="Buscar por nome ou CPF/CNPJ" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <Select value={titularId} onValueChange={setTitularId}>
              <SelectTrigger><SelectValue placeholder="Selecione o titular" /></SelectTrigger>
              <SelectContent>
                {opcoes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}{c.documento ? ` · ${c.documento}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Field label="Parentesco / relação com o lead">
              <Input value={relacao} onChange={(e) => setRelacao(e.target.value)} placeholder="Ex.: cônjuge, sócio" />
            </Field>
          </div>
        )}
        {modo === "novo" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <Input value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            </Field>
            <Field label="CPF / CNPJ">
              <Input value={novo.documento} onChange={(e) => setNovo({ ...novo, documento: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <Input value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} />
            </Field>
            <Field label="Parentesco / relação" className="sm:col-span-2">
              <Input value={novo.relacao} onChange={(e) => setNovo({ ...novo, relacao: e.target.value })} placeholder="Ex.: cônjuge, sócio" />
            </Field>
          </div>
        )}
        {modo !== "proprio" && (
          <p className="text-xs text-muted-foreground">
            O lead fica registrado como contato de origem / indicador no pedido e no histórico dele.
          </p>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={confirmar} disabled={salvando}>
            <FileText /> {salvando ? "Convertendo..." : "Converter e abrir pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
