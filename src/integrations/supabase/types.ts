export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agenda_assinaturas: {
        Row: {
          created_at: string
          id: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agenda_eventos: {
        Row: {
          cliente_nome: string | null
          created_at: string
          created_by: string | null
          descricao: string | null
          dia_inteiro: boolean
          fim: string | null
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          inicio: string
          local: string | null
          obra_id: string | null
          ordem_id: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status: string
          tipo: string
          titulo: string
          updated_at: string
          venda_id: string | null
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dia_inteiro?: boolean
          fim?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          inicio: string
          local?: string | null
          obra_id?: string | null
          ordem_id?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string
          tipo?: string
          titulo: string
          updated_at?: string
          venda_id?: string | null
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          dia_inteiro?: boolean
          fim?: string | null
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          inicio?: string
          local?: string | null
          obra_id?: string | null
          ordem_id?: string | null
          responsavel_id?: string | null
          responsavel_nome?: string | null
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_eventos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_ordem_id_fkey"
            columns: ["ordem_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_eventos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          codigo: string | null
          codigo_municipio: string | null
          complemento: string | null
          created_at: string
          created_by: string | null
          documento: string | null
          email: string | null
          endereco_obra: string | null
          estado: string | null
          etapa: string
          id: string
          indicador_ie: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logradouro: string | null
          nome: string
          numero: string | null
          observacoes: string | null
          regime_tributario: string | null
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          codigo_municipio?: string | null
          complemento?: string | null
          created_at?: string
          created_by?: string | null
          documento?: string | null
          email?: string | null
          endereco_obra?: string | null
          estado?: string | null
          etapa?: string
          id?: string
          indicador_ie?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          regime_tributario?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          codigo?: string | null
          codigo_municipio?: string | null
          complemento?: string | null
          created_at?: string
          created_by?: string | null
          documento?: string | null
          email?: string | null
          endereco_obra?: string | null
          estado?: string | null
          etapa?: string
          id?: string
          indicador_ie?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          regime_tributario?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracao_fiscal: {
        Row: {
          ambiente: string
          bairro: string | null
          cep: string | null
          certificado_valido_ate: string | null
          cnae: string | null
          cnpj: string
          codigo_municipio: string | null
          complemento: string | null
          created_at: string
          email: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logradouro: string | null
          municipio: string | null
          nome_fantasia: string | null
          numero: string | null
          provedor: string
          proximo_numero_nfe: number
          proximo_numero_nfse: number
          razao_social: string
          regime_tributario: string
          serie_nfe: string
          serie_nfse: string
          telefone: string | null
          token_configurado: boolean
          uf: string | null
          updated_at: string
        }
        Insert: {
          ambiente?: string
          bairro?: string | null
          cep?: string | null
          certificado_valido_ate?: string | null
          cnae?: string | null
          cnpj?: string
          codigo_municipio?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          provedor?: string
          proximo_numero_nfe?: number
          proximo_numero_nfse?: number
          razao_social?: string
          regime_tributario?: string
          serie_nfe?: string
          serie_nfse?: string
          telefone?: string | null
          token_configurado?: boolean
          uf?: string | null
          updated_at?: string
        }
        Update: {
          ambiente?: string
          bairro?: string | null
          cep?: string | null
          certificado_valido_ate?: string | null
          cnae?: string | null
          cnpj?: string
          codigo_municipio?: string | null
          complemento?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logradouro?: string | null
          municipio?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          provedor?: string
          proximo_numero_nfe?: number
          proximo_numero_nfse?: number
          razao_social?: string
          regime_tributario?: string
          serie_nfe?: string
          serie_nfse?: string
          telefone?: string | null
          token_configurado?: boolean
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      configuracao_mestra: {
        Row: {
          id: boolean
          senha_hash: string
          updated_at: string
        }
        Insert: {
          id?: boolean
          senha_hash: string
          updated_at?: string
        }
        Update: {
          id?: boolean
          senha_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      conta_rateios: {
        Row: {
          categoria: string
          conta_id: string
          created_at: string
          created_by: string | null
          id: string
          observacoes: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          conta_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          categoria?: string
          conta_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          observacoes?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "conta_rateios_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
        ]
      }
      contas: {
        Row: {
          categoria: string | null
          cliente_id: string | null
          competencia_recorrencia: string | null
          condicao_id: string | null
          conta_bancaria: string | null
          created_at: string
          created_by: string | null
          data_pagamento: string | null
          descricao: string
          funcionario_id: string | null
          id: string
          numero_documento: string | null
          obra_id: string | null
          observacoes: string | null
          ordem_compra_id: string | null
          parceiro: string | null
          recorrencia: string
          recorrencia_fim: string | null
          recorrencia_id: string | null
          status: string
          tipo: string
          tipo_despesa: string | null
          updated_at: string
          valor: number
          valor_desconto: number
          valor_juros: number
          valor_pago: number
          vencimento: string
          venda_id: string | null
        }
        Insert: {
          categoria?: string | null
          cliente_id?: string | null
          competencia_recorrencia?: string | null
          condicao_id?: string | null
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao: string
          funcionario_id?: string | null
          id?: string
          numero_documento?: string | null
          obra_id?: string | null
          observacoes?: string | null
          ordem_compra_id?: string | null
          parceiro?: string | null
          recorrencia?: string
          recorrencia_fim?: string | null
          recorrencia_id?: string | null
          status?: string
          tipo?: string
          tipo_despesa?: string | null
          updated_at?: string
          valor?: number
          valor_desconto?: number
          valor_juros?: number
          valor_pago?: number
          vencimento?: string
          venda_id?: string | null
        }
        Update: {
          categoria?: string | null
          cliente_id?: string | null
          competencia_recorrencia?: string | null
          condicao_id?: string | null
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string | null
          descricao?: string
          funcionario_id?: string | null
          id?: string
          numero_documento?: string | null
          obra_id?: string | null
          observacoes?: string | null
          ordem_compra_id?: string | null
          parceiro?: string | null
          recorrencia?: string
          recorrencia_fim?: string | null
          recorrencia_id?: string | null
          status?: string
          tipo?: string
          tipo_despesa?: string | null
          updated_at?: string
          valor?: number
          valor_desconto?: number
          valor_juros?: number
          valor_pago?: number
          vencimento?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_ordem_compra_id_fkey"
            columns: ["ordem_compra_id"]
            isOneToOne: false
            referencedRelation: "ordens_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_recorrencia_id_fkey"
            columns: ["recorrencia_id"]
            isOneToOne: false
            referencedRelation: "despesas_recorrentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      credito_fabricante: {
        Row: {
          created_at: string
          fornecedor_nome: string
          id: string
          saldo: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fornecedor_nome?: string
          id?: string
          saldo?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fornecedor_nome?: string
          id?: string
          saldo?: number
          updated_at?: string
        }
        Relationships: []
      }
      despesas_recorrentes: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          created_by: string
          descricao: string
          dia_vencimento: number
          fim: string | null
          id: string
          inicio: string
          obra_id: string | null
          parceiro: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          created_at?: string
          created_by?: string
          descricao: string
          dia_vencimento: number
          fim?: string | null
          id?: string
          inicio: string
          obra_id?: string | null
          parceiro?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          created_by?: string
          descricao?: string
          dia_vencimento?: number
          fim?: string | null
          id?: string
          inicio?: string
          obra_id?: string | null
          parceiro?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_recorrentes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_movimentos: {
        Row: {
          created_at: string
          created_by: string | null
          documento: string | null
          id: string
          observacoes: string | null
          origem: string | null
          produto_id: string
          quantidade: number
          tipo: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          documento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          produto_id: string
          quantidade?: number
          tipo?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          documento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "estoque_movimentos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      extratos_bancarios: {
        Row: {
          banco: string | null
          conciliado: boolean
          conciliado_em: string | null
          conciliado_por: string | null
          conta: string
          conta_id: string | null
          created_at: string
          created_by: string | null
          data_movimento: string
          descricao: string
          documento: string | null
          id: string
          lancamento_id: string | null
          observacoes: string | null
          origem: string
          saldo: number | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          banco?: string | null
          conciliado?: boolean
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta: string
          conta_id?: string | null
          created_at?: string
          created_by?: string | null
          data_movimento: string
          descricao: string
          documento?: string | null
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem?: string
          saldo?: number | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          banco?: string | null
          conciliado?: boolean
          conciliado_em?: string | null
          conciliado_por?: string | null
          conta?: string
          conta_id?: string | null
          created_at?: string
          created_by?: string | null
          data_movimento?: string
          descricao?: string
          documento?: string | null
          id?: string
          lancamento_id?: string | null
          observacoes?: string | null
          origem?: string
          saldo?: number | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extratos_bancarios_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extratos_bancarios_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_credenciais: {
        Row: {
          ambiente: string
          atualizado_por: string | null
          created_at: string
          id: string
          mensagem: string | null
          token: string
          updated_at: string
          validado_em: string | null
          valido: boolean
        }
        Insert: {
          ambiente: string
          atualizado_por?: string | null
          created_at?: string
          id?: string
          mensagem?: string | null
          token: string
          updated_at?: string
          validado_em?: string | null
          valido?: boolean
        }
        Update: {
          ambiente?: string
          atualizado_por?: string | null
          created_at?: string
          id?: string
          mensagem?: string | null
          token?: string
          updated_at?: string
          validado_em?: string | null
          valido?: boolean
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          ativo: boolean
          cnpj: string | null
          codigo: string | null
          contato: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          inscricao_estadual: string | null
          nome: string
          observacoes: string | null
          prazo_entrega_dias: number
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cnpj?: string | null
          codigo?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome: string
          observacoes?: string | null
          prazo_entrega_dias?: number
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cnpj?: string | null
          codigo?: string | null
          contato?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          inscricao_estadual?: string | null
          nome?: string
          observacoes?: string | null
          prazo_entrega_dias?: number
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funcionarios: {
        Row: {
          ativo: boolean
          bonificacao: number
          cargo: string
          codigo: string | null
          comissao_acessorios: number
          comissao_piscinas: number
          comissao_quimicos: number
          created_at: string
          created_by: string | null
          data_admissao: string | null
          email: string | null
          id: string
          inss_perc: number
          irrf_perc: number
          nome: string
          perfil: Database["public"]["Enums"]["app_role"]
          perfis: Database["public"]["Enums"]["app_role"][]
          salario_base: number
          sindicato: number
          telefone: string | null
          updated_at: string
          user_id: string | null
          vr: number
          vt: number
        }
        Insert: {
          ativo?: boolean
          bonificacao?: number
          cargo?: string
          codigo?: string | null
          comissao_acessorios?: number
          comissao_piscinas?: number
          comissao_quimicos?: number
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          email?: string | null
          id?: string
          inss_perc?: number
          irrf_perc?: number
          nome: string
          perfil?: Database["public"]["Enums"]["app_role"]
          perfis?: Database["public"]["Enums"]["app_role"][]
          salario_base?: number
          sindicato?: number
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          vr?: number
          vt?: number
        }
        Update: {
          ativo?: boolean
          bonificacao?: number
          cargo?: string
          codigo?: string | null
          comissao_acessorios?: number
          comissao_piscinas?: number
          comissao_quimicos?: number
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          email?: string | null
          id?: string
          inss_perc?: number
          irrf_perc?: number
          nome?: string
          perfil?: Database["public"]["Enums"]["app_role"]
          perfis?: Database["public"]["Enums"]["app_role"][]
          salario_base?: number
          sindicato?: number
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
          vr?: number
          vt?: number
        }
        Relationships: []
      }
      lancamento_rateios: {
        Row: {
          categoria: string
          created_at: string
          created_by: string | null
          id: string
          lancamento_id: string
          observacoes: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string
          created_by?: string | null
          id?: string
          lancamento_id: string
          observacoes?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          created_by?: string | null
          id?: string
          lancamento_id?: string
          observacoes?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamento_rateios_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_financeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_financeiros: {
        Row: {
          categoria: string
          cliente_id: string | null
          conciliado: boolean
          conta_bancaria: string | null
          created_at: string
          created_by: string | null
          data_competencia: string
          data_pagamento: string | null
          descricao: string
          forma_pagamento: string | null
          fornecedor_id: string | null
          funcionario_id: string | null
          id: string
          numero_documento: string | null
          obra_id: string | null
          observacoes: string | null
          recorrencia: string
          status: string
          tipo_despesa: string | null
          tipo_fluxo: string
          updated_at: string
          valor: number
          vencimento: string | null
          venda_id: string | null
        }
        Insert: {
          categoria?: string
          cliente_id?: string | null
          conciliado?: boolean
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_competencia?: string
          data_pagamento?: string | null
          descricao: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          funcionario_id?: string | null
          id?: string
          numero_documento?: string | null
          obra_id?: string | null
          observacoes?: string | null
          recorrencia?: string
          status?: string
          tipo_despesa?: string | null
          tipo_fluxo?: string
          updated_at?: string
          valor?: number
          vencimento?: string | null
          venda_id?: string | null
        }
        Update: {
          categoria?: string
          cliente_id?: string | null
          conciliado?: boolean
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_competencia?: string
          data_pagamento?: string | null
          descricao?: string
          forma_pagamento?: string | null
          fornecedor_id?: string | null
          funcionario_id?: string | null
          id?: string
          numero_documento?: string | null
          obra_id?: string | null
          observacoes?: string | null
          recorrencia?: string
          status?: string
          tipo_despesa?: string | null
          tipo_fluxo?: string
          updated_at?: string
          valor?: number
          vencimento?: string | null
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_funcionario_id_fkey"
            columns: ["funcionario_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_compra: {
        Row: {
          chave_acesso: string | null
          created_at: string
          created_by: string | null
          data_emissao: string | null
          data_entrada: string
          fornecedor: string
          fornecedor_cnpj: string | null
          id: string
          natureza_operacao: string | null
          numero: string | null
          observacoes: string | null
          serie: string | null
          status: string
          updated_at: string
          valor_frete: number
          valor_produtos: number
          valor_total: number
          xml: string | null
        }
        Insert: {
          chave_acesso?: string | null
          created_at?: string
          created_by?: string | null
          data_emissao?: string | null
          data_entrada?: string
          fornecedor: string
          fornecedor_cnpj?: string | null
          id?: string
          natureza_operacao?: string | null
          numero?: string | null
          observacoes?: string | null
          serie?: string | null
          status?: string
          updated_at?: string
          valor_frete?: number
          valor_produtos?: number
          valor_total?: number
          xml?: string | null
        }
        Update: {
          chave_acesso?: string | null
          created_at?: string
          created_by?: string | null
          data_emissao?: string | null
          data_entrada?: string
          fornecedor?: string
          fornecedor_cnpj?: string | null
          id?: string
          natureza_operacao?: string | null
          numero?: string | null
          observacoes?: string | null
          serie?: string | null
          status?: string
          updated_at?: string
          valor_frete?: number
          valor_produtos?: number
          valor_total?: number
          xml?: string | null
        }
        Relationships: []
      }
      notas_fiscais: {
        Row: {
          aliquota_iss: number
          base_icms: number
          chave_acesso: string | null
          cliente_documento: string | null
          cliente_id: string | null
          cliente_nome: string | null
          codigo_servico: string | null
          consumidor_final: boolean
          created_at: string
          created_by: string | null
          data_emissao: string
          discriminacao: string | null
          finalidade: string
          id: string
          iss_retido: boolean
          itens: Json
          mensagem_sefaz: string | null
          modalidade_frete: string
          modelo: string
          motivo_cancelamento: string | null
          natureza_operacao: string
          numero: string | null
          observacoes: string | null
          presenca_comprador: string
          protocolo: string | null
          referencia: string | null
          serie: string | null
          status: string
          tipo_documento: string
          updated_at: string
          url_danfe: string | null
          url_xml: string | null
          valor_cofins: number
          valor_desconto: number
          valor_frete: number
          valor_icms: number
          valor_ipi: number
          valor_iss: number
          valor_pis: number
          valor_produtos: number
          valor_servicos: number
          valor_total: number
          venda_id: string | null
        }
        Insert: {
          aliquota_iss?: number
          base_icms?: number
          chave_acesso?: string | null
          cliente_documento?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo_servico?: string | null
          consumidor_final?: boolean
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          discriminacao?: string | null
          finalidade?: string
          id?: string
          iss_retido?: boolean
          itens?: Json
          mensagem_sefaz?: string | null
          modalidade_frete?: string
          modelo?: string
          motivo_cancelamento?: string | null
          natureza_operacao?: string
          numero?: string | null
          observacoes?: string | null
          presenca_comprador?: string
          protocolo?: string | null
          referencia?: string | null
          serie?: string | null
          status?: string
          tipo_documento?: string
          updated_at?: string
          url_danfe?: string | null
          url_xml?: string | null
          valor_cofins?: number
          valor_desconto?: number
          valor_frete?: number
          valor_icms?: number
          valor_ipi?: number
          valor_iss?: number
          valor_pis?: number
          valor_produtos?: number
          valor_servicos?: number
          valor_total?: number
          venda_id?: string | null
        }
        Update: {
          aliquota_iss?: number
          base_icms?: number
          chave_acesso?: string | null
          cliente_documento?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo_servico?: string | null
          consumidor_final?: boolean
          created_at?: string
          created_by?: string | null
          data_emissao?: string
          discriminacao?: string | null
          finalidade?: string
          id?: string
          iss_retido?: boolean
          itens?: Json
          mensagem_sefaz?: string | null
          modalidade_frete?: string
          modelo?: string
          motivo_cancelamento?: string | null
          natureza_operacao?: string
          numero?: string | null
          observacoes?: string | null
          presenca_comprador?: string
          protocolo?: string | null
          referencia?: string | null
          serie?: string | null
          status?: string
          tipo_documento?: string
          updated_at?: string
          url_danfe?: string | null
          url_xml?: string | null
          valor_cofins?: number
          valor_desconto?: number
          valor_frete?: number
          valor_icms?: number
          valor_ipi?: number
          valor_iss?: number
          valor_pis?: number
          valor_produtos?: number
          valor_servicos?: number
          valor_total?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          board_os_id: string | null
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          created_by: string | null
          data_inicio: string | null
          data_limite: string | null
          data_pedido: string
          data_termino: string | null
          endereco_obra: string | null
          escavacao_fim: string | null
          escavacao_inicio: string | null
          etapa_aquecimento: string
          etapa_base: string
          etapa_casa_maquinas: string
          etapa_cascata: string
          etapa_escavacao: string
          etapa_esquadro: string
          etapa_furacao: string
          etapa_motor: string
          etapa_nivel: string
          etapa_tubulacao: string
          id: string
          instalacao_fim: string | null
          instalacao_inicio: string | null
          numero: string | null
          observacoes: string | null
          os_acabamento: string | null
          os_instalacao: string | null
          os_logistica: string | null
          prazo_dias: number
          responsavel: string | null
          selecionada: boolean
          status_geral: string
          tipo_servico: string
          updated_at: string
          venda_id: string | null
        }
        Insert: {
          board_os_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_limite?: string | null
          data_pedido?: string
          data_termino?: string | null
          endereco_obra?: string | null
          escavacao_fim?: string | null
          escavacao_inicio?: string | null
          etapa_aquecimento?: string
          etapa_base?: string
          etapa_casa_maquinas?: string
          etapa_cascata?: string
          etapa_escavacao?: string
          etapa_esquadro?: string
          etapa_furacao?: string
          etapa_motor?: string
          etapa_nivel?: string
          etapa_tubulacao?: string
          id?: string
          instalacao_fim?: string | null
          instalacao_inicio?: string | null
          numero?: string | null
          observacoes?: string | null
          os_acabamento?: string | null
          os_instalacao?: string | null
          os_logistica?: string | null
          prazo_dias?: number
          responsavel?: string | null
          selecionada?: boolean
          status_geral?: string
          tipo_servico?: string
          updated_at?: string
          venda_id?: string | null
        }
        Update: {
          board_os_id?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          data_limite?: string | null
          data_pedido?: string
          data_termino?: string | null
          endereco_obra?: string | null
          escavacao_fim?: string | null
          escavacao_inicio?: string | null
          etapa_aquecimento?: string
          etapa_base?: string
          etapa_casa_maquinas?: string
          etapa_cascata?: string
          etapa_escavacao?: string
          etapa_esquadro?: string
          etapa_furacao?: string
          etapa_motor?: string
          etapa_nivel?: string
          etapa_tubulacao?: string
          id?: string
          instalacao_fim?: string | null
          instalacao_inicio?: string | null
          numero?: string | null
          observacoes?: string | null
          os_acabamento?: string | null
          os_instalacao?: string | null
          os_logistica?: string | null
          prazo_dias?: number
          responsavel?: string | null
          selecionada?: boolean
          status_geral?: string
          tipo_servico?: string
          updated_at?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "obras_board_os_id_fkey"
            columns: ["board_os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obras_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_compra_itens: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          codigo: string | null
          created_at: string
          cst: string | null
          desconto: number
          descricao: string
          id: string
          ncm: string | null
          numero_nf: string | null
          ordem_id: string
          produto_id: string | null
          quantidade: number
          total: number
          unidade: string
          valor_unitario: number
          venda_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo?: string | null
          created_at?: string
          cst?: string | null
          desconto?: number
          descricao: string
          id?: string
          ncm?: string | null
          numero_nf?: string | null
          ordem_id: string
          produto_id?: string | null
          quantidade?: number
          total?: number
          unidade?: string
          valor_unitario?: number
          venda_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          codigo?: string | null
          created_at?: string
          cst?: string | null
          desconto?: number
          descricao?: string
          id?: string
          ncm?: string | null
          numero_nf?: string | null
          ordem_id?: string
          produto_id?: string | null
          quantidade?: number
          total?: number
          unidade?: string
          valor_unitario?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordem_compra_itens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_compra_itens_ordem_id_fkey"
            columns: ["ordem_id"]
            isOneToOne: false
            referencedRelation: "ordens_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_compra_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordem_compra_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      ordem_compra_pagamentos: {
        Row: {
          conta_bancaria: string | null
          created_at: string
          created_by: string | null
          data_pagamento: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          ordem_id: string
          updated_at: string
          valor: number
        }
        Insert: {
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          ordem_id: string
          updated_at?: string
          valor?: number
        }
        Update: {
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          ordem_id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordem_compra_pagamentos_ordem_id_fkey"
            columns: ["ordem_id"]
            isOneToOne: false
            referencedRelation: "ordens_compra"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_compra: {
        Row: {
          condicoes: string | null
          created_at: string
          created_by: string | null
          data_pedido: string
          desconto: number
          enviada_em: string | null
          faturada_em: string | null
          fornecedor_id: string | null
          fornecedor_nome: string | null
          icms_base: number
          icms_st_base: number
          icms_st_valor: number
          icms_valor: number
          id: string
          numero: string | null
          obs_pagamento: string | null
          observacoes: string | null
          previsao_entrega: string | null
          status: string
          updated_at: string
          valor_nota: number
          valor_pago: number
          valor_produtos: number
          valor_total: number
        }
        Insert: {
          condicoes?: string | null
          created_at?: string
          created_by?: string | null
          data_pedido?: string
          desconto?: number
          enviada_em?: string | null
          faturada_em?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          icms_base?: number
          icms_st_base?: number
          icms_st_valor?: number
          icms_valor?: number
          id?: string
          numero?: string | null
          obs_pagamento?: string | null
          observacoes?: string | null
          previsao_entrega?: string | null
          status?: string
          updated_at?: string
          valor_nota?: number
          valor_pago?: number
          valor_produtos?: number
          valor_total?: number
        }
        Update: {
          condicoes?: string | null
          created_at?: string
          created_by?: string | null
          data_pedido?: string
          desconto?: number
          enviada_em?: string | null
          faturada_em?: string | null
          fornecedor_id?: string | null
          fornecedor_nome?: string | null
          icms_base?: number
          icms_st_base?: number
          icms_st_valor?: number
          icms_valor?: number
          id?: string
          numero?: string | null
          obs_pagamento?: string | null
          observacoes?: string | null
          previsao_entrega?: string | null
          status?: string
          updated_at?: string
          valor_nota?: number
          valor_pago?: number
          valor_produtos?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordens_compra_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          aceite_em: string | null
          aceite_observacoes: string | null
          assinatura_codigo: string | null
          assinatura_documento: string | null
          assinatura_em: string | null
          assinatura_imagem: string | null
          assinatura_metodo: string
          assinatura_nome: string | null
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          created_by: string | null
          data_agendada: string | null
          descricao: string | null
          horas_trabalhadas: number
          id: string
          materiais_utilizados: string | null
          numero: string | null
          prioridade: string
          responsavel: string | null
          status: string
          tipo_servico: string
          updated_at: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          aceite_em?: string | null
          aceite_observacoes?: string | null
          assinatura_codigo?: string | null
          assinatura_documento?: string | null
          assinatura_em?: string | null
          assinatura_imagem?: string | null
          assinatura_metodo?: string
          assinatura_nome?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          descricao?: string | null
          horas_trabalhadas?: number
          id?: string
          materiais_utilizados?: string | null
          numero?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          tipo_servico?: string
          updated_at?: string
          valor?: number
          venda_id?: string | null
        }
        Update: {
          aceite_em?: string | null
          aceite_observacoes?: string | null
          assinatura_codigo?: string | null
          assinatura_documento?: string | null
          assinatura_em?: string | null
          assinatura_imagem?: string | null
          assinatura_metodo?: string
          assinatura_nome?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          data_agendada?: string | null
          descricao?: string | null
          horas_trabalhadas?: number
          id?: string
          materiais_utilizados?: string | null
          numero?: string | null
          prioridade?: string
          responsavel?: string | null
          status?: string
          tipo_servico?: string
          updated_at?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_telas: {
        Row: {
          created_at: string
          telas: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          telas?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          telas?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          aliquota_cofins: number
          aliquota_icms: number
          aliquota_ipi: number
          aliquota_iss: number
          aliquota_pis: number
          ativo: boolean
          categoria: string | null
          cest: string | null
          cfop: string | null
          codigo: string | null
          codigo_servico_municipal: string | null
          cor_pastilha: string | null
          created_at: string
          created_by: string | null
          cst: string | null
          custo_fabricacao: number
          custo_logistico: number
          desconto_compra: number
          descricao: string | null
          estoque_atual: number
          estoque_minimo: number
          fornecedor_id: string | null
          id: string
          localizacao: string | null
          modelo_pastilha: string | null
          ncm: string | null
          nome: string
          origem_mercadoria: string
          preco_custo: number
          preco_venda: number
          quantidade_compra: number
          sob_encomenda: boolean
          status_compra: string
          tipo: string
          unidade: string
          unidades_por_compra: number
          updated_at: string
        }
        Insert: {
          aliquota_cofins?: number
          aliquota_icms?: number
          aliquota_ipi?: number
          aliquota_iss?: number
          aliquota_pis?: number
          ativo?: boolean
          categoria?: string | null
          cest?: string | null
          cfop?: string | null
          codigo?: string | null
          codigo_servico_municipal?: string | null
          cor_pastilha?: string | null
          created_at?: string
          created_by?: string | null
          cst?: string | null
          custo_fabricacao?: number
          custo_logistico?: number
          desconto_compra?: number
          descricao?: string | null
          estoque_atual?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          localizacao?: string | null
          modelo_pastilha?: string | null
          ncm?: string | null
          nome: string
          origem_mercadoria?: string
          preco_custo?: number
          preco_venda?: number
          quantidade_compra?: number
          sob_encomenda?: boolean
          status_compra?: string
          tipo?: string
          unidade?: string
          unidades_por_compra?: number
          updated_at?: string
        }
        Update: {
          aliquota_cofins?: number
          aliquota_icms?: number
          aliquota_ipi?: number
          aliquota_iss?: number
          aliquota_pis?: number
          ativo?: boolean
          categoria?: string | null
          cest?: string | null
          cfop?: string | null
          codigo?: string | null
          codigo_servico_municipal?: string | null
          cor_pastilha?: string | null
          created_at?: string
          created_by?: string | null
          cst?: string | null
          custo_fabricacao?: number
          custo_logistico?: number
          desconto_compra?: number
          descricao?: string | null
          estoque_atual?: number
          estoque_minimo?: number
          fornecedor_id?: string | null
          id?: string
          localizacao?: string | null
          modelo_pastilha?: string | null
          ncm?: string | null
          nome?: string
          origem_mercadoria?: string
          preco_custo?: number
          preco_venda?: number
          quantidade_compra?: number
          sob_encomenda?: boolean
          status_compra?: string
          tipo?: string
          unidade?: string
          unidades_por_compra?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      saldos_bancarios: {
        Row: {
          banco: string | null
          conta: string
          created_at: string
          created_by: string | null
          data_saldo: string
          id: string
          observacoes: string | null
          saldo: number
          updated_at: string
        }
        Insert: {
          banco?: string | null
          conta: string
          created_at?: string
          created_by?: string | null
          data_saldo?: string
          id?: string
          observacoes?: string | null
          saldo?: number
          updated_at?: string
        }
        Update: {
          banco?: string | null
          conta?: string
          created_at?: string
          created_by?: string | null
          data_saldo?: string
          id?: string
          observacoes?: string | null
          saldo?: number
          updated_at?: string
        }
        Relationships: []
      }
      tabela_fabricante: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          custo_casco: number
          custo_filtro: number
          frete: number
          id: string
          imposto: number
          instalacao: number
          linha: string | null
          lucro: number
          modelo: string
          observacoes: string | null
          preco_venda: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          custo_casco?: number
          custo_filtro?: number
          frete?: number
          id?: string
          imposto?: number
          instalacao?: number
          linha?: string | null
          lucro?: number
          modelo: string
          observacoes?: string | null
          preco_venda?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          custo_casco?: number
          custo_filtro?: number
          frete?: number
          id?: string
          imposto?: number
          instalacao?: number
          linha?: string | null
          lucro?: number
          modelo?: string
          observacoes?: string | null
          preco_venda?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios_importados: {
        Row: {
          ativo: boolean
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          nome: string | null
          observacoes: string | null
          perfil: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          observacoes?: string | null
          perfil?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          observacoes?: string | null
          perfil?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      venda_condicoes: {
        Row: {
          acrescimo: number
          bandeira: string | null
          conta_bancaria: string | null
          created_at: string
          created_by: string | null
          data_prevista: string | null
          forma_pagamento: string
          id: string
          observacoes: string | null
          ordem: number
          pago: boolean
          parcelas: number
          updated_at: string
          valor: number
          valor_cobrado: number
          valor_parcela: number
          venda_id: string
        }
        Insert: {
          acrescimo?: number
          bandeira?: string | null
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_prevista?: string | null
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          ordem?: number
          pago?: boolean
          parcelas?: number
          updated_at?: string
          valor?: number
          valor_cobrado?: number
          valor_parcela?: number
          venda_id: string
        }
        Update: {
          acrescimo?: number
          bandeira?: string | null
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_prevista?: string | null
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          ordem?: number
          pago?: boolean
          parcelas?: number
          updated_at?: string
          valor?: number
          valor_cobrado?: number
          valor_parcela?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_condicoes_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_historico: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          created_at: string
          created_by: string | null
          data: string
          descricao: string
          id: string
          lancamento_id: string | null
          natureza: string
          obra_id: string | null
          observacoes: string | null
          ordem_id: string | null
          proxima_data: string | null
          recorrencia: string
          tipo: string
          updated_at: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao: string
          id?: string
          lancamento_id?: string | null
          natureza?: string
          obra_id?: string | null
          observacoes?: string | null
          ordem_id?: string | null
          proxima_data?: string | null
          recorrencia?: string
          tipo?: string
          updated_at?: string
          valor?: number
          venda_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string
          id?: string
          lancamento_id?: string | null
          natureza?: string
          obra_id?: string | null
          observacoes?: string | null
          ordem_id?: string | null
          proxima_data?: string | null
          recorrencia?: string
          tipo?: string
          updated_at?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venda_historico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_historico_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_historico_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_financeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_historico_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_historico_ordem_id_fkey"
            columns: ["ordem_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_historico_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_itens: {
        Row: {
          created_at: string
          custo_unitario: number
          desconto_perc: number
          desconto_valor: number
          descricao: string
          id: string
          preco_unitario: number
          produto_id: string | null
          quantidade: number
          sku: string | null
          total: number
          venda_id: string
        }
        Insert: {
          created_at?: string
          custo_unitario?: number
          desconto_perc?: number
          desconto_valor?: number
          descricao: string
          id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          sku?: string | null
          total?: number
          venda_id: string
        }
        Update: {
          created_at?: string
          custo_unitario?: number
          desconto_perc?: number
          desconto_valor?: number
          descricao?: string
          id?: string
          preco_unitario?: number
          produto_id?: string | null
          quantidade?: number
          sku?: string | null
          total?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_itens_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_kit: {
        Row: {
          acessorios: Json
          casco_id: string | null
          created_at: string
          custo_frete: number
          custo_mao_obra: number
          custo_total_kit: number
          filtro_id: string | null
          id: string
          impostos: number
          preco_venda_kit: number
          updated_at: string
          venda_id: string
        }
        Insert: {
          acessorios?: Json
          casco_id?: string | null
          created_at?: string
          custo_frete?: number
          custo_mao_obra?: number
          custo_total_kit?: number
          filtro_id?: string | null
          id?: string
          impostos?: number
          preco_venda_kit?: number
          updated_at?: string
          venda_id: string
        }
        Update: {
          acessorios?: Json
          casco_id?: string | null
          created_at?: string
          custo_frete?: number
          custo_mao_obra?: number
          custo_total_kit?: number
          filtro_id?: string | null
          id?: string
          impostos?: number
          preco_venda_kit?: number
          updated_at?: string
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_kit_casco_id_fkey"
            columns: ["casco_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_kit_filtro_id_fkey"
            columns: ["filtro_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venda_kit_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      venda_pagamentos: {
        Row: {
          conta_bancaria: string | null
          created_at: string
          created_by: string | null
          data_pagamento: string
          forma_pagamento: string
          id: string
          observacoes: string | null
          retencao_financeira: number
          updated_at: string
          valor: number
          valor_origem: number | null
          venda_id: string
        }
        Insert: {
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento: string
          id?: string
          observacoes?: string | null
          retencao_financeira?: number
          updated_at?: string
          valor: number
          valor_origem?: number | null
          venda_id: string
        }
        Update: {
          conta_bancaria?: string | null
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          forma_pagamento?: string
          id?: string
          observacoes?: string | null
          retencao_financeira?: number
          updated_at?: string
          valor?: number
          valor_origem?: number | null
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venda_pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          assinatura_codigo: string | null
          assinatura_documento: string | null
          assinatura_em: string | null
          assinatura_imagem: string | null
          assinatura_metodo: string
          assinatura_nome: string | null
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          created_by: string | null
          custo_total: number
          data: string
          endereco_entrega: string | null
          endereco_instalacao: string | null
          etiqueta: string | null
          forma_pagamento: string | null
          id: string
          materiais: Json
          numero: string | null
          observacoes: string | null
          parcelas: number
          pdf_link: string | null
          prazo_entrega: string | null
          saldo_devedor: number
          status_pagamento: string
          status_pedido: string
          subtotal_produtos: number
          tipo_atendimento: string
          updated_at: string
          valor_entrada: number
          valor_frete: number
          valor_impostos: number
          valor_mao_obra: number
          valor_parcela: number
          valor_total: number
          vendedor: string | null
          vendedor_id: string | null
        }
        Insert: {
          assinatura_codigo?: string | null
          assinatura_documento?: string | null
          assinatura_em?: string | null
          assinatura_imagem?: string | null
          assinatura_metodo?: string
          assinatura_nome?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          custo_total?: number
          data?: string
          endereco_entrega?: string | null
          endereco_instalacao?: string | null
          etiqueta?: string | null
          forma_pagamento?: string | null
          id?: string
          materiais?: Json
          numero?: string | null
          observacoes?: string | null
          parcelas?: number
          pdf_link?: string | null
          prazo_entrega?: string | null
          saldo_devedor?: number
          status_pagamento?: string
          status_pedido?: string
          subtotal_produtos?: number
          tipo_atendimento?: string
          updated_at?: string
          valor_entrada?: number
          valor_frete?: number
          valor_impostos?: number
          valor_mao_obra?: number
          valor_parcela?: number
          valor_total?: number
          vendedor?: string | null
          vendedor_id?: string | null
        }
        Update: {
          assinatura_codigo?: string | null
          assinatura_documento?: string | null
          assinatura_em?: string | null
          assinatura_imagem?: string | null
          assinatura_metodo?: string
          assinatura_nome?: string | null
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          created_by?: string | null
          custo_total?: number
          data?: string
          endereco_entrega?: string | null
          endereco_instalacao?: string | null
          etiqueta?: string | null
          forma_pagamento?: string | null
          id?: string
          materiais?: Json
          numero?: string | null
          observacoes?: string | null
          parcelas?: number
          pdf_link?: string | null
          prazo_entrega?: string | null
          saldo_devedor?: number
          status_pagamento?: string
          status_pedido?: string
          subtotal_produtos?: number
          tipo_atendimento?: string
          updated_at?: string
          valor_entrada?: number
          valor_frete?: number
          valor_impostos?: number
          valor_mao_obra?: number
          valor_parcela?: number
          valor_total?: number
          vendedor?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "funcionarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aplicar_delta_bancario: {
        Args: { p_conta: string; p_delta: number }
        Returns: undefined
      }
      gerar_despesas_recorrentes: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      proximo_numero_venda: { Args: never; Returns: string }
      selecionar_obra_board: {
        Args: { p_obra?: string; p_selecionada?: boolean; p_venda?: string }
        Returns: string
      }
      selecionar_obra_board_interno: {
        Args: { p_obra: string; p_selecionada: boolean; p_venda: string }
        Returns: string
      }
      tem_area: { Args: { _area: string; _uid: string }; Returns: boolean }
      tem_area_any: {
        Args: { _areas: string[]; _uid: string }
        Returns: boolean
      }
      tem_tela: { Args: { _tela: string; _uid: string }; Returns: boolean }
      tem_telas: { Args: { _telas: string[]; _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "gerente"
        | "vendedor"
        | "financeiro"
        | "tecnico"
        | "usuario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "gerente",
        "vendedor",
        "financeiro",
        "tecnico",
        "usuario",
      ],
    },
  },
} as const
