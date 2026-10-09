import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { hojeISO } from "@/lib/erp";

export const RECORRENCIAS = [
  { valor: "nenhuma", rotulo: "Pagamento único (sem recorrência)" },
  { valor: "diaria", rotulo: "Diária" },
  { valor: "semanal", rotulo: "Semanal" },
  { valor: "quinzenal", rotulo: "Quinzenal" },
  { valor: "mensal", rotulo: "Mensal" },
  { valor: "bimestral", rotulo: "Bimestral" },
  { valor: "trimestral", rotulo: "Trimestral" },
  { valor: "semestral", rotulo: "Semestral" },
  { valor: "anual", rotulo: "Anual" },
] as const;

export const rotuloRecorrencia = (v?: string | null) =>
  RECORRENCIAS.find((r) => r.valor === v)?.rotulo ?? null;

function formatarISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

function somarMeses(ano: number, mes: number, diaBase: number, incrementoMeses: number): string {
  // mes é 1-indexado
  const totalMeses = ano * 12 + (mes - 1) + incrementoMeses;
  const novoAno = Math.floor(totalMeses / 12);
  const novoMes = (totalMeses % 12) + 1;
  const maxDiasNoMes = new Date(novoAno, novoMes, 0).getDate();
  const diaFinal = Math.min(diaBase, maxDiasNoMes);
  return `${novoAno}-${String(novoMes).padStart(2, "0")}-${String(diaFinal).padStart(2, "0")}`;
}

/**
 * Calcula a próxima data a partir de uma data ISO (YYYY-MM-DD),
 * respeitando o dia base original (ex.: dia 19, dia 31).
 */
export function proximaDataRecorrencia(
  iso: string,
  recorrencia: string,
  diaOriginal?: number,
): string | null {
  if (!recorrencia || recorrencia === "nenhuma") return null;
  const partes = iso.slice(0, 10).split("-").map(Number);
  if (partes.length < 3 || Number.isNaN(partes[0])) return null;
  const [ano, mes, dia] = partes;
  const diaBase = diaOriginal ?? dia;

  switch (recorrencia) {
    case "diaria": {
      const d = new Date(ano, mes - 1, dia, 12);
      d.setDate(d.getDate() + 1);
      return formatarISO(d);
    }
    case "semanal": {
      const d = new Date(ano, mes - 1, dia, 12);
      d.setDate(d.getDate() + 7);
      return formatarISO(d);
    }
    case "quinzenal": {
      const d = new Date(ano, mes - 1, dia, 12);
      d.setDate(d.getDate() + 15);
      return formatarISO(d);
    }
    case "mensal":
      return somarMeses(ano, mes, diaBase, 1);
    case "bimestral":
      return somarMeses(ano, mes, diaBase, 2);
    case "trimestral":
      return somarMeses(ano, mes, diaBase, 3);
    case "semestral":
      return somarMeses(ano, mes, diaBase, 6);
    case "anual":
      return somarMeses(ano, mes, diaBase, 12);
    default:
      return null;
  }
}

/**
 * Gera todas as datas de recorrência a partir de uma data inicial até o limite:
 * - Se fim for fornecido, respeita o fim;
 * - Se não, projeta pelo menos 12 meses à frente da data de hoje;
 * - Limite seguro de iterações para evitar loops infinitos.
 */
export function gerarDatasRecorrentes(
  inicio: string,
  recorrencia: string,
  fim: string | null = null,
  horizonteMeses: number = 12,
): string[] {
  if (!recorrencia || recorrencia === "nenhuma") return [];
  const datas: string[] = [];
  const [hojeAno, hojeMes, hojeDia] = hojeISO().split("-").map(Number);
  const dataHoje = new Date(hojeAno, hojeMes - 1, hojeDia, 12);
  const limiteMax = new Date(dataHoje);
  limiteMax.setMonth(limiteMax.getMonth() + horizonteMeses);
  const limiteISO = formatarISO(limiteMax);
  const dataFinal = fim && fim < limiteISO ? fim : limiteISO;

  const diaOriginal = Number(inicio.slice(8, 10)) || 1;
  let atual = inicio;
  const maxIter = 60;
  let count = 0;

  while (count < maxIter) {
    const prox = proximaDataRecorrencia(atual, recorrencia, diaOriginal);
    if (!prox) break;
    if (prox > dataFinal) break;
    datas.push(prox);
    atual = prox;
    count++;
  }

  return datas;
}

