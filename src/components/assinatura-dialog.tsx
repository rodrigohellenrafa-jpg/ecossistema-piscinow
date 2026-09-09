import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eraser, PenLine } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  tabela: "vendas" | "ordens_servico";
  registroId: string;
  documentoLabel: string;
  clienteNome?: string | null;
  clienteDocumento?: string | null;
  invalidar?: unknown[];
};

function codigoConferencia() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 10; i++) c += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${c.slice(0, 5)}-${c.slice(5)}`;
}

export function AssinaturaDialog({
  tabela,
  registroId,
  documentoLabel,
  clienteNome,
  clienteDocumento,
  invalidar = [],
}: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(clienteNome ?? "");
  const [documento, setDocumento] = useState(clienteDocumento ?? "");
  const [metodo, setMetodo] = useState("tela");
  const [temTraco, setTemTraco] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const desenhando = useRef(false);

  const ctx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const c = canvas.getContext("2d");
    if (c) {
      c.lineWidth = 2.5;
      c.lineCap = "round";
      c.lineJoin = "round";
      c.strokeStyle = "#0f172a";
    }
    return c;
  };

  const ponto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };

  const inicio = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = ctx();
    if (!c) return;
    desenhando.current = true;
    setTemTraco(true);
    const p = ponto(e);
    c.beginPath();
    c.moveTo(p.x, p.y);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!desenhando.current) return;
    e.preventDefault();
    const c = ctx();
    if (!c) return;
    const p = ponto(e);
    c.lineTo(p.x, p.y);
    c.stroke();
  };

  const fim = () => {
    desenhando.current = false;
  };

  const limpar = () => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext("2d");
    if (canvas && c) c.clearRect(0, 0, canvas.width, canvas.height);
    setTemTraco(false);
  };

  const salvar = useMutation({
    mutationFn: async () => {
      if (!nome.trim()) throw new Error("Informe o nome de quem está assinando.");
      if (metodo === "tela" && !temTraco) throw new Error("Peça para o cliente assinar no quadro.");

      const imagem = metodo === "tela" ? (canvasRef.current?.toDataURL("image/png") ?? null) : null;

      const { error } = await supabase
        .from(tabela)
        .update({
          assinatura_imagem: imagem,
          assinatura_nome: nome.trim(),
          assinatura_documento: documento.trim() || null,
          assinatura_metodo: metodo,
          assinatura_codigo: codigoConferencia(),
          assinatura_em: new Date().toISOString(),
        } as never)
        .eq("id", registroId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assinatura registrada no documento!");
      setOpen(false);
      limpar();
      invalidar.forEach((key) => qc.invalidateQueries({ queryKey: key as string[] }));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PenLine /> Assinar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assinatura do cliente</DialogTitle>
          <DialogDescription>
            {documentoLabel}. O cliente assina com o dedo na tela do celular; guardamos nome,
            documento, data/hora e um código de conferência impresso no documento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="Nome de quem assina">
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label="CPF / CNPJ">
            <Input
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              placeholder="000.000.000-00"
            />
          </Field>
          <Field label="Forma da assinatura">
            <Select value={metodo} onValueChange={setMetodo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tela">Assinar na tela (dedo)</SelectItem>
                <SelectItem value="govbr">
                  Assinado por fora no gov.br (registrar conferência)
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {metodo === "tela" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Assine no quadro abaixo</p>
              <canvas
                ref={canvasRef}
                width={640}
                height={240}
                onPointerDown={inicio}
                onPointerMove={mover}
                onPointerUp={fim}
                onPointerLeave={fim}
                className="h-40 w-full touch-none rounded-lg border border-dashed border-border bg-white"
              />
              <Button variant="ghost" size="sm" onClick={limpar}>
                <Eraser /> Limpar
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
              Use o portal gov.br para assinar o PDF e depois registre aqui quem assinou. A
              assinatura oficial pelo gov.br dentro do sistema exige o credenciamento da empresa
              junto ao serviço — quando isso estiver liberado, ligamos o botão direto aqui.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => salvar.mutate()} disabled={salvar.isPending}>
            Registrar assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
