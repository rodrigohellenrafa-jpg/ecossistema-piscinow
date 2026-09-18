import { createServerFn } from '@tanstack/react-start';
import { pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
function confere(senha:string, hash:string) {
 const [salt,digest]=hash.split(':');
 if(!salt || !digest) return false;
 const calculated=pbkdf2Sync(senha,salt,100000,32,'sha256');
 const expected=Buffer.from(digest,'hex');
 return calculated.length===expected.length && timingSafeEqual(calculated,expected);
}
async function verificar(senha:string) {
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data,error}=await supabaseAdmin.from('configuracao_mestra').select('senha_hash').eq('id',true).maybeSingle();
 if(error) throw new Error('Não foi possível conferir a senha mestra.');
 if(data) return confere(senha,data.senha_hash);
 const original=process.env['MASTER_PASSWORD'];
 return !!original && timingSafeEqual(createHash('sha256').update(senha).digest(),createHash('sha256').update(original).digest());
}
export const validarSenhaMestra=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({senha:z.string().min(1).max(256)})).handler(async({data})=> (await verificar(data.senha)) ? {ok:true as const} : {ok:false as const,motivo:'invalida' as 'invalida' | 'nao_configurada'});
export const alterarSenhaMestra=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({atual:z.string().min(1).max(256),nova:z.string().min(10).max(256),confirmacao:z.string()}).refine(d=>d.nova===d.confirmacao,'As senhas não conferem.')).handler(async({data,context})=>{
 const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(error || !admin) throw new Error('Somente administradores podem alterar a senha mestra.');
 if(!await verificar(data.atual)) throw new Error('Senha mestra atual incorreta.');
 const salt=randomBytes(24).toString('hex');
 const hash=`${salt}:${pbkdf2Sync(data.nova,salt,100000,32,'sha256').toString('hex')}`;
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {error:saveError}=await supabaseAdmin.from('configuracao_mestra').upsert({id:true,senha_hash:hash});
 if(saveError) throw new Error('Não foi possível alterar a senha mestra.');
 return {ok:true};
});
