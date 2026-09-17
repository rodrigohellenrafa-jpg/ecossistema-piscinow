import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { dataLocal } from "@/components/agenda-calendario";
export function DataObraPicker({ value, onChange, label, disabled }: { value: string; onChange: (v: string) => void; label: string; disabled?: boolean }) {
 const [open,setOpen] = useState(false);
 const date = value ? new Date(`${value}T12:00:00`) : undefined;
 return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button disabled={disabled} variant="outline" aria-label={label} title={label} className="h-8 min-w-0 flex-1 gap-1 px-1 text-xs"><CalendarDays className="size-3 shrink-0" />{date ? date.toLocaleDateString("pt-BR") : "Data"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0 pointer-events-auto" align="start"><Calendar mode="single" locale={ptBR} selected={date} defaultMonth={date} onSelect={(d) => { if(d) { onChange(dataLocal(d)); setOpen(false); } }} className="p-3 pointer-events-auto" /><Button variant="ghost" className="w-full" onClick={() => { onChange("");setOpen(false); }}>Limpar data</Button></PopoverContent></Popover>;
}
