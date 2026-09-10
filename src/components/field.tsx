import { Children, cloneElement, isValidElement, useId, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  id,
  className,
  children,
}: {
  label: string;
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  let assigned = false;
  const control = Children.map(children, (child) => {
    if (!assigned && isValidElement<{ id?: string }>(child) && child.props.id === undefined) {
      assigned = true;
      return cloneElement(child, { id: fieldId });
    }
    return child;
  });

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      {control}
    </div>
  );
}