/**
 * Sincroniza e garante todas as parcelas recorrentes pendentes:
 * 1. Converte qualquer registro ativo em despesas_recorrentes para contas;
 * 2. Projeta qualquer conta existente com recorrência ativa até pelo menos hoje + 12 meses;
 * 3. Garante que títulos como "Santander Financiamentos" / "Parcela do carro" tenham suas parcelas geradas.
 */
export async function sincronizarRecorrenciasContas(
  supabase: SupabaseClient<Database>,
): Promise<{ inseridas: number }> {
  let inseridas = 0;

  try {
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id ?? null;

    // 1. Despesas Recorrentes cadastradas na tabela despesas_recorrentes
    const { data: despesasRec = [] } = await supabase
      .from("despesas_recorrentes")
      .select("*")
      .eq("ativo", true);

    // 2. Contas existentes para evitar duplicidade
    const { data: contasExistentes = [] } = await supabase
      .from("contas")
      .select("id, tipo, descricao, parceiro, vencimento, recorrencia, recorrencia_fim, recorrencia_id, competencia_recorrencia, status");

    const mapaContas = new Set<string>();
    for (const c of contasExistentes) {
      if (c.recorrencia_id && c.competencia_recorrencia) {
        mapaContas.add(`rec:${c.recorrencia_id}:${String(c.competencia_recorrencia).slice(0, 7)}`);
      }
      mapaContas.add(
        `desc:${(c.tipo || "pagar").toLowerCase()}:::${(c.descricao || "").trim().toLowerCase()}:::${String(c.vencimento).slice(0, 10)}`,
      );
    }

    // Processa despesas_recorrentes
    const novasContasDespesas: Database["public"]["Tables"]["contas"]["Insert"][] = [];
    const hoje = hojeISO();
    const [hAno, hMes] = hoje.split("-").map(Number);

    for (const r of despesasRec || []) {
      const inicioPartes = String(r.inicio).slice(0, 10).split("-").map(Number);
      const anoIni = inicioPartes[0] || hAno;
      const mesIni = inicioPartes[1] || hMes;
      const diaVenc = Math.max(1, Math.min(31, Number(r.dia_vencimento) || 5));

      // Gera competências de início até hoje + 12 meses (ou r.fim)
      const limiteMeses = 12;
      const totalMesesGerar = (hAno - anoIni) * 12 + (hMes - mesIni) + limiteMeses;

      for (let m = 0; m <= Math.min(totalMesesGerar, 36); m++) {
        const compTotal = anoIni * 12 + (mesIni - 1) + m;
        const compAno = Math.floor(compTotal / 12);
        const compMes = (compTotal % 12) + 1;
        const compISO = `${compAno}-${String(compMes).padStart(2, "0")}-01`;

        const maxDias = new Date(compAno, compMes, 0).getDate();
        const diaReal = Math.min(diaVenc, maxDias);
        const vencISO = `${compAno}-${String(compMes).padStart(2, "0")}-${String(diaReal).padStart(2, "0")}`;

        if (vencISO < r.inicio) continue;
        if (r.fim && vencISO > r.fim) break;

        const chaveRec = `rec:${r.id}:${compISO.slice(0, 7)}`;
        const chaveDesc = `desc:pagar:::${r.descricao.trim().toLowerCase()}:::${vencISO}`;

        if (!mapaContas.has(chaveRec) && !mapaContas.has(chaveDesc)) {
          novasContasDespesas.push({
            tipo: "pagar",
            descricao: r.descricao.trim(),
            parceiro: r.parceiro || null,
            categoria: r.categoria,
            valor: Number(r.valor),
            valor_juros: 0,
            vencimento: vencISO,
            status: "aberto",
            recorrencia: "mensal",
            recorrencia_fim: r.fim || null,
            recorrencia_id: r.id,
            competencia_recorrencia: compISO,
            obra_id: r.obra_id || null,
            created_by: uid,
          });
          mapaContas.add(chaveRec);
          mapaContas.add(chaveDesc);
        }
      }
    }

    if (novasContasDespesas.length > 0) {
      const { error: errIns } = await supabase.from("contas").insert(novasContasDespesas);
      if (!errIns) inseridas += novasContasDespesas.length;
    }

    // 3. Contas com recorrencia != 'nenhuma' cadastradas diretamente em contas
    const contasRecorrentes = (contasExistentes || []).filter(
      (c) => c.recorrencia && c.recorrencia !== "nenhuma",
    );

    // Agrupa por série (tipo + descricao + parceiro)
    const series = new Map<string, typeof contasRecorrentes>();
    for (const c of contasRecorrentes) {
      const chaveSerie = `${(c.tipo || "pagar").toLowerCase()}:::${(c.descricao || "").trim().toLowerCase()}:::${(c.parceiro || "").trim().toLowerCase()}`;
      const grupo = series.get(chaveSerie) ?? [];
      grupo.push(c);
      series.set(chaveSerie, grupo);
    }

    const novasContasSeries: Database["public"]["Tables"]["contas"]["Insert"][] = [];

    for (const [, itens] of series.entries()) {
      // Ordena por vencimento
      itens.sort((a, b) => String(a.vencimento).localeCompare(String(b.vencimento)));
      const base = itens[0];
      const ultimo = itens[itens.length - 1];
      const rec = base.recorrencia as string;
      const fim = base.recorrencia_fim || ultimo.recorrencia_fim || null;

      // Gera as próximas parcelas a partir do último vencimento registrado
      const futuras = gerarDatasRecorrentes(ultimo.vencimento, rec, fim, 12);

      for (const fVenc of futuras) {
        const chaveDesc = `desc:${(base.tipo || "pagar").toLowerCase()}:::${(base.descricao || "").trim().toLowerCase()}:::${fVenc}`;
        if (!mapaContas.has(chaveDesc)) {
          novasContasSeries.push({
            tipo: base.tipo,
            descricao: base.descricao,
            parceiro: base.parceiro || null,
            categoria: (base as { categoria?: string | null }).categoria || null,
            valor: (base as { valor?: number }).valor ?? 0,
            valor_juros: 0,
            vencimento: fVenc,
            status: "aberto",
            recorrencia: rec,
            recorrencia_fim: fim,
            recorrencia_id: base.recorrencia_id || null,
            obra_id: (base as { obra_id?: string | null }).obra_id || null,
            funcionario_id: (base as { funcionario_id?: string | null }).funcionario_id || null,
            cliente_id: (base as { cliente_id?: string | null }).cliente_id || null,
            numero_documento: (base as { numero_documento?: string | null }).numero_documento || null,
            conta_bancaria: (base as { conta_bancaria?: string | null }).conta_bancaria || null,
            tipo_despesa: (base as { tipo_despesa?: string | null }).tipo_despesa || null,
            observacoes: (base as { observacoes?: string | null }).observacoes || null,
            created_by: uid,
          });
          mapaContas.add(chaveDesc);
        }
      }
    }

    if (novasContasSeries.length > 0) {
      const { error: errSeries } = await supabase.from("contas").insert(novasContasSeries);
      if (!errSeries) inseridas += novasContasSeries.length;
    }
  } catch (err) {
    console.error("Erro ao sincronizar recorrências:", err);
  }

  return { inseridas };
}
