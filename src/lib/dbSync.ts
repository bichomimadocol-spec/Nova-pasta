import { Cliente, Venda, Pet, Agendamento } from '../App';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function syncClientesToDB(cliente: Omit<Cliente, 'id' | 'dataCadastro'>) {
  try {
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
  } catch (error) {
    console.error('Erro no sync de clientes:', error);
    throw error;
  }
}

export async function syncVendasToDB(venda: Omit<Venda, 'id'>) {
  try {
    const response = await fetch(`${API_URL}/api/sync/vendas`, {
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
  } catch (error) {
    console.error('Erro no sync de vendas:', error);
    throw error;
  }
}

export async function syncPetsToDB(pet: Omit<Pet, 'id' | 'dataCadastro'>) {
  try {
    const response = await fetch(`${API_URL}/api/sync/pets`, {
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
  } catch (error) {
    console.error('Erro no sync de pets:', error);
    throw error;
  }
}

export async function syncAgendamentosToDB(agendamento: Omit<Agendamento, 'id'>) {
  try {
    const response = await fetch(`${API_URL}/api/sync/agendamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agendamento),
    });

    if (!response.ok) {
      throw new Error(`Erro ao sincronizar agendamento: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro no sync de agendamentos:', error);
    throw error;
  }
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
    const response = await fetch(`${API_URL}/api/sync/vendas`);
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
    const response = await fetch(`${API_URL}/api/sync/pets`);
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
    const response = await fetch(`${API_URL}/api/sync/agendamentos`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}
