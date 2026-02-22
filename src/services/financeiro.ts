import { 
  TituloFinanceiro, 
  BaixaTitulo, 
  MovimentoConta, 
  RecebivelCartao, 
  OperadoraCartao, 
  ContaBancaria,
  Agendamento,
  Venda,
  EntradaMercadoria,
  Cliente,
  Fornecedor
} from '../App';

export interface IntegrationResult {
  titulo?: TituloFinanceiro;
  baixa?: BaixaTitulo;
  movimento?: MovimentoConta;
  recebivel?: RecebivelCartao;
}

export const FinanceiroService = {
  // --- AGENDA ---
  gerarDadosCheckoutAgenda: (
    agendamento: Agendamento,
    cliente: Cliente | undefined,
    operadoras: OperadoraCartao[],
    contas: ContaBancaria[],
    operadoraIdSelected?: number
  ): IntegrationResult => {
    const result: IntegrationResult = {};
    const now = new Date();
    const dataHoje = now.toISOString().split('T')[0];

    // 1. Título a Receber
    const titulo: TituloFinanceiro = {
      id: Date.now(),
      tipo: 'RECEBER',
      pessoaTipo: 'CLIENTE',
      pessoaId: agendamento.clienteId,
      pessoaNome: cliente?.nome || 'Cliente Agenda',
      descricao: `Atendimento ${agendamento.servico}`,
      dataEmissao: dataHoje,
      dataVencimento: dataHoje,
      valorOriginal: agendamento.valorTotal || agendamento.valor || 0,
      desconto: agendamento.desconto || 0,
      juros: 0,
      multa: 0,
      valorLiquido: (agendamento.valorTotal || agendamento.valor || 0),
      status: 'ABERTO',
      origem: 'AGENDA',
      origemId: agendamento.id,
      observacao: agendamento.observacoesFinanceiro
    };
    result.titulo = titulo;

    // 2. Lógica de Pagamento
    const forma = agendamento.formaPagamento;
    const contaCaixa = contas.find(c => c.tipo === 'CAIXA' && c.ativo) || contas[0]; // Fallback to first account

    if (forma === 'DINHEIRO' || forma === 'PIX' || forma === 'TRANSFERENCIA') {
      // Baixa Automática
      const baixa: BaixaTitulo = {
        id: Date.now() + 1,
        tituloId: titulo.id,
        contaId: contaCaixa?.id || 0,
        data: dataHoje,
        valor: titulo.valorLiquido,
        formaPagamento: forma as any,
        observacao: 'Baixa automática via Agenda'
      };
      result.baixa = baixa;
      titulo.status = 'PAGO';

      // Movimento de Conta
      if (contaCaixa) {
        const movimento: MovimentoConta = {
          id: Date.now() + 2,
          contaId: contaCaixa.id,
          data: dataHoje,
          tipo: 'ENTRADA',
          valor: titulo.valorLiquido,
          historico: `Recebimento Agenda: ${agendamento.servico}`,
          referenciaTipo: 'AR',
          referenciaId: titulo.id,
          conciliado: true,
          observacao: `Cliente: ${cliente?.nome}`
        };
        result.movimento = movimento;
      }

    } else if (forma === 'CARTAO_CREDITO' || forma === 'CARTAO_DEBITO') {
      // Recebível de Cartão
      const operadora = operadoras.find(o => o.id === operadoraIdSelected) || operadoras.find(o => o.ativo);
      
      if (operadora) {
        let taxa = 0;
        let dias = 0;
        let modalidade: 'DEBITO' | 'CREDITO_AVISTA' = 'CREDITO_AVISTA';

        if (forma === 'CARTAO_DEBITO') {
          taxa = operadora.taxaDebito || 0;
          dias = operadora.diasLiquidezDebito || 1;
          modalidade = 'DEBITO';
        } else {
          taxa = operadora.taxaCreditoAvista || 0;
          dias = operadora.diasLiquidezCredito || 30;
          modalidade = 'CREDITO_AVISTA';
        }

        const valorTaxa = (titulo.valorLiquido * taxa) / 100;
        const liquidoPrevisto = titulo.valorLiquido - valorTaxa;
        const dataPrev = new Date(now);
        dataPrev.setDate(dataPrev.getDate() + dias);

        const recebivel: RecebivelCartao = {
          id: Date.now() + 3,
          dataVenda: dataHoje,
          origem: 'AGENDA',
          origemId: agendamento.id,
          clienteId: agendamento.clienteId,
          valorBruto: titulo.valorLiquido,
          taxaPercentual: taxa,
          valorTaxa: valorTaxa,
          valorLiquidoPrevisto: liquidoPrevisto,
          modalidade: modalidade,
          parcelas: 1,
          parcelaNumero: 1,
          operadoraId: operadora.id,
          dataPrevistaRecebimento: dataPrev.toISOString().split('T')[0],
          status: 'ABERTO',
          valorRecebidoAcumulado: 0,
          conciliado: false,
          observacao: `Gerado via Agenda #${agendamento.id}`
        };
        result.recebivel = recebivel;
        
        // Mantém título em ABERTO para conciliação ou PAGO?
        // Regra do prompt: "O título AR pode ficar: ABERTO (se você quiser tratar cartão como “a receber”)"
        // Vamos manter ABERTO para indicar que o dinheiro ainda não está na conta (será baixado na conciliação ou manualmente?)
        // Prompt diz: "NÃO conciliar automaticamente; conciliação ocorre em “Recebimento de Operadora”."
        // Se deixarmos ABERTO, ele aparece no Contas a Receber. Quando o dinheiro cair (Recebimento Operadora), baixamos o título?
        // O fluxo de cartão é complexo. Geralmente: Venda -> Recebível. O Título Financeiro é a Venda.
        // Se baixarmos o título agora, duplicamos a receita se considerarmos Recebível como dinheiro.
        // Melhor abordagem simples: Título fica ABERTO. Quando conciliar o recebível, baixamos o título?
        // O prompt diz: "Ao conciliar: ... Atualizar recebíveis ... Criar Movimento de Conta". Não diz explicitamente para baixar o título AR.
        // Mas diz "Registrar vendas em cartão como 'a receber da operadora'".
        // Vamos deixar o título como ABERTO.
      }
    }

    return result;
  },

  // --- PDV ---
  gerarDadosVendaPDV: (
    venda: Venda,
    cliente: Cliente | undefined,
    operadoras: OperadoraCartao[],
    contas: ContaBancaria[],
    operadoraIdSelected?: number
  ): IntegrationResult => {
    const result: IntegrationResult = {};
    const now = new Date();
    const dataHoje = now.toISOString().split('T')[0];

    // 1. Título
    const titulo: TituloFinanceiro = {
      id: Date.now(),
      tipo: 'RECEBER',
      pessoaTipo: 'CLIENTE',
      pessoaId: venda.clienteId || 0,
      pessoaNome: cliente?.nome || 'Consumidor Final',
      descricao: `Venda PDV #${venda.id}`,
      dataEmissao: dataHoje,
      dataVencimento: dataHoje,
      valorOriginal: venda.total,
      desconto: venda.desconto || 0,
      juros: 0,
      multa: 0,
      valorLiquido: venda.total,
      status: 'ABERTO',
      origem: 'PDV',
      origemId: venda.id,
      observacao: 'Venda de produtos'
    };
    result.titulo = titulo;

    // 2. Pagamento
    const forma = venda.formaPagamento;
    const contaCaixa = contas.find(c => c.tipo === 'CAIXA' && c.ativo) || contas[0];

    if (forma === 'DINHEIRO' || forma === 'PIX' || forma === 'TRANSFERENCIA') {
      const baixa: BaixaTitulo = {
        id: Date.now() + 1,
        tituloId: titulo.id,
        contaId: contaCaixa?.id || 0,
        data: dataHoje,
        valor: titulo.valorLiquido,
        formaPagamento: forma as any,
        observacao: 'Baixa automática via PDV'
      };
      result.baixa = baixa;
      titulo.status = 'PAGO';

      if (contaCaixa) {
        const movimento: MovimentoConta = {
          id: Date.now() + 2,
          contaId: contaCaixa.id,
          data: dataHoje,
          tipo: 'ENTRADA',
          valor: titulo.valorLiquido,
          historico: `Venda PDV #${venda.id}`,
          referenciaTipo: 'PDV',
          referenciaId: venda.id,
          conciliado: true
        };
        result.movimento = movimento;
      }
    } else if (forma === 'CARTAO_CREDITO' || forma === 'CARTAO_DEBITO') {
      const operadora = operadoras.find(o => o.id === operadoraIdSelected) || operadoras.find(o => o.ativo);
      
      if (operadora) {
        let taxa = 0;
        let dias = 0;
        let modalidade: 'DEBITO' | 'CREDITO_AVISTA' = 'CREDITO_AVISTA';

        if (forma === 'CARTAO_DEBITO') {
          taxa = operadora.taxaDebito || 0;
          dias = operadora.diasLiquidezDebito || 1;
          modalidade = 'DEBITO';
        } else {
          taxa = operadora.taxaCreditoAvista || 0;
          dias = operadora.diasLiquidezCredito || 30;
          modalidade = 'CREDITO_AVISTA';
        }

        const valorTaxa = (titulo.valorLiquido * taxa) / 100;
        const liquidoPrevisto = titulo.valorLiquido - valorTaxa;
        const dataPrev = new Date(now);
        dataPrev.setDate(dataPrev.getDate() + dias);

        const recebivel: RecebivelCartao = {
          id: Date.now() + 3,
          dataVenda: dataHoje,
          origem: 'PDV',
          origemId: venda.id,
          clienteId: venda.clienteId,
          valorBruto: titulo.valorLiquido,
          taxaPercentual: taxa,
          valorTaxa: valorTaxa,
          valorLiquidoPrevisto: liquidoPrevisto,
          modalidade: modalidade,
          parcelas: 1,
          parcelaNumero: 1,
          operadoraId: operadora.id,
          dataPrevistaRecebimento: dataPrev.toISOString().split('T')[0],
          status: 'ABERTO',
          valorRecebidoAcumulado: 0,
          conciliado: false,
          observacao: `Gerado via PDV #${venda.id}`
        };
        result.recebivel = recebivel;
      }
    }

    return result;
  },

  // --- COMPRAS ---
  gerarDadosEntradaCompra: (
    entrada: EntradaMercadoria,
    fornecedor: Fornecedor | undefined
  ): IntegrationResult => {
    const result: IntegrationResult = {};
    const now = new Date();
    const dataHoje = now.toISOString().split('T')[0];

    // Calcular total da entrada
    const total = entrada.itens.reduce((acc, item) => acc + (item.quantidade * item.custoUnitario), 0);

    const titulo: TituloFinanceiro = {
      id: Date.now(),
      tipo: 'PAGAR',
      pessoaTipo: 'FORNECEDOR',
      pessoaId: entrada.fornecedorId,
      pessoaNome: fornecedor?.nome || 'Fornecedor Desconhecido',
      descricao: `Compra #${entrada.numeroDocumento || entrada.id}`,
      dataEmissao: entrada.data,
      dataVencimento: entrada.data, // Default to same day, user can edit later
      valorOriginal: total,
      desconto: 0,
      juros: 0,
      multa: 0,
      valorLiquido: total,
      status: 'ABERTO',
      origem: 'COMPRAS',
      origemId: entrada.id,
      observacao: entrada.observacao
    };
    result.titulo = titulo;

    return result;
  }
};
