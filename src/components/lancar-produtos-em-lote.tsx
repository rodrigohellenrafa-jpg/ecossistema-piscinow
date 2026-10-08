import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, Wrench, Package } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { brl, CATEGORIAS_PRODUTO } from "@/lib/erp";

const SEM_FORNECEDOR = "__nenhum__";

export interface LinhaProdutoLote {
  id: string;
  tipo: "servico" | "produto";
  nome: string;
  categoria: string;
  unidade: string;
  preco_custo: string;
  preco_venda: string;
  fornecedor_id: string;
  estoque_minimo: string;
  sob_encomenda: boolean;
  descricao: string;
}

const criarLinha = (tipoPadrao: "servico" | "produto" = "servico"): LinhaProdutoLote => ({
  id: crypto.randomUUID(),
  tipo: tipoPadrao,
  nome: "",
  categoria: tipoPadrao === "servico" ? "Serviços" : "Piscinas",
  unidade: tipoPadrao === "servico" ? "SV" : "UN",
  preco_custo: "0",
  preco_venda: "0",
  fornecedor_id: SEM_FORNECEDOR,
  estoque_minimo: "0",
  sob_encomenda: tipoPadrao === "produto",
  descricao: "",
});

export function LancarProdutosEmLote() {
  const [open, setOpen] = useState(false);
  const [linhas, setLinhas] = useState<LinhaProdutoLote[]>([]);
  const qc = useQueryClient();

  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const alterar = <K extends keyof LinhaProdutoLote>(
    id: string,
    campo: K,
    valor: LinhaProdutoLote[K],
  ) => {
    setLinhas((atuais) =>
      atuais.map((r) => {
        if (r.id !== id) return r;
        const atualizado = { ...r, [campo]: valor };
        // Ao alternar tipo, ajusta defaults sugeridos se ainda não modificados
        if (campo === "tipo") {
          if (valor === "servico") {
            atualizado.categoria = "Serviços";
            atualizado.unidade = "SV";
            atualizado.sob_encomenda = false;
          } else {
            if (r.categoria === "Serviços") atualizado.categoria = "Piscinas";
            atualizado.unidade = "UN";
            atualizado.sob_encomenda = true;
          }
        }
        return atualizado;
      }),
    );
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!linhas.length) throw new Error("Adicione pelo menos um item para cadastrar.");

      for (const [idx, l] of linhas.entries()) {
        if (!l.nome.trim()) {
          throw new Error(`Linha ${idx + 1}: informe o nome do ${l.tipo === "servico" ? "serviço" : "produto"}.`);
        }
        const precoVenda = Number(l.preco_venda);
        if (!Number.isFinite(precoVenda) || precoVenda < 0) {
          throw new Error(`Linha ${idx + 1}: preço de venda inválido.`);
        }
      }

      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData.user) {
        throw new Error("Faça login novamente para salvar o lote.");
      }
      const uid = userData.user.id;

      const payload = linhas.map((l) => ({
        tipo: l.tipo,
        nome: l.nome.trim(),
        categoria: l.categoria.trim() || (l.tipo === "servico" ? "Serviços" : null),
        unidade: l.unidade.trim().toUpperCase() || (l.tipo === "servico" ? "SV" : "UN"),
        preco_custo: Number(l.preco_custo) || 0,
        preco_venda: Number(l.preco_venda) || 0,
        fornecedor_id: l.fornecedor_id === SEM_FORNECEDOR ? null : l.fornecedor_id,
        estoque_atual: 0,
        estoque_minimo: l.tipo === "produto" ? Number(l.estoque_minimo) || 0 : 0,
        sob_encomenda: l.tipo === "produto" ? l.sob_encomenda : false,
        descricao: l.descricao.trim() || null,
        ativo: true,
        created_by: uid,
      }));

      const { error } = await supabase.from("produtos").insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${linhas.length} itens cadastrados com sucesso!`);
      setLinhas([]);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Erro ao salvar lançamento em lote.");
    },
  });

  const adicionarLinha = (tipo: "servico" | "produto") => {
    setLinhas((r) => [...r, criarLinha(tipo)]);
  };

  const totalVenda = linhas.reduce((s, l) => s + (Number(l.preco_venda) || 0), 0);
  const totalCusto = linhas.reduce((s, l) => s + (Number(l.preco_custo) || 0), 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (salvar.isPending) return;
        setOpen(v);
        if (v && !linhas.length) {
          // Inicia com 2 linhas de exemplo (serviço e produto)
          setLinhas([criarLinha("servico"), criarLinha("servico")]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Layers className="size-4" /> Lançamento em lote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Lançamento em Lote de Produtos e Serviços
          </DialogTitle>
          <DialogDescription>
            Cadastre rapidamente múltiplos serviços, manutenções, mão de obra ou produtos com seus
            detalhes pertinentes em uma única operação.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Adicionar rápido:
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => adicionarLinha("servico")}
            className="gap-1.5"
          >
            <Wrench className="size-3.5 text-blue-500" /> + Serviço
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => adicionarLinha("produto")}
            className="gap-1.5"
          >
            <Package className="size-3.5 text-emerald-500" /> + Produto
          </Button>
        </div>

        <fieldset disabled={salvar.isPending} className="space-y-4">
          {linhas.map((l, i) => (
            <div
              key={l.id}
              className="relative rounded-lg border bg-card p-4 shadow-sm space-y-3 transition-colors hover:border-border/80"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {l.tipo === "servico" ? "Serviço / Mão de Obra" : "Produto / Material"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-destructive"
                  aria-label={`Remover linha ${i + 1}`}
                  onClick={() => setLinhas((r) => r.filter((x) => x.id !== l.id))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-2">
                  <Field label="Tipo">
                    <Select
                      value={l.tipo}
                      onValueChange={(v: "servico" | "produto") => alterar(l.id, "tipo", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="servico">Serviço</SelectItem>
                        <SelectItem value="produto">Produto</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="sm:col-span-6">
                  <Field label="Nome / Título do Item *">
                    <Input
                      placeholder={
                        l.tipo === "servico"
                          ? "Ex: Instalação de Piscina, Troca de Areia, Visita Técnica"
                          : "Ex: Registro de Esfera 50mm, Cloro Granulado 10kg"
                      }
                      value={l.nome}
                      onChange={(e) => alterar(l.id, "nome", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-4">
                  <Field label="Categoria">
                    <Select
                      value={l.categoria}
                      onValueChange={(v) => alterar(l.id, "categoria", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-12">
                <div className="sm:col-span-2">
                  <Field label="Unidade">
                    <Input
                      placeholder="UN, SV, HR, M2"
                      value={l.unidade}
                      onChange={(e) => alterar(l.id, "unidade", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-3">
                  <Field label="Preço de Custo (R$)">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={l.preco_custo}
                      onChange={(e) => alterar(l.id, "preco_custo", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-3">
                  <Field label="Preço de Venda (R$) *">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={l.preco_venda}
                      onChange={(e) => alterar(l.id, "preco_venda", e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-4">
                  <Field label="Fornecedor / Parceiro">
                    <Select
                      value={l.fornecedor_id}
                      onValueChange={(v) => alterar(l.id, "fornecedor_id", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEM_FORNECEDOR}>Sem fornecedor</SelectItem>
                        {fornecedores.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>

              <div>
                <Field label="Detalhes pertinentes / Escopo / Observações">
                  <Input
                    placeholder="Descreva detalhes específicos do serviço, mão de obra inclusa, prazos, especificações ou garantias."
                    value={l.descricao}
                    onChange={(e) => alterar(l.id, "descricao", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          ))}

          {linhas.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Nenhum item na lista. Clique abaixo para adicionar um serviço ou produto.
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => adicionarLinha("servico")}
              className="gap-2"
            >
              <Plus className="size-4" /> Adicionar Serviço
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => adicionarLinha("produto")}
              className="gap-2"
            >
              <Plus className="size-4" /> Adicionar Produto
            </Button>
          </div>
        </fieldset>

        <DialogFooter className="items-center justify-between border-t pt-4 sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>
              Itens: <strong className="text-foreground">{linhas.length}</strong>
            </span>
            <span>
              Total Venda: <strong className="text-foreground">{brl(totalVenda)}</strong>
            </span>
            {totalCusto > 0 && (
              <span>
                Total Custo: <strong className="text-foreground">{brl(totalCusto)}</strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={salvar.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={salvar.isPending || !linhas.length}
              onClick={() => salvar.mutate()}
            >
              {salvar.isPending ? "Salvando lote…" : `Salvar lote (${linhas.length} itens)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
