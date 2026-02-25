import { Agendamento } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export const agendamentosService = {
  listar: async (): Promise<Agendamento[]> => {
    try {
      const response = await fetch(`${API_URL}/api/agendamentos`);
      if (!response.ok) {
        console.error(`Erro ao listar agendamentos: ${response.status} ${response.statusText}`);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error);
      return [];
    }
  },
};