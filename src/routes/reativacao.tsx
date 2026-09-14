import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Kpi, PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { brl, dataBR } from "@/lib/erp";

export const Route = createFileRoute("/reativacao")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Reativação de Clientes | Piscinow ERP" },
      {
        name: "description",
        content:
          "Clientes sem comprar há mais de 30 dias, com mensagem pronta para enviar no WhatsApp.",
      },
      { property: "og:title", content: "Reativação de Clientes | Piscinow ERP" },
      {
        property: "og:description",
        content: "Lista de clientes parados e disparo de mensagens de retorno pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Reativacao />
    </RequireAuth>
  ),
});

const MODELO_PADRAO =
  "Olá {nome}, aqui é da Piscinow! 💧 Faz {dias} dias desde a sua última compra. Estamos com condições especiais em produtos químicos e manutenção. Posso te enviar uma proposta?";

const diasDesde = (iso: string | null) => {
  if (!iso) return null;
  const ms = Date.now() - new Date(`${iso}T00:00:00`).getTime();
  return Math.floor(ms / 86400000);
};

const soDigitos = (v: string | null | undefined) => (v ?? "").replace(/\D/g, "");

function Reativacao() {
  const [q, setQ] = useState("");
  const [corte, setCorte] = useState("30");
  const [modelo, setModelo] = useState(MODELO_PADRAO);

  const { data: clientes = [] } = useQuery({
    queryKey: ["reativacao-clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, cidade, estado, created_at")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const { data: vendas = [] } = useQuery({
    queryKey: ["reativacao-vendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendas")
        .select("cliente_id, data, valor_total, status_pedido")
        .neq("status_pedido", "cancelado")
        .neq("status_pedido", "orcamento");
      if (error) throw error;
      return data;
    },
  });

  const lista = useMemo(() => {
    const porCliente = new Map<string, { ultima: string; total: number; compras: number }>();
    for (const v of vendas) {
      if (!v.cliente_id) continue;
      const atual = porCliente.get(v.cliente_id);
      porCliente.set(v.cliente_id, {
        ultima: !atual || v.data > atual.ultima ? v.data : atual.ultima,
        total: (atual?.total ?? 0) + Number(v.valor_total ?? 0),
        compras: (atual?.compras ?? 0) + 1,
      });
    }

    const limite = Number(corte) || 30;

    return clientes
      .map((c) => {
        const h = porCliente.get(c.id);
        const ultima = h?.ultima ?? null;
        const dias = ultima ? (diasDesde(ultima) ?? 0) : (diasDesde(c.created_at.slice(0, 10)) ?? 0);
        return {
          ...c,
          ultima,
          dias,
          total: h?.total ?? 0,
          compras: h?.compras ?? 0,
        };
      })
      .filter((c) => c.dias >= limite)
      .filter((c) =>
        `${c.nome} ${c.cidade ?? ""}`.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => b.dias - a.dias);
  }, [clientes, vendas, corte, q]);

  const semTelefone = lista.filter((c) => soDigitos(c.telefone).length < 10).length;
  const valorHistorico = lista.reduce((s, c) => s + c.total, 0);

  const mensagem = (nome: string, dias: number) =>
    modelo.replace(/{nome}/g, nome.split(" ")[0] ?? nome).replace(/{dias}/g, String(dias));

  const abrirWhats = (telefone: string | null, nome: string, dias: number) => {
    const fone = soDigitos(telefone);
    if (fone.length < 10) {
      toast.error("Este cliente não tem telefone cadastrado.");
      return;
    }
    const numero = fone.length <= 11 ? `55${fone}` : fone;
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensagem(nome, dias))}`,
      "_blank",
      "noopener",
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reativação de Clientes"
        subtitle="Quem está sem comprar há mais de 30 dias, com a mensagem pronta para enviar no WhatsApp."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Clientes parados" value={String(lista.length)} tone={lista.length > 0 ? "warning" : "default"} to="/clientes" />
        <Kpi label="Já compraram (histórico)" value={brl(valorHistorico)} to="/vendas" />
        <Kpi label="Sem telefone cadastrado" value={String(semTelefone)} to="/clientes" />
        <Kpi label="Corte usado" value={`${corte} dias`} to="/clientes" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Field label="Texto enviado (use {nome} e {dias})">
            <Textarea rows={3} value={modelo} onChange={(e) => setModelo(e.target.value)} />
          </Field>
          <Field label="Considerar parado a partir de">
            <Select value={corte} onValueChange={setCorte}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="60">60 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
                <SelectItem value="180">180 dias</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle>Clientes para chamar de volta</CardTitle>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou cidade"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Última compra</TableHead>
                <TableHead className="text-right">Dias parado</TableHead>
                <TableHead className="text-right">Histórico</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell>
                    {c.cidade ?? "—"}
                    {c.estado ? `/${c.estado}` : ""}
                  </TableCell>
                  <TableCell>{c.ultima ? dataBR(c.ultima) : "Nunca comprou"}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={c.dias >= 90 ? "destructive" : "secondary"}>{c.dias} dias</Badge>
                  </TableCell>
                  <TableCell className="text-right">{brl(c.total)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => abrirWhats(c.telefone, c.nome, c.dias)}>
                        <MessageCircle /> WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          void navigator.clipboard.writeText(mensagem(c.nome, c.dias));
                          toast.success("Mensagem copiada.");
                        }}
                        aria-label="Copiar mensagem"
                      >
                        <Copy />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Nenhum cliente parado nesse período. 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
