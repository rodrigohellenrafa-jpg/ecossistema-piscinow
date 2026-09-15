import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, num } from "@/lib/erp";

type Linha = {
  data_movimento: string;
  descricao: string;
  documento: string | null;
  valor: number;
  tipo: string;
};

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Procura a primeira coluna cujo nome bate com um dos apelidos. */
function achar(reg: Record<string, unknown>, apelidos: string[]) {
  for (const chave of Object.keys(reg)) {
    const k = semAcento(chave);
    if (apelidos.some((a) => k === a || k.includes(a))) return reg[chave];
  }
  return undefined;
}

/** Converte 15/09/2026, 2026-09-15 ou serial de planilha em ISO. */
function paraISO(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number" && v > 20000 && v < 60000) {
    const d = new Date(Date.UTC(1899, 11, 30) + v * 86_400_000);
    return d.toISOString().slice(0, 10);
  }
  const s = String(v ?? "").trim();
  if (!s) return null;
  const br = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  return null;
}

function normalizar(registros: Record<string, unknown>[]): Linha[] {
  const linhas: Linha[] = [];
  for (const reg of registros) {
    const data = paraISO(achar(reg, ["data", "dt"]));
    const descricao = String(
      achar(reg, ["descricao", "historico", "lancamento", "memo"]) ?? "",
    ).trim();
    const bruto = achar(reg, ["valor", "montante", "amount"]);
    const credito = achar(reg, ["credito", "entrada"]);
    const debito = achar(reg, ["debito", "saida"]);
    let valor = num(bruto);
    if (!valor && (credito !== undefined || debito !== undefined)) {
      valor = num(credito) - num(debito);
    }
    if (!data || !descricao || !valor) continue;
    linhas.push({
      data_movimento: data,
      descricao,
      documento: String(achar(reg, ["documento", "doc", "identificador"]) ?? "").trim() || null,
      valor: Math.abs(valor),
      tipo: valor >= 0 ? "entrada" : "saida",
    });
  }
  return linhas;
}

/** Importa o extrato bancário de uma planilha CSV/XLSX exportada do banco. */
export function ExtratoImportar({
  contaInicial,
  trigger,
}: {
  contaInicial?: string;
  trigger?: React.ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [conta, setConta] = useState(contaInicial ?? "");
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [arquivo, setArquivo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: contas = [] } = useQuery({
    queryKey: ["saldos-bancarios", "opcoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saldos_bancarios")
        .select("id, conta, banco")
        .order("conta");
      if (error) throw error;
      return data as { id: string; conta: string; banco: string | null }[];
    },
  });

  const ler = async (file: File) => {
    setArquivo(file.name);
    try {
      let registros: Record<string, unknown>[] = [];
      if (/\.csv$/i.test(file.name)) {
        const texto = await file.text();
        const r = Papa.parse<Record<string, unknown>>(texto, {
          header: true,
          skipEmptyLines: true,
        });
        registros = r.data;
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]!]!;
        registros = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      }
      const normalizadas = normalizar(registros);
      setLinhas(normalizadas);
      if (normalizadas.length === 0) {
        toast.error("Não encontrei colunas de data, descrição e valor na planilha.");
      }
    } catch {
      toast.error("Não consegui ler esse arquivo. Use CSV ou XLSX.");
    }
  };

  const importar = useMutation({
    mutationFn: async () => {
      if (!conta) throw new Error("Escolha a conta bancária.");
      if (linhas.length === 0) throw new Error("Nenhuma linha válida para importar.");
      const banco = contas.find((c) => c.conta === conta)?.banco ?? null;
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("extratos_bancarios").upsert(
        linhas.map((l) => ({
          ...l,
          conta,
          banco,
          origem: "importado",
          created_by: auth.user?.id ?? null,
        })),
        { onConflict: "conta,data_movimento,valor,descricao", ignoreDuplicates: true },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extratos-bancarios"] });
      toast.success(`${linhas.length} movimentos importados.`);
      setLinhas([]);
      setArquivo("");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Upload /> Importar extrato
          </Button>
        )}
      </span>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar extrato da conta</DialogTitle>
          <DialogDescription>
            Exporte o extrato do banco em CSV ou Excel e envie aqui. O sistema reconhece as colunas
            de data, descrição e valor sozinho e ignora linhas repetidas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Conta bancária</Label>
            <Select value={conta} onValueChange={setConta}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a conta" />
              </SelectTrigger>
              <SelectContent>
                {contas.map((c) => (
                  <SelectItem key={c.id} value={c.conta}>
                    {c.conta}
                    {c.banco ? ` · ${c.banco}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contas.length === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Cadastre primeiro uma conta no quadro de saldos.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-dashed p-4 text-center">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void ler(f);
              }}
            />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload /> Escolher arquivo
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              {arquivo ? `${arquivo} · ${linhas.length} movimentos reconhecidos` : "CSV, XLSX ou XLS"}
            </p>
          </div>

          {linhas.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-lg border">
              <table className="w-full text-sm">
                <tbody>
                  {linhas.slice(0, 50).map((l, i) => (
                    <tr key={`${l.data_movimento}-${i}`} className="border-b last:border-0">
                      <td className="px-2 py-1 whitespace-nowrap">{dataBR(l.data_movimento)}</td>
                      <td className="px-2 py-1">{l.descricao}</td>
                      <td
                        className={`px-2 py-1 text-right tabular-nums ${
                          l.tipo === "entrada" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {l.tipo === "entrada" ? "+" : "−"}
                        {brl(l.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => importar.mutate()}
            disabled={importar.isPending || linhas.length === 0 || !conta}
          >
            Importar {linhas.length > 0 ? `${linhas.length} movimentos` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
