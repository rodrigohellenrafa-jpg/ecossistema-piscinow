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

const ITENS = [
  { cod: "A", label: "Item A" },
  { cod: "B", label: "Item B" },
  { cod: "C", label: "Item C" },
  { cod: "D", label: "Item D" },
];

function FormularioOS() {
  return (
    <div className="space-y-4">
      {/* Controles — ocultos na impressão */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Formulário de OS</h1>
          <p className="text-sm text-muted-foreground">
            Preencha e imprima o formulário de Ordem de Serviço.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-2 border-b border-slate-900">
            <div className="border-r border-slate-900 p-3">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Nome do Cliente
              </label>
              <input
                type="text"
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
                className="w-full border-b border-slate-400 bg-transparent py-1 text-sm outline-none"
                placeholder=""
              />
            </div>
          </div>

          {/* Linha 3 — Início / Término */}
          <div className="grid grid-cols-2 border-b border-slate-900">
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
            {/* Coluna esquerda */}
            <div className="border-r border-slate-900 p-3">
              {/* Tabela */}
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
                  {ITENS.map((item) => (
                    <tr key={item.cod}>
                      <td className="border border-slate-900 px-2 py-2 text-center font-medium">
                        {item.label}
                      </td>
                      <td className="border border-slate-900 px-2 py-2 text-center">
                        <span className="inline-flex h-5 w-5 items-center justify-center border border-slate-900 bg-slate-100 text-sm font-bold">
                          ✓
                        </span>
                      </td>
                      <td className="border border-slate-900 px-2 py-2 text-center">
                        <span className="inline-block h-5 w-5 border border-slate-900" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Gráfico de Nível */}
              <div className="mt-4">
                <h3 className="mb-2 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                  Nível
                </h3>
                <div className="flex justify-center">
                  <svg
                    viewBox="0 0 260 120"
                    className="h-32 w-full max-w-xs"
                    aria-label="Perfil de profundidade da piscina"
                  >
                    {/* Água */}
                    <path
                      d="M10 30 L70 30 L70 50 L110 50 L110 70 L150 70 L150 90 L250 90 L250 30 Z"
                      fill="none"
                      stroke="none"
                    />
                    {/* Linha do nível/terreno */}
                    <line x1="0" y1="30" x2="260" y2="30" stroke="#0f172a" strokeWidth="1" />
                    {/* Perfil da piscina (degraus + rampa) */}
                    <polyline
                      points="10,30 70,30 70,50 110,50 110,70 150,70 150,90 250,90 250,110"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    {/* Fundo */}
                    <line x1="10" y1="30" x2="10" y2="110" stroke="#0f172a" strokeWidth="2" />
                    <line x1="10" y1="110" x2="250" y2="110" stroke="#0f172a" strokeWidth="2" />
                    <line x1="250" y1="90" x2="250" y2="110" stroke="#0f172a" strokeWidth="2" />
                    {/* Linhas de cota de profundidade */}
                    <line x1="75" y1="30" x2="75" y2="50" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,2" />
                    <line x1="115" y1="30" x2="115" y2="70" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,2" />
                    <line x1="155" y1="30" x2="155" y2="90" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,2" />
                    {/* Setas de profundidade */}
                    <polygon points="75,55 72,50 78,50" fill="#0f172a" />
                    <polygon points="115,75 112,70 118,70" fill="#0f172a" />
                    <polygon points="155,95 152,90 158,90" fill="#0f172a" />
                  </svg>
                </div>
                <div className="mt-2 text-right text-sm font-medium text-slate-700">
                  REF: <span className="inline-block w-24 border-b border-slate-900" />
                </div>
              </div>
            </div>

            {/* Coluna direita — Medidas */}
            <div className="flex flex-col p-3">
              <h3 className="mb-4 text-center text-xs font-bold uppercase tracking-wide text-slate-700">
                Principais Medidas
              </h3>

              <div className="flex flex-1 flex-col items-center justify-center">
                <svg
                  viewBox="0 0 340 220"
                  className="h-52 w-full max-w-md"
                  aria-label="Esquema de medidas da piscina"
                >
                  {/* Cota superior — comprimento */}
                  <line x1="60" y1="20" x2="280" y2="20" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="55,20 60,16 60,24" fill="#0f172a" />
                  <polygon points="285,20 280,16 280,24" fill="#0f172a" />

                  {/* Cota inferior — comprimento */}
                  <line x1="60" y1="180" x2="280" y2="180" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="55,180 60,176 60,184" fill="#0f172a" />
                  <polygon points="285,180 280,176 280,184" fill="#0f172a" />

                  {/* Cota esquerda — largura */}
                  <line x1="40" y1="40" x2="40" y2="160" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="40,35 36,40 44,40" fill="#0f172a" />
                  <polygon points="40,165 36,160 44,160" fill="#0f172a" />

                  {/* Cota direita — largura */}
                  <line x1="300" y1="40" x2="300" y2="160" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="300,35 296,40 304,40" fill="#0f172a" />
                  <polygon points="300,165 296,160 304,160" fill="#0f172a" />

                  {/* Retângulo da piscina */}
                  <rect x="60" y="40" width="220" height="140" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                  <text
                    x="170"
                    y="110"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-slate-400 text-[10px] font-bold uppercase"
                  >
                    Piscina
                  </text>

                  {/* Inputs sobre as cotas (superior e inferior) */}
                  <foreignObject x="130" y="8" width="80" height="24">
                    <input
                      type="text"
                      className="h-full w-full border-b border-slate-400 bg-transparent text-center text-xs outline-none"
                      placeholder="m"
                    />
                  </foreignObject>
                  <foreignObject x="130" y="188" width="80" height="24">
                    <input
                      type="text"
                      className="h-full w-full border-b border-slate-400 bg-transparent text-center text-xs outline-none"
                      placeholder="m"
                    />
                  </foreignObject>
                </svg>

                {/* Inputs de largura ao lado do SVG */}
                <div className="mt-2 flex w-full max-w-md justify-between px-8 text-xs text-slate-700">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">Largura esq.</span>
                    <input
                      type="text"
                      className="w-20 border-b border-slate-400 bg-transparent text-center outline-none"
                      placeholder="m"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">Largura dir.</span>
                    <input
                      type="text"
                      className="w-20 border-b border-slate-400 bg-transparent text-center outline-none"
                      placeholder="m"
                    />
                  </div>
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
