import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { TELAS } from './telas';
export const salvarTelas = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({userId:z.string().uuid(),telas:z.array(z.string())})).handler(async({data,context})=>{
 const {data:admin,error:roleError}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(roleError || !admin) throw new Error('Somente administradores podem alterar acessos.');
 if(data.telas.some(t=>!TELAS.some(x=>x.id===t))) throw new Error('Tela inválida.');
 const {error}=await context.supabase.from('permissoes_telas').upsert({user_id:data.userId,telas:[...new Set(data.telas)]});
 if(error) throw new Error(error.message);
 return {ok:true};
});
