import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/components/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CentroCustoField({value,onChange}:{value:string;onChange:(v:string)=>void}) {
  const {data=[]}=useQuery({queryKey:['obras-centro-custo'],queryFn:async()=>{const {data,error}=await supabase.from('obras').select('id,numero,cliente_nome').order('created_at',{ascending:false});if(error)throw error;return data;}});
  return <Field label="Centro de custo — obra"><Select value={value||'nenhum'} onValueChange={v=>onChange(v==='nenhum'?'':v)}><SelectTrigger><SelectValue placeholder="Sem vínculo"/></SelectTrigger><SelectContent><SelectItem value="nenhum">Sem vínculo</SelectItem>{data.map(o=><SelectItem key={o.id} value={o.id}>{o.numero} — {o.cliente_nome}</SelectItem>)}</SelectContent></Select></Field>;
}

/**
 * Vínculo do lançamento: obra, funcionário ou cliente.
 * Valor no formato "tipo:id" ("obra:...", "func:...", "cli:...") ou "".
 */
export function VinculoField({value,onChange}:{value:string;onChange:(v:string)=>void}) {
  const {data:obras=[]}=useQuery({queryKey:['obras-centro-custo'],queryFn:async()=>{const {data,error}=await supabase.from('obras').select('id,numero,cliente_nome').order('created_at',{ascending:false});if(error)throw error;return data;}});
  const {data:funcionarios=[]}=useQuery({queryKey:['funcionarios-vinculo'],queryFn:async()=>{const {data,error}=await supabase.from('funcionarios').select('id,nome,cargo').eq('ativo',true).order('nome',{ascending:true});if(error)throw error;return data;}});
  const {data:clientes=[]}=useQuery({queryKey:['clientes-vinculo'],queryFn:async()=>{const {data,error}=await supabase.from('clientes').select('id,nome').eq('ativo',true).order('nome',{ascending:true});if(error)throw error;return data;}});
  return (
    <Field label="Vínculo (obra, funcionário ou cliente)">
      <Select value={value||'nenhum'} onValueChange={v=>onChange(v==='nenhum'?'':v)}>
        <SelectTrigger><SelectValue placeholder="Sem vínculo"/></SelectTrigger>
        <SelectContent>
          <SelectItem value="nenhum">Sem vínculo</SelectItem>
          {obras.length>0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Obras</div>}
          {obras.map(o=><SelectItem key={`obra:${o.id}`} value={`obra:${o.id}`}>{o.numero} — {o.cliente_nome}</SelectItem>)}
          {funcionarios.length>0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Funcionários</div>}
          {funcionarios.map(f=><SelectItem key={`func:${f.id}`} value={`func:${f.id}`}>{f.nome}{f.cargo?` — ${f.cargo}`:''}</SelectItem>)}
          {clientes.length>0 && <div className="px-2 pt-2 text-xs font-semibold text-muted-foreground">Clientes</div>}
          {clientes.map(c=><SelectItem key={`cli:${c.id}`} value={`cli:${c.id}`}>{c.nome}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function parseVinculo(v:string):{obra_id:string|null;funcionario_id:string|null;cliente_id:string|null}{
  const r={obra_id:null,funcionario_id:null,cliente_id:null} as {obra_id:string|null;funcionario_id:string|null;cliente_id:string|null};
  if(!v) return r;
  const i=v.indexOf(':');
  if(i<0) return r;
  const tipo=v.slice(0,i); const id=v.slice(i+1);
  if(tipo==='obra') r.obra_id=id;
  else if(tipo==='func') r.funcionario_id=id;
  else if(tipo==='cli') r.cliente_id=id;
  return r;
}
