import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Handshake,
  Calendar,
  Check,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { brl, dataBR, hojeISO } from "@/lib/erp";
import { proximaDataRecorrencia } from "@/lib/recorrencias";

export type ContaParaRenegociar = {
  id: string;
  tipo: string;
  descricao: string;
  parceiro: string | null;
  categoria: string | null;
  valor: number;
  valor_juros?: number | null;
  valor_pago?: number | null;
  valor_desconto?: number | null;
  vencimento: string;
  status: string;
  observacoes?: string | null;
  numero_documento?: string | null;
  conta_bancaria?: string | null;
  obra_id?: string | null;
  funcionario_id?: string | null;
  cliente_id?: string | null;
  tipo_despesa?: string | null;
};

type ParcelaItem = {
  numero: number;
  vencimento: string;
  valor: number;
};

const OPCOES_CARDS_PARCELAS = [1, 2, 3, 4, 5, 6, 10, 12];

export function RenegociacaoDialog({
  conta,
  aberto,
  onFechar,
}: {
  conta: ContaParaRenegociar | null;
  aberto: boolean;
  onFechar: () => void;
}) {
  const qc = useQueryClient();

  // Saldo em aberto original
  const valorTotalOriginal = conta
    ? Number(conta.valor) + Number(conta.valor_juros ?? 0)
    : 0;
  const jaPago = conta ? Number(conta.valor_pago ?? 0) : 0;
  const saldoEmAberto = Math.max(0, valorTotalOriginal - jaPago);

  // Estados da renegociação
  const [valorTotalNegociado, setValorTotalNegociado] = useState(saldoEmAberto.toFixed(2));
  const [primeiroVencimento, setPrimeiroVencimento] = useState("");
  const [periodicidade, setPeriodicidade] = useState<"mensal" | "quinzenal" | "semanal">("mensal");
  const [qtdParcelasSelecionada, setQtdParcelasSelecionada] = useState<number>(3);
  const [qtdPersonalizada, setQtdPersonalizada] = useState<string>("");
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [observacoesAcordo, setObservacoesAcordo] = useState("");
  const [parcelasEditadas, setParcelasEditadas] = useState<ParcelaItem[]>([]);

  // Inicializa valores ao abrir o modal
  useEffect(() => {
    if (conta && aberto) {
      const saldo = Math.max(0, (Number(conta.valor) + Number(conta.valor_juros ?? 0)) - Number(conta.valor_pago ?? 0));
      setValorTotalNegociado(saldo.toFixed(2));
      
      // Define primeiro vencimento padrão: 30 dias após hoje ou próximo mês
      const hoje = new Date();
      hoje.setDate(hoje.getDate() + 30);
      setPrimeiroVencimento(hoje.toISOString().slice(0, 10));
      
      setPeriodicidade("mensal");
      setQtdParcelasSelecionada(3);
      setModoPersonalizado(false);
      setQtdPersonalizada("");
      setObservacoesAcordo("");
    }
  }, [conta, aberto]);

  const valorTotalNum = Math.max(0, Number(String(valorTotalNegociado).replace(",", ".")) || 0);

  // Gera datas e valores distribuindo centavos
  const calcularParcelas = (total: number, qtd: number, dtInicio: string, period: string): ParcelaItem[] => {
    if (qtd <= 0 || total <= 0 || !dtInicio) return [];
    
    const valorBaseCentavos = Math.floor((total * 100) / qtd);
    const sobraCentavos = Math.round(total * 100) - valorBaseCentavos * qtd;

    const lista: ParcelaItem[] = [];
    let dataAtual = dtInicio;
    const diaOriginal = Number(dtInicio.slice(8, 10)) || 1;

    for (let i = 1; i <= qtd; i++) {
      // Distribui a sobra dos centavos nas primeiras parcelas
      const centavos = valorBaseCentavos + (i <= sobraCentavos ? 1 : 0);
      const valorParcela = Number((centavos / 100).toFixed(2));

      lista.push({
        numero: i,
        vencimento: dataAtual,
        valor: valorParcela,
      });

      // Próxima data
      const prox = proximaDataRecorrencia(dataAtual, period, diaOriginal);
      if (prox) dataAtual = prox;
    }

    return lista;
  };

  // Atualiza as parcelas quando os parâmetros mudam
  useEffect(() => {
    const qtd = modoPersonalizado ? (Number(qtdPersonalizada) || 1) : qtdParcelasSelecionada;
    if (qtd > 0 && valorTotalNum > 0 && primeiroVencimento) {
      const calculadas = calcularParcelas(valorTotalNum, qtd, primeiroVencimento, periodicidade);
      setParcelasEditadas(calculadas);
    }
  }, [valorTotalNum, qtdParcelasSelecionada, modoPersonalizado, qtdPersonalizada, primeiroVencimento, periodicidade]);

  // Simulações para os cards rápidos de parcelamento
  const simulacoesCards = useMemo(() => {
    if (!valorTotalNum || !primeiroVencimento) return [];
    return OPCOES_CARDS_PARCELAS.map((n) => {
      const parcs = calcularParcelas(valorTotalNum, n, primeiroVencimento, periodicidade);
      const valParcela = parcs[0]?.valor ?? (valorTotalNum / n);
      const ultimaData = parcs[parcs.length - 1]?.vencimento ?? primeiroVencimento;
      return {
        numero: n,
        valorParcela: valParcela,
        total: valorTotalNum,
        primeiraData: primeiroVencimento,
        ultimaData,
      };
    });
  }, [valorTotalNum, primeiroVencimento, periodicidade]);

  // Soma atual das parcelas editadas
  const somaParcelasEditadas = parcelasEditadas.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
  const diferencaCentavos = Math.round((valorTotalNum - somaParcelasEditadas) * 100) / 100;
  const valoresConferem = Math.abs(diferencaCentavos) <= 0.009;

  // Mutation de confirmação da renegociação
  const renegociarMutation = useMutation({
    mutationFn: async () => {
      if (!conta) throw new Error("Título não selecionado.");
      if (parcelasEditadas.length === 0) throw new Error("Nenhuma parcela definida para a renegociação.");
      if (!valoresConferem) {
        throw new Error(`A soma das parcelas (${brl(somaParcelasEditadas)}) precisa bater com o total negociado (${brl(valorTotalNum)}).`);
      }

      const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
      const dataHojeStr = new Date().toLocaleDateString("pt-BR");
      const totalParcelas = parcelasEditadas.length;

      // 1. Atualiza a conta original com status "renegociado"
      const obsOriginalAtualizada = `[Renegociado em ${dataHojeStr} — Acordo de ${brl(valorTotalNum)} em ${totalParcelas}x]. ${observacoesAcordo.trim() ? `Detalhes: ${observacoesAcordo.trim()}. ` : ""}${conta.observacoes || ""}`.trim();

      const { error: errOrig } = await supabase
        .from("contas")
        .update({
          status: "renegociado",
          observacoes: obsOriginalAtualizada,
        })
        .eq("id", conta.id);

      if (errOrig) throw errOrig;

      // 2. Insere as novas parcelas no Contas a Pagar / Receber
      const novasContas = parcelasEditadas.map((p, idx) => {
        const numDocBase = conta.numero_documento ? conta.numero_documento.trim() : `RNG-${conta.id.slice(0, 6)}`;
        return {
          tipo: conta.tipo,
          descricao: `${conta.descricao} (Renegociação ${idx + 1}/${totalParcelas})`,
          parceiro: conta.parceiro,
          categoria: conta.categoria,
          valor: p.valor,
          valor_juros: 0,
          vencimento: p.vencimento,
          status: "aberto",
          observacoes: `Parcela ${idx + 1} de ${totalParcelas} referente à renegociação do título #${conta.id.slice(0, 8)} (${conta.descricao}). ${observacoesAcordo.trim()}`,
          obra_id: conta.obra_id,
          funcionario_id: conta.funcionario_id,
          cliente_id: conta.cliente_id,
          numero_documento: `${numDocBase}-RNG-${idx + 1}/${totalParcelas}`,
          conta_bancaria: conta.conta_bancaria,
          tipo_despesa: conta.tipo_despesa,
          recorrencia: "nenhuma",
          created_by: uid,
        };
      });

      const { error: errInsert } = await supabase.from("contas").insert(novasContas);
      if (errInsert) throw errInsert;

      return totalParcelas;
    },
    onSuccess: (total) => {
      toast.success(
        `Renegociação confirmada! ${total} nova(s) parcela(s) lançada(s) no Contas a ${conta?.tipo === "pagar" ? "Pagar" : "Receber"}.`,
      );
      qc.invalidateQueries({ queryKey: ["contas"] });
      qc.invalidateQueries({ queryKey: ["saldos-bancarios"] });
      onFechar();
    },
    onError: (e: Error) => toast.error(`Erro ao renegociar: ${e.message}`),
  });

  const ajustarDiferencaNaUltima = () => {
    if (parcelasEditadas.length === 0 || valoresConferem) return;
    setParcelasEditadas((prev) => {
      const copia = [...prev];
      const ultimaIdx = copia.length - 1;
      const novoValorUltima = Number((copia[ultimaIdx].valor + diferencaCentavos).toFixed(2));
      if (novoValorUltima > 0) {
        copia[ultimaIdx] = { ...copia[ultimaIdx], valor: novoValorUltima };
      }
      return copia;
    });
  };

  if (!conta) return null;

  const ehPagar = conta.tipo === "pagar";

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Handshake className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                Renegociação de Título {ehPagar ? "a Pagar" : "a Receber"}
              </DialogTitle>
              <DialogDescription>
                Repactue valores, escolha o parcelamento nos cards e gere os novos títulos automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Card de Resumo da Conta Original */}
        <div className="rounded-lg border bg-muted/40 p-3.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
            <div>
              <span className="font-semibold">{conta.descricao}</span>
              {conta.parceiro && (
                <span className="ml-2 text-xs text-muted-foreground">· {conta.parceiro}</span>
              )}
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
              Vencimento original: {dataBR(conta.vencimento)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            <div>
              <span className="text-xs text-muted-foreground">Valor original:</span>
              <p className="font-medium">{brl(valorTotalOriginal)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Já pago anteriormente:</span>
              <p className="font-medium text-emerald-600">{brl(jaPago)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Saldo atual em aberto:</span>
              <p className="font-semibold text-destructive">{brl(saldoEmAberto)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Categoria:</span>
              <p className="truncate font-medium">{conta.categoria || "Geral"}</p>
            </div>
          </div>
        </div>

        {/* Parâmetros da Renegociação */}
        <div className="space-y-4 pt-1">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Calculator className="size-4 text-primary" />
            Parâmetros do Novo Acordo
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Novo Valor Total Negociado (R$)">
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={valorTotalNegociado}
                onChange={(e) => setValorTotalNegociado(e.target.value)}
                className="font-semibold"
                placeholder="0,00"
              />
            </Field>

            <Field label="1º Vencimento do Acordo">
              <Input
                type="date"
                value={primeiroVencimento}
                onChange={(e) => setPrimeiroVencimento(e.target.value)}
                required
              />
            </Field>

            <Field label="Periodicidade">
              <Select
                value={periodicidade}
                onValueChange={(v) => setPeriodicidade(v as "mensal" | "quinzenal" | "semanal")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal (a cada 30 dias)</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal (a cada 15 dias)</SelectItem>
                  <SelectItem value="semanal">Semanal (a cada 7 dias)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Observações / Motivo da Renegociação (opcional)">
            <Input
              value={observacoesAcordo}
              onChange={(e) => setObservacoesAcordo(e.target.value)}
              placeholder="Ex.: Acordo amigável direto com o fornecedor / cliente com desconto concedido"
            />
          </Field>
        </div>

        {/* CARDS DE PARCELAMENTO */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="size-4 text-primary" />
              Cards de Opções de Parcelamento
            </h3>
            <span className="text-xs text-muted-foreground">
              Selecione o plano desejado para gerar os títulos
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {simulacoesCards.map((card) => {
              const selecionado = !modoPersonalizado && qtdParcelasSelecionada === card.numero;
              return (
                <button
                  key={card.numero}
                  type="button"
                  onClick={() => {
                    setModoPersonalizado(false);
                    setQtdParcelasSelecionada(card.numero);
                  }}
                  className={`relative flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all ${
                    selecionado
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "bg-card hover:border-primary/50 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Badge variant={selecionado ? "default" : "secondary"} className="text-xs">
                      {card.numero === 1 ? "1x À vista" : `${card.numero}x`}
                    </Badge>
                    {selecionado && <Check className="size-4 text-primary" />}
                  </div>
                  <div className="mt-2 w-full">
                    <span className="text-base font-bold tabular-nums">
                      {brl(card.valorParcela)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {card.numero === 1 ? "Total renegociado" : `de ${brl(card.valorParcela)} / parcela`}
                    </span>
                  </div>
                  <div className="mt-2 border-t pt-1 text-[10px] text-muted-foreground w-full">
                    {card.numero === 1
                      ? `Venc.: ${dataBR(card.primeiraData)}`
                      : `${dataBR(card.primeiraData)} até ${dataBR(card.ultimaData)}`}
                  </div>
                </button>
              );
            })}

            {/* Card Personalizado */}
            <button
              type="button"
              onClick={() => {
                setModoPersonalizado(true);
                if (!qtdPersonalizada) setQtdPersonalizada("8");
              }}
              className={`relative flex flex-col items-start justify-between rounded-lg border p-3 text-left transition-all ${
                modoPersonalizado
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "bg-card hover:border-primary/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <Badge variant={modoPersonalizado ? "default" : "outline"} className="text-xs">
                  Personalizado
                </Badge>
                {modoPersonalizado && <Check className="size-4 text-primary" />}
              </div>
              <div className="mt-2 w-full">
                {modoPersonalizado ? (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      min="1"
                      max="72"
                      value={qtdPersonalizada}
                      onChange={(e) => setQtdPersonalizada(e.target.value)}
                      className="h-7 w-16 text-center text-xs font-semibold"
                      placeholder="Qtd"
                      autoFocus
                    />
                    <span className="text-xs font-medium">parcelas</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Digite a quantidade (ex.: 8x, 18x, 24x)</span>
                )}
              </div>
              <div className="mt-2 border-t pt-1 text-[10px] text-muted-foreground w-full">
                Defina livremente
              </div>
            </button>
          </div>
        </div>

        {/* Tabela de Detalhamento das Parcelas Geradas */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Detalhamento das Parcelas ({parcelasEditadas.length}x)
            </h4>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold tabular-nums ${
                  valoresConferem ? "text-emerald-600" : "text-destructive"
                }`}
              >
                Soma das parcelas: {brl(somaParcelasEditadas)} de {brl(valorTotalNum)}
              </span>
              {!valoresConferem && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs text-destructive hover:bg-destructive/10"
                  onClick={ajustarDiferencaNaUltima}
                >
                  Ajustar diferença na última
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto rounded-md border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/80 text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 pl-3 text-left font-medium">Parcela</th>
                  <th className="py-2 text-left font-medium">Vencimento</th>
                  <th className="py-2 pr-3 text-right font-medium">Valor da Parcela</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parcelasEditadas.map((p, idx) => (
                  <tr key={p.numero} className="hover:bg-muted/30">
                    <td className="py-1.5 pl-3 font-semibold">
                      {p.numero}/{parcelasEditadas.length}
                    </td>
                    <td className="py-1.5">
                      <Input
                        type="date"
                        value={p.vencimento}
                        onChange={(e) => {
                          const novaData = e.target.value;
                          setParcelasEditadas((prev) =>
                            prev.map((it, j) => (j === idx ? { ...it, vencimento: novaData } : it)),
                          );
                        }}
                        className="h-7 w-36 text-xs"
                      />
                    </td>
                    <td className="py-1.5 pr-3 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={p.valor}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setParcelasEditadas((prev) =>
                            prev.map((it, j) => (j === idx ? { ...it, valor: val } : it)),
                          );
                        }}
                        className="ml-auto h-7 w-28 text-right text-xs font-medium tabular-nums"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={
              renegociarMutation.isPending ||
              !valoresConferem ||
              valorTotalNum <= 0 ||
              parcelasEditadas.length === 0
            }
            onClick={() => renegociarMutation.mutate()}
            className="gap-2 bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
          >
            {renegociarMutation.isPending ? (
              "Lançando renegociação…"
            ) : (
              <>
                Confirmar Renegociação e Lançar ({parcelasEditadas.length}x)
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
