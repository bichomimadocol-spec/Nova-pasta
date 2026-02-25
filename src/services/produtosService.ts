import { Produto } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export const produtosService = {
  listar: async (): Promise<Produto[]> => {
    try {
      const response = await fetch(`${API_URL}/api/produtos`);
      if (!response.ok) {
        console.error(`Erro ao listar produtos: ${response.status} ${response.statusText}`);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return [];
    }
  },
};