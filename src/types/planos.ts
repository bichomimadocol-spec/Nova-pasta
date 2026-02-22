export interface Plano {
  id: string;
  nome: string;
  descricao?: string;
  valor_mensal: number;
  valor_trimestral?: number;
  valor_semestral?: number;
  valor_anual?: number;
  ativo: boolean;
  notas?: string;
  criado_em: string;
  atualizado_em: string;
  deletado_em?: string;
  servicos?: PlanoServico[];
}

export interface PlanoServico {
  id: string;
  plano_id: string;
  servico_id: number; // References Produto.id (where tipo='Serviço')
  quantidade: number;
  frequencia_mes: number;
  descricao_adicional?: string;
  criado_em: string;
  atualizado_em: string;
  // Joined fields
  nome_servico?: string;
  preco_servico?: number;
}
