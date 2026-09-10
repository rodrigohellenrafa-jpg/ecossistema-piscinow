import { useEffect, useState, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Card com botão de expandir para tela cheia.
 * Ao expandir, a seção ocupa toda a área da tela; Esc fecha.
 */
export function ExpandableCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [full, setFull] = useState(false);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return (
    <>
      {full && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setFull(false)}
        />
      )}
      <Card
        className={cn(
          "relative",
          full && "fixed inset-2 z-50 flex flex-col overflow-y-auto md:inset-4",
          className,
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={full ? "Reduzir (Esc)" : "Expandir para tela cheia"}
          aria-label={full ? "Reduzir" : "Expandir para tela cheia"}
          className="absolute right-2 top-2 z-10 size-7 text-muted-foreground hover:text-primary"
          onClick={() => setFull((v) => !v)}
        >
          {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </Button>
        {children}
      </Card>
    </>
  );
}
