import React, { useState, useMemo } from 'react';
import { Venda, ContaReceber, ContaPagar, ContaFinanceira, Produto } from '../App';

interface PainelProps {
  vendas: Venda[];
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  contasFinanceiras: ContaFinanceira[];
  produtos: Produto[];
  caixaAberto: boolean;
}

export default function Painel({ vendas, contasReceber, contasPagar, contasFinanceiras, produtos, caixaAberto }: PainelProps) {
  const [filtro, setFiltro] = useState<'MES' | '30DIAS' | 'TODAS'>('MES');

  const parseDate = (dateStr: string) => {
    if (dateStr.includes(',')) {
      const [datePart] = dateStr.split(',');
      const [day, month, year] = datePart.trim().split('/');
      return new Date(Number(year), Number(month) - 1, Number(day));
    } else if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return new Date();
  };

  const isDateInPeriod = (date: Date) => {
    const now = new Date();
    if (filtro === 'TODAS') return true;
    
    if (filtro === 'MES') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    if (filtro === '30DIAS') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      return date >= thirtyDaysAgo;
    }
    
    return true;
  };

  const dadosDRE = useMemo(() => {
    const vendasCaixa = vendas.filter(v => {
      const isCartao = v.formaPagamento.includes('Cartão');
      return !isCartao && isDateInPeriod(parseDate(v.dataVenda));
    });
    const totalVendasCaixa = vendasCaixa.reduce((acc, v) => acc + v.total, 0);

    const recebimentos = contasReceber.filter(c => {
      return c.status === 'RECEBIDO' && isDateInPeriod(parseDate(c.dataVencimento));
    });
    const totalRecebimentos = recebimentos.reduce((acc, c) => acc + c.valor, 0);

    const receitaBruta = totalVendasCaixa + totalRecebimentos;

    const pagamentos = contasPagar.filter(c => {
      return c.status === 'PAGO' && isDateInPeriod(parseDate(c.dataVencimento));
    });
    const despesas = pagamentos.reduce((acc, c) => acc + c.valor, 0);

    const resultado = receitaBruta - despesas;

    return { receitaBruta, despesas, resultado };
  }, [vendas, contasReceber, contasPagar, filtro]);

  const kpis = useMemo(() => {
    const vendasPeriodo = vendas.filter(v => isDateInPeriod(parseDate(v.dataVenda)));
    const faturamento = vendasPeriodo.reduce((acc, v) => acc + v.total, 0);
    const totalVendas = vendasPeriodo.length;
    const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;
    
    return { faturamento, totalVendas, ticketMedio };
  }, [vendas, filtro]);

  const vendasPorPagamento = useMemo(() => {
    const vendasPeriodo = vendas.filter(v => isDateInPeriod(parseDate(v.dataVenda)));
    const agrupado: {[key: string]: number} = {};
    
    vendasPeriodo.forEach(v => {
      const tipo = v.formaPagamento.includes('Cartão') ? 'Cartão' : v.formaPagamento;
      agrupado[tipo] = (agrupado[tipo] || 0) + v.total;
    });

    return agrupado;
  }, [vendas, filtro]);

  const produtosMaisVendidos = useMemo(() => {
    const vendasPeriodo = vendas.filter(v => isDateInPeriod(parseDate(v.dataVenda)));
    const contagem: {[key: string]: number} = {};

    vendasPeriodo.forEach(v => {
      v.itens.forEach(item => {
        contagem[item.nome] = (contagem[item.nome] || 0) + item.quantidade;
      });
    });

    return Object.entries(contagem)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [vendas, filtro]);

  const alertas = useMemo(() => {
    const estoqueBaixo = produtos.filter(p => p.controlaEstoque && p.estoqueAtual <= p.estoqueMinimo);
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const contasVencidas = contasPagar.filter(c => {
      if (c.status !== 'PENDENTE') return false;
      const vencimento = parseDate(c.dataVencimento);
      return vencimento < hoje;
    });

    return { estoqueBaixo, contasVencidas };
  }, [produtos, contasPagar]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Gerencial</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setFiltro('MES')} style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: filtro === 'MES' ? 'bold' : 'normal', backgroundColor: filtro === 'MES' ? '#e9ecef' : 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>Mês Atual</button>
        <button onClick={() => setFiltro('30DIAS')} style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer', fontWeight: filtro === '30DIAS' ? 'bold' : 'normal', backgroundColor: filtro === '30DIAS' ? '#e9ecef' : 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>Últimos 30 Dias</button>
        <button onClick={() => setFiltro('TODAS')} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: filtro === 'TODAS' ? 'bold' : 'normal', backgroundColor: filtro === 'TODAS' ? '#e9ecef' : 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>Todo o Período</button>
      </div>

      {/* ALERTAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {caixaAberto && (
          <div style={{ padding: '10px 20px', backgroundColor: '#d1ecf1', color: '#0c5460', borderRadius: '4px', border: '1px solid #bee5eb' }}>
            ℹ️ Caixa Aberto
          </div>
        )}
        {alertas.estoqueBaixo.length > 0 && (
          <div style={{ padding: '10px 20px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', border: '1px solid #ffeeba' }}>
            ⚠️ {alertas.estoqueBaixo.length} Produtos com Estoque Baixo
          </div>
        )}
        {alertas.contasVencidas.length > 0 && (
          <div style={{ padding: '10px 20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', border: '1px solid #f5c6cb' }}>
            🚨 {alertas.contasVencidas.length} Contas Vencidas
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Faturamento</h3>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#0275d8' }}>R$ {kpis.faturamento.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Lucro (DRE)</h3>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: dadosDRE.resultado >= 0 ? 'green' : 'red' }}>R$ {dadosDRE.resultado.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Ticket Médio</h3>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#333' }}>R$ {kpis.ticketMedio.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, minWidth: '200px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Vendas</h3>
          <div style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#333' }}>{kpis.totalVendas}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Receita por Pagamento */}
        <div style={{ flex: 1, minWidth: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Receita por Forma de Pagamento</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {Object.entries(vendasPorPagamento).map(([tipo, valor]) => (
                <tr key={tipo} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{tipo}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>R$ {(valor as number).toFixed(2)}</td>
                </tr>
              ))}
              {Object.keys(vendasPorPagamento).length === 0 && <tr><td colSpan={2} style={{ padding: '10px', textAlign: 'center' }}>Sem dados</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Produtos Mais Vendidos */}
        <div style={{ flex: 1, minWidth: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          <h3>Top 5 Produtos Mais Vendidos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Produto</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {produtosMaisVendidos.map(([nome, qtd]) => (
                <tr key={nome} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{nome}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{qtd}</td>
                </tr>
              ))}
              {produtosMaisVendidos.length === 0 && <tr><td colSpan={2} style={{ padding: '10px', textAlign: 'center' }}>Sem dados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRE Section (Existing) */}
      <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
        <h3>Detalhamento DRE</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Receita Bruta:</span>
          <strong>R$ {dadosDRE.receitaBruta.toFixed(2)}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>(-) Despesas:</span>
          <strong style={{ color: 'red' }}>R$ {dadosDRE.despesas.toFixed(2)}</strong>
        </div>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '1.2em' }}>
          <span>Resultado:</span>
          <strong style={{ color: dadosDRE.resultado >= 0 ? 'green' : 'red' }}>R$ {dadosDRE.resultado.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
