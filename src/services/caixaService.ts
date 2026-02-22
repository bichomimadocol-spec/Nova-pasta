import { DailyCashRegister, CashTransaction, CrediarioParcela, CardOperator, PaymentAccount } from '../App';

// Mock data storage keys
const STORAGE_KEYS = {
  CAIXA: 'petnexis_caixa',
  TRANSACOES: 'petnexis_transacoes',
  PARCELAS: 'petnexis_parcelas',
  OPERADORAS: 'petnexis_operadoras',
  CONTAS: 'petnexis_contas',
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const CaixaService = {
  // --- CAIXA ---
  async getCaixaHoje(): Promise<DailyCashRegister | null> {
    await delay(300);
    const caixas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAIXA) || '[]');
    const hoje = new Date().toISOString().split('T')[0];
    return caixas.find((c: DailyCashRegister) => c.data === hoje) || null;
  },

  async abrirCaixa(usuario: string, saldoInicial: number): Promise<DailyCashRegister> {
    await delay(500);
    const caixas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAIXA) || '[]');
    const hoje = new Date().toISOString().split('T')[0];
    
    if (caixas.find((c: DailyCashRegister) => c.data === hoje)) {
      throw new Error('Caixa já existe para hoje.');
    }

    const novoCaixa: DailyCashRegister = {
      id: crypto.randomUUID(),
      data: hoje,
      status: 'aberto',
      saldo_inicial: saldoInicial,
      saldo_final: 0,
      usuario_abertura: usuario,
      dt_abertura: new Date().toISOString(),
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    };

    caixas.push(novoCaixa);
    localStorage.setItem(STORAGE_KEYS.CAIXA, JSON.stringify(caixas));

    // Se saldo inicial > 0, criar transação de "Troco inicial"
    if (saldoInicial > 0) {
      await this.criarTransacao({
        caixa_id: novoCaixa.id,
        tipo: 'dinheiro',
        subtipo: 'Troco inicial',
        descricao: 'Abertura de caixa',
        valor: saldoInicial,
        origem: 'entrada_troco',
        usuario_criacao: usuario,
      } as CashTransaction);
    }

    return novoCaixa;
  },

  async fecharCaixa(caixaId: string, usuario: string, observacoes?: string): Promise<DailyCashRegister> {
    await delay(500);
    const caixas = JSON.parse(localStorage.getItem(STORAGE_KEYS.CAIXA) || '[]');
    const index = caixas.findIndex((c: DailyCashRegister) => c.id === caixaId);
    
    if (index === -1) throw new Error('Caixa não encontrado.');

    const transacoes = await this.getTransacoes(caixaId);
    const totalTransacoes = transacoes.reduce((acc, t) => acc + t.valor, 0);
    const saldoFinal = caixas[index].saldo_inicial + totalTransacoes;

    caixas[index] = {
      ...caixas[index],
      status: 'fechado',
      saldo_final: saldoFinal,
      usuario_fechamento: usuario,
      dt_fechamento: new Date().toISOString(),
      observacoes,
      atualizado_em: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.CAIXA, JSON.stringify(caixas));
    return caixas[index];
  },

  // --- TRANSAÇÕES ---
  async getTransacoes(caixaId: string): Promise<CashTransaction[]> {
    await delay(300);
    const transacoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACOES) || '[]');
    return transacoes.filter((t: CashTransaction) => t.caixa_id === caixaId && !t.deletado_em);
  },

  async criarTransacao(dados: Partial<CashTransaction> & { parcelas?: Partial<CrediarioParcela>[] }): Promise<CashTransaction> {
    await delay(300);
    const transacoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACOES) || '[]');
    
    const novaTransacao: CashTransaction = {
      id: crypto.randomUUID(),
      ...dados,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    } as CashTransaction;

    // Remove parcelas from the transaction object before saving (as it belongs to another table)
    const { parcelas, ...transacaoSalva } = novaTransacao as any;

    transacoes.push(transacaoSalva);
    localStorage.setItem(STORAGE_KEYS.TRANSACOES, JSON.stringify(transacoes));

    // Handle Crediário Parcels
    if (parcelas && parcelas.length > 0) {
      const parcelasDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARCELAS) || '[]');
      const novasParcelas = parcelas.map((p: any) => ({
        id: crypto.randomUUID(),
        transacao_id: novaTransacao.id,
        ...p,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      }));
      
      parcelasDb.push(...novasParcelas);
      localStorage.setItem(STORAGE_KEYS.PARCELAS, JSON.stringify(parcelasDb));
    }

    return novaTransacao;
  },

  async getParcelas(transacaoId: string): Promise<CrediarioParcela[]> {
    await delay(300);
    const parcelas = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARCELAS) || '[]');
    return parcelas.filter((p: CrediarioParcela) => p.transacao_id === transacaoId);
  },

  // --- OPERADORAS ---
  async getOperadoras(): Promise<CardOperator[]> {
    await delay(200);
    // Mock initial data if empty
    let operadoras = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERADORAS) || '[]');
    if (operadoras.length === 0) {
      operadoras = [
        { id: crypto.randomUUID(), nome: 'Visa', taxa_comissao: 2.5, dias_repasse: 30, ativo: true },
        { id: crypto.randomUUID(), nome: 'Mastercard', taxa_comissao: 2.5, dias_repasse: 30, ativo: true },
        { id: crypto.randomUUID(), nome: 'Elo', taxa_comissao: 3.0, dias_repasse: 30, ativo: true },
      ];
      localStorage.setItem(STORAGE_KEYS.OPERADORAS, JSON.stringify(operadoras));
    }
    return operadoras;
  },

  // --- CONTAS PAGAMENTO ---
  async getContasPagamento(): Promise<PaymentAccount[]> {
    await delay(200);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTAS) || '[]');
  }
};
