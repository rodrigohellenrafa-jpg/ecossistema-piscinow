import { useCallback, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import Papa from "papaparse";
import { CheckCircle2, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  type EntidadeImport,
} from "@/lib/import-config";

export const Route = createFileRoute("/importacao")({
  head: () => ({
    meta: [
      { title: "Importação de Dados | Piscinow ERP" },
      {
        name: "description",
        content:
          "Importe usuários, clientes, produtos, vendas e financeiro da planilha antiga por arquivos CSV.",
      },
      { property: "og:title", content: "Importação de Dados | Piscinow ERP" },
      {
        property: "og:description",
        content: "Migre o histórico da planilha para o ERP Piscinow em poucos cliques.",
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
          Exporte cada aba da planilha em <strong>.csv</strong> e solte o arquivo na aba
          correspondente. Valores em R$ e datas DD/MM/AAAA são convertidos automaticamente.
        </p>
      </div>

      <Tabs defaultValue={ENTIDADES[0]!.id}>
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

function PainelImport({ entidade }: { entidade: EntidadeImport }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<string | null>(null);
  const [cabecalhos, setCabecalhos] = useState<string[]>([]);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progresso, setProgresso] = useState<number | null>(null);
  const [importados, setImportados] = useState(0);
  const [loteAtual, setLoteAtual] = useState(0);
  const [totalLotes, setTotalLotes] = useState(0);
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

  const mapa = useMemo(() => {
    return entidade.campos.map((campo) => ({
      campo,
      origem: acharCabecalho(campo, cabecalhos),
    }));
  }, [entidade, cabecalhos]);

  const semObrigatorio = mapa.find((m) => m.campo.obrigatorio && !m.origem);

  const limpar = () => {
    setArquivo(null);
    setCabecalhos([]);
    setLinhas([]);
    setProgresso(null);
    setImportados(0);
    setLoteAtual(0);
    setTotalLotes(0);
    setLogs([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const carregar = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Envie um arquivo .csv");
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
          setCabecalhos((res.meta.fields ?? []).map((f) => f.trim()));
          setLinhas(dados);
          setImportados(0);
          setProgresso(null);
          setLoteAtual(0);
          setTotalLotes(0);
          setLogs([]);
          log("info", `Arquivo "${file.name}" lido: ${dados.length} linhas válidas.`);
          if (brutas.length > dados.length) {
            log("aviso", `${brutas.length - dados.length} linha(s) em branco ignorada(s).`);
          }
          if (res.errors?.length) {
            log("aviso", `${res.errors.length} aviso(s) de leitura do CSV.`);
          }
          toast.success(`${dados.length} linhas lidas de ${file.name}`);
        },
        error: () => toast.error("Não consegui ler esse CSV."),
      });
    },
    [log],
  );

  async function processar() {
    if (semObrigatorio) {
      toast.error(`Falta a coluna obrigatória: ${semObrigatorio.campo.rotulo}`);
      log("erro", `Coluna obrigatória ausente: ${semObrigatorio.campo.rotulo}.`);
      return;
    }
    const usuario = (await supabase.auth.getUser()).data.user?.id ?? null;

    const naoMapeadas = mapa.filter((m) => !m.origem).map((m) => m.campo.rotulo);
    if (naoMapeadas.length) {
      log("aviso", `Campos sem coluna no CSV (ficarão vazios): ${naoMapeadas.join(", ")}.`);
    }

    const registros = linhas.map((linha) => {
      const reg: Record<string, unknown> = { created_by: usuario };
      for (const { campo, origem } of mapa) {
        if (!origem) continue;
        const valor = converter(campo.tipo, linha[origem]);
        if (valor !== null) reg[campo.coluna] = valor;
      }
      return reg;
    });

    const lote = 500;
    const total = Math.ceil(registros.length / lote);

    setProgresso(0);
    setImportados(0);
    setLoteAtual(0);
    setTotalLotes(total);
    log(
      "info",
      `Iniciando importação de ${registros.length} registros em ${total} lote(s) de até ${lote}.`,
    );

    let ok = 0;

    for (let i = 0; i < registros.length; i += lote) {
      const bloco = registros.slice(i, i + lote);
      const indice = Math.floor(i / lote) + 1;
      setLoteAtual(indice);
      log("info", `Lote ${indice}/${total}: enviando ${bloco.length} registros…`);

      const { error } = await supabase
        .from(entidade.tabela as never)
        .insert(bloco as never);

      if (error) {
        setProgresso(null);
        log(
          "erro",
          `Lote ${indice}/${total} falhou a partir da linha ${i + 2} do arquivo: ${error.message}`,
        );
        toast.error(
          `Erro a partir da linha ${i + 2} do arquivo (${bloco.length} registros): ${error.message}`,
        );
        if (ok > 0) {
          log("aviso", `${ok} registros haviam sido importados antes do erro.`);
          toast.message(`${ok} registros foram importados antes do erro.`);
        }
        setImportados(ok);
        return;
      }

      ok += bloco.length;
      setImportados(ok);
      setProgresso(Math.round((ok / registros.length) * 100));
      log("ok", `Lote ${indice}/${total} concluído — ${ok}/${registros.length} registros.`);
    }

    log("ok", `Importação finalizada: ${ok} registros em ${entidade.titulo}.`);
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
            if (file) carregar(file);
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
          <p className="text-sm font-medium">Arraste o arquivo .csv aqui</p>
          <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) carregar(file);
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

        {arquivo && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Colunas reconhecidas</p>
            <div className="flex flex-wrap gap-1.5">
              {mapa.map(({ campo, origem }) => (
                <Badge
                  key={campo.coluna}
                  variant={origem ? "default" : "outline"}
                  className={!origem && campo.obrigatorio ? "border-destructive text-destructive" : ""}
                >
                  {campo.rotulo}
                  {origem ? ` ← ${origem}` : " · não encontrada"}
                </Badge>
              ))}
            </div>
            {semObrigatorio && (
              <p className="text-xs text-destructive">
                A coluna obrigatória “{semObrigatorio.campo.rotulo}” não foi encontrada no CSV.
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
                          {String(converter(campo.tipo, linha[origem!]) ?? "—")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {progresso !== null && (
          <div className="space-y-1">
            <Progress value={progresso} />
            <p className="text-xs text-muted-foreground">
              {importados} de {linhas.length} registros enviados
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={processar}
            disabled={!arquivo || !!semObrigatorio || progresso !== null && progresso < 100}
          >
            {progresso !== null && progresso < 100 ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 />
            )}
            Processar importação
          </Button>
          {progresso === 100 && (
            <span className="text-sm text-muted-foreground">Importação concluída.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
