import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Printer, Wallet } from "lucide-react";
import { toast } from "sonner";


import { Field } from "@/components/field";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMestre } from "@/hooks/use-mestre";
import { validarSenhaMestra } from "@/lib/mestre.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, mesSeguinte, provisaoFolha, quintoDiaUtil } from "@/lib/erp";
import logoSplash from "@/assets/logo-splash.png.asset.json";

export const Route = createFileRoute("/holerite")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Holerite e Comissões | Piscinow ERP" },
      {
        name: "description",
        content: "Cálculo de holerite mensal com comissões por categoria de produto e descontos.",
      },
      { property: "og:title", content: "Holerite e Comissões | Piscinow ERP" },
      {
        property: "og:description",
        content: "Salário base, comissões, benefícios e descontos por funcionário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Holerite />
    </RequireAuth>
  ),
});

function mesAtualISO() {
  return new Date().toISOString().slice(0, 7);
}

const mesBR = (mesISO: string) => `${mesISO.slice(5, 7)}/${mesISO.slice(0, 4)}`;

function Holerite() {
  const qc = useQueryClient();
  const [mes, setMes] = useState(mesAtualISO());
  const [funcionarioId, setFuncionarioId] = useState("todos");


  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios-holerite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcionarios")
        .select(
          "id, nome, cargo, salario_base, vt, vr, inss_perc, irrf_perc, sindicato, bonificacao, comissao_piscinas, comissao_acessorios, comissao_quimicos, ativo",
        )
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-holerite", mes],
    queryFn: async () => {
      const inicio = `${mes}-01`;
      const [ano, m] = mes.split("-").map(Number);
      const fim = new Date(ano, m, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, data, cliente_nome, vendedor_id, valor_total")
        .gte("data", inicio)
        .lte("data", fim);
      if (error) throw error;
      return data;
    },
  });

  const { data: itens = [] } = useQuery({
    queryKey: ["itens-holerite", vendas.map((v) => v.id).join(",")],
    enabled: vendas.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("id, venda_id, produto_id, descricao, quantidade, total, custo_unitario, produtos(categoria)")
        .in(
          "venda_id",
          vendas.map((v) => v.id),
        );
      if (error) throw error;
      return data as Array<{
        id: string;
        venda_id: string;
        descricao: string;
        total: number;
        produtos: { categoria: string | null } | null;
      }>;
    },
  });

  const holeritesTodos = useMemo(() => {
    return funcionarios.map((f) => {
      const vendasFunc = vendas.filter((v) => v.vendedor_id === f.id);
      const linhasVenda = vendasFunc.map((v) => {
        const itensVenda = itens.filter((i) => i.venda_id === v.id);
        let comissaoVenda = 0;
        for (const item of itensVenda) {
          const categoria = item.produtos?.categoria ?? "";
          const valorItem = Number(item.total);
          if (categoria === "Piscinas") comissaoVenda += valorItem * (Number(f.comissao_piscinas) / 100);
          else if (categoria === "Químicos") comissaoVenda += valorItem * (Number(f.comissao_quimicos) / 100);
          else comissaoVenda += valorItem * (Number(f.comissao_acessorios) / 100);
        }
        return { venda: v, comissao: comissaoVenda };
      });
      const comissaoTotal = linhasVenda.reduce((s, l) => s + l.comissao, 0);

      const salarioBase = Number(f.salario_base);
      const bonificacao = Number(f.bonificacao);
      const vt = Number(f.vt);
      const vr = Number(f.vr);
      const inss = salarioBase * (Number(f.inss_perc) / 100);
      const irrf = salarioBase * (Number(f.irrf_perc) / 100);
      const sindicato = Number(f.sindicato);

      const bruto = salarioBase + comissaoTotal + bonificacao;
      const descontos = vt + vr + inss + irrf + sindicato;
      const liquido = bruto - descontos;

      return {
        funcionario: f,
        linhasVenda,
        comissaoTotal,
        salarioBase,
        bonificacao,
        vt,
        vr,
        inss,
        irrf,
        sindicato,
        bruto,
        descontos,
        liquido,
      };
    });
  }, [funcionarios, vendas, itens]);

  const holerites = holeritesTodos.filter(
    (h) => funcionarioId === "todos" || h.funcionario.id === funcionarioId,
  );

  // Folha entra no Contas a Pagar 7 dias antes do 5º dia útil do mês seguinte.
  const mesPagamento = mesSeguinte(mes);
  const vencimentoFolha = quintoDiaUtil(mesPagamento);
  const dataProvisao = provisaoFolha(mesPagamento);
  const marcador = (id: string) => `folha:${mes}:${id}`;

  const { data: folhaLancada = [] } = useQuery({
    queryKey: ["folha-contas", mes],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("id, observacoes")
        .eq("categoria", "Folha de pagamento")
        .like("observacoes", `folha:${mes}:%`);
      if (error) throw error;
      return data as { id: string; observacoes: string | null }[];
    },
  });

  const pendentes = holeritesTodos.filter(
    (h) =>
      h.funcionario.ativo &&
      h.liquido > 0 &&
      !folhaLancada.some((c) => c.observacoes === marcador(h.funcionario.id)),
  );

  const lancarFolha = useMutation({
    mutationFn: async () => {
      if (pendentes.length === 0) throw new Error("Folha deste mês já está lançada.");
      const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
      const { error } = await supabase.from("contas").insert(
        pendentes.map((h) => ({
          tipo: "pagar",
          descricao: `Folha ${mesBR(mes)} — ${h.funcionario.nome}`,
          parceiro: h.funcionario.nome,
          categoria: "Folha de pagamento",
          valor: Number(h.liquido.toFixed(2)),
          valor_juros: 0,
          vencimento: vencimentoFolha,
          status: "aberto",
          observacoes: marcador(h.funcionario.id),
          created_by: userId,
        })),
      );
      if (error) throw error;
      return pendentes.length;
    },
    onSuccess: (qtd) => {
      toast.success(`${qtd} título(s) de folha lançados em Contas a Pagar.`);
      qc.invalidateQueries({ queryKey: ["folha-contas", mes] });
      qc.invalidateQueries({ queryKey: ["contas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const autoRef = useRef<string>("");
  useEffect(() => {
    if (autoRef.current === mes) return;
    if (hojeISO() < dataProvisao) return;
    if (pendentes.length === 0) return;
    autoRef.current = mes;
    lancarFolha.mutate();
  }, [mes, dataProvisao, pendentes.length]);


  return (
    <div className="space-y-6">
      <div className="hidden print:flex print:items-center print:gap-3">
        <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="h-20 w-auto" />
        <div>
          <p className="text-lg font-semibold">Splash Jardim do Trevo</p>
          <p className="text-sm text-muted-foreground">Holerite e Comissões</p>
        </div>
      </div>
      <PageHeader
        title="Holerite e Comissões"
        subtitle="Cálculo mensal de salário, comissões por categoria e descontos."
        actions={
          <Button className="print:hidden" variant="outline" onClick={() => window.print()}>
            <Printer /> Imprimir
          </Button>
        }
      />

      <Card className="print:hidden">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="text-sm">
            <p className="font-medium">Folha {mesBR(mes)} no Contas a Pagar</p>
            <p className="text-muted-foreground">
              Vencimento no 5º dia útil ({dataBR(vencimentoFolha)}) — lançamento automático a partir de{" "}
              {dataBR(dataProvisao)}.
            </p>
            <p className="text-muted-foreground">
              {pendentes.length === 0
                ? "Todos os títulos desta folha já foram lançados."
                : `${pendentes.length} funcionário(s) ainda sem título lançado.`}
            </p>
          </div>
          <Button
            onClick={() => lancarFolha.mutate()}
            disabled={pendentes.length === 0 || lancarFolha.isPending}
          >
            <Wallet /> Lançar folha agora
          </Button>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2">
          <Field label="Mês de referência">
            <input
              type="month"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </Field>
          <Field label="Funcionário">
            <Select value={funcionarioId} onValueChange={setFuncionarioId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {funcionarios.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {holerites.map((h) => (
          <Card key={h.funcionario.id} className="break-inside-avoid print:break-before-page">
            <CardHeader>
              <div className="hidden print:flex items-center gap-4"><img src={logoSplash.url} alt="Splash Jardim do Trevo" className="h-20 w-auto" /><div><p className="font-semibold">Splash Jardim do Trevo</p><p>Recibo de pagamento — {mesBR(mes)}</p></div></div>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>
                  {h.funcionario.nome} — {h.funcionario.cargo}
                </CardTitle>
                <EditarValores funcionario={h.funcionario} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Proventos</p>
                  <Row label="Salário base" valor={h.salarioBase} />
                  <Row label="Comissões" valor={h.comissaoTotal} />
                  <Row label="Bonificação" valor={h.bonificacao} />
                  <Row label="Bruto" valor={h.bruto} destaque />
                </div>
                <div className="space-y-1 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">Descontos</p>
                  <Row label="Vale transporte" valor={-h.vt} />
                  <Row label="Vale refeição" valor={-h.vr} />
                  <Row label="INSS" valor={-h.inss} />
                  <Row label="IRRF" valor={-h.irrf} />
                  <Row label="Sindicato" valor={-h.sindicato} />
                  <Row label="Total de descontos" valor={-h.descontos} destaque />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
                <span className="font-semibold">Total líquido</span>
                <span className="text-lg font-semibold tabular-nums">{brl(h.liquido)}</span>
              </div>

              <div className="hidden print:flex justify-between gap-8 pt-12"><span className="border-t pt-2">Assinatura do funcionário</span><span className="border-t pt-2">Data: ____/____/________</span></div>
              {h.linhasVenda.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Vendas consideradas no mês</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Comissão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {h.linhasVenda.map(({ venda, comissao }) => (
                        <TableRow key={venda.id}>
                          <TableCell>{venda.numero ?? venda.id.slice(0, 8)}</TableCell>
                          <TableCell>{dataBR(venda.data)}</TableCell>
                          <TableCell>{venda.cliente_nome ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">{brl(venda.valor_total)}</TableCell>
                          <TableCell className="text-right tabular-nums">{brl(comissao)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {holerites.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum funcionário encontrado.</p>
        )}
      </div>
    </div>
  );
}

function Row({ label, valor, destaque }: { label: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={destaque ? "font-medium" : "text-muted-foreground"}>{label}</span>
      <span className={`tabular-nums ${destaque ? "font-semibold" : ""}`}>{brl(valor)}</span>
    </div>
  );
}

/** E-mail do dono: edita os valores sem pedir senha mestra. */
const DONO_EMAIL = "rodrigohellenrafa@gmail.com";

type FuncionarioHolerite = {
  id: string;
  nome: string;
  salario_base: number;
  vt: number;
  vr: number;
  inss_perc: number;
  irrf_perc: number;
  sindicato: number;
  bonificacao: number;
  comissao_piscinas: number;
  comissao_acessorios: number;
  comissao_quimicos: number;
};

const CAMPOS: { chave: keyof FuncionarioHolerite; label: string }[] = [
  { chave: "salario_base", label: "Salário base (R$)" },
  { chave: "bonificacao", label: "Bonificação (R$)" },
  { chave: "vt", label: "Vale transporte (R$)" },
  { chave: "vr", label: "Vale refeição (R$)" },
  { chave: "inss_perc", label: "INSS (%)" },
  { chave: "irrf_perc", label: "IRRF (%)" },
  { chave: "sindicato", label: "Sindicato (R$)" },
  { chave: "comissao_piscinas", label: "Comissão piscinas (%)" },
  { chave: "comissao_acessorios", label: "Comissão acessórios (%)" },
  { chave: "comissao_quimicos", label: "Comissão químicos (%)" },
];

function EditarValores({ funcionario }: { funcionario: FuncionarioHolerite }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { mestre, ativar } = useMestre();
  const validar = useServerFn(validarSenhaMestra);

  const dono = (user?.email ?? "").toLowerCase() === DONO_EMAIL;
  const liberado = dono || mestre;

  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState("");
  const [conferindo, setConferindo] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const inicial: Record<string, string> = {};
    for (const c of CAMPOS) inicial[c.chave] = String(Number(funcionario[c.chave] ?? 0));
    setValores(inicial);
    setSenha("");
  }, [open, funcionario]);

  async function conferirSenha() {
    setConferindo(true);
    try {
      const r = await validar({ data: { senha } });
      if (r.ok) {
        ativar();
        toast.success("Edição liberada neste aparelho.");
      } else if (r.motivo === "nao_configurada") {
        toast.error("A senha mestra ainda não foi cadastrada.");
      } else {
        toast.error("Senha mestra incorreta.");
      }
    } catch {
      toast.error("Não foi possível conferir a senha agora.");
    } finally {
      setConferindo(false);
    }
  }

  const salvar = useMutation({
    mutationFn: async () => {
      const num = (c: (typeof CAMPOS)[number]) => {
        const n = Number(String(valores[c.chave] ?? "").replace(",", "."));
        if (!Number.isFinite(n) || n < 0) throw new Error(`Valor inválido em ${c.label}.`);
        return n;
      };
      const patch = Object.fromEntries(CAMPOS.map((c) => [c.chave, num(c)])) as {
        salario_base: number;
      };
      const { error } = await supabase.from("funcionarios").update(patch).eq("id", funcionario.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Valores atualizados.");
      qc.invalidateQueries({ queryKey: ["funcionarios-holerite"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="print:hidden"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" /> Editar valores
      </Button>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar valores — {funcionario.nome}</DialogTitle>
          <DialogDescription>
            {liberado
              ? "Altere salário, benefícios, descontos e percentuais de comissão."
              : "Digite a senha mestra para liberar a edição dos valores."}
          </DialogDescription>
        </DialogHeader>

        {liberado ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAMPOS.map((c) => (
                <Field key={c.chave} label={c.label}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valores[c.chave] ?? ""}
                    onChange={(e) =>
                      setValores((v) => ({ ...v, [c.chave]: e.target.value }))
                    }
                  />
                </Field>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
                Salvar valores
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <Input
              type="password"
              autoComplete="off"
              placeholder="Senha mestra"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void conferirSenha();
              }}
            />
            <DialogFooter>
              <Button onClick={() => void conferirSenha()} disabled={conferindo || !senha}>
                Liberar edição
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
