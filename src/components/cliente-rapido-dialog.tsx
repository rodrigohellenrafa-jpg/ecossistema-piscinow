import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onCreated: (clienteId: string) => void | Promise<void>;
}

const vazio = {
  nome: "",
  tipo: "PF",
  documento: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  endereco_obra: "",
};

export function ClienteRapidoDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState(vazio);

  const set = (campo: keyof typeof vazio) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    setSalvando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          nome: form.nome.trim(),
          tipo: form.tipo,
          documento: form.documento.trim() || null,
          telefone: form.telefone.trim() || null,
          email: form.email.trim() || null,
          cidade: form.cidade.trim() || null,
          estado: form.estado.trim() || null,
          endereco_obra: form.endereco_obra.trim() || null,
          etapa: "Cliente",
          ativo: true,
          created_by: userData.user?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Cliente cadastrado.");
      setForm(vazio);
      setOpen(false);
      await onCreated(data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cadastrar cliente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Cadastro rápido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastro rápido de cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={set("tipo")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa física</SelectItem>
                <SelectItem value="PJ">Pessoa jurídica</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="CPF / CNPJ">
            <Input value={form.documento} onChange={(e) => set("documento")(e.target.value)} />
          </Field>
          <Field label="Telefone">
            <Input value={form.telefone} onChange={(e) => set("telefone")(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input value={form.email} onChange={(e) => set("email")(e.target.value)} />
          </Field>
          <Field label="Cidade">
            <Input value={form.cidade} onChange={(e) => set("cidade")(e.target.value)} />
          </Field>
          <Field label="UF">
            <Input
              value={form.estado}
              maxLength={2}
              onChange={(e) => set("estado")(e.target.value.toUpperCase())}
            />
          </Field>
          <Field label="Endereço da obra" className="sm:col-span-2">
            <Input
              value={form.endereco_obra}
              onChange={(e) => set("endereco_obra")(e.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar e selecionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
