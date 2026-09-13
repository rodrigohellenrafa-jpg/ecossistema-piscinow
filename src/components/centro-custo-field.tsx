import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Field } from '@/components/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function CentroCustoField({value,onChange}:{value:string;onChange:(v:string)=>void}) {
 const {data=[]}=useQuery({queryKey:['obras-centro-custo'],queryFn:async()=>{const {data,error}=await supabase.from('obras').select('id,numero,cliente_nome').order('created_at',{ascending:false});if(error)throw error;return data;}});
 return <Field label="Centro de custo — obra"><Select value={value||'nenhum'} onValueChange={v=>onChange(v==='nenhum'?'':v)}><SelectTrigger><SelectValue placeholder="Sem vínculo"/></SelectTrigger><SelectContent><SelectItem value="nenhum">Sem vínculo</SelectItem>{data.map(o=><SelectItem key={o.id} value={o.id}>{o.numero} — {o.cliente_nome}</SelectItem>)}</SelectContent></Select></Field>;
}
