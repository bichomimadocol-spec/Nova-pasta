import { Cliente, Venda, Pet, Agendamento } from '../App';

// Se VITE_API_URL não estiver definida, usa base relativa ('')
const API_URL = import.meta.env.VITE_API_URL || '';
console.log('API_URL =>', API_URL);

export async function syncClientesToDB(
  cliente: Omit<Cliente, 'id' | 'dataCadastro'>
) {
  const response = await fetch(`${API_URL}/api/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    throw new Error(`Erro ao sincronizar cliente: ${response.statusText}`);
  }

  return await response.json();
}

export async function syncVendasToDB(venda: Omit<Venda, 'id'>) {
  const response = await fetch(`${API_URL}/api/vendas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(venda),
  });

  if (!response.ok) {
    throw new Error(`Erro ao sincronizar venda: ${response.statusText}`);
  }

  return await response.json();
}

export async function syncPetsToDB(pet: Omit<Pet, 'id' | 'dataCadastro'>) {
  const response = await fetch(`${API_URL}/api/pets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pet),
  });

  if (!response.ok) {
    throw new Error(`Erro ao sincronizar pet: ${response.statusText}`);
  }

  return await response.json();
}

export async function syncAgendamentosToDB(
  agendamento: Omit<Agendamento, 'id'>
) {
  const response = await fetch(`${API_URL}/api/agendamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agendamento),
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao sincronizar agendamento: ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getClientesFromDB(): Promise<Cliente[]> {
  try {
    const response = await fetch(`${API_URL}/api/clientes`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar clientes: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

export async function getVendasFromDB(): Promise<Venda[]> {
  try {
    const response = await fetch(`${API_URL}/api/vendas`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar vendas: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
}

export async function getPetsFromDB(): Promise<Pet[]> {
  try {
    const response = await fetch(`${API_URL}/api/pets`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar pets: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar pets:', error);
    return [];
  }
}

export async function getAgendamentosFromDB(): Promise<Agendamento[]> {
  try {
    const response = await fetch(`${API_URL}/api/agendamentos`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}
