import { Cliente } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export const clientesService = {
  listar: async (): Promise<Cliente[]> => {
    try {
      const response = await fetch(`${API_URL}/api/clientes`);
      if (!response.ok) {
        console.error(`Erro ao listar clientes: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('Response body:', text);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return [];
    }
  },
  
  criar: async (cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Promise<Cliente> => {
    const response = await fetch(`${API_URL}/api/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });
    if (!response.ok) throw new Error('Erro ao criar cliente');
    return response.json();
  },

  atualizar: async (id: number, cliente: Partial<Cliente>): Promise<Cliente> => {
    const response = await fetch(`${API_URL}/api/clientes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cliente, id }),
    });
    if (!response.ok) throw new Error('Erro ao atualizar cliente');
    return response.json();
  },

  deletar: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/api/clientes?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar cliente');
  }
};
