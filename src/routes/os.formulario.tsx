import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/require-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/os/formulario")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Formulário de OS | Piscinow ERP" },
      {
        name: "description",
        content: "Formulário de Ordem de Serviço otimizado para impressão A4 e PDF.",
      },
      { property: "og:title", content: "Formulário de OS | Piscinow ERP" },
      {
        property: "og:description",
        content: "Formulário de Ordem de Serviço otimizado para impressão A4 e PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <FormularioOS />
    </RequireAuth>
  ),
});

const TOTAL_LINHAS = 20;
const TOTAL_LINHAS_APOIO = 12;

const LINHAS_VAZIAS = Array.from({ length: TOTAL_LINHAS }, () => "");
const LINHAS_APOIO_VAZIAS = Array.from({ length: TOTAL_LINHAS_APOIO }, () => "");
const ITENS_VAZIOS: Array<{ descricao: string; quantidade: number }> = [];

function FormularioOS() {
  const [selecao, setSelecao] = useState<string>("");
  const [cliente, setCliente] = useState("");
  const [profissional, setProfissional] = useState("");
  const [linhas, setLinhas] = useState<string[]>(LINHAS_VAZIAS);
  const [linhasApoio, setLinhasApoio] = useState<string[]>(LINHAS_APOIO_VAZIAS);

  const { data: obras = [] } = useQuery({
    queryKey: ["obras-formulario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id, numero, cliente_nome, responsavel, venda_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Array<{
        id: string;
        numero: string | null;
        cliente_nome: string | null;
        responsavel: string | null;
        venda_id: string | null;
      }>;
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-formulario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_nome, vendedor")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Array<{
        id: string;
        numero: string | null;
        cliente_nome: string | null;
        vendedor: string | null;
      }>;
    },
  });

  const obra = selecao.startsWith("obra:")
    ? obras.find((o) => o.id === selecao.slice(5))
    : undefined;

  const vendaSelecionada = selecao.startsWith("venda:")
    ? vendas.find((v) => v.id === selecao.slice(6))
    : undefined;

  // Obra escolhida usa o pedido vinculado; senão tenta casar pelo cliente.
  const vendaDaObra = obra
    ? (obra.venda_id ??
      vendas.find(
        (v) =>
          (v.cliente_nome ?? "").trim().toLowerCase() ===
          (obra.cliente_nome ?? "").trim().toLowerCase(),
      )?.id ??
      null)
    : null;

  const vendaId = vendaSelecionada?.id ?? vendaDaObra ?? null;

  const { data: itensVenda = ITENS_VAZIOS } = useQuery({
    queryKey: ["formulario-itens", vendaId],
    enabled: Boolean(vendaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("venda_itens")
        .select("descricao, quantidade")
        .eq("venda_id", vendaId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Array<{ descricao: string; quantidade: number }>;
    },
  });

  useEffect(() => {
    if (obra) {
      setCliente(obra.cliente_nome ?? "");
      setProfissional(obra.responsavel ?? "");
    } else if (vendaSelecionada) {
      setCliente(vendaSelecionada.cliente_nome ?? "");
      setProfissional(vendaSelecionada.vendedor ?? "");
    }
  }, [obra, vendaSelecionada]);

  useEffect(() => {
    if (!vendaId) return;
    const preenchidas = itensVenda.map(
      (i) => `${Number(i.quantidade) % 1 === 0 ? Number(i.quantidade) : Number(i.quantidade).toFixed(2)}x ${i.descricao}`,
    );
    setLinhas(
      Array.from({ length: Math.max(TOTAL_LINHAS, preenchidas.length) }, (_, i) => preenchidas[i] ?? ""),
    );
  }, [itensVenda, vendaId]);


  return (
    <div className="space-y-4">
      {/* Controles — ocultos na impressão */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Formulário de OS</h1>
          <p className="text-sm text-muted-foreground">
            Selecione a obra ou o pedido de venda para trazer os itens e imprima o formulário.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selecao} onValueChange={setSelecao}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Selecionar obra / pedido" />
            </SelectTrigger>
            <SelectContent>
              {obras.map((o) => (
                <SelectItem key={o.id} value={`obra:${o.id}`}>
                  Obra {(o.numero ?? "—") + " — " + (o.cliente_nome ?? "sem cliente")}
                </SelectItem>
              ))}
              {vendas.map((v) => (
                <SelectItem key={v.id} value={`venda:${v.id}`}>
                  Pedido {(v.numero ?? "—") + " — " + (v.cliente_nome ?? "sem cliente")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" asChild>
            <Link to="/ordens">
              <ArrowLeft /> Voltar às OS
            </Link>
          </Button>
          <Button onClick={() => window.print()}>
            <Printer /> Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* Área imprimível */}
      <div className="os-form-wrapper mx-auto max-w-4xl bg-white p-4 text-slate-900 shadow-sm print:m-0 print:max-w-none print:shadow-none print:p-0">
        {/* Título geral */}
        <h2 className="mb-4 text-center font-cursive text-4xl text-slate-900">
          Ordem de Serviço
        </h2>

        {/* Caixa principal */}
        <div className="border border-slate-900">
          {/* Linha 1 — Logomarca */}
          <div className="border-b border-slate-900 p-4">
            <div className="flex h-16 w-48 items-center justify-center border border-dashed border-slate-400 bg-slate-50 text-sm text-slate-500">
              LOGOMARCA SPLASH
            </div>
          </div>

          {/* Linha 2 — Cliente / Profissional */}
          <div className="os-campo grid grid-cols-2 border-b border-slate-900">
            <div className="border-r border-slate-900 p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full border-b border-slate-400 bg-transparent py-1 text-sm outline-none"
                placeholder=""
              />
            </div>
            <div className="p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Profissional
              </label>
              <input
                type="text"
                value={profissional}
                onChange={(e) => setProfissional(e.target.value)}
                className="w-full border-b border-slate-400 bg-transparent py-1 text-sm outline-none"
                placeholder=""
              />
            </div>
          </div>

          {/* Linha 3 — Início / Término */}
          <div className="os-campo grid grid-cols-2 border-b border-slate-900">
            <div className="border-r border-slate-900 p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Início
              </label>
              <input
                type="text"
                className="w-full border-b border-slate-400 bg-transparent py-1 text-sm outline-none"
                placeholder=""
              />
            </div>
            <div className="p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Término
              </label>
              <input
                type="text"
                className="w-full border-b border-slate-400 bg-transparent py-1 text-sm outline-none"
                placeholder=""
              />
            </div>
          </div>


          {/* Divisória central */}
          <div className="border-b border-slate-900 bg-slate-100 py-2 text-center text-sm font-bold uppercase tracking-widest text-slate-800">
            Itens Incluídos
          </div>

          {/* Seção inferior — duas colunas */}
          <div className="grid grid-cols-2">
            {/* Coluna esquerda — tabelas de conferência */}
            <div className="border-r border-slate-900 p-3">
              {/* Tabela de itens do pedido */}
              <table className="w-full border-collapse border border-slate-900 text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                      Confere
                    </th>
                    <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                      Loja
                    </th>
                    <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                      Cliente
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((valor, index) => (
                    <tr key={index}>
                      <td className="border border-slate-900 px-1 py-0">
                        <input
                          type="text"
                          value={valor}
                          onChange={(e) =>
                            setLinhas((atual) =>
                              atual.map((v, i) => (i === index ? e.target.value : v)),
                            )
                          }
                          className="h-5 w-full bg-transparent text-[11px] leading-none text-slate-900 outline-none"
                        />
                      </td>
                      <td className="w-12 border border-slate-900 px-1 py-0 text-center">
                        <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                      </td>
                      <td className="w-12 border border-slate-900 px-1 py-0 text-center">
                        <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tabela de itens de apoio / conferência em loja */}
              <div className="mt-4">
                <h3 className="mb-2 border border-slate-900 bg-slate-100 py-1 text-center text-xs font-bold uppercase tracking-wide text-slate-800">
                  Itens de Apoio — Conferência em Loja
                </h3>
                <table className="w-full border-collapse border border-slate-900 text-sm">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                        Item
                      </th>
                      <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                        Loja
                      </th>
                      <th className="border border-slate-900 px-2 py-1 text-center text-xs font-bold uppercase">
                        Cliente
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhasApoio.map((valor, index) => (
                      <tr key={index}>
                        <td className="border border-slate-900 px-1 py-0">
                          <input
                            type="text"
                            value={valor}
                            onChange={(e) =>
                              setLinhasApoio((atual) =>
                                atual.map((v, i) => (i === index ? e.target.value : v)),
                              )
                            }
                            className="h-5 w-full bg-transparent text-[11px] leading-none text-slate-900 outline-none"
                          />
                        </td>
                        <td className="w-12 border border-slate-900 px-1 py-0 text-center">
                          <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                        </td>
                        <td className="w-12 border border-slate-900 px-1 py-0 text-center">
                          <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Coluna direita — Principais Medidas e Nivelamento empilhados */}
            <div className="flex flex-col p-3">
              {/* Principais Medidas — planta baixa */}
              <div className="flex flex-col border-b border-slate-900 p-2">
                <h3 className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Principais Medidas
                </h3>
                <div className="os-campo flex flex-1 items-center justify-center">
                  <svg
                    viewBox="0 0 180 90"
                    className="h-24 w-full"
                    aria-label="Planta baixa da piscina com cotas"
                  >
                    {/* Cota superior — comprimento */}
                    <line x1="35" y1="12" x2="145" y2="12" stroke="#0f172a" strokeWidth="1" />
                    <polygon points="30,12 35,8 35,16" fill="#0f172a" />
                    <polygon points="150,12 145,8 145,16" fill="#0f172a" />

                    {/* Cota esquerda — largura */}
                    <line x1="18" y1="22" x2="18" y2="78" stroke="#0f172a" strokeWidth="1" />
                    <polygon points="18,17 14,22 22,22" fill="#0f172a" />
                    <polygon points="18,83 14,78 22,78" fill="#0f172a" />

                    {/* Retângulo em planta baixa (centro) */}
                    <rect x="35" y="22" width="110" height="56" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />

                    {/* Campos sobre as cotas */}
                    <foreignObject x="70" y="0" width="44" height="12">
                      <input
                        type="text"
                        className="h-full w-full border-b border-slate-400 bg-transparent text-center text-[9px] outline-none"
                        placeholder="compr. (m)"
                      />
                    </foreignObject>
                    <foreignObject x="26" y="78" width="52" height="12">
                      <input
                        type="text"
                        className="h-full w-full border-b border-slate-400 bg-transparent text-center text-[9px] outline-none"
                        placeholder="larg. (m)"
                      />
                    </foreignObject>
                    <foreignObject x="60" y="44" width="60" height="14">
                      <input
                        type="text"
                        className="h-full w-full border-b border-slate-400 bg-transparent text-center text-[9px] outline-none"
                        placeholder="obs. medida"
                      />
                    </foreignObject>
                  </svg>
                </div>
              </div>

              {/* Nivelamento — corte transversal */}
              <div className="flex flex-col p-2">
                <h3 className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Nivelamento
                </h3>
                <div className="flex flex-1 items-center justify-center">
                  <svg
                    viewBox="0 0 180 90"
                    className="h-24 w-full"
                    aria-label="Corte transversal da piscina com referência de nível"
                  >
                    {/* Terreno */}
                    <line x1="5" y1="35" x2="175" y2="35" stroke="#0f172a" strokeWidth="1" />

                    {/* Cubo retangular (corte transversal da piscina) */}
                    <rect x="35" y="35" width="110" height="38" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
                    {/* Perspectiva do cubo */}
                    <polyline points="35,35 50,22 160,22 145,35" fill="none" stroke="#0f172a" strokeWidth="1.2" />
                    <line x1="160" y1="22" x2="160" y2="60" stroke="#0f172a" strokeWidth="1.2" />
                    <line x1="145" y1="73" x2="160" y2="60" stroke="#0f172a" strokeWidth="1.2" />

                    {/* Símbolo de nível com traço maior para a referência */}
                    <line x1="30" y1="44" x2="150" y2="44" stroke="#0f172a" strokeWidth="1" strokeDasharray="4,3" />
                    <polygon points="86,44 80,36 92,36" fill="none" stroke="#0f172a" strokeWidth="1.2" />
                    <line x1="60" y1="36" x2="150" y2="36" stroke="#0f172a" strokeWidth="1.5" />

                    {/* Cota de profundidade */}
                    <line x1="20" y1="35" x2="20" y2="73" stroke="#0f172a" strokeWidth="1" />
                    <polygon points="20,32 16,38 24,38" fill="#0f172a" />
                    <polygon points="20,76 16,70 24,70" fill="#0f172a" />

                    <foreignObject x="62" y="20" width="88" height="14">
                      <input
                        type="text"
                        className="h-full w-full bg-transparent text-center text-[9px] outline-none"
                        placeholder="REF. de nível"
                      />
                    </foreignObject>
                    <foreignObject x="0" y="76" width="60" height="14">
                      <input
                        type="text"
                        className="h-full w-full border-b border-slate-400 bg-transparent text-center text-[9px] outline-none"
                        placeholder="prof. (m)"
                      />
                    </foreignObject>
                  </svg>
                </div>

                {/* Rodapé do quadrante — tipo de borda */}
                <div className="mt-1 flex items-center justify-between border-t border-slate-400 pt-1 text-[10px] text-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                    Borda normal
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 border border-slate-900 align-middle" />
                    Borda rebaixada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé opcional */}
        <div className="mt-4 grid grid-cols-2 gap-8 text-sm text-slate-700 print:mt-8">
          <div>
            <p className="text-xs font-semibold uppercase">Assinatura do Cliente</p>
            <div className="mt-8 border-b border-slate-900" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase">Assinatura do Profissional</p>
            <div className="mt-8 border-b border-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
