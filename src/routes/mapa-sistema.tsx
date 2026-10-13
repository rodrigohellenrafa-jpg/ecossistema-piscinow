import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Maximize2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/mapa-sistema")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Mapa Vetorizado do Sistema • Diálogo dos Vetores | Piscinow ERP" },
      {
        name: "description",
        content: "Mapa vetorial interativo da arquitetura do Piscinow ERP com simulação em tempo real de fluxos e diálogo entre vetores.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MapaVetorizadoPage />
    </RequireAuth>
  ),
});

function MapaVetorizadoPage() {
  const [fullscreen, setFullscreen] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div className={`space-y-4 ${fullscreen ? "fixed inset-0 z-50 bg-slate-950 p-4" : ""}`}>
      <PageHeader
        title="Mapa Vetorizado • Diálogo dos Vetores"
        subtitle="Visualização interativa 360° da arquitetura do Piscinow ERP com troca de mensagens em tempo real entre Comercial, DRE, Contas, Fluxo de Caixa e Supabase."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setKey((k) => k + 1)}
              title="Recarregar simulação"
            >
              <RefreshCw className="mr-1.5 size-3.5" />
              Reiniciar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullscreen(!fullscreen)}
              title="Alternar tela cheia"
            >
              <Maximize2 className="mr-1.5 size-3.5" />
              {fullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden border-slate-800 bg-slate-950 shadow-2xl">
        <div className="relative w-full" style={{ height: fullscreen ? "calc(100vh - 120px)" : "780px" }}>
          <iframe
            key={key}
            srcDoc={HTML_MAPA}
            className="size-full border-0"
            title="Mapa Vetorizado com Diálogo dos Vetores"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </Card>
    </div>
  );
}

// Injeção do mapa com o motor de diálogo dos vetores
const HTML_MAPA = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mapa Vetorizado Interativo</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @keyframes dash { to { stroke-dashoffset: -40; } }
    @keyframes pulseGlow { 0%, 100% { filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6)); } 50% { filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.95)); } }
    @keyframes popIn { 0% { transform: scale(0.6) translateY(10px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
    .flow-line { stroke-dasharray: 6, 6; animation: dash 2.5s linear infinite; }
    .vector-active { stroke-width: 4.5px !important; animation: dash 1.2s linear infinite, pulseGlow 1.5s ease-in-out infinite !important; }
    .node-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
    .node-card:hover { transform: translateY(-3px) scale(1.02); filter: drop-shadow(0 10px 18px rgba(0,0,0,0.25)); }
    .node-active { outline: 3px solid #38bdf8; box-shadow: 0 0 28px rgba(56, 189, 248, 0.55); transform: translateY(-4px) scale(1.03); }
    .node-speaking { outline: 3px solid #10b981; box-shadow: 0 0 32px rgba(16, 185, 129, 0.65); animation: popIn 0.3s ease-out; }
    .node-receiving { outline: 3px solid #f59e0b; box-shadow: 0 0 28px rgba(245, 158, 11, 0.6); }
    .speech-bubble { animation: popIn 0.28s cubic-bezier(0.16, 1, 0.3, 1); filter: drop-shadow(0 12px 24px rgba(0,0,0,0.35)); }
    .vector-clickable { cursor: pointer; pointer-events: stroke; }
    .vector-clickable:hover { stroke-width: 5px !important; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8)); }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.3); border-radius: 4px; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased select-none font-sans overflow-hidden h-screen flex flex-col">
  <header class="flex-none bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-2 shadow-md z-30 flex flex-wrap items-center justify-between gap-2 text-xs">
    <div class="flex items-center gap-2">
      <div class="size-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">⚡</div>
      <div>
        <h1 class="text-xs font-bold text-slate-100">Diálogo dos Vetores • Piscinow ERP</h1>
        <p class="text-[10px] text-slate-400">Comunicação e payload entre Comercial, DRE, Contas e Fluxo de Caixa</p>
      </div>
    </div>
    <div class="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
      <span class="text-[11px] font-semibold text-slate-300">Cenário:</span>
      <select id="select-cenario" onchange="trocarCenario(this.value)" class="bg-slate-900 border border-slate-700 rounded-lg text-xs px-2 py-0.5 text-sky-300 font-medium">
        <option value="debito_credito">💳 Venda Débito/Crédito: DRE vs Caixa (Caso Venda 27)</option>
        <option value="venda_splash">🏊 Venda Piscina Splash: RPC Atômico, Fábrica & Obras</option>
        <option value="ponto_equilibrio">⚖️ Fechamento Mensal, DRE, Folha & Ponto de Equilíbrio</option>
        <option value="balcao_pix">🛒 Venda de Balcão: À Vista / PIX c/ Baixa Imediata</option>
      </select>
      <button id="btn-play-conversa" onclick="alternarConversa()" class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow">
        <span id="btn-play-icon">▶️</span> <span id="btn-play-text">Conversar</span>
      </button>
      <button onclick="proximoPassoConversa()" class="p-1 hover:bg-slate-700 text-slate-300 rounded text-xs" title="Próximo passo">⏭️</button>
      <button onclick="reiniciarConversa()" class="p-1 hover:bg-slate-700 text-slate-300 rounded text-xs" title="Reiniciar">🔄</button>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex items-center border border-slate-700 rounded bg-slate-800 text-[11px]">
        <button onclick="alterarZoom(0.15)" class="px-2 py-0.5 hover:bg-slate-700 text-slate-200">+</button>
        <button onclick="resetarZoom()" class="px-2 py-0.5 hover:bg-slate-700 text-slate-400 border-x border-slate-700">100%</button>
        <button onclick="alterarZoom(-0.15)" class="px-2 py-0.5 hover:bg-slate-700 text-slate-200">−</button>
      </div>
    </div>
  </header>

  <div id="status-dialogo-bar" class="flex-none bg-slate-900/90 border-b border-slate-800 px-4 py-1 text-xs flex items-center justify-between z-20">
    <div class="flex items-center gap-2">
      <span id="dialogo-passo-label" class="font-bold text-sky-400">Passo 1/6:</span>
      <span id="dialogo-status-texto" class="text-slate-300 font-medium">Selecione um cenário e clique em "Conversar".</span>
    </div>
    <span class="text-[10px] text-slate-500">Clique nas linhas para inspecionar o vetor</span>
  </div>

  <div class="relative flex-1 overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing" id="viewport-container">
    <div id="canvas-content" class="absolute origin-top-left" style="transform: translate(30px, 20px) scale(0.85); width: 2300px; height: 1350px;">
      <svg id="svg-conexoes" class="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" /></marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#22c55e" /></marker>
          <marker id="arrow-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#c084fc" /></marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" /></marker>
          <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#fb7185" /></marker>
          <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" /></marker>
          <filter id="glow-cyan"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>

        <path id="path-prod-venda" onclick="ouvirVetor('path-prod-venda')" d="M 330 230 C 440 230, 470 230, 560 230" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-cli-venda" onclick="ouvirVetor('path-cli-venda')" d="M 330 90 C 450 90, 480 190, 560 210" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-orc-venda" onclick="ouvirVetor('path-orc-venda')" d="M 330 370 C 450 370, 470 260, 560 250" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-venda-detalhe" onclick="ouvirVetor('path-venda-detalhe')" d="M 820 230 C 880 230, 910 230, 960 230" fill="none" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-venda-rpc" onclick="ouvirVetor('path-venda-rpc')" d="M 1220 230 C 1300 230, 1340 340, 1400 370" fill="none" stroke="#c084fc" stroke-width="3" marker-end="url(#arrow-purple)" class="flow-line vector-clickable" />
        <path id="path-venda-receber" onclick="ouvirVetor('path-venda-receber')" d="M 1220 210 C 1310 180, 1360 140, 1420 120" fill="none" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arrow-green)" class="flow-line vector-clickable" />
        <path id="path-venda-os" onclick="ouvirVetor('path-venda-os')" d="M 1220 250 C 1300 280, 1330 500, 1400 560" fill="none" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-amber)" class="flow-line vector-clickable" />
        <path id="path-rpc-estoque" onclick="ouvirVetor('path-rpc-estoque')" d="M 1400 400 C 1290 440, 1100 480, 950 510" fill="none" stroke="#c084fc" stroke-width="2" marker-end="url(#arrow-purple)" class="flow-line vector-clickable" />
        <path id="path-rpc-compras" onclick="ouvirVetor('path-rpc-compras')" d="M 1400 410 C 1280 470, 900 580, 680 620" fill="none" stroke="#c084fc" stroke-width="2" marker-end="url(#arrow-purple)" class="flow-line vector-clickable" />
        <path id="path-compra-pagar" onclick="ouvirVetor('path-compra-pagar')" d="M 680 660 C 800 700, 1250 350, 1450 250" fill="none" stroke="#fb7185" stroke-width="2" marker-end="url(#arrow-rose)" class="flow-line vector-clickable" />
        <path id="path-contas-fluxo" onclick="ouvirVetor('path-contas-fluxo')" d="M 1660 130 C 1730 150, 1780 200, 1820 240" fill="none" stroke="#22c55e" stroke-width="2.5" marker-end="url(#arrow-green)" class="flow-line vector-clickable" />
        <path id="path-pagar-fluxo" onclick="ouvirVetor('path-pagar-fluxo')" d="M 1660 250 C 1720 250, 1770 250, 1820 250" fill="none" stroke="#fb7185" stroke-width="2.5" marker-end="url(#arrow-rose)" class="flow-line vector-clickable" />
        <path id="path-fluxo-banco" onclick="ouvirVetor('path-fluxo-banco')" d="M 2060 250 C 2110 250, 2130 250, 2160 250" fill="none" stroke="#22d3ee" stroke-width="2" marker-end="url(#arrow-cyan)" class="flow-line vector-clickable" />
        <path id="path-vendas-dre" onclick="ouvirVetor('path-vendas-dre')" d="M 1090 280 C 1090 750, 1300 850, 1420 870" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-dre-indicadores" onclick="ouvirVetor('path-dre-indicadores')" d="M 1670 870 C 1740 870, 1780 870, 1830 870" fill="none" stroke="#22d3ee" stroke-width="3" marker-end="url(#arrow-cyan)" class="flow-line vector-clickable" />
        <path id="path-ind-home" onclick="ouvirVetor('path-ind-home')" d="M 2070 870 C 2180 870, 2220 500, 2180 100" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-blue)" class="flow-line vector-clickable" />
        <path id="path-os-obras" onclick="ouvirVetor('path-os-obras')" d="M 1650 580 C 1720 580, 1760 580, 1810 580" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-amber)" class="flow-line vector-clickable" />
        <path id="path-baixa-caixa" onclick="ouvirVetor('path-baixa-caixa')" d="M 1660 170 C 1740 180, 1780 220, 1820 240" fill="none" stroke="#10b981" stroke-width="3" stroke-dasharray="4,4" marker-end="url(#arrow-green)" class="vector-clickable" />
        <path id="path-retencao-dre" onclick="ouvirVetor('path-retencao-dre')" d="M 1660 180 C 1720 300, 1550 780, 1540 840" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arrow-rose)" class="vector-clickable" />

        <g id="camada-particulas"></g>
      </svg>

      <div id="camada-baloes" class="absolute inset-0 pointer-events-none"></div>

      <!-- COLUNA 1: CADASTROS -->
      <div class="absolute left-10 top-6 w-[280px] p-2 rounded-2xl border border-sky-500/20 bg-slate-900/40">
        <div class="text-[11px] font-bold text-sky-400 mb-2">📁 1. Cadastros & Entradas Base</div>
        <div id="card-clientes" class="node-card mb-2 p-3 rounded-xl border border-slate-800 bg-slate-900"><div class="text-xs font-bold text-sky-400">/clientes</div><div class="text-sm font-semibold text-slate-100">Clientes & CRM</div></div>
        <div id="card-produtos" class="node-card mb-2 p-3 rounded-xl border border-sky-500/40 bg-slate-900"><div class="text-xs font-bold text-sky-400">/produtos</div><div class="text-sm font-semibold text-slate-100">Catálogo Splash 2026 & Peças</div></div>
        <div id="card-orcamentos" class="node-card mb-2 p-3 rounded-xl border border-slate-800 bg-slate-900"><div class="text-xs font-bold text-sky-400">/vendas/orcamentos</div><div class="text-sm font-semibold text-slate-100">Orçamentos & Propostas</div></div>
        <div id="card-fornecedores" class="node-card mb-2 p-3 rounded-xl border border-slate-800 bg-slate-900"><div class="text-xs font-bold text-sky-400">/fornecedores</div><div class="text-sm font-semibold text-slate-100">Fornecedores & Fábrica</div></div>
        <div id="card-funcionarios" class="node-card p-3 rounded-xl border border-slate-800 bg-slate-900"><div class="text-xs font-bold text-rose-400">/funcionarios</div><div class="text-sm font-semibold text-slate-100">Equipe & Folha (Ponto Equilíbrio)</div></div>
      </div>

      <!-- COLUNA 2: FORMULAÇÃO -->
      <div class="absolute left-[560px] top-28 w-[270px] p-2 rounded-2xl border border-sky-500/30 bg-sky-950/20">
        <div class="text-[11px] font-bold text-sky-400 mb-2">🛒 2. Formulação Comercial (PDV)</div>
        <div id="card-venda-nova" class="node-card p-4 rounded-xl border border-sky-500/50 bg-slate-900"><div class="text-xs font-bold text-sky-400">/vendas/novo</div><div class="text-base font-bold text-slate-100">Formulação de Venda & Kits</div><p class="text-xs text-slate-400 mt-1">IN Balcão vs OUT Externo. Débito/Crédito vai para DRE.</p></div>
      </div>

      <!-- COLUNA 3: PEDIDO FECHADO -->
      <div class="absolute left-[960px] top-28 w-[270px] p-2 rounded-2xl border border-sky-500/30 bg-slate-900/40">
        <div class="text-[11px] font-bold text-sky-400 mb-2">📜 3. Pedido Aprovado & Trava</div>
        <div id="card-venda-id" class="node-card p-4 rounded-xl border border-slate-700 bg-slate-900"><div class="text-xs font-bold text-sky-400">/vendas/$id</div><div class="text-base font-bold text-slate-100">Detalhe do Pedido & KPIs</div><p class="text-xs text-slate-400 mt-1">Bruto DRE (R$ 460) | Líquido Caixa (R$ 450,85) | Retenção MDR (R$ 9,15)</p></div>
      </div>

      <!-- COLUNA 4: SUPABASE ENGINE -->
      <div class="absolute left-[1400px] top-6 w-[280px] p-2 rounded-2xl border border-purple-500/30 bg-purple-950/10">
        <div class="text-[11px] font-bold text-purple-400 mb-2">⚡ 4. Motor de Processamento & Banco</div>
        <div id="card-contas-receber" class="node-card mb-2 p-3 rounded-xl border border-emerald-500/40 bg-slate-900"><div class="text-xs font-bold text-emerald-400">/contas (receber)</div><div class="text-sm font-semibold text-slate-100">Contas a Receber</div><p class="text-[11px] text-slate-400">Cartão aguardando baixa manual</p></div>
        <div id="card-contas-pagar" class="node-card mb-2 p-3 rounded-xl border border-rose-500/40 bg-slate-900"><div class="text-xs font-bold text-rose-400">/contas (pagar)</div><div class="text-sm font-semibold text-slate-100">Contas a Pagar & Despesas Fixas</div></div>
        <div id="card-rpc-processar" class="node-card mb-2 p-3 rounded-xl border border-purple-500/50 bg-slate-900"><div class="text-xs font-bold text-purple-400">RPC PostgreSQL</div><div class="text-sm font-bold text-slate-100">processar_compra_estoque_venda</div></div>
        <div id="card-os" class="node-card mb-2 p-3 rounded-xl border border-amber-500/40 bg-slate-900"><div class="text-xs font-bold text-amber-400">/ordens</div><div class="text-sm font-semibold text-slate-100">Ordens de Serviço & Equipes</div></div>
        <div id="card-dre" class="node-card p-3 rounded-xl border border-cyan-500/50 bg-slate-900"><div class="text-xs font-bold text-cyan-400">/dre</div><div class="text-sm font-semibold text-slate-100">DRE Gerencial (Competência)</div><p class="text-[11px] text-slate-400">Faturamento Bruto R$ 460 | Taxa MDR R$ 9,15</p></div>
      </div>

      <!-- COLUNA 5: RESULTADO -->
      <div class="absolute left-[1820px] top-6 w-[280px] p-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
        <div class="text-[11px] font-bold text-emerald-400 mb-2">📊 5. Tesouraria & Controladoria</div>
        <div id="card-fluxo-caixa" class="node-card mb-2 p-3 rounded-xl border border-emerald-500/50 bg-slate-900"><div class="text-xs font-bold text-emerald-400">/fluxo-caixa</div><div class="text-sm font-bold text-slate-100">Fluxo de Caixa Realizado</div><p class="text-[11px] text-slate-400">Líquido de R$ 450,85 consolidado sem duplicidade</p></div>
        <div id="card-saldos-bancarios" class="node-card mb-2 p-3 rounded-xl border border-cyan-500/40 bg-slate-900"><div class="text-xs font-bold text-cyan-400">/saldos-bancarios</div><div class="text-sm font-semibold text-slate-100">Saldos Bancários (Santander/Itaú)</div></div>
        <div id="card-obras" class="node-card mb-2 p-3 rounded-xl border border-amber-500/40 bg-slate-900"><div class="text-xs font-bold text-amber-400">/obras/$id</div><div class="text-sm font-semibold text-slate-100">Acompanhamento de Obras</div></div>
        <div id="card-indicadores" class="node-card mb-2 p-3 rounded-xl border border-cyan-500/50 bg-slate-900"><div class="text-xs font-bold text-cyan-400">/indicadores</div><div class="text-sm font-bold text-slate-100">EBITDA & Ponto de Equilíbrio</div></div>
        <div id="card-home" class="node-card p-3 rounded-xl border border-sky-500/60 bg-slate-900"><div class="text-xs font-bold text-sky-400">/ (Dashboard 360°)</div><div class="text-sm font-bold text-slate-100">Balança do Ponto de Equilíbrio</div></div>
      </div>

      <!-- APOIO: ESTOQUE E COMPRAS -->
      <div id="card-estoque" class="absolute left-[780px] top-[480px] w-[240px] node-card p-3 rounded-xl border border-purple-500/40 bg-slate-900"><div class="text-xs font-bold text-purple-400">/estoque/*</div><div class="text-sm font-semibold text-slate-100">Estoque Físico & Inventário</div></div>
      <div id="card-compras" class="absolute left-[480px] top-[600px] w-[260px] node-card p-3 rounded-xl border border-purple-500/40 bg-slate-900"><div class="text-xs font-bold text-purple-400">/compras</div><div class="text-sm font-semibold text-slate-100">Ordens de Compra Fábrica Splash</div></div>
    </div>
  </div>

  <!-- DOCK DE LOGS -->
  <div class="flex-none bg-slate-900/95 border-t border-slate-800 p-2 text-xs flex flex-col h-36">
    <div class="font-bold text-slate-300 mb-1 flex items-center justify-between">
      <span>💬 Diálogo em Tempo Real entre Vetores:</span>
      <span class="text-[10px] text-slate-500">Transmissão ativa de dados</span>
    </div>
    <div id="terminal-log-content" class="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300">
      <div class="text-slate-500 italic">// Aguardando início do diálogo. Clique em "Conversar".</div>
    </div>
  </div>

  <script>
    const CENARIOS = {
      debito_credito: {
        titulo: "Venda no Débito/Crédito: DRE vs Caixa (Venda 27)",
        passos: [
          {
            origem: "card-venda-nova", destino: "card-venda-id", pathId: "path-venda-detalhe",
            emissor: "Formulação de Venda", receptor: "Pedido Aprovado ($id)",
            falaEmissor: "Fechei a Venda 27 de Peças no valor de R$ 460,00 no Cartão de Débito!",
            falaReceptor: "Pedido 27 aprovado. Gravando valor_total = R$ 460,00 para alimentar o DRE.",
            payload: { pedido: "27", valor_total: 460.00, forma: "Cartão de Débito" }
          },
          {
            origem: "card-venda-id", destino: "card-dre", pathId: "path-vendas-dre",
            emissor: "Pedido 27", receptor: "DRE Gerencial",
            falaEmissor: "DRE, anote aí: R$ 460,00 de receita bruta de peças por competência!",
            falaReceptor: "Computado! Faturamento Bruto do mês acrescido em R$ 460,00.",
            payload: { faturamento_bruto: 460.00, regime: "competencia", categoria: "Peças" }
          },
          {
            origem: "card-venda-id", destino: "card-contas-receber", pathId: "path-venda-receber",
            emissor: "Pedido 27", receptor: "Contas a Receber",
            falaEmissor: "Criando título a receber de R$ 460,00 aguardando a concessionária.",
            falaReceptor: "Título registrado como 'Aberto'. Não crio entrada automática no caixa até a baixa!",
            payload: { valor: 460.00, status: "aberto", observacao: "Aguardando baixa manual" }
          },
          {
            origem: "card-contas-receber", destino: "card-fluxo-caixa", pathId: "path-baixa-caixa",
            emissor: "Baixa Manual Maquininha", receptor: "Fluxo de Caixa",
            falaEmissor: "Concessionária depositou! Valor líquido apurado: R$ 450,85 no banco Santander.",
            falaReceptor: "Confirmado! Registrando entrada REALIZADA de R$ 450,85 no livro caixa (zero R$ 910!).",
            payload: { valor_pago: 450.85, retencao_mdr: 9.15, banco: "Santander", status: "Pago" }
          },
          {
            origem: "card-contas-receber", destino: "card-dre", pathId: "path-retencao-dre",
            emissor: "Retenção da Maquininha", receptor: "DRE Gerencial",
            falaEmissor: "DRE, a taxa MDR retida pela maquininha foi de R$ 9,15.",
            falaReceptor: "Lançado em Despesas Financeiras / Taxas de Máquina!",
            payload: { taxa_mdr: 9.15, tipo: "deducao_financeira" }
          },
          {
            origem: "card-fluxo-caixa", destino: "card-home", pathId: "path-fluxo-banco",
            emissor: "Fluxo de Caixa", receptor: "Cockpit Executivo",
            falaEmissor: "Saldo bancário atualizado em R$ 450,85. Deduplicação 100% perfeita!",
            falaReceptor: "Painel 360° em equilíbrio: DRE = R$ 460 | Caixa = R$ 450,85.",
            payload: { saldo_incrementado: 450.85, duplicidades: 0 }
          }
        ]
      },
      venda_splash: {
        titulo: "Venda Piscina Splash: RPC Atômico, Fábrica & Obras",
        passos: [
          { origem: "card-venda-nova", destino: "card-venda-id", pathId: "path-venda-detalhe", emissor: "PDV Comercial", receptor: "Pedido Aprovado", falaEmissor: "Contrato assinado: Piscina Splash Tropical 6x3 + Filtro + Instalação por R$ 32.000!", falaReceptor: "Pedido oficial gravado. Aguardando confirmação explícita para compras e estoque.", payload: { valor: 32000.00 } },
          { origem: "card-venda-id", destino: "card-rpc-processar", pathId: "path-venda-rpc", emissor: "Pedido Confirmado", receptor: "RPC Supabase", falaEmissor: "Disparar RPC processar_compra_estoque_venda com segurança transacional!", falaReceptor: "Iniciando transação atômica PL/pgSQL.", payload: { rpc: "processar_compra_estoque_venda" } },
          { origem: "card-rpc-processar", destino: "card-estoque", pathId: "path-rpc-estoque", emissor: "RPC Engine", receptor: "Estoque Físico", falaEmissor: "Baixar 1x Filtro DFR e areia que já estão no depósito local.", falaReceptor: "Estoque físico deduzido com sucesso.", payload: { baixados: 2 } },
          { origem: "card-rpc-processar", destino: "card-compras", pathId: "path-rpc-compras", emissor: "RPC Engine", receptor: "Fábrica Splash / Compras", falaEmissor: "Gerar Ordem de Compra para o casco da piscina sob encomenda!", falaReceptor: "Ordem de Compra gerada e vinculada à fábrica.", payload: { ordem: "oc-splash-882" } },
          { origem: "card-venda-id", destino: "card-os", pathId: "path-venda-os", emissor: "Pedido Confirmado", receptor: "Ordens de Serviço", falaEmissor: "Criando OS de Instalação: designando equipe técnica e eletricista.", falaReceptor: "OS aberta no painel operacional.", payload: { os: "OS-412" } }
        ]
      },
      ponto_equilibrio: {
        titulo: "Fechamento Mensal, DRE, Folha & Ponto de Equilíbrio",
        passos: [
          { origem: "card-funcionarios", destino: "card-contas-pagar", pathId: "path-compra-pagar", emissor: "RH & Folha", receptor: "Contas a Pagar", falaEmissor: "Folha de salários ativos apurada: R$ 14.200,00 no mês vigente.", falaReceptor: "Despesa fixa com pessoal registrada no Contas a Pagar.", payload: { total_salarios: 14200.00 } },
          { origem: "card-contas-pagar", destino: "card-dre", pathId: "path-pagar-fluxo", emissor: "Contas a Pagar", receptor: "DRE Gerencial", falaEmissor: "Total de Despesas Fixas (Salários + Aluguel + Energia): R$ 19.850,00.", falaReceptor: "Despesas fixas computadas no fechamento de competência do DRE.", payload: { despesas_fixas: 19850.00 } },
          { origem: "card-dre", destino: "card-indicadores", pathId: "path-dre-indicadores", emissor: "DRE Gerencial", receptor: "Indicadores / BI", falaEmissor: "Calculando Ponto de Equilíbrio: R$ 19.850 (Despesas Fixas) ÷ 0.40 (Margem) = R$ 49.625,00!", falaReceptor: "Ponto de Equilíbrio apurado: R$ 49.625,00.", payload: { pe_valor: 49625.00 } }
        ]
      },
      balcao_pix: {
        titulo: "Venda de Balcão: À Vista / PIX c/ Baixa Imediata",
        passos: [
          { origem: "card-venda-nova", destino: "card-venda-id", pathId: "path-venda-detalhe", emissor: "PDV Loja Física", receptor: "Pedido Confirmado", falaEmissor: "Venda de cloro e pastilhas no balcão por R$ 180,00 via PIX!", falaReceptor: "Pedido quitado na hora.", payload: { valor: 180.00, forma: "PIX" } },
          { origem: "card-venda-id", destino: "card-estoque", pathId: "path-rpc-estoque", emissor: "Venda Balcão", receptor: "Estoque Físico", falaEmissor: "Baixar 2x Baldes de Cloro da prateleira da loja.", falaReceptor: "Estoque físico deduzido.", payload: { qtd: 2 } },
          { origem: "card-venda-id", destino: "card-fluxo-caixa", pathId: "path-contas-fluxo", emissor: "Venda Balcão (PIX)", receptor: "Fluxo de Caixa", falaEmissor: "Dinheiro caiu na conta! Entrada de R$ 180,00 realizada.", falaReceptor: "Lançamento financeiro gerado com status 'Pago'.", payload: { valor: 180.00, status: "Pago" } }
        ]
      }
    };

    let cenarioAtualKey = "debito_credito";
    let passoIndex = 0;
    let timerSimulacao = null;
    let rodandoConversa = false;

    function trocarCenario(k) {
      pausarConversa();
      cenarioAtualKey = k;
      passoIndex = 0;
      limparDestaques();
      removerBaloes();
      const c = CENARIOS[cenarioAtualKey];
      document.getElementById('dialogo-passo-label').innerText = "Passo 1/" + c.passos.length + ":";
      document.getElementById('dialogo-status-texto').innerText = "Cenário: " + c.titulo;
    }

    function alternarConversa() {
      if (rodandoConversa) pausarConversa(); else iniciarConversa();
    }

    function iniciarConversa() {
      rodandoConversa = true;
      document.getElementById('btn-play-icon').innerText = "⏸️";
      document.getElementById('btn-play-text').innerText = "Pausar";
      executarPassoAtual();
    }

    function pausarConversa() {
      rodandoConversa = false;
      if (timerSimulacao) clearTimeout(timerSimulacao);
      document.getElementById('btn-play-icon').innerText = "▶️";
      document.getElementById('btn-play-text').innerText = "Conversar";
    }

    function reiniciarConversa() {
      pausarConversa();
      passoIndex = 0;
      iniciarConversa();
    }

    function proximoPassoConversa() {
      const c = CENARIOS[cenarioAtualKey];
      passoIndex = (passoIndex + 1) % c.passos.length;
      executarPassoAtual(false);
    }

    function executarPassoAtual(auto = true) {
      const c = CENARIOS[cenarioAtualKey];
      const p = c.passos[passoIndex];
      if (!p) return;

      limparDestaques();
      removerBaloes();

      document.getElementById('dialogo-passo-label').innerText = "Passo " + (passoIndex + 1) + "/" + c.passos.length + ":";
      document.getElementById('dialogo-status-texto').innerText = p.emissor + " ➔ " + p.receptor + ': "' + p.falaEmissor + '"';

      const elO = document.getElementById(p.origem);
      const elD = document.getElementById(p.destino);
      if (elO) elO.classList.add('node-speaking');
      if (elD) elD.classList.add('node-receiving');

      const elP = document.getElementById(p.pathId);
      if (elP) {
        elP.classList.add('vector-active');
        animarParticula(elP);
      }

      criarBalaoFala(elO, p.emissor, p.falaEmissor, true);
      setTimeout(() => criarBalaoFala(elD, p.receptor, p.falaReceptor, false), 600);

      adicionarLog(p);

      if (rodandoConversa && auto) {
        timerSimulacao = setTimeout(() => {
          if (passoIndex < c.passos.length - 1) {
            passoIndex++;
            executarPassoAtual(true);
          } else {
            pausarConversa();
            passoIndex = 0;
          }
        }, 3000);
      }
    }

    function criarBalaoFala(node, nome, texto, emissor) {
      if (!node) return;
      const b = document.createElement('div');
      b.className = "speech-bubble absolute z-40 max-w-xs p-2.5 rounded-xl text-xs shadow-2xl border pointer-events-auto " + (emissor ? 'bg-slate-900 border-emerald-500/80 text-emerald-100' : 'bg-slate-900 border-amber-500/80 text-amber-100');
      b.style.left = (node.offsetLeft - 15) + "px";
      b.style.top = (emissor ? node.offsetTop - 65 : node.offsetTop + node.offsetHeight + 10) + "px";
      b.innerHTML = '<div class="font-bold mb-0.5 ' + (emissor ? 'text-emerald-400' : 'text-amber-400') + '">' + (emissor ? '🗣️ ' : '👂 ') + nome + '</div><p class="text-[11px] leading-tight">' + texto + '</p>';
      document.getElementById('camada-baloes').appendChild(b);
    }

    function animarParticula(path) {
      if (!path) return;
      const camada = document.getElementById('camada-particulas');
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "6");
      circle.setAttribute("fill", "#38bdf8");
      circle.setAttribute("filter", "url(#glow-cyan)");
      const am = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      am.setAttribute("dur", "1.2s");
      am.setAttribute("repeatCount", "indefinite");
      am.setAttribute("rotate", "auto");
      const mp = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
      mp.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + path.id);
      mp.setAttribute("href", "#" + path.id);
      am.appendChild(mp);
      circle.appendChild(am);
      camada.appendChild(circle);
    }

    function adicionarLog(p) {
      const log = document.getElementById('terminal-log-content');
      const d = document.createElement('div');
      d.className = "p-1.5 rounded bg-slate-800/80 border border-slate-700/80";
      d.innerHTML = '<span class="text-emerald-400 font-bold">' + p.emissor + '</span> <span class="text-slate-500">➔</span> <span class="text-amber-400 font-bold">' + p.receptor + '</span>: ' + p.falaEmissor + ' <span class="text-slate-400 italic">↳ ' + p.falaReceptor + '</span>';
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }

    function limparDestaques() {
      document.querySelectorAll('.node-card').forEach(c => c.classList.remove('node-speaking', 'node-receiving'));
      document.querySelectorAll('path').forEach(p => p.classList.remove('vector-active'));
    }

    function removerBaloes() {
      document.getElementById('camada-baloes').innerHTML = '';
      document.getElementById('camada-particulas').innerHTML = '';
    }

    function ouvirVetor(pathId) {
      const c = CENARIOS[cenarioAtualKey];
      const p = c.passos.find(x => x.pathId === pathId);
      if (p) {
        passoIndex = c.passos.indexOf(p);
        executarPassoAtual(false);
      }
    }

    let zoom = 0.85, panX = 30, panY = 20, isDragging = false, startX, startY;
    const cont = document.getElementById('viewport-container');
    const content = document.getElementById('canvas-content');
    function updateT() { content.style.transform = "translate(" + panX + "px, " + panY + "px) scale(" + zoom + ")"; }
    function alterarZoom(d) { zoom = Math.min(Math.max(0.4, zoom + d), 2.0); updateT(); }
    function resetarZoom() { zoom = 0.85; panX = 30; panY = 20; updateT(); }
    cont.addEventListener('mousedown', e => { if (e.target.closest('button') || e.target.closest('select')) return; isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY; });
    window.addEventListener('mousemove', e => { if (!isDragging) return; panX = e.clientX - startX; panY = e.clientY - startY; updateT(); });
    window.addEventListener('mouseup', () => isDragging = false);
  </script>
</body>
</html>`;
