import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "default",
  to,
  search,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "warning";
  to?: string;
  search?: Record<string, string>;
}) {
  const cor =
    tone === "positive"
      ? "text-success"
      : tone === "negative"
        ? "text-destructive"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";
  const body = (
    <>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${cor}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  );
  const className =
    "block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-primary/5";
  if (to) {
    return (
      <Link to={to} search={search as never} className={className}>
        {body}
      </Link>
    );
  }
  return <div className={className}>{body}</div>;
}
