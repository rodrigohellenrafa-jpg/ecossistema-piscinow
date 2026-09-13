import { useCallback, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  ENTIDADES,
  acharCabecalho,
  converter,
  normalizarFinanceiro,
  type EntidadeImport,
} from "@/lib/import-config";

export const Route = createFileRoute("/importacao")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Importação de Dados | Piscinow ERP" },
      {
        name: "description",
        content:
          "Importe usuários, clientes, produtos, vendas e financeiro da planilha antiga por arquivos CSV ou Excel, com mapeamento de colunas e validação.",
      },
      { property: "og:title", content: "Importação de Dados | Piscinow ERP" },
      {
        property: "og:description",
        content: "Migre o histórico da planilha para o ERP Piscinow com validação registro a registro.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Importacao />
    </RequireAuth>
  ),
});

function Importacao() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importação de Dados</h1>
        <p className="text-sm text-muted-foreground">
          Solte o arquivo <strong>.csv</strong> ou <strong>.xlsx</strong> na aba correspondente.
          Confira o mapeamento das colunas, rode a validação e só então confirme a importação.
          Valores em R$ e datas DD/MM/AAAA são convertidos automaticamente.
        </p>
      </div>

      <Tabs defaultValue={ENTIDADES[0]?.id ?? "financeiro"}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {ENTIDADES.map((e) => (
            <TabsTrigger key={e.id} value={e.id} className="text-xs sm:text-sm">
              {e.titulo}
            </TabsTrigger>
          ))}
        </TabsList>
        {ENTIDADES.map((e) => (
          <TabsContent key={e.id} value={e.id} className="pt-4">
            <PainelImport entidade={e} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

type Linha = Record<string, string>;
type Problema = { linha: number; campo: string; tipo: "erro" | "aviso"; texto: string };
const IGNORAR = "__ignorar__";

function PainelImport({ entidade }: { entidade: EntidadeImport }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [abas, setAbas] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<string | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [cabecalhos, setCabecalhos] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [mapaManual, setMapaManual] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState(false);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const enviados = useRef(new Set<number>());
  const [importados, setImportados] = useState(0);
  const [loteAtual, setLoteAtual] = useState(0);
  const [totalLotes, setTotalLotes] = useState(0);
  const [validando, setValidando] = useState(false);
  const [problemas, setProblemas] = useState<Problema[] | null>(null);
  const [logs, setLogs] = useState<
    { hora: string; tipo: "info" | "ok" | "aviso" | "erro"; texto: string }[]
  >([]);

  const log = useCallback(
    (tipo: "info" | "ok" | "aviso" | "erro", texto: string) =>
      setLogs((prev) => [
        ...prev,
        { hora: new Date().toLocaleTimeString("pt-BR"), tipo, texto },
      ]),
    [],
  );

  const mapa = useMemo(
    () =>
      entidade.campos.map((campo) => {
        const manual = mapaManual[campo.coluna];
        const origem =
          manual === IGNORAR
            ? null
            : (manual ?? acharCabecalho(campo, cabecalhos) ?? null);
        return { campo, origem: origem && cabecalhos.includes(origem) ? origem : null };
      }),
    [entidade, cabecalhos, mapaManual],
  );

  const semObrigatorio = mapa.find((m) => m.campo.obrigatorio && !m.origem);
  const erros = (problemas ?? []).filter((p) => p.tipo === "erro");
  const avisos = (problemas ?? []).filter((p) => p.tipo === "aviso");
  const linhasComErro = new Set(erros.map((e) => e.linha));

  const limpar = () => {
    setArquivo(null);
    setAbas([]);
    setAbaAtiva(null);
    setWorkbook(null);
    setCabecalhos([]);
    setLinhas([]);
    setMapaManual({});
    setProgresso(null);
    setImportados(0);
    setLoteAtual(0);
    setTotalLotes(0);
    setProblemas(null);
    setLogs([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const aplicarDados = useCallback(
    (nome: string, campos: string[], dados: Linha[], brutas: number) => {
      enviados.current.clear();
      setCabecalhos(campos.map((f) => f.trim()));
      setLinhas(dados);
      setMapaManual({});
      setImportados(0);
      setProgresso(null);
      setLoteAtual(0);
      setTotalLotes(0);
      setProblemas(null);
      log("info", `"${nome}" lido: ${dados.length} linhas preenchidas.`);
      if (brutas > dados.length) {
        log("aviso", `${brutas - dados.length} linha(s) em branco ignorada(s).`);
      }
      toast.success(`${dados.length} linhas lidas`);
    },
    [log],
  );

  const carregarAba = useCallback(
    (wb: XLSX.WorkBook, nomeAba: string) => {
      const sheet = wb.Sheets[nomeAba];
      if (!sheet) return;
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });
      const dados = json
        .map((l) =>
          Object.fromEntries(
            Object.entries(l).map(([k, v]) => [k.trim(), String(v ?? "").trim()]),
          ),
        )
        .filter((l) => Object.values(l).some((v) => v !== ""));
      const campos = Object.keys(json[0] ?? {});
      setAbaAtiva(nomeAba);
      if (dados.length === 0) {
        setCabecalhos([]);
        setLinhas([]);
        toast.error(`A aba "${nomeAba}" não tem linhas preenchidas.`);
        return;
      }
      aplicarDados(nomeAba, campos, dados as Linha[], json.length);
    },
    [aplicarDados],
  );

  const carregar = useCallback(
    async (file: File) => {
      const nome = file.name.toLowerCase();
      setLogs([]);
      if (nome.endsWith(".xlsx") || nome.endsWith(".xls")) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array", cellDates: false });
        setArquivo(file.name);
        setWorkbook(wb);
        setAbas(wb.SheetNames);
        const preferida =
          wb.SheetNames.find((s) =>
            s.toLowerCase().includes(entidade.id.slice(0, 5).toLowerCase()),
          ) ?? wb.SheetNames[0];
        if (preferida) carregarAba(wb, preferida);
        return;
      }
      if (!nome.endsWith(".csv")) {
        toast.error("Envie um arquivo .csv, .xlsx ou .xls");
        return;
      }
      Papa.parse<Linha>(file, {
        header: true,
        skipEmptyLines: "greedy",
        transformHeader: (h) => h.trim(),
        complete: (res) => {
          const brutas = res.data ?? [];
          const dados = brutas.filter((l) =>
            Object.values(l).some((v) => String(v ?? "").trim() !== ""),
          );
          if (dados.length === 0) {
            toast.error("O arquivo não tem linhas preenchidas.");
            return;
          }
          setArquivo(file.name);
          setWorkbook(null);
          setAbas([]);
          setAbaAtiva(null);
          aplicarDados(file.name, res.meta.fields ?? [], dados, brutas.length);
          if (res.errors?.length) log("aviso", `${res.errors.length} aviso(s) de leitura do CSV.`);
        },
        error: () => toast.error("Não consegui ler esse arquivo."),
      });
    },
    [aplicarDados, carregarAba, entidade.id, log],
  );

  /** Monta os registros já convertidos, na ordem das linhas do arquivo. */
  const montarRegistros = useCallback(
    (usuario: string | null) =>
      linhas.map((linha) => {
        const reg: Record<string, unknown> = { created_by: usuario };
        for (const { campo, origem } of mapa) {
          if (!origem) continue;
          const valor = converter(campo.tipo, linha[origem]);
          if (valor !== null) reg[campo.coluna] = valor;
        }
        return normalizarFinanceiro(entidade.tabela, reg);
      }),
    [linhas, mapa, entidade.tabela],
  );

  async function validar() {
    setValidando(true);
    const achados: Problema[] = [];
    const chave = entidade.chave;
    const vistos = new Map<string, number>();

    linhas.forEach((linha, i) => {
      const numeroLinha = i + 2;
      for (const { campo, origem } of mapa) {
        const bruto = origem ? String(linha[origem] ?? "").trim() : "";
        const valor = origem ? converter(campo.tipo, linha[origem]) : null;
        if (campo.obrigatorio && (valor === null || valor === "")) {
          achados.push({
            linha: numeroLinha,
            campo: campo.rotulo,
            tipo: "erro",
            texto: "campo obrigatório vazio",
          });
        }
        if (bruto !== "" && valor === null && campo.tipo !== "texto") {
          achados.push({
            linha: numeroLinha,
            campo: campo.rotulo,
            tipo: "erro",
            texto: `valor "${bruto}" não é um(a) ${campo.tipo} válido(a)`,
          });
        }
      }
      if (chave) {
        const origemChave = mapa.find((m) => m.campo.coluna === chave)?.origem;
        const v = origemChave ? String(linha[origemChave] ?? "").trim().toLowerCase() : "";
        if (v) {
          const anterior = vistos.get(v);
          if (anterior) {
            achados.push({
              linha: numeroLinha,
              campo: chave,
              tipo: "aviso",
              texto: `duplicado no arquivo (igual à linha ${anterior}): "${v}"`,
            });
          } else vistos.set(v, numeroLinha);
        }
      }
    });

    if (["contas", "lancamentos_financeiros"].includes(entidade.tabela)) {
      montarRegistros(null).forEach((reg, i) => {
        const erro = (campo: string, texto: string) => achados.push({ linha: i + 2, campo, tipo: "erro", texto });
        const contas = entidade.tabela === "contas";
        if (!(Number(reg.valor) > 0)) erro("Valor", "Informe um valor maior que zero.");
        if (reg.valor_juros !== undefined && Number(reg.valor_juros) < 0) erro("Juros", "Juros não podem ser negativos.");
        if (!(contas ? ["pagar", "receber"] : ["receita", "despesa"]).includes(String(reg[contas ? "tipo" : "tipo_fluxo"]))) erro("Tipo", contas ? "Use pagar ou receber." : "Use receita ou despesa.");
        if (!(contas ? ["aberto", "pago"] : ["Pendente", "Pago"]).includes(String(reg.status))) erro("Status", "Use pendente ou pago.");
        if (["pago", "Pago"].includes(String(reg.status)) && !reg.data_pagamento) erro("Data de pagamento", "Obrigatória para registros pagos.");
      });
    }

    // Duplicidade contra o que já existe no banco
    if (chave && vistos.size > 0) {
      const valores = [...vistos.keys()];
      const existentes = new Set<string>();
      for (let i = 0; i < valores.length; i += 200) {
        const fatia = valores.slice(i, i + 200);
        const { data, error } = await supabase
          .from(entidade.tabela as never)
          .select(chave)
          .in(chave, fatia as never);
        if (error) {
          log("aviso", `Não consegui checar duplicidade no banco: ${error.message}`);
          break;
        }
        for (const r of (data ?? []) as Record<string, unknown>[]) {
          const v = String(r[chave] ?? "").trim().toLowerCase();
          if (v) existentes.add(v);
        }
      }
      for (const [v, linha] of vistos) {
        if (existentes.has(v)) {
          achados.push({
            linha,
            campo: chave,
            tipo: "aviso",
            texto: `já existe no ERP: "${v}"`,
          });
        }
      }
    }

    const naoMapeadas = mapa.filter((m) => !m.origem).map((m) => m.campo.rotulo);
    if (naoMapeadas.length) {
      log("aviso", `Campos sem coluna (ficarão vazios): ${naoMapeadas.join(", ")}.`);
    }

    setProblemas(achados);
    setValidando(false);
    const qtdErros = achados.filter((a) => a.tipo === "erro").length;
    const qtdAvisos = achados.length - qtdErros;
    log(
      qtdErros ? "erro" : "ok",
      `Validação concluída: ${qtdErros} erro(s) e ${qtdAvisos} aviso(s) em ${linhas.length} linhas.`,
    );
    if (qtdErros) toast.error(`${qtdErros} linha(s) com erro. Corrija ou pule essas linhas.`);
    else toast.success("Validação sem erros. Pode confirmar a importação.");
  }

  async function processar(pularErros: boolean) {
    if (ocupado || !problemas || (!pularErros && erros.length > 0)) return;
    if (semObrigatorio) {
      toast.error(`Falta mapear a coluna obrigatória: ${semObrigatorio.campo.rotulo}`);
      return;
    }
    const usuario = (await supabase.auth.getUser()).data.user?.id;
    if (!usuario) { toast.error("Entre novamente para importar."); return; }
    const todos = montarRegistros(usuario);
    const indices = todos.map((_, i) => i).filter(i => !enviados.current.has(i) && (!pularErros || !linhasComErro.has(i + 2)));
    const registros = indices.map(i => todos[i]);

    if (registros.length === 0) {
      toast.error("Nenhum registro válido para importar.");
      return;
    }
    if (pularErros && registros.length < todos.length) {
      log("aviso", `${todos.length - registros.length} linha(s) com erro foram puladas.`);
    }

    const lote = 500;
    const total = Math.ceil(registros.length / lote);

    setOcupado(true);
    setProgresso(0);
    setImportados(0);
    setLoteAtual(0);
    setTotalLotes(total);
    log("info", `Importando ${registros.length} registros em ${total} lote(s) de até ${lote}.`);

    let ok = 0;
    for (let i = 0; i < registros.length; i += lote) {
      const bloco = registros.slice(i, i + lote);
      const indice = Math.floor(i / lote) + 1;
      setLoteAtual(indice);
      log("info", `Lote ${indice}/${total}: enviando ${bloco.length} registros…`);

      const { error } = await supabase.from(entidade.tabela as never).insert(bloco as never);

      if (error) {
        setOcupado(false);
        setProgresso(null);
        log("erro", `Lote ${indice}/${total} falhou: ${error.message}`);
        toast.error(`Erro no lote ${indice}: ${error.message}`);
        if (ok > 0) log("aviso", `${ok} registros haviam sido importados antes do erro.`);
        setImportados(ok);
        return;
      }

      indices.slice(i, i + lote).forEach(index => enviados.current.add(index));
      ok += bloco.length;
      setImportados(ok);
      setProgresso(Math.round((ok / registros.length) * 100));
      log("ok", `Lote ${indice}/${total} concluído — ${ok}/${registros.length} registros.`);
    }

    const { count } = await supabase
      .from(entidade.tabela as never)
      .select("id", { count: "exact", head: true });
    log("ok", `Importação finalizada: ${ok} registros. Total agora no ERP: ${count ?? "?"}.`);
    setOcupado(false);
    toast.success(`${ok} registros importados em ${entidade.titulo}.`);
  }

  const previa = linhas.slice(0, 5);
  const colunasPrevia = mapa.filter((m) => m.origem);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{entidade.titulo}</CardTitle>
        <CardDescription>{entidade.descricao}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button variant="outline" disabled={ocupado} onClick={() => {
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([entidade.campos.map(c => c.coluna)]);
          ws["!cols"] = entidade.campos.map(() => ({ wch: 24 }));
          XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");
          XLSX.writeFile(wb, `modelo-${entidade.id}.xlsx`);
        }}><FileSpreadsheet /> Baixar modelo de planilha</Button>
        <fieldset disabled={ocupado} className="space-y-5 min-w-0">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void carregar(file);
          }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Arraste o arquivo .csv ou .xlsx aqui</p>
          <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void carregar(file);
            }}
          />
        </div>

        {arquivo && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
            <FileSpreadsheet className="size-4 text-primary" />
            <span className="text-sm font-medium">{arquivo}</span>
            <Badge variant="secondary">{linhas.length} linhas</Badge>
            <Button size="sm" variant="ghost" className="ml-auto" onClick={limpar}>
              <X className="size-4" /> Remover
            </Button>
          </div>
        )}

        {abas.length > 1 && workbook && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Aba da planilha</p>
            <Select value={abaAtiva ?? ""} onValueChange={(v) => carregarAba(workbook, v)}>
              <SelectTrigger className="sm:w-80">
                <SelectValue placeholder="Selecione a aba" />
              </SelectTrigger>
              <SelectContent>
                {abas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {cabecalhos.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Mapeamento de colunas</p>
            <p className="text-xs text-muted-foreground">
              O sistema tenta reconhecer sozinho. Ajuste qualquer campo que ficou errado.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {mapa.map(({ campo, origem }) => (
                <div key={campo.coluna} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 text-sm">
                    {campo.rotulo}
                    {campo.obrigatorio && <span className="text-destructive"> *</span>}
                  </span>
                  <Select
                    value={origem ?? IGNORAR}
                    onValueChange={(v) => {
                      setMapaManual((m) => ({ ...m, [campo.coluna]: v }));
                      setProblemas(null);
                    }}
                  >
                    <SelectTrigger
                      className={
                        !origem && campo.obrigatorio ? "border-destructive text-destructive" : ""
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORAR}>— não importar —</SelectItem>
                      {cabecalhos.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {semObrigatorio && (
              <p className="text-xs text-destructive">
                Mapeie a coluna obrigatória “{semObrigatorio.campo.rotulo}” antes de continuar.
              </p>
            )}
          </div>
        )}

        {previa.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Pré-visualização (5 primeiras linhas)</p>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {colunasPrevia.map(({ campo }) => (
                      <TableHead key={campo.coluna} className="whitespace-nowrap">
                        {campo.rotulo}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previa.map((linha, i) => (
                    <TableRow key={i}>
                      {colunasPrevia.map(({ campo, origem }) => (
                        <TableCell key={campo.coluna} className="whitespace-nowrap">
                          {String(converter(campo.tipo, linha[origem ?? ""]) ?? "—")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {problemas && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">Resultado da validação</p>
              <Badge variant={erros.length ? "destructive" : "default"}>
                {erros.length} erro(s)
              </Badge>
              <Badge variant="outline">{avisos.length} aviso(s)</Badge>
              <Badge variant="secondary">
                {linhas.length - linhasComErro.size} linha(s) prontas
              </Badge>
            </div>
            {problemas.length > 0 && (
              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Linha</TableHead>
                      <TableHead className="w-40">Campo</TableHead>
                      <TableHead>Ocorrência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problemas.slice(0, 200).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.linha}</TableCell>
                        <TableCell>{p.campo}</TableCell>
                        <TableCell
                          className={p.tipo === "erro" ? "text-destructive" : "text-amber-500"}
                        >
                          {p.texto}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {problemas.length > 200 && (
              <p className="text-xs text-muted-foreground">
                Mostrando as 200 primeiras ocorrências de {problemas.length}.
              </p>
            )}
          </div>
        )}

        {progresso !== null && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>
                Lote {loteAtual}/{totalLotes}
              </span>
              <span className="text-muted-foreground">{progresso}%</span>
            </div>
            <Progress value={progresso} />
            <p className="text-xs text-muted-foreground">
              {importados} de {linhas.length} registros enviados
            </p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Log da importação</p>
              <Button size="sm" variant="ghost" onClick={() => setLogs([])}>
                Limpar log
              </Button>
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
              {logs.map((l, i) => (
                <p
                  key={i}
                  className={
                    l.tipo === "erro"
                      ? "text-destructive"
                      : l.tipo === "ok"
                        ? "text-primary"
                        : l.tipo === "aviso"
                          ? "text-amber-500"
                          : "text-muted-foreground"
                  }
                >
                  [{l.hora}] {l.texto}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => void validar()}
            disabled={!arquivo || linhas.length === 0 || validando || ocupado}
          >
            {validando ? <Loader2 className="animate-spin" /> : <AlertTriangle />}
            Validar dados
          </Button>
          <Button
            onClick={() => void processar(false)}
            disabled={
              ocupado || progresso === 100 || !problemas ||
              erros.length > 0 ||
              !!semObrigatorio ||
              (progresso !== null && progresso < 100)
            }
          >
            {progresso !== null && progresso < 100 ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 />
            )}
            Confirmar importação
          </Button>
          {erros.length > 0 && (
            <Button variant="secondary" onClick={() => void processar(true)}>
              Importar só as {linhas.length - linhasComErro.size} linhas válidas
            </Button>
          )}
          {progresso === 100 && (
            <span className="text-sm text-muted-foreground">Importação concluída.</span>
          )}
          {!problemas && arquivo && (
            <span className="text-xs text-muted-foreground">
              Rode a validação para liberar a importação.
            </span>
          )}
        </div>
        </fieldset>
      </CardContent>
    </Card>
  );
}
