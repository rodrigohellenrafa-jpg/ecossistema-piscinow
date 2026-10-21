import * as React from "react";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";

import { cn } from "@/lib/utils";

type CardContextValue = {
  full: boolean;
  setFull: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const CardContext = React.createContext<CardContextValue | null>(null);

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hideControls?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hideControls = false, ...props }, ref) => {
    const [full, setFull] = React.useState(false);
    const [collapsed, setCollapsed] = React.useState(false);

    React.useEffect(() => {
      if (!full) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setFull(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [full]);

    return (
      <CardContext.Provider value={{ full, setFull, collapsed, setCollapsed }}>
        {full && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm print:hidden"
            onClick={() => setFull(false)}
          />
        )}
        <div
          ref={ref}
          data-slot="card"
          data-collapsed={collapsed ? "true" : "false"}
          data-full={full ? "true" : "false"}
          className={cn(
            "relative rounded-xl border bg-card text-card-foreground shadow transition-all",
            full &&
              "fixed inset-2 z-50 flex flex-col overflow-y-auto md:inset-4 shadow-2xl !max-h-none",
            collapsed &&
              !full &&
              "[&>[data-slot=card-content]]:hidden [&>[data-slot=card-footer]]:hidden [&:not(:has([data-slot=card-header]))]:max-h-14 [&:not(:has([data-slot=card-header]))]:overflow-hidden",
            className,
          )}
          {...props}
        >
          {!hideControls && (
            <div
              data-slot="card-controls"
              className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-md bg-card/80 backdrop-blur-xs print:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                title={collapsed ? "Expandir conteúdo do card" : "Minimizar / recolher card"}
                aria-label={collapsed ? "Expandir conteúdo do card" : "Minimizar / recolher card"}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed((c) => {
                    const next = !c;
                    if (next && full) setFull(false);
                    return next;
                  });
                }}
              >
                {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
              </button>
              <button
                type="button"
                title={full ? "Reduzir (Esc)" : "Expandir para tela cheia"}
                aria-label={full ? "Reduzir" : "Expandir para tela cheia"}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFull((f) => {
                    const next = !f;
                    if (next && collapsed) setCollapsed(false);
                    return next;
                  });
                }}
              >
                {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>
            </div>
          )}
          {children}
        </div>
      </CardContext.Provider>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6 pr-16", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      data-slot="card-title"
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(CardContext);
    return (
      <div
        ref={ref}
        data-slot="card-content"
        className={cn("p-6 pt-0", ctx?.collapsed && !ctx?.full && "hidden", className)}
        {...props}
      />
    );
  },
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const ctx = React.useContext(CardContext);
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn("flex items-center p-6 pt-0", ctx?.collapsed && !ctx?.full && "hidden", className)}
        {...props}
      />
    );
  },
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
