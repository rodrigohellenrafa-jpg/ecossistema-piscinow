import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

/**
 * Card com botões de minimizar/recolher e expandir para tela cheia.
 * Mantido por compatibilidade; o próprio componente Card agora possui os controles nativamente.
 */
export function ExpandableCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Card className={className}>{children}</Card>;
}
