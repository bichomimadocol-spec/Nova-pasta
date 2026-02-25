import { Pet } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export const petsService = {
  listar: async (): Promise<Pet[]> => {
    try {
      const response = await fetch(`${API_URL}/api/pets`);
      if (!response.ok) {
        console.error(`Erro ao listar pets: ${response.status} ${response.statusText}`);
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Erro ao listar pets:', error);
      return [];
    }
  },
};