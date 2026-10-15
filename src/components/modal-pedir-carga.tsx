import { useEffect, useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Building2,
  PackageCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  Users,
  Search,
  ShoppingCart,
  Boxes,
  Maximize2,
  Minimize2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR, hojeISO, proximoCodigo } from "@/lib/erp";
import {
  ManifestoCargaModal,
  type CargaManifestoDados,
  type ItemCargaManifesto,
} from "@/components/manifesto-carga-modal";

const normalizar = (valor: string) =>
  (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

interface Fornecedor {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cnpj?: string | null;
}

interface ItemPendente {
  id: string;
  ordem_id: string;
  ordem_numero: string | null;
  cliente_id: string | null;
  cliente_nome: string;
  produto_id: string | null;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  fornecedor_id: string | null;
  fornecedor_nome: string;
}

export interface ItemConsolidado {
  chave: string;
  cliente_id: string | null;
  cliente_nome: string;
  produto_id: string | null;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  ordem_numeros: string[];
  ordem_ids: string[];
  itensOriginais: (ItemPendente & {
    carga_id?: string | null;
    status_carga?: string | null;
    ordem_status?: string;
  })[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedorInicialId?: string | null;
  itensIniciaisIds?: string[];
}

export function ModalPedirCarga({
  open,
  onOpenChange,
  fornecedorInicialId,
  itensIniciaisIds,
}: Props) {
  const qc = useQueryClient();
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);
  const [fornecedorId, setFornecedorId] = useState<string>(fornecedorInicialId || "");
  const [itensSelecionados, setItensSelecionados] = useState<Record<string, boolean>>({});
  const [valoresUnitarios, setValoresUnitarios] = useState<Record<string, number>>({});
  const [linhasExpandidas, setLinhasExpandidas] = useState<Record<string, boolean>>({});
  const [busca, setBusca] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (open) {
      if (fornecedorInicialId) {
        setFornecedorId(fornecedorInicialId);
        setPasso(2); // Migra diretamente para a aba OCs Pendentes do Fornecedor
      } else {
        setPasso(1);
      }
      setValoresUnitarios({});
      setLinhasExpandidas({});
    }
  }, [open, fornecedorInicialId]);

  // Dados do formulário de fechamento (Passo 4)
  const [previsaoEntrega, setPrevisaoEntrega] = useState("");
  const [placaVeiculo, setPlacaVeiculo] = useState("");
  const [motoristaContato, setMotoristaContato] = useState("");
  const [volumeCubagem, setVolumeCubagem] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Estado para visualização do manifesto logo após criação
  const [manifestoAberto, setManifestoAberto] = useState(false);
  const [cargaCriada, setCargaCriada] = useState<CargaManifestoDados | null>(null);

  // 1. Carrega fornecedores ativos
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores", "lista-cargas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("id, nome, email, telefone, cnpj")
        .order("nome");
      if (error) throw error;
      return data as Fornecedor[];
    },
  });

  const fornecedoresCompletos = useMemo(() => {
    const lista = [...fornecedores];
    const temAnalandia = lista.some(
      (f) =>
        normalizar(f.nome).includes("analandia") ||
        normalizar(f.nome).includes("analândia"),
    );
    if (!temAnalandia) {
      lista.unshift({ id: "analandia", nome: "Analândia" });
    }
    const temProgeu = lista.some((f) => normalizar(f.nome).includes("progeu"));
    if (!temProgeu) {
      lista.push({ id: "progeu", nome: "Progeu" });
    }
    return lista;
  }, [fornecedores]);

  // 2. Carrega produtos simples para verificar categorias (casco piscina vs acessórios/bombas/filtros)
  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", "lista-simples-cargas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("id, nome, categoria, tipo, fornecedor_id")
        .order("nome");
      if (error) throw error;
      return data as {
        id: string;
        nome: string;
        categoria: string | null;
        tipo: string | null;
        fornecedor_id: string | null;
      }[];
    },
  });

  const produtosMap = useMemo(() => {
    return new Map(produtos.map((p) => [p.id, p]));
  }, [produtos]);

  // 3. Carrega ordens de compra e seus itens pendentes de carga
  const { data: itensTodos = [] } = useQuery({
    queryKey: ["ordem_compra_itens", "pendentes-carga"],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordem_compra_itens")
        .select(`
          id,
          ordem_id,
          cliente_id,
          cliente_nome,
          produto_id,
          descricao,
          quantidade,
          valor_unitario,
          total,
          carga_id,
          status_carga,
          ordens_compra:ordem_id (
            id,
            numero,
            fornecedor_id,
            fornecedor_nome,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        ordem_id: row.ordem_id,
        ordem_numero: row.ordens_compra?.numero || "O.C.",
        cliente_id: row.cliente_id,
        cliente_nome: row.cliente_nome || "Estoque Geral",
        produto_id: row.produto_id,
        produto_nome: row.descricao,
        quantidade: Number(row.quantidade || 1),
        valor_unitario: Number(row.valor_unitario || 0),
        valor_total: Number(row.total || 0),
        fornecedor_id: row.ordens_compra?.fornecedor_id,
        fornecedor_nome: row.ordens_compra?.fornecedor_nome || "Fornecedor não identificado",
        carga_id: row.carga_id,
        status_carga: row.status_carga,
        ordem_status: row.ordens_compra?.status,
      })) as (ItemPendente & { carga_id?: string | null; status_carga?: string | null; ordem_status?: string })[];
    },
  });

  // Filtra itens que ainda não foram consolidados em nenhuma carga
  const itensPendentes = useMemo(() => {
    return itensTodos.filter((item) => {
      // Ignora ordens canceladas ou já em carga
      if (item.ordem_status === "cancelada") return false;
      if (item.carga_id) return false;
      if (item.status_carga && item.status_carga !== "pendente_carga") return false;
      return true;
    });
  }, [itensTodos]);

  // Resolução inteligente de fornecedor por item (garante Progeu para bombas/filtros/acessórios e Analândia para cascos)
  const resolverFornecedorItem = useCallback(
    (item: ItemPendente) => {
      const prod = item.produto_id ? produtosMap.get(item.produto_id) : null;
      const desc = normalizar(item.produto_nome || prod?.nome || "");
      const categ = normalizar(prod?.categoria || "");
      const tipo = normalizar(prod?.tipo || "");

      const ehPiscina =
        categ.includes("piscina") ||
        desc.includes("piscina") ||
        tipo.includes("casco");

      const fornNome = normalizar(item.fornecedor_nome || "");
      const fornId = (item.fornecedor_id || "").toLowerCase();

      const progeuForn = fornecedoresCompletos.find((f) =>
        normalizar(f.nome).includes("progeu"),
      );
      const analandiaForn = fornecedoresCompletos.find(
        (f) =>
          normalizar(f.nome).includes("analandia") ||
          normalizar(f.nome).includes("analândia"),
      );

      // Se for explicitamente Progeu
      if (fornNome.includes("progeu") || fornId.includes("progeu")) {
        return progeuForn?.id || "progeu";
      }

      // Se a ordem foi marcada como Analândia mas NÃO é piscina (ex: bomba, filtro, acessório)
      if ((fornNome.includes("analand") || fornId.includes("analand")) && !ehPiscina) {
        return progeuForn?.id || "progeu";
      }

      // Se for piscina -> Analândia
      if (ehPiscina) {
        return analandiaForn?.id || "analandia";
      }

      // Se tem fornecedor_id e existe na lista
      if (item.fornecedor_id) {
        const fExistente = fornecedoresCompletos.find((f) => f.id === item.fornecedor_id);
        if (fExistente) {
          if (
            (normalizar(fExistente.nome).includes("analandia") ||
              normalizar(fExistente.nome).includes("analândia")) &&
            !ehPiscina
          ) {
            return progeuForn?.id || "progeu";
          }
          return fExistente.id;
        }
      }

      // Fallback inteligente padrão: não é piscina -> Progeu
      return progeuForn?.id || "progeu";
    },
    [fornecedoresCompletos, produtosMap],
  );

  const itemPertenceAoFornecedor = useCallback(
    (item: ItemPendente, fornId: string) => {
      if (!fornId) return false;
      const fornAlvo = fornecedoresCompletos.find((f) => f.id === fornId);
      const fornAlvoNome = normalizar(fornAlvo?.nome || "");
      const alvoEhProgeu = fornId === "progeu" || fornAlvoNome.includes("progeu");
      const alvoEhAnalandia =
        fornId === "analandia" ||
        fornAlvoNome.includes("analandia") ||
        fornAlvoNome.includes("analândia");

      const resId = resolverFornecedorItem(item);
      if (resId === fornId) return true;

      const resForn = fornecedoresCompletos.find((f) => f.id === resId);
      const resFornNome = normalizar(resForn?.nome || "");

      if (alvoEhProgeu && (resId === "progeu" || resFornNome.includes("progeu"))) {
        return true;
      }
      if (
        alvoEhAnalandia &&
        (resId === "analandia" ||
          resFornNome.includes("analandia") ||
          resFornNome.includes("analândia"))
      ) {
        return true;
      }

      return false;
    },
    [fornecedoresCompletos, resolverFornecedorItem],
  );

  // Contadores por fornecedor para o Passo 1
  const contagemPorFornecedor = useMemo(() => {
    const mapa = new Map<
      string,
      { totalItens: number; totalOcs: Set<string>; totalValor: number }
    >();

    for (const item of itensPendentes) {
      const fId = resolverFornecedorItem(item);
      const fornObj = fornecedoresCompletos.find((f) => f.id === fId);
      const chaveForn = fornObj?.id || fId;

      const atual = mapa.get(chaveForn) ?? {
        totalItens: 0,
        totalOcs: new Set<string>(),
        totalValor: 0,
      };
      atual.totalItens += item.quantidade;
      if (item.ordem_numero) atual.totalOcs.add(item.ordem_numero);
      atual.totalValor += item.valor_total;
      mapa.set(chaveForn, atual);

      if (fornObj) {
        if (normalizar(fornObj.nome).includes("progeu")) {
          for (const f of fornecedoresCompletos) {
            if (normalizar(f.nome).includes("progeu") && f.id !== chaveForn) {
              const a = mapa.get(f.id) ?? { totalItens: 0, totalOcs: new Set<string>(), totalValor: 0 };
              a.totalItens += item.quantidade;
              if (item.ordem_numero) a.totalOcs.add(item.ordem_numero);
              a.totalValor += item.valor_total;
              mapa.set(f.id, a);
            }
          }
        }
        if (
          normalizar(fornObj.nome).includes("analandia") ||
          normalizar(fornObj.nome).includes("analândia")
        ) {
          for (const f of fornecedoresCompletos) {
            if (
              (normalizar(f.nome).includes("analandia") ||
                normalizar(f.nome).includes("analândia")) &&
              f.id !== chaveForn
            ) {
              const a = mapa.get(f.id) ?? { totalItens: 0, totalOcs: new Set<string>(), totalValor: 0 };
              a.totalItens += item.quantidade;
              if (item.ordem_numero) a.totalOcs.add(item.ordem_numero);
              a.totalValor += item.valor_total;
              mapa.set(f.id, a);
            }
          }
        }
      }
    }
    return mapa;
  }, [itensPendentes, resolverFornecedorItem, fornecedoresCompletos]);

  // Fornecedor selecionado
  const fornecedorAtual = useMemo(() => {
    if (!fornecedorId) return null;
    return (
      fornecedoresCompletos.find(
        (f) =>
          f.id === fornecedorId ||
          (fornecedorId === "progeu" && normalizar(f.nome).includes("progeu")) ||
          (fornecedorId === "analandia" &&
            (normalizar(f.nome).includes("analandia") ||
              normalizar(f.nome).includes("analândia"))),
      ) ?? null
    );
  }, [fornecedoresCompletos, fornecedorId]);

  // Agrupamento consolidado: consolida produtos idênticos vinculados ao mesmo cliente em uma única linha somando as quantidades
  const itensConsolidados = useMemo(() => {
    if (!fornecedorAtual) return [];

    const itensDoForn = itensPendentes.filter((item) =>
      itemPertenceAoFornecedor(item, fornecedorAtual.id),
    );

    const mapa = new Map<string, ItemConsolidado>();

    for (const item of itensDoForn) {
      const clienteKey = (item.cliente_id || normalizar(item.cliente_nome || "estoque")).trim();
      const produtoKey = (item.produto_id || normalizar(item.produto_nome || "")).trim();
      const chave = `${clienteKey}:::${produtoKey}`;

      const existente = mapa.get(chave);
      if (existente) {
        existente.quantidade += item.quantidade;
        existente.valor_total += item.valor_total;
        if (item.ordem_numero && !existente.ordem_numeros.includes(item.ordem_numero)) {
          existente.ordem_numeros.push(item.ordem_numero);
        }
        if (item.ordem_id && !existente.ordem_ids.includes(item.ordem_id)) {
          existente.ordem_ids.push(item.ordem_id);
        }
        existente.itensOriginais.push(item);
      } else {
        mapa.set(chave, {
          chave,
          cliente_id: item.cliente_id,
          cliente_nome: item.cliente_nome || "Estoque Geral",
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade: item.quantidade,
          valor_unitario: item.valor_unitario,
          valor_total: item.valor_total,
          ordem_numeros: item.ordem_numero ? [item.ordem_numero] : [],
          ordem_ids: item.ordem_id ? [item.ordem_id] : [],
          itensOriginais: [item],
        });
      }
    }

    return Array.from(mapa.values());
  }, [itensPendentes, fornecedorAtual, itemPertenceAoFornecedor]);

  // Sincroniza pré-seleção dos itens iniciais (ou de todos) com as linhas consolidadas
  useEffect(() => {
    if (!open) return;
    if (itensIniciaisIds && itensIniciaisIds.length > 0) {
      const mapa: Record<string, boolean> = {};
      for (const item of itensConsolidados) {
        const foiMarcado =
          itensIniciaisIds.includes(item.chave) ||
          item.itensOriginais.some((orig) => itensIniciaisIds.includes(orig.id));
        if (foiMarcado) {
          mapa[item.chave] = true;
        }
      }
      setItensSelecionados(mapa);
    } else if (fornecedorInicialId && itensConsolidados.length > 0) {
      setItensSelecionados((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        const mapa: Record<string, boolean> = {};
        for (const item of itensConsolidados) mapa[item.chave] = true;
        return mapa;
      });
    }
  }, [open, itensIniciaisIds, itensConsolidados, fornecedorInicialId]);

  // Itens consolidados filtrados pela busca
  const itensConsolidadosFiltrados = useMemo(() => {
    if (!busca.trim()) return itensConsolidados;
    const termo = busca.toLowerCase();
    return itensConsolidados.filter(
      (item) =>
        item.produto_nome.toLowerCase().includes(termo) ||
        item.cliente_nome.toLowerCase().includes(termo) ||
        item.ordem_numeros.some((num) => num.toLowerCase().includes(termo)),
    );
  }, [itensConsolidados, busca]);

  // Itens consolidados efetivamente marcados para entrarem na carga
  const itensConsolidadosMarcados = useMemo(() => {
    return itensConsolidados.filter((item) => itensSelecionados[item.chave] === true);
  }, [itensConsolidados, itensSelecionados]);

  const getValorUnitarioConsolidado = (item: ItemConsolidado) => {
    if (valoresUnitarios[item.chave] !== undefined) {
      return valoresUnitarios[item.chave];
    }
    return item.valor_unitario;
  };

  const getTotalConsolidado = (item: ItemConsolidado) => {
    const unit = getValorUnitarioConsolidado(item);
    return unit * item.quantidade;
  };

  const atualizarValorUnitarioGrupo = async (
    item: ItemConsolidado,
    novoValor: number,
  ) => {
    try {
      for (const orig of item.itensOriginais) {
        const novoTotalItem = novoValor * orig.quantidade;
        await supabase
          .from("ordem_compra_itens")
          .update({
            valor_unitario: novoValor,
            total: novoTotalItem,
          })
          .eq("id", orig.id);
      }
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      toast.success(
        `Valor unitário de "${item.produto_nome}" atualizado para ${brl(novoValor)}`,
      );
    } catch (err: any) {
      console.error("Erro ao atualizar valor unitário consolidado:", err);
      toast.error("Erro ao atualizar valor unitário: " + (err?.message || ""));
    }
  };

  const totalItensMarcados = itensConsolidadosMarcados.reduce(
    (sum, item) => sum + item.quantidade,
    0,
  );
  const totalValorMarcado = itensConsolidadosMarcados.reduce(
    (sum, item) => sum + getTotalConsolidado(item),
    0,
  );
  const clientesAtendidos = Array.from(
    new Set(itensConsolidadosMarcados.map((i) => i.cliente_nome)),
  );

  const todosFiltradosMarcados =
    itensConsolidadosFiltrados.length > 0 &&
    itensConsolidadosFiltrados.every((i) => itensSelecionados[i.chave]);

  const marcarTodosItens = (marcar: boolean) => {
    setItensSelecionados((atual) => {
      const proximo = { ...atual };
      for (const item of itensConsolidadosFiltrados) {
        if (marcar) {
          proximo[item.chave] = true;
        } else {
          delete proximo[item.chave];
        }
      }
      return proximo;
    });
  };

  const toggleExpandir = (chave: string) => {
    setLinhasExpandidas((prev) => ({
      ...prev,
      [chave]: !prev[chave],
    }));
  };

  // Mutação para criar a carga e fechar o lote
  const criarCargaMutation = useMutation({
    mutationFn: async () => {
      if (!fornecedorAtual) throw new Error("Selecione um fornecedor");
      if (itensConsolidadosMarcados.length === 0) {
        throw new Error("Selecione ao menos um item para a carga");
      }

      const { data: auth } = await supabase.auth.getUser();

      // Busca próximo número sequencial de carga (CRG-001, CRG-002...)
      const { data: cargasExistentes } = await (supabase as any)
        .from("cargas")
        .select("numero");
      const numeros = (cargasExistentes ?? []).map((c: any) => c.numero);
      const numeroCarga = proximoCodigo("CRG", numeros);

      // Snapshot dos itens consolidados com valores atualizados para o manifesto
      const itensSnapshot: ItemCargaManifesto[] = itensConsolidadosMarcados.map((item) => ({
        ordem_numero: item.ordem_numeros.join(", "),
        cliente_nome: item.cliente_nome,
        produto_nome: item.produto_nome,
        quantidade: item.quantidade,
        valor_unitario: getValorUnitarioConsolidado(item),
        valor_total: getTotalConsolidado(item),
      }));

      // 1. Cria a carga
      const { data: novaCarga, error: erroCarga } = await (supabase as any)
        .from("cargas")
        .insert({
          numero: numeroCarga,
          fornecedor_id: fornecedorAtual.id,
          fornecedor_nome: fornecedorAtual.nome,
          data_solicitacao: hojeISO(),
          previsao_entrega: previsaoEntrega || null,
          status: "solicitada",
          total_itens: totalItensMarcados,
          total_valor: totalValorMarcado,
          volume_cubagem: volumeCubagem.trim() || null,
          placa_veiculo: placaVeiculo.trim() || null,
          motorista_contato: motoristaContato.trim() || null,
          observacoes: observacoes.trim() || null,
          itens_snapshot: itensSnapshot,
          created_by: auth.user?.id ?? null,
        })
        .select("id, numero")
        .single();

      if (erroCarga) throw erroCarga;

      const cargaId = novaCarga.id;

      // 2. Insere itens na tabela cargas_itens com valores atualizados
      const payloadItens = itensConsolidadosMarcados.flatMap((itemConsolidado) => {
        const unitario = getValorUnitarioConsolidado(itemConsolidado);
        return itemConsolidado.itensOriginais.map((orig) => ({
          carga_id: cargaId,
          ordem_id: orig.ordem_id,
          item_ordem_id: orig.id,
          cliente_id: orig.cliente_id,
          cliente_nome: orig.cliente_nome,
          produto_id: orig.produto_id,
          produto_nome: orig.produto_nome,
          quantidade: orig.quantidade,
          valor_unitario: unitario,
          valor_total: unitario * orig.quantidade,
        }));
      });

      const { error: erroItens } = await (supabase as any)
        .from("cargas_itens")
        .insert(payloadItens);
      if (erroItens) throw erroItens;

      // 3. Atualiza ordem_compra_itens para em_carga e sincroniza valor_unitario e total editados
      for (const itemConsolidado of itensConsolidadosMarcados) {
        const unitario = getValorUnitarioConsolidado(itemConsolidado);
        for (const orig of itemConsolidado.itensOriginais) {
          const vlTotal = unitario * orig.quantidade;
          const { error: erroUpItens } = await supabase
            .from("ordem_compra_itens")
            .update({
              carga_id: cargaId,
              status_carga: "em_carga",
              valor_unitario: unitario,
              total: vlTotal,
            } as any)
            .eq("id", orig.id);
          if (erroUpItens) throw erroUpItens;
        }
      }

      // 4. Atualiza ordens_compra relacionadas como Comprado / Em Trânsito
      const idsOrdens = Array.from(
        new Set(
          itensConsolidadosMarcados.flatMap((i) =>
            i.itensOriginais.map((orig) => orig.ordem_id),
          ),
        ),
      );
      for (const ordemId of idsOrdens) {
        await supabase
          .from("ordens_compra")
          .update({
            carga_id: cargaId,
            status: "comprado",
            status_carga: "em_transito",
          } as any)
          .eq("id", ordemId);
      }

      // 5. Atualiza status dos produtos marcados
      const idsProdutos = Array.from(
        new Set(
          itensConsolidadosMarcados
            .flatMap((i) => i.itensOriginais.map((orig) => orig.produto_id))
            .filter(Boolean),
        ),
      ) as string[];
      if (idsProdutos.length > 0) {
        await supabase
          .from("produtos")
          .update({ status_compra: "comprado" })
          .in("id", idsProdutos);
      }

      return {
        id: cargaId,
        numero: numeroCarga,
        fornecedor_nome: fornecedorAtual.nome,
        data_solicitacao: hojeISO(),
        previsao_entrega: previsaoEntrega,
        status: "solicitada",
        total_itens: totalItensMarcados,
        total_valor: totalValorMarcado,
        volume_cubagem: volumeCubagem,
        placa_veiculo: placaVeiculo,
        motorista_contato: motoristaContato,
        observacoes: observacoes,
        itens: itensSnapshot,
      } as CargaManifestoDados;
    },
    onSuccess: (dados) => {
      toast.success(
        `Ordem executada e Carga #${dados.numero} gerada com sucesso! Itens marcados como Comprado / Em Trânsito.`,
      );
      qc.invalidateQueries({ queryKey: ["cargas"] });
      qc.invalidateQueries({ queryKey: ["ordens_compra"] });
      qc.invalidateQueries({ queryKey: ["ordem_compra_itens"] });
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples"] });
      qc.invalidateQueries({ queryKey: ["produtos", "lista-simples-cargas"] });
      qc.invalidateQueries({ queryKey: ["venda_itens", "consumo-compras"] });

      setCargaCriada(dados);
      setManifestoAberto(true);
      onOpenChange(false);
      resetar();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const resetar = () => {
    setPasso(1);
    setFornecedorId("");
    setItensSelecionados({});
    setLinhasExpandidas({});
    setBusca("");
    setPrevisaoEntrega("");
    setPlacaVeiculo("");
    setMotoristaContato("");
    setVolumeCubagem("");
    setObservacoes("");
  };

  const handleNext = () => {
    if (passo === 1) {
      if (!fornecedorId) {
        toast.error("Selecione um fornecedor para continuar");
        return;
      }
      // Marca todos os itens consolidados deste fornecedor por padrão
      const mapa: Record<string, boolean> = {};
      for (const item of itensConsolidados) mapa[item.chave] = true;
      setItensSelecionados(mapa);
      setPasso(2);
    } else if (passo === 2 || passo === 3) {
      if (itensConsolidadosMarcados.length === 0) {
        toast.error("Selecione ao menos um produto para entrar no caminhão");
        return;
      }
      setPasso(4);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) resetar();
          onOpenChange(v);
        }}
      >
        <DialogContent
          className={cn(
            "overflow-y-auto transition-all duration-200",
            isMaximized
              ? "fixed inset-2 md:inset-4 max-w-none w-[calc(100vw-1rem)] md:w-[calc(100vw-2rem)] h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] max-h-none z-50 flex flex-col"
              : "max-h-[92vh] sm:max-w-4xl",
          )}
        >
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Truck className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold">
                    📦 Pedir Carga · Fechamento de Lote
                  </DialogTitle>
                  <DialogDescription>
                    Consolide Ordens de Compra por fornecedor em um manifesto único de transporte.
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mr-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-primary"
                  title={isMaximized ? "Reduzir tela (Esc)" : "Expandir para tela cheia"}
                  onClick={() => setIsMaximized((v) => !v)}
                >
                  {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </Button>
              </div>
            </div>

            {/* STEPPER / PROGRESSO */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t">
              {[
                { step: 1, label: "1. Fornecedor" },
                { step: 2, label: "2. OCs Pendentes" },
                { step: 3, label: "3. Seleção de Carga" },
                { step: 4, label: "4. Fechamento" },
              ].map(({ step, label }) => (
                <div
                  key={step}
                  onClick={() => {
                    if (step < passo) setPasso(step as any);
                  }}
                  className={`flex items-center justify-center p-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    passo === step
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : passo > step
                        ? "bg-muted text-foreground hover:bg-muted/80"
                        : "bg-muted/30 text-muted-foreground opacity-60"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </DialogHeader>

          {/* CONTEÚDO DOS PASSOS */}
          <div className="space-y-4 py-2">
            {/* PASSO 1: SELEÇÃO DO FORNECEDOR */}
            {passo === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">
                    Passo 1: Selecione o Fornecedor de Origem
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Escolha de qual fábrica ou distribuidor os produtos serão carregados no caminhão.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {fornecedoresCompletos.map((forn) => {
                    const stats = contagemPorFornecedor.get(forn.id);
                    const temPendencias = Boolean(stats && stats.totalItens > 0);
                    const isSelected = fornecedorId === forn.id;

                    return (
                      <Card
                        key={forn.id}
                        onClick={() => setFornecedorId(forn.id)}
                        className={`cursor-pointer transition-all border ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                            : temPendencias
                              ? "hover:border-foreground/30 hover:bg-muted/20"
                              : "opacity-60 bg-muted/10"
                        }`}
                      >
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Building2
                                className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                              />
                              <span className="font-bold text-sm leading-tight line-clamp-1">
                                {forn.nome}
                              </span>
                            </div>
                            {temPendencias ? (
                              <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 font-mono text-[10px]">
                                {stats?.totalItens} un.
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                Sem OCs
                              </Badge>
                            )}
                          </div>

                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>
                              OCs aguardando: <strong>{stats?.totalOcs.size ?? 0} pedidos</strong>
                            </p>
                            <p>
                              Valor estimado:{" "}
                              <strong className="text-foreground">
                                {brl(stats?.totalValor ?? 0)}
                              </strong>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASSO 2 & 3: LISTAGEM E SELEÇÃO DE PRODUTOS PARA A CARGA */}
            {(passo === 2 || passo === 3) && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <span>Passo {passo}: Produtos Pendentes de {fornecedorAtual?.nome}</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {itensConsolidados.length} itens consolidados ({itensConsolidados.reduce((s, i) => s + i.quantidade, 0)} un.)
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Itens idênticos do mesmo cliente consolidados em linha única. Marque quais produtos entrarão no caminhão.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente, OC ou produto..."
                      className="pl-8 h-8 text-xs"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                    />
                  </div>
                </div>

                {/* TABELA DE PRODUTOS */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs bg-muted/20">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={todosFiltradosMarcados}
                            onCheckedChange={(val) => marcarTodosItens(val === true)}
                          />
                        </TableHead>
                        <TableHead className="w-28">Ordem (O.C.)</TableHead>
                        <TableHead className="min-w-44">Cliente de Destino</TableHead>
                        <TableHead className="min-w-56">Produto / Modelo</TableHead>
                        <TableHead className="w-20 text-right">Qtd</TableHead>
                        <TableHead className="w-28 text-right">Valor Unit.</TableHead>
                        <TableHead className="w-28 text-right">Total</TableHead>
                        <TableHead className="w-24 text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itensConsolidadosFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                            Nenhum item pendente de carga encontrado para este fornecedor.
                          </TableCell>
                        </TableRow>
                      ) : (
                        itensConsolidadosFiltrados.map((item) => {
                          const isChecked = itensSelecionados[item.chave] === true;
                          const temMultiplos = item.itensOriginais.length > 1;
                          const estaExpandido = linhasExpandidas[item.chave] === true;

                          return (
                            <>
                              <TableRow
                                key={item.chave}
                                className={`text-xs cursor-pointer ${isChecked ? "bg-primary/5" : ""}`}
                                onClick={() => {
                                  setItensSelecionados((atual) => ({
                                    ...atual,
                                    [item.chave]: !atual[item.chave],
                                  }));
                                }}
                              >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(val) => {
                                      setItensSelecionados((atual) => ({
                                        ...atual,
                                        [item.chave]: val === true,
                                      }));
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="font-mono font-semibold">
                                  {item.ordem_numeros.length === 0 ? (
                                    "-"
                                  ) : item.ordem_numeros.length === 1 ? (
                                    item.ordem_numeros[0]
                                  ) : (
                                    <span title={item.ordem_numeros.join(", ")}>
                                      {item.ordem_numeros[0]}{" "}
                                      <span className="text-[10px] text-muted-foreground font-normal">
                                        +{item.ordem_numeros.length - 1}
                                      </span>
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium text-foreground">
                                  {item.cliente_nome}
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span>{item.produto_nome}</span>
                                    {temMultiplos && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5 font-semibold"
                                      >
                                        {item.itensOriginais.length}x somados
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                  {item.quantidade} un.
                                </TableCell>
                                <TableCell className="text-right font-mono" onClick={(e) => e.stopPropagation()}>
                                  <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="h-7 w-24 text-right font-mono text-xs ml-auto font-medium"
                                    value={
                                      valoresUnitarios[item.chave] !== undefined
                                        ? valoresUnitarios[item.chave]
                                        : item.valor_unitario
                                    }
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setValoresUnitarios((prev) => ({
                                        ...prev,
                                        [item.chave]: val,
                                      }));
                                    }}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      atualizarValorUnitarioGrupo(item, val);
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="text-right font-mono font-bold text-foreground">
                                  {brl(getTotalConsolidado(item))}
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-1">
                                    {temMultiplos && (
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 text-muted-foreground hover:text-foreground"
                                        title={estaExpandido ? "Ocultar detalhes dos pedidos somados" : "Expandir detalhes dos pedidos somados"}
                                        onClick={() => toggleExpandir(item.chave)}
                                      >
                                        {estaExpandido ? (
                                          <ChevronUp className="size-3.5" />
                                        ) : (
                                          <ChevronDown className="size-3.5" />
                                        )}
                                      </Button>
                                    )}
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="size-7"
                                      title="Editar valor unitário"
                                      onClick={() => {
                                        const input = window.prompt(
                                          `Novo valor unitário para "${item.produto_nome}" (${item.cliente_nome}):`,
                                          String(
                                            valoresUnitarios[item.chave] !== undefined
                                              ? valoresUnitarios[item.chave]
                                              : item.valor_unitario,
                                          ),
                                        );
                                        if (input !== null) {
                                          const val = parseFloat(input) || 0;
                                          setValoresUnitarios((prev) => ({ ...prev, [item.chave]: val }));
                                          atualizarValorUnitarioGrupo(item, val);
                                        }
                                      }}
                                    >
                                      <Pencil className="size-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="size-7 text-destructive hover:bg-destructive/10"
                                      title="Remover/desmarcar da carga"
                                      onClick={() => {
                                        setItensSelecionados((prev) => ({ ...prev, [item.chave]: false }));
                                      }}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* LINHA EXPANDIDA COM DETALHAMENTO DOS PEDIDOS SOMADOS */}
                              {temMultiplos && estaExpandido && (
                                <TableRow className="bg-muted/30 text-xs hover:bg-muted/30">
                                  <TableCell colSpan={8} className="p-3">
                                    <div className="rounded border bg-background/95 p-2.5 space-y-2">
                                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                                        <span>Pedidos somados para {item.cliente_nome} ({item.itensOriginais.length} registros originais):</span>
                                        <span>Total consolidado: <strong className="text-foreground font-mono">{item.quantidade} un.</strong></span>
                                      </div>
                                      <div className="divide-y divide-border/60">
                                        {item.itensOriginais.map((orig, idx) => (
                                          <div key={orig.id || idx} className="flex items-center justify-between py-1.5 text-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="font-mono text-muted-foreground font-semibold">{orig.ordem_numero}</span>
                                              <span className="text-foreground">{orig.produto_nome}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                              <span className="font-bold">{orig.quantidade} un.</span>
                                              <span className="font-mono text-muted-foreground">{brl(getValorUnitarioConsolidado(item))} / un.</span>
                                              <span className="font-mono font-bold text-foreground">
                                                {brl(getValorUnitarioConsolidado(item) * orig.quantidade)}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* BARRA DE RESUMO EM TEMPO REAL DA SELEÇÃO */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/10 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      Marcados: <strong>{itensConsolidadosMarcados.length} produtos ({totalItensMarcados} un.)</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Clientes contemplados: <strong>{clientesAtendidos.length}</strong>
                    </span>
                  </div>
                  <div className="text-right">
                    <span>Total da carga: </span>
                    <strong className="text-sm font-mono text-primary">
                      {brl(totalValorMarcado)}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 4: FECHAMENTO DA CARGA E INFORMAÇÕES DE TRANSPORTE */}
            {passo === 4 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">
                    Passo 4: Resumo e Fechamento da Carga
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Confira os dados do lote antes de confirmar a solicitação ao fornecedor.
                  </p>
                </div>

                {/* RESUMO CONSOLIDADO */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Fornecedor</p>
                      <p className="font-bold text-sm text-foreground">{fornecedorAtual?.nome}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Total de Produtos</p>
                      <p className="font-bold text-sm text-foreground">
                        {totalItensMarcados} volumes em {itensConsolidadosMarcados.length} itens consolidados
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/10 border">
                    <CardContent className="p-3.5 space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase font-medium">Valor Total do Lote</p>
                      <p className="font-bold text-sm font-mono text-primary">{brl(totalValorMarcado)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* DESTINOS / CLIENTES */}
                <div className="p-3 rounded-lg border bg-muted/10 space-y-1 text-xs">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                    Clientes Contemplados nesta Carga ({clientesAtendidos.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {clientesAtendidos.map((cliente, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-background">
                        <Users className="size-3 mr-1 text-muted-foreground" />
                        {cliente}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* FORMULÁRIO DE TRANSPORTE */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Previsão de Saída / Entrega
                    </label>
                    <Input
                      type="date"
                      value={previsaoEntrega}
                      onChange={(e) => setPrevisaoEntrega(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Volume / Cubagem Aproximada
                    </label>
                    <Input
                      placeholder="Ex: 1 carreta fechada / 3 piscinas + caixas"
                      value={volumeCubagem}
                      onChange={(e) => setVolumeCubagem(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Placa do Veículo (opcional)
                    </label>
                    <Input
                      placeholder="Ex: ABC-1234"
                      value={placaVeiculo}
                      onChange={(e) => setPlacaVeiculo(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Motorista / Transportador (opcional)
                    </label>
                    <Input
                      placeholder="Nome do motorista ou telefone da transportadora"
                      value={motoristaContato}
                      onChange={(e) => setMotoristaContato(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Instruções / Observações Logísticas
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Observações de carregamento, ordem de descarregamento por cidade, etc..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RODAPÉ E NAVEGAÇÃO DOS PASSOS */}
          <DialogFooter className="flex flex-row items-center justify-between border-t pt-3">
            <div>
              {passo > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasso((p) => Math.max(1, p - 1) as any)}
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="size-4" />
                  Voltar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Cancelar
              </Button>

              {passo < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 text-xs font-semibold"
                >
                  Continuar
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => criarCargaMutation.mutate()}
                  disabled={criarCargaMutation.isPending || itensConsolidadosMarcados.length === 0}
                  className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  <ShoppingCart className="size-4" />
                  Executar Ordem / Fechar Carga
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANIFESTO AUTOMÁTICO APÓS FECHAMENTO DA CARGA */}
      {cargaCriada && (
        <ManifestoCargaModal
          open={manifestoAberto}
          onOpenChange={setManifestoAberto}
          carga={cargaCriada}
        />
      )}
    </>
  );
}
