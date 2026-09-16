import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        toast.success("Aplicativo instalado! Procure o ícone Piscinow na tela inicial.");
        setInstalled(true);
      }
      setDeferred(null);
      return;
    }
    if (isIOS()) {
      setShowIOSHelp(true);
      return;
    }
    toast.info(
      "Para instalar: abra o menu do navegador (⋮) e toque em \"Adicionar à tela inicial\"."
    );
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        size={compact ? "sm" : "default"}
        className={compact
          ? "h-9 shrink-0 gap-1.5 px-2.5"
          : "w-full gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"}
        title="Instalar app no celular"
        aria-label="Instalar Piscinow no celular"
      >
        <Download className="size-4 shrink-0" />
        <span className={compact ? "text-xs" : "group-data-[collapsible=icon]:hidden"}>
          {compact ? "Instalar" : "Instalar no celular"}
        </span>
      </Button>

      <Dialog open={showIOSHelp} onOpenChange={setShowIOSHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Instalar no iPhone/iPad</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para adicionar o Piscinow à sua tela inicial:
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            <li>
              Abra este site no <strong>Safari</strong>.
            </li>
            <li>
              Toque no botão <Share className="inline size-4 align-text-bottom" />{" "}
              <strong>Compartilhar</strong> (barra inferior).
            </li>
            <li>
              Role e toque em <strong>"Adicionar à Tela de Início"</strong>.
            </li>
            <li>
              Confirme em <strong>Adicionar</strong>. O ícone do Piscinow aparecerá na
              sua tela inicial.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
