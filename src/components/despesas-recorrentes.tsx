import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Repeat, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/field';
import { brl, hojeISO } from '@/lib/erp';
import { sincronizarRecorrenciasContas } from '@/lib/recorrencias';

export function DespesasRecorrentes() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    descricao: '',
    parceiro: '',
    categoria: '',
    valor: '',
    dia: '5',
    inicio: hojeISO(),
    fim: '',
  });

  const { data = [] } = useQuery({
    queryKey: ['despesas-recorrentes'],
    queryFn: async () => {
      const result = await supabase
        .from('despesas_recorrentes')
        .select('*')
        .order('dia_vencimento', { ascending: true })
        .order('descricao');
      if (result.error) throw result.error;
      return result.data;
    },
  });

  const sincronizar = useMutation({
    mutationFn: async () => {
      return await sincronizarRecorrenciasContas(supabase);
    },
    onSuccess: (res) => {
      toast.success(
        res.inseridas > 0
          ? `${res.inseridas} nova(s) parcela(s) gerada(s) no Contas a Pagar!`
          : 'Todas as parcelas recorrentes já estão sincronizadas e em dia.',
      );
      qc.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      qc.invalidateQueries({ queryKey: ['contas'] });
    },
    onError: (e: Error) => toast.error(`Erro ao sincronizar: ${e.message}`),
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const valor = Number(form.valor.replace(',', '.'));
      if (
        !form.descricao.trim() ||
        !form.categoria.trim() ||
        !Number.isFinite(valor) ||
        valor <= 0 ||
        !form.inicio ||
        (form.fim && form.fim < form.inicio)
      ) {
        throw new Error('Confira descrição, categoria, valor e período.');
      }

      const { data: criada, error } = await supabase
        .from('despesas_recorrentes')
        .insert({
          descricao: form.descricao.trim(),
          parceiro: form.parceiro || null,
          categoria: form.categoria.trim(),
          valor,
          dia_vencimento: Number(form.dia),
          inicio: form.inicio,
          fim: form.fim || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Sincroniza imediatamente gerando as parcelas no Contas a Pagar
      await sincronizarRecorrenciasContas(supabase);
      return criada;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      qc.invalidateQueries({ queryKey: ['contas'] });
      setForm({ ...form, descricao: '', valor: '' });
      toast.success('Recorrência cadastrada e parcelas provisionadas com sucesso no Contas a Pagar!');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from('despesas_recorrentes').update({ ativo }).eq('id', id);
      if (error) throw error;
      if (ativo) {
        await sincronizarRecorrenciasContas(supabase);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['despesas-recorrentes'] });
      qc.invalidateQueries({ queryKey: ['contas'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Repeat className="size-4 mr-2" /> Despesas recorrentes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-auto sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pr-6">
          <DialogTitle>Despesas mensais recorrentes</DialogTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => sincronizar.mutate()}
            disabled={sincronizar.isPending}
            title="Sincronizar parcelas pendentes com o Contas a Pagar"
          >
            <RefreshCw className={`size-4 mr-1 ${sincronizar.isPending ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </DialogHeader>

        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            salvar.mutate();
          }}
        >
          {(
            ['descricao', 'parceiro', 'categoria', 'valor', 'dia', 'inicio', 'fim'] as const
          ).map((key) => (
            <Field
              key={key}
              label={
                {
                  descricao: 'Descrição',
                  parceiro: 'Fornecedor / Beneficiário',
                  categoria: 'Categoria',
                  valor: 'Valor (R$)',
                  dia: 'Dia do vencimento',
                  inicio: 'Início',
                  fim: 'Fim (opcional)',
                }[key]
              }
            >
              <Input
                required={!['fim', 'parceiro'].includes(key)}
                type={key === 'inicio' || key === 'fim' ? 'date' : key === 'dia' ? 'number' : 'text'}
                min={key === 'dia' ? 1 : undefined}
                max={key === 'dia' ? 31 : undefined}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </Field>
          ))}
          <Button disabled={salvar.isPending} type="submit" className="sm:col-span-2">
            <Plus className="size-4 mr-2" /> Cadastrar recorrência e provisionar parcelas
          </Button>
        </form>

        <div className="divide-y pt-4">
          {data.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhuma despesa recorrente cadastrada.
            </p>
          ) : (
            data.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{r.descricao}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.parceiro ? `${r.parceiro} · ` : ''}
                    {brl(r.valor)} · dia {r.dia_vencimento} · {r.ativo ? 'Ativa' : 'Pausada'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={alternar.isPending}
                  onClick={() => alternar.mutate({ id: r.id, ativo: !r.ativo })}
                >
                  {r.ativo ? 'Pausar' : 'Ativar'}
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
