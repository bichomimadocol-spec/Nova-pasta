import { Plano, PlanoServico } from '../../types/planos';

// Mock data storage keys
const STORAGE_KEYS = {
  PLANOS: 'petnexis_planos',
  PLANO_SERVICOS: 'petnexis_plano_servicos',
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const PlanosService = {
  async getPlanos(): Promise<Plano[]> {
    await delay(300);
    const planos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANOS) || '[]');
    const planoServicos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANO_SERVICOS) || '[]');
    
    return planos.filter((p: Plano) => !p.deletado_em).map((p: Plano) => ({
      ...p,
      servicos: planoServicos.filter((ps: PlanoServico) => ps.plano_id === p.id)
    }));
  },

  async getPlanoById(id: string): Promise<Plano | null> {
    await delay(200);
    const planos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANOS) || '[]');
    const plano = planos.find((p: Plano) => p.id === id && !p.deletado_em);
    
    if (!plano) return null;

    const planoServicos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANO_SERVICOS) || '[]');
    plano.servicos = planoServicos.filter((ps: PlanoServico) => ps.plano_id === id);
    
    return plano;
  },

  async createPlano(plano: Omit<Plano, 'id' | 'criado_em' | 'atualizado_em'>): Promise<Plano> {
    await delay(400);
    const planos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANOS) || '[]');
    
    const novoPlano: Plano = {
      id: crypto.randomUUID(),
      ...plano,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    // Save Plano
    const { servicos, ...planoSalvo } = novoPlano;
    planos.push(planoSalvo);
    localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(planos));

    // Save Servicos
    if (servicos && servicos.length > 0) {
      const planoServicosDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANO_SERVICOS) || '[]');
      const novosServicos = servicos.map(s => ({
        id: crypto.randomUUID(),
        plano_id: novoPlano.id,
        ...s,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }));
      planoServicosDb.push(...novosServicos);
      localStorage.setItem(STORAGE_KEYS.PLANO_SERVICOS, JSON.stringify(planoServicosDb));
      novoPlano.servicos = novosServicos;
    }

    return novoPlano;
  },

  async updatePlano(id: string, dados: Partial<Plano>): Promise<Plano> {
    await delay(400);
    const planos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANOS) || '[]');
    const index = planos.findIndex((p: Plano) => p.id === id);
    
    if (index === -1) throw new Error('Plano não encontrado');

    const planoAtualizado = {
      ...planos[index],
      ...dados,
      atualizado_em: new Date().toISOString(),
    };

    // Update Plano
    const { servicos, ...planoSalvo } = planoAtualizado;
    planos[index] = planoSalvo;
    localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(planos));

    // Update Servicos (Full Replace Strategy for Simplicity)
    if (servicos) {
      let planoServicosDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANO_SERVICOS) || '[]');
      // Remove old services
      planoServicosDb = planoServicosDb.filter((ps: PlanoServico) => ps.plano_id !== id);
      // Add new services
      const novosServicos = servicos.map(s => ({
        id: s.id || crypto.randomUUID(),
        plano_id: id,
        servico_id: s.servico_id,
        quantidade: s.quantidade,
        frequencia_mes: s.frequencia_mes,
        descricao_adicional: s.descricao_adicional,
        criado_em: s.criado_em || new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }));
      planoServicosDb.push(...novosServicos);
      localStorage.setItem(STORAGE_KEYS.PLANO_SERVICOS, JSON.stringify(planoServicosDb));
      planoAtualizado.servicos = novosServicos;
    }

    return planoAtualizado;
  },

  async deletePlano(id: string): Promise<void> {
    await delay(300);
    const planos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANOS) || '[]');
    const index = planos.findIndex((p: Plano) => p.id === id);
    
    if (index !== -1) {
      planos[index].deletado_em = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.PLANOS, JSON.stringify(planos));
    }
  }
};
