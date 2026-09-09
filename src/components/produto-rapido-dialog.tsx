import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIAS_PRODUTO } from "@/lib/erp";

interface Props {
  onCreated: (produtoId: string) => void | Promise<void>;
}

const vazio = {
  nome: "",
  codigo: "",
  categoria: "",
  tipo: "produto",
  unidade: "UN",
  preco_custo: "0",
  preco_venda: "0",
  estoque_atual: "0",
};

export function ProdutoRapidoDialog({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sobEncomenda, setSobEncomenda] = useState(false);
  const [form, setForm] = useState(vazio);

  const set = (campo: keyof typeof vazio) => (valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  async function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do item.");
      return;
    }
    setSalvando(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("produtos")
        .insert({
          nome: form.nome.trim(),
          codigo: form.codigo.trim() || null,
          categoria: form.categoria || null,
          tipo: form.tipo,
          unidade: form.unidade || "UN",
          preco_custo: Number(form.preco_custo) || 0,
          preco_venda: Number(form.preco_venda) || 0,
          estoque_atual: sobEncomenda ? 0 : Number(form.estoque_atual) || 0,
          sob_encomenda: sobEncomenda,
          ativo: true,
          created_by: userData.user?.id ?? null,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Item cadastrado.");
      setForm(vazio);
      setSobEncomenda(false);
      setOpen(false);
      await onCreated(data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cadastrar item.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PackagePlus className="mr-2 h-4 w-4" />
          Cadastro rápido de produto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cadastro rápido de produto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
          </Field>
          <Field label="Código / SKU">
            <Input value={form.codigo} onChange={(e) => set("codigo")(e.target.value)} />
          </Field>
          <Field label="Categoria">
            <Select value={form.categoria || undefined} onValueChange={set("categoria")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={set("tipo")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="produto">Produto</SelectItem>
                <SelectItem value="servico">Serviço</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Unidade">
            <Input value={form.unidade} onChange={(e) => set("unidade")(e.target.value)} />
          </Field>
          <Field label="Preço de custo (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.preco_custo}
              onChange={(e) => set("preco_custo")(e.target.value)}
            />
          </Field>
          <Field label="Preço de venda (R$)">
            <Input
              type="number"
              step="0.01"
              value={form.preco_venda}
              onChange={(e) => set("preco_venda")(e.target.value)}
            />
          </Field>
          {form.tipo === "produto" && !sobEncomenda && (
            <Field label="Estoque atual">
              <Input
                type="number"
                step="0.001"
                value={form.estoque_atual}
                onChange={(e) => set("estoque_atual")(e.target.value)}
              />
            </Field>
          )}
          <div className="flex items-start gap-2 rounded-md border border-border p-3 sm:col-span-2">
            <Checkbox
              id="produto-rapido-sob-encomenda"
              checked={sobEncomenda}
              onCheckedChange={(v) => setSobEncomenda(v === true)}
            />
            <div className="space-y-0.5">
              <Label htmlFor="produto-rapido-sob-encomenda">Vendido sob encomenda</Label>
              <p className="text-xs text-muted-foreground">
                O item não fica em estoque: a venda é concluída normalmente e a compra é pedida ao
                fornecedor.
              </p>
            </div>
          </div>
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
