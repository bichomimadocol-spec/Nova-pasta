import { Venda } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export const vendasService = {
  listar: async (): Promise<Venda[]> => {
    try {
      const response = await fetch(`${API_URL}/api/vendas`);
      if (!response.ok) {
        console.error(`Erro ao listar vendas: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Response body:', text);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      return [];
    }
  },
  
  criar: async (venda: Omit<Venda, 'id'>): Promise<Venda> => {
    const response = await fetch(`${API_URL}/api/vendas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venda),
    });
    if (!response.ok) throw new Error('Erro ao criar venda');
    return response.json();
  },

  atualizar: async (id: number, venda: Partial<Venda>): Promise<Venda> => {
    const response = await fetch(`${API_URL}/api/vendas`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...venda, id }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar venda');
    return response.json();
  },

  deletar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/api/vendas?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar venda');
  }
};
