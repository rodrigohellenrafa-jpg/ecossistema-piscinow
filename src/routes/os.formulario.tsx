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
import logoSplash from "@/assets/logo-splash.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import plantaPiscina from "@/assets/planta-piscina-limpa.png";

export const Route = createFileRoute("/os/formulario")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Ordem de Serviço de Instalação | Piscinow ERP" },
      {
        name: "description",
        content:
          "Ordem de Serviço de instalação de piscinas com desenhos técnicos e checklist de conferência, pronta para impressão A4 frente e verso.",
      },
      { property: "og:title", content: "Ordem de Serviço de Instalação | Piscinow ERP" },
      {
        property: "og:description",
        content:
          "Ordem de Serviço de instalação de piscinas com desenhos técnicos e checklist de conferência, pronta para impressão A4 frente e verso.",
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

const TOTAL_LINHAS_APOIO = 26;
const LINHAS_APOIO_VAZIAS = Array.from({ length: TOTAL_LINHAS_APOIO }, () => "");
const ITENS_VAZIOS: Array<{ descricao: string; quantidade: number }> = [];

type Obra = {
  id: string;
  numero: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  responsavel: string | null;
  venda_id: string | null;
  endereco_obra: string | null;
  tipo_servico: string | null;
  observacoes: string | null;
};

type EventoAgenda = {
  id: string;
  inicio: string;
  fim: string | null;
  titulo: string;
  descricao: string | null;
  local: string | null;
};

type Venda = {
  id: string;
  numero: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  vendedor: string | null;
};

function Campo({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={`os-campo px-3 py-2 ${className}`}>
      <label className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border-b border-slate-900 bg-transparent py-0.5 text-[12px] font-medium text-slate-900 outline-none"
      />
    </div>
  );
}

function FormularioOS() {
  const [selecao, setSelecao] = useState<string>("");
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [modelo, setModelo] = useState("");
  const [numeroOS, setNumeroOS] = useState("");
  const [profissional, setProfissional] = useState("");
  const [inicio, setInicio] = useState("");
  const [termino, setTermino] = useState("");
  const [agendamento, setAgendamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [linhasApoio, setLinhasApoio] = useState<string[]>(LINHAS_APOIO_VAZIAS);

  const { data: obras = [] } = useQuery({
    queryKey: ["obras-formulario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras")
        .select("id, numero, cliente_id, cliente_nome, responsavel, venda_id, endereco_obra, tipo_servico")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Obra[];
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["vendas-formulario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("id, numero, cliente_id, cliente_nome, vendedor")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as Venda[];
    },
  });

  const obra = selecao.startsWith("obra:")
    ? obras.find((o) => o.id === selecao.slice(5))
    : undefined;

  const vendaSelecionada = selecao.startsWith("venda:")
    ? vendas.find((v) => v.id === selecao.slice(6))
    : undefined;

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
  const clienteId = obra?.cliente_id ?? vendaSelecionada?.cliente_id ?? null;

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

  const { data: clienteDados } = useQuery({
    queryKey: ["formulario-cliente", clienteId],
    enabled: Boolean(clienteId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("nome, telefone, endereco_obra, logradouro, numero, bairro, cidade, estado")
        .eq("id", clienteId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (obra) {
      setCliente(obra.cliente_nome ?? "");
      setProfissional(obra.responsavel ?? "");
      setNumeroOS(obra.numero ?? "");
      if (obra.endereco_obra) setEndereco(obra.endereco_obra);
      if (obra.tipo_servico) setModelo(obra.tipo_servico);
    } else if (vendaSelecionada) {
      setCliente(vendaSelecionada.cliente_nome ?? "");
      setProfissional(vendaSelecionada.vendedor ?? "");
      setNumeroOS(vendaSelecionada.numero ?? "");
    }
  }, [obra, vendaSelecionada]);

  useEffect(() => {
    if (!clienteDados) return;
    setTelefone(clienteDados.telefone ?? "");
    const completo = [
      clienteDados.logradouro,
      clienteDados.numero,
      clienteDados.bairro,
      clienteDados.cidade,
      clienteDados.estado,
    ]
      .filter(Boolean)
      .join(", ");
    setEndereco((atual) => atual || clienteDados.endereco_obra || completo);
  }, [clienteDados]);

  useEffect(() => {
    const piscina = itensVenda.find((i) => /piscina|casco|spa/i.test(i.descricao));
    if (piscina) setModelo((atual) => atual || piscina.descricao);
  }, [itensVenda]);

  const formatarQtd = (q: number) => (Number(q) % 1 === 0 ? String(Number(q)) : Number(q).toFixed(2));

  return (
    <div className="space-y-4">
      {/* Controles — ocultos na impressão */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ordem de Serviço de Instalação</h1>
          <p className="text-sm text-muted-foreground">
            Selecione a obra ou o pedido. A frente traz os desenhos técnicos e o verso o checklist de
            conferência.
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

      {/* ================= Área imprimível ================= */}
      <div className="os-form-wrapper mx-auto w-full max-w-4xl space-y-6 text-slate-900">
        {/* -------- FRENTE -------- */}
        <section className="os-pagina bg-white p-6 shadow-sm print:p-0 print:shadow-none">
          {/* Cabeçalho */}
          <header className="flex items-start justify-between gap-6 border-b-2 border-slate-900 pb-3">
            <div>
              <img
                src={logoSplash.url}
                alt="Splash Jardim do Trevo"
                className="h-24 w-auto"
              />
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-700">
                Instalação de piscinas
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold uppercase tracking-[0.18em] text-slate-900">
                Ordem de Serviço
              </h2>
              <p className="text-[11px] text-slate-700">Instalação · Frente</p>
            </div>
          </header>

          {/* Dados do cliente / pedido */}
          <div className="mt-3 grid grid-cols-4 border border-slate-900">
            <Campo
              label="Cliente"
              value={cliente}
              onChange={setCliente}
              className="col-span-2 border-b border-r border-slate-900"
            />
            <Campo
              label="Telefone"
              value={telefone}
              onChange={setTelefone}
              className="border-b border-r border-slate-900"
            />
            <Campo
              label="Nº da O.S."
              value={numeroOS}
              onChange={setNumeroOS}
              className="border-b border-slate-900"
            />
            <Campo
              label="Endereço da obra"
              value={endereco}
              onChange={setEndereco}
              className="col-span-2 border-b border-r border-slate-900"
            />
            <Campo
              label="Modelo da piscina"
              value={modelo}
              onChange={setModelo}
              className="col-span-2 border-b border-slate-900"
            />
            <Campo
              label="Profissional responsável"
              value={profissional}
              onChange={setProfissional}
              className="col-span-2 border-r border-slate-900"
            />
            <Campo
              label="Início"
              value={inicio}
              onChange={setInicio}
              className="border-r border-slate-900"
            />
            <Campo label="Término" value={termino} onChange={setTermino} />
          </div>

          {/* Desenho técnico */}
          <div className="mt-4 border border-slate-900">
            <div className="border-b border-slate-900 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Desenho técnico — planta baixa e corte
            </div>

            <div className="os-desenho p-4">
              <img
                src={plantaPiscina}
                alt="Desenho técnico da piscina: planta baixa e corte longitudinal"
                className="mx-auto max-h-[130mm] w-auto object-contain"
              />
            </div>

            <div className="flex items-center gap-8 border-t border-slate-900 px-3 py-2 text-[11px] text-slate-700">
              <span className="font-semibold uppercase tracking-wide text-slate-700">Borda:</span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 border border-slate-900" /> Normal
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 border border-slate-900" /> Rebaixada
              </span>
              <span className="ml-auto font-semibold uppercase tracking-wide text-slate-700">
                Referência de nível:
              </span>
              <span className="inline-block w-40 border-b border-slate-400" />
            </div>
          </div>

          {/* Observações */}
          <div className="mt-4 border border-slate-900">
            <div className="border-b border-slate-900 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Observações da obra
            </div>
            <div className="space-y-4 p-3">
              <div className="border-b border-slate-900" />
              <div className="border-b border-slate-900" />
              <div className="border-b border-slate-900" />
            </div>
          </div>
        </section>

        {/* -------- VERSO -------- */}
        <section className="os-pagina os-verso bg-white p-6 shadow-sm print:p-0 print:shadow-none">
          <header className="flex items-end justify-between border-b-2 border-slate-900 pb-2">
            <div className="flex items-center gap-3">
              <img src={logoSplash.url} alt="Splash Jardim do Trevo" className="h-16 w-auto" />
              <div>
              <h2 className="text-base font-bold uppercase tracking-[0.18em] text-slate-900">
                Checklist de materiais e equipamentos
              </h2>
              <p className="text-[11px] text-slate-700">
                {cliente || "Cliente"} · O.S. {numeroOS || "—"}
              </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-700">Verso</p>
          </header>

          <table className="mt-3 w-full border-collapse border border-slate-900 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="border border-slate-900 px-2 py-1 text-left text-[10px] font-bold uppercase tracking-wide">
                  Item / Descrição
                </th>
                <th className="w-28 border border-slate-900 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide">
                  Conferência Loja (saída)
                </th>
                <th className="w-28 border border-slate-900 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-wide">
                  Conferência Obra (cliente)
                </th>
              </tr>
            </thead>
            <tbody>
              {itensVenda.map((item, index) => (
                <tr key={`venda-${index}`}>
                  <td className="border border-slate-900 px-2 py-0.5 leading-tight text-slate-900">
                    {formatarQtd(item.quantidade)}x {item.descricao}
                  </td>
                  <td className="border border-slate-900 px-2 py-0.5 text-center">
                    <span className="inline-block h-3.5 w-3.5 border border-slate-900 align-middle" />
                  </td>
                  <td className="border border-slate-900 px-2 py-0.5 text-center">
                    <span className="inline-block h-3.5 w-3.5 border border-slate-900 align-middle" />
                  </td>
                </tr>
              ))}

              <tr>
                <td
                  colSpan={3}
                  className="border border-slate-900 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700"
                >
                  Itens de apoio — preencher na conferência da loja
                </td>
              </tr>

              {linhasApoio.map((valor, index) => (
                <tr key={`apoio-${index}`}>
                  <td className="border border-slate-900 px-2 py-0">
                    <input
                      type="text"
                      value={valor}
                      onChange={(e) =>
                        setLinhasApoio((atual) =>
                          atual.map((v, i) => (i === index ? e.target.value : v)),
                        )
                      }
                      className="h-5 w-full bg-transparent text-[11px] leading-tight text-slate-900 outline-none"
                      placeholder=""
                    />
                  </td>
                  <td className="border border-slate-900 px-2 py-0.5 text-center">
                    <span className="inline-block h-3.5 w-3.5 border border-slate-900 align-middle" />
                  </td>
                  <td className="border border-slate-900 px-2 py-0.5 text-center">
                    <span className="inline-block h-3.5 w-3.5 border border-slate-900 align-middle" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Assinaturas */}
          <div className="mt-10 grid grid-cols-2 gap-10 text-[11px] text-slate-700">
            <div>
              <div className="border-b border-slate-900" />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Assinatura do Cliente
              </p>
            </div>
            <div>
              <div className="border-b border-slate-900" />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                Assinatura do Técnico
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
