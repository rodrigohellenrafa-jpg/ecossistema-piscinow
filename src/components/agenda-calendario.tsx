import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExpandableCard } from "@/components/expandable-card";

export function dataLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
type Compromisso = { id: string; titulo: string; quando: string; hora: string | null; detalhe: string | null; local: string | null; responsavelNome: string | null };

export function AgendaCalendario({ itens, ehMeu }: { itens: Compromisso[]; ehMeu: (item: Compromisso) => boolean }) {
  const [mes, setMes] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dia, setDia] = useState(() => dataLocal(new Date()));
  const [meus, setMeus] = useState(false);
  const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1);
  inicio.setDate(1 - inicio.getDay());
  const dias = Array.from({ length: 42 }, (_, i) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i));
  const visiveis = itens.filter((i) => !meus || ehMeu(i));
  const selecionados = visiveis.filter((i) => i.quando === dia);
  function mover(n: number) { setMes(new Date(mes.getFullYear(), mes.getMonth() + n, 1)); }
  return (
    <ExpandableCard className="gap-0 py-0">
      <div className="flex flex-wrap items-center gap-2 border-b p-4 pr-12">
        <h2 className="mr-auto text-lg font-semibold capitalize">{mes.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
        <Button variant="outline" size="sm" onClick={() => { const d = new Date(); setMes(new Date(d.getFullYear(), d.getMonth(), 1)); setDia(dataLocal(d)); }}>Hoje</Button>
        <Button variant={meus ? "default" : "outline"} size="sm" aria-pressed={meus} onClick={() => setMeus(!meus)}>Só os meus</Button>
        <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => mover(-1)}><ChevronLeft /></Button>
        <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => mover(1)}><ChevronRight /></Button>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 border-b bg-muted/40">{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((s) => <div key={s} className="py-2 text-center text-xs font-semibold text-muted-foreground">{s}</div>)}</div>
          <div className="grid grid-cols-7">{dias.map((d) => {
            const chave = dataLocal(d); const eventos = visiveis.filter((i) => i.quando === chave);
            return <div key={chave} className={`min-h-28 min-w-0 border-b border-r p-1.5 ${dia === chave ? "bg-primary/10" : d.getMonth() !== mes.getMonth() ? "bg-muted/30" : "bg-background"}`}>
              <Button size="sm" variant={chave === dataLocal(new Date()) ? "default" : "ghost"} aria-label={`Ver compromissos de ${d.toLocaleDateString("pt-BR")}`} aria-pressed={dia === chave} onClick={() => setDia(chave)} className="mb-1 h-7 px-2">{d.getDate()}</Button>
              <div className="space-y-1">{eventos.map((e) => <Button key={e.id} variant="ghost" onClick={() => setDia(chave)} title={`${e.hora ?? "Dia inteiro"} · ${e.titulo}`} className={`h-auto w-full justify-start whitespace-normal rounded-sm border-l-2 px-1.5 py-1 text-left text-xs ${ehMeu(e) ? "border-primary bg-primary/10" : "border-border bg-muted"}`}><span className="min-w-0 break-words"><strong className="tabular-nums">{e.hora ?? "Dia inteiro"}</strong><br />{e.titulo}</span></Button>)}</div>
            </div>;
          })}</div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <h3 className="font-semibold capitalize">{new Date(`${dia}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</h3>
        {selecionados.length === 0 && <p className="text-sm text-muted-foreground">Nenhum compromisso nesta data.</p>}
        {selecionados.map((e) => <div key={e.id} className="flex gap-4 border-b pb-3 text-sm last:border-0"><strong className="w-20 shrink-0 tabular-nums">{e.hora ?? "Dia inteiro"}</strong><div className="min-w-0"><p className="break-words font-medium">{e.titulo}</p><p className="break-words text-xs text-muted-foreground">{[e.responsavelNome, e.detalhe, e.local].filter(Boolean).join(" · ")}</p></div></div>)}
      </div>
    </ExpandableCard>
  );
}
