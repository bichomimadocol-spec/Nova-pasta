import React, { useState, useMemo } from 'react';
import { EntradaMercadoria, Fornecedor, Produto } from '../../App';

interface RelatoriosComprasProps {
  entradas: EntradaMercadoria[];
  fornecedores: Fornecedor[];
  produtos: Produto[];
}

export default function RelatoriosComprasPage({ entradas, fornecedores, produtos }: RelatoriosComprasProps) {
  const [activeTab, setActiveTab] = useState<'PERIODO' | 'PRODUTO'>('PERIODO');
  const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProdutoId, setSelectedProdutoId] = useState('');

  const getFornecedorNome = (id?: number) => {
    if (!id) return '-';
    return fornecedores.find(f => f.id === id)?.nome || 'Desconhecido';
  };

  const getProdutoNome = (id: number) => {
    return produtos.find(p => p.id === id)?.nome || 'Desconhecido';
  };

  // REPORT A: PERIODO
  const reportPeriodo = useMemo(() => {
    return entradas.filter(e => e.data >= dateStart && e.data <= dateEnd);
  }, [entradas, dateStart, dateEnd]);

  // REPORT B: PRODUTO
  const reportProduto = useMemo(() => {
    const filteredEntradas = entradas.filter(e => e.data >= dateStart && e.data <= dateEnd);
    
    // Aggregate by product
    const aggregation: Record<number, { qtd: number, totalCusto: number, count: number }> = {};

    filteredEntradas.forEach(entrada => {
        entrada.itens.forEach(item => {
            if (selectedProdutoId && item.produtoId !== Number(selectedProdutoId)) return;

            if (!aggregation[item.produtoId]) {
                aggregation[item.produtoId] = { qtd: 0, totalCusto: 0, count: 0 };
            }
            aggregation[item.produtoId].qtd += item.quantidade;
            aggregation[item.produtoId].totalCusto += (item.custoUnitario || 0) * item.quantidade;
            aggregation[item.produtoId].count += 1;
        });
    });

    return Object.entries(aggregation).map(([prodId, data]) => ({
        produtoId: Number(prodId),
        ...data
    })).sort((a, b) => b.qtd - a.qtd);

  }, [entradas, dateStart, dateEnd, selectedProdutoId]);


  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-4 mb-6 border-b">
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'PERIODO' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('PERIODO')}
        >
            Entradas por Período
        </button>
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'PRODUTO' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('PRODUTO')}
        >
            Entradas por Produto
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex gap-4 items-end">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input 
                type="date" 
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="border rounded p-2"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input 
                type="date" 
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="border rounded p-2"
            />
        </div>
        {activeTab === 'PRODUTO' && (
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar Produto (Opcional)</label>
                <select 
                    value={selectedProdutoId}
                    onChange={(e) => setSelectedProdutoId(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <option value="">Todos os produtos</option>
                    {produtos.filter(p => p.tipo === 'Produto').map(p => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                </select>
            </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            {activeTab === 'PERIODO' ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd Itens</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Total (Est.)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportPeriodo.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum registro no período.</td></tr>
                        ) : (
                            reportPeriodo.map(entrada => {
                                const totalValor = entrada.itens.reduce((acc, item) => acc + ((item.custoUnitario || 0) * item.quantidade), 0);
                                const totalQtd = entrada.itens.reduce((acc, item) => acc + item.quantidade, 0);
                                return (
                                    <tr key={entrada.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(entrada.data).toLocaleDateString('pt-BR')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getFornecedorNome(entrada.fornecedorId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{totalQtd}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">R$ {totalValor.toFixed(2)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd Total Entrada</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custo Médio (no período)</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Gasto</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportProduto.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum registro no período.</td></tr>
                        ) : (
                            reportProduto.map(row => (
                                <tr key={row.produtoId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getProdutoNome(row.produtoId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">{row.qtd}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">R$ {(row.totalCusto / row.qtd).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">R$ {row.totalCusto.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
}
