import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TELAS } from '@/lib/telas';
import { salvarTelas } from '@/lib/permissoes.functions';
import { alterarSenhaMestra } from '@/lib/mestre.functions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter } from '@/components/ui/dialog';
export function PermissoesUsuario({id,nome,admin}:{id:string;nome:string;admin:boolean}) {
 const [open,setOpen]=useState(false),[draft,setDraft]=useState<string[]|null>(null),[saving,setSaving]=useState(false);
 const qc=useQueryClient(),save=useServerFn(salvarTelas);
 const query=useQuery({queryKey:['permissoes-telas',id],enabled:open,queryFn:async()=>{const {data,error}=await supabase.from('permissoes_telas').select('telas').eq('user_id',id).maybeSingle();if(error)throw error;return data?.telas??[];}});
 const selected=draft??query.data??[];
 const change=(ids:string[],on:boolean)=>setDraft(on?[...new Set([...selected,...ids])]:selected.filter(t=>!ids.includes(t)));
 return <><Button size="icon" variant="ghost" aria-label={`Permissões por tela de ${nome}`} onClick={()=>{setDraft(null);setOpen(true);}}><ShieldCheck className="size-4"/></Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-4 overflow-hidden sm:max-w-3xl"><DialogHeader><DialogTitle>Telas e subtelas — {nome}</DialogTitle></DialogHeader>
 {admin?<p>Administrador: acesso total.</p>:query.isLoading?<p>Carregando…</p>:query.isError?<p>Não foi possível carregar as permissões.</p>:<div className="-mr-2 flex-1 space-y-5 overflow-y-auto pr-2">{[...new Set(TELAS.map(t=>t.grupo))].map(grupo=>{const itens=TELAS.filter(t=>t.grupo===grupo),ids=itens.map(t=>t.id),count=ids.filter(t=>selected.includes(t)).length;return <section key={grupo}><label className="flex items-center gap-2 font-semibold mb-3"><Checkbox checked={count===ids.length?true:count?'indeterminate':false} onCheckedChange={v=>change(ids,v===true)}/>{grupo}</label><div className="grid gap-3 pl-6 sm:grid-cols-2">{itens.map(t=><label key={t.id} className="flex items-center gap-2 text-sm"><Checkbox checked={selected.includes(t.id)} onCheckedChange={v=>change([t.id],v===true)}/>{t.nome}</label>)}</div></section>;})}</div>}
 <DialogFooter className="shrink-0 flex-wrap gap-2 border-t pt-4"><span className="text-sm text-muted-foreground mr-auto">{draft?'Alterações não salvas':`${selected.length} telas liberadas`}</span><Button variant="outline" onClick={()=>setOpen(false)}>Fechar</Button><Button disabled={admin||!draft||saving||query.isError} onClick={async()=>{setSaving(true);try{await save({data:{userId:id,telas:selected}});await qc.invalidateQueries({queryKey:['permissoes-telas']});setDraft(null);toast.success('Acessos salvos.');}catch(e){toast.error(e instanceof Error?e.message:'Falha ao salvar.');}finally{setSaving(false);}}}>Salvar acessos</Button></DialogFooter></DialogContent></Dialog></>;
}
export function TrocarSenhaMestra(){
 const [atual,setAtual]=useState(''),[nova,setNova]=useState(''),[confirmacao,setConfirmacao]=useState(''),[pending,setPending]=useState(false);
 const save=useServerFn(alterarSenhaMestra);
 return <section className="space-y-4 border-t pt-6"><h2 className="text-lg font-semibold">Alterar senha mestra</h2><form className="space-y-4" onSubmit={async e=>{e.preventDefault();if(nova!==confirmacao)return toast.error('As senhas não conferem.');setPending(true);try{await save({data:{atual,nova,confirmacao}});setAtual('');setNova('');setConfirmacao('');toast.success('Senha mestra alterada.');}catch(error){toast.error(error instanceof Error?error.message:'Falha ao alterar.');}finally{setPending(false);}}}><div className="grid gap-4 sm:grid-cols-3">{[{id:'master-current',label:'Senha mestra atual',value:atual,set:setAtual},{id:'master-new',label:'Nova senha (mínimo 10 caracteres)',value:nova,set:setNova},{id:'master-confirm',label:'Confirmar nova senha',value:confirmacao,set:setConfirmacao}].map(f=><div className="space-y-2" key={f.id}><Label htmlFor={f.id}>{f.label}</Label><Input id={f.id} type="password" autoComplete={f.id==='master-current'?'current-password':'new-password'} value={f.value} onChange={e=>f.set(e.target.value)} required minLength={f.id==='master-current'?1:10}/></div>)}</div><Button disabled={pending}>Salvar senha mestra</Button></form></section>;
}
