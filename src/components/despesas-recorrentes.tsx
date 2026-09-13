import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Repeat, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/field';
import { brl, hojeISO } from '@/lib/erp';

export function DespesasRecorrentes() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ descricao: '', parceiro: '', categoria: '', valor: '', dia: '5', inicio: hojeISO(), fim: '' });
  const { data = [] } = useQuery({ queryKey: ['despesas-recorrentes'], queryFn: async () => {
    const result = await supabase.from('despesas_recorrentes').select('*').order('descricao');
    if (result.error) throw result.error; return result.data;
  }});
  const salvar = useMutation({ mutationFn: async () => {
    const valor = Number(form.valor.replace(',', '.'));
    if (!form.descricao.trim() || !form.categoria.trim() || !Number.isFinite(valor) || valor <= 0 || !form.inicio || (form.fim && form.fim < form.inicio)) throw new Error('Confira descrição, categoria, valor e período.');
    const { error } = await supabase.from('despesas_recorrentes').insert({ descricao: form.descricao.trim(), parceiro: form.parceiro || null, categoria: form.categoria.trim(), valor, dia_vencimento: Number(form.dia), inicio: form.inicio, fim: form.fim || null });
    if (error) throw error;
  }, onSuccess: () => { qc.invalidateQueries({queryKey:['despesas-recorrentes']}); setForm({...form, descricao:'',valor:''}); toast.success('Recorrência cadastrada. Geração diária automática ativada.'); }, onError: (e:Error) => toast.error(e.message) });
  const alternar = useMutation({mutationFn: async ({id,ativo}:{id:string;ativo:boolean}) => {const {error}=await supabase.from('despesas_recorrentes').update({ativo}).eq('id',id);if(error)throw error;},onSuccess:()=>qc.invalidateQueries({queryKey:['despesas-recorrentes']}),onError:(e:Error)=>toast.error(e.message)});
  return <Dialog><DialogTrigger asChild><Button variant="outline"><Repeat /> Despesas recorrentes</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Despesas mensais recorrentes</DialogTitle></DialogHeader><form className="grid gap-3 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();salvar.mutate();}}>{(['descricao','parceiro','categoria','valor','dia','inicio','fim'] as const).map(key=><Field key={key} label={{descricao:'Descrição',parceiro:'Fornecedor',categoria:'Categoria',valor:'Valor (R$)',dia:'Dia do vencimento',inicio:'Início',fim:'Fim (opcional)'}[key]}><Input required={!['fim','parceiro'].includes(key)} type={key==='inicio'||key==='fim'?'date':key==='dia'?'number':'text'} min={key==='dia'?1:undefined} max={key==='dia'?31:undefined} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/></Field>)}<Button disabled={salvar.isPending} type="submit"><Plus/>Cadastrar recorrência</Button></form><div className="divide-y">{data.map(r=><div key={r.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{r.descricao}</p><p className="text-sm text-muted-foreground">{brl(r.valor)} · dia {r.dia_vencimento} · {r.ativo?'Ativa':'Pausada'}</p></div><Button variant="outline" disabled={alternar.isPending} onClick={()=>alternar.mutate({id:r.id,ativo:!r.ativo})}>{r.ativo?'Pausar':'Ativar'}</Button></div>)}</div></DialogContent></Dialog>;
}
