import { AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { brl, dataBR } from "@/lib/erp";

export type ItemLancamentoComparacao = {
  id?: string;
  tipo?: string; // "pagar", "receber", "despesa", "receita"
  descricao: string;
  valor: number;
  data: string; // Vencimento ou data_competencia (YYYY-MM-DD)
  parceiro?: string | null;
  categoria?: string | null;
  conta_bancaria?: string | null;
  status?: string | null;
};

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const ehEntradaFluxo = (tipo?: string | null) =>
  ["receber", "receita", "entrada"].includes((tipo || "").toLowerCase());

/**
 * Função inteligente de detecção de duplicidades.
 * Retorna os itens existentes que coincidem por valor, data e/ou descrição/parceiro.
 */
export function encontrarDuplicidades(
  tentado: {
    id?: string | null;
    tipo: string;
    descricao: string;
    valor: number;
    data: string;
    parceiro?: string | null;
  },
  existentes: Array<{
    id: string;
    tipo?: string;
    tipo_fluxo?: string;
    descricao: string;
    valor: number;
    vencimento?: string | null;
    data_competencia?: string | null;
    parceiro?: string | null;
    categoria?: string | null;
    status?: string | null;
    conta_bancaria?: string | null;
  }>,
): ItemLancamentoComparacao[] {
  const vTentado = Number(tentado.valor) || 0;
  const dTentado = (tentado.data || "").slice(0, 10);
  const descTentada = norm(tentado.descricao);
  const parcTentado = norm(tentado.parceiro || "");
  const ehEntrada = ehEntradaFluxo(tentado.tipo);

  if (vTentado <= 0 || !dTentado) return [];

  const duplicados: ItemLancamentoComparacao[] = [];

  for (const item of existentes) {
    if (tentado.id && item.id === tentado.id) continue;

    const ehEntradaExistente = ehEntradaFluxo(item.tipo ?? item.tipo_fluxo ?? "");
    if (ehEntrada !== ehEntradaExistente) continue;

    const vExistente = Number(item.valor) || 0;
    const dExistente = (item.vencimento || item.data_competencia || "").slice(0, 10);
    const descExistente = norm(item.descricao);
    const parcExistente = norm(item.parceiro || "");

    const mesmoValor = Math.abs(vExistente - vTentado) < 0.01;
    const mesmaData = Boolean(dExistente && dTentado && dExistente === dTentado);
    const mesmaDesc = Boolean(descExistente && descTentada && descExistente === descTentada);
    const mesmoParceiro = Boolean(parcTentado && parcExistente && parcTentado === parcExistente);

    // Critérios de duplicidade:
    // 1) Mesmo valor E mesma data
    // 2) Mesmo valor E (mesma descrição OU mesmo parceiro)
    // 3) Mesma descrição E mesma data
    const ehDuplicado =
      (mesmoValor && mesmaData) ||
      (mesmoValor && (mesmaDesc || mesmoParceiro)) ||
      (mesmaDesc && mesmaData);

    if (ehDuplicado) {
      duplicados.push({
        id: item.id,
        tipo: item.tipo ?? item.tipo_fluxo ?? tentado.tipo,
        descricao: item.descricao,
        valor: vExistente,
        data: dExistente,
        parceiro: item.parceiro,
        categoria: item.categoria,
        conta_bancaria: item.conta_bancaria,
        status: item.status,
      });
    }
  }

  return duplicados;
}

export type AlertaDuplicidadeDialogProps = {
  aberto: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
  tentado: ItemLancamentoComparacao | null;
  duplicados: ItemLancamentoComparacao[];
  titulo?: string;
  subtitulo?: string;
};

export function AlertaDuplicidadeDialog({
  aberto,
  onCancelar,
  onConfirmar,
  tentado,
  duplicados,
  titulo = "Possível lançamento em duplicidade detectado",
  subtitulo,
}: AlertaDuplicidadeDialogProps) {
  if (!tentado) return null;

  const ehEntrada = ehEntradaFluxo(tentado.tipo);
  const totalEncontrados = duplicados.length;

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                {titulo}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {subtitulo ||
                  `Identificamos ${totalEncontrados} lançamento(s) já existente(s) com valor, data ou descrição idêntica.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card do que o usuário está tentando incluir */}
          <div className="rounded-lg border border-amber-500/40 bg-amber-50/50 p-3.5 dark:bg-amber-950/20">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                O que você está tentando lançar agora
              </span>
              <Badge
                variant="outline"
                className={
                  ehEntrada
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }
              >
                {ehEntrada ? (
                  <>
                    <ArrowDownLeft className="mr-1 size-3" /> Entrada / A receber
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-1 size-3" /> Saída / A pagar
                  </>
                )}
              </Badge>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground">Descrição:</span>
                <p className="font-medium text-foreground">{tentado.descricao || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Valor:</span>
                <p className="text-base font-bold tabular-nums text-foreground">
                  {brl(tentado.valor)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Vencimento / Data:</span>
                <p className="font-medium text-foreground">
                  {tentado.data ? dataBR(tentado.data) : "—"}
                </p>
              </div>
              {tentado.parceiro && (
                <div>
                  <span className="text-xs text-muted-foreground">Fornecedor / Cliente:</span>
                  <p className="font-medium text-foreground">{tentado.parceiro}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista dos títulos já cadastrados no sistema */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lançamento(s) já encontrado(s) no sistema ({totalEncontrados})
              </h4>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicados.map((item, idx) => (
                    <TableRow key={item.id ?? `dup-${idx}`}>
                      <TableCell className="font-medium">{item.descricao}</TableCell>
                      <TableCell>{item.parceiro || "—"}</TableCell>
                      <TableCell>{item.data ? dataBR(item.data) : "—"}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {brl(item.valor)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.status || "Cadastrado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <p className="rounded-md bg-muted/60 p-2.5 text-center text-xs text-muted-foreground">
            Você deseja <strong>incluir este lançamento mesmo assim</strong> ou prefere{" "}
            <strong>não incluir</strong> para revisar os dados?
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onCancelar}>
            Não incluir (Revisar dados)
          </Button>
          <Button
            type="button"
            className="bg-amber-600 font-medium text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            onClick={onConfirmar}
          >
            Sim, incluir lançamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Banner dinâmico para renderizar dentro do formulário enquanto o usuário digita.
 */
export function BannerAvisoDuplicidade({
  duplicados,
  onVerDuplicados,
}: {
  duplicados: ItemLancamentoComparacao[];
  onVerDuplicados?: () => void;
}) {
  if (!duplicados || duplicados.length === 0) return null;

  const primeiro = duplicados[0];

  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-900 dark:text-amber-200">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Atenção:</strong> Já existe {duplicados.length}{" "}
          {duplicados.length === 1 ? "título similar" : "títulos similares"} com este valor/data (
          <em>{primeiro.descricao}</em> · {brl(primeiro.valor)}).
        </span>
      </div>
      {onVerDuplicados && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-6 border-amber-500/40 px-2 text-[11px] text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
          onClick={onVerDuplicados}
        >
          Conferir
        </Button>
      )}
    </div>
  );
}
