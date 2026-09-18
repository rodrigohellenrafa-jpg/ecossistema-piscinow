import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useMestre } from "@/hooks/use-mestre";
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
import { validarSenhaMestra } from "@/lib/mestre.functions";

export function SenhaMestra() {
  const { mestre, ativar, desativar } = useMestre();
  const validar = useServerFn(validarSenhaMestra);
  const [open, setOpen] = useState(false);
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function desbloquear() {
    setEnviando(true);
    try {
      const r = await validar({ data: { senha } });
      if (r.ok) {
        ativar();
        setSenha("");
        setOpen(false);
        toast.success("Senha mestra confirmada.");
      } else if (false) {
        toast.error("A senha mestra ainda não foi cadastrada.");
      } else {
        toast.error("Senha mestra incorreta.");
      }
    } catch {
      toast.error("Não foi possível conferir a senha agora.");
    } finally {
      setEnviando(false);
    }
  }

  if (mestre) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1 border-primary/40 text-primary"
        onClick={() => {
          desativar();
          toast.success("Modo mestre encerrado.");
        }}
      >
        <ShieldCheck className="size-4" />
        <span className="hidden sm:inline">Senha confirmada</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Senha mestra">
          <KeyRound className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Senha mestra</DialogTitle>
          <DialogDescription>
            Confirma a senha mestra sem alterar as permissões do usuário.
          </DialogDescription>
        </DialogHeader>
        <Input
          type="password"
          value={senha}
          autoComplete="off"
          placeholder="Digite a senha mestra"
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void desbloquear();
          }}
        />
        <DialogFooter>
          <Button onClick={() => void desbloquear()} disabled={enviando || !senha}>
            Confirmar senha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
