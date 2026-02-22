import React, { useState, useMemo } from 'react';
import { Produto, MovimentacaoEstoque } from '../App';

interface EstoqueProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  movimentacoesEstoque: MovimentacaoEstoque[];
  setMovimentacoesEstoque: React.Dispatch<React.SetStateAction<MovimentacaoEstoque[]>>;
}

export default function Estoque({ 
  produtos, setProdutos, 
  movimentacoesEstoque, setMovimentacoesEstoque 
}: EstoqueProps) {
  
  // --- STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'BAIXO' | 'ZERADO'>('TODOS');
  
  // Modal State
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  
  // Form State
  const [error, setError] = useState<string | null>(null);
  const [movimentacaoForm, setMovimentacaoForm] = useState<{
    tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'INVENTARIO';
    quantidade: number;
    motivo: string;
    observacao: string;
    direcaoAjuste: 'SOMAR' | 'SUBTRAIR'; // Only for AJUSTE
  }>({
    tipo: 'ENTRADA',
    quantidade: 0,
    motivo: '',
    observacao: '',
    direcaoAjuste: 'SOMAR'
  });

  // --- FILTERING ---
  const filteredProdutos = useMemo(() => {
    return produtos.filter(p => {
      // Only show 'Produto' type
      if (p.tipo !== 'Produto') return false;

      // Text Search
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        p.nome.toLowerCase().includes(term) || 
        (p.codigoBarras && p.codigoBarras.includes(term)) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        p.id.toString().includes(term);

      if (!matchesSearch) return false;

      // Status Filter
      if (filterStatus === 'ZERADO') return p.estoqueAtual === 0;
      if (filterStatus === 'BAIXO') return p.estoqueAtual > 0 && p.estoqueAtual <= p.estoqueMinimo;

      return true;
    });
  }, [produtos, searchTerm, filterStatus]);

  // --- HANDLERS ---

  const handleOpenMovimentacao = (produto: Produto) => {
    setSelectedProduto(produto);
    setError(null);
    setMovimentacaoForm({
      tipo: 'ENTRADA',
      quantidade: 0,
      motivo: '',
      observacao: '',
      direcaoAjuste: 'SOMAR'
    });
    setShowMovimentacaoModal(true);
  };

  const handleOpenHistory = (produto: Produto) => {
    setSelectedProduto(produto);
    setShowHistoryModal(true);
  };

  const handleSaveMovimentacao = () => {
    if (!selectedProduto) return;
    setError(null);

    if (movimentacaoForm.quantidade <= 0 && movimentacaoForm.tipo !== 'INVENTARIO') {
        // Inventory can be 0 (setting stock to 0)
        // Others must have positive quantity to move
        setError("A quantidade deve ser maior que zero.");
        return;
    }

    let novoEstoque = selectedProduto.estoqueAtual;
    const qtd = Number(movimentacaoForm.quantidade);

    if (movimentacaoForm.tipo === 'ENTRADA') {
        novoEstoque += qtd;
    } else if (movimentacaoForm.tipo === 'SAIDA') {
        if (novoEstoque < qtd) {
            setError("Estoque insuficiente para realizar a saída.");
            return;
        }
        novoEstoque -= qtd;
    } else if (movimentacaoForm.tipo === 'AJUSTE') {
        if (movimentacaoForm.direcaoAjuste === 'SOMAR') {
            novoEstoque += qtd;
        } else {
            // Subtract
             if (novoEstoque < qtd) {
                setError("Estoque insuficiente para realizar o ajuste (subtração).");
                return;
            }
            novoEstoque -= qtd;
        }
    } else if (movimentacaoForm.tipo === 'INVENTARIO') {
        // Set exact stock
        novoEstoque = qtd;
    }

    // Update Product Stock
    setProdutos(prev => prev.map(p => p.id === selectedProduto.id ? { ...p, estoqueAtual: novoEstoque } : p));

    // Record Movement
    const novaMovimentacao: MovimentacaoEstoque = {
        id: Date.now(),
        produtoId: selectedProduto.id,
        dataHora: new Date().toISOString(),
        tipo: movimentacaoForm.tipo,
        quantidade: qtd,
        motivo: movimentacaoForm.motivo || (movimentacaoForm.tipo === 'INVENTARIO' ? 'Contagem' : ''),
        observacao: movimentacaoForm.observacao,
        referencia: movimentacaoForm.tipo === 'AJUSTE' ? `Ajuste (${movimentacaoForm.direcaoAjuste})` : undefined
    };

    setMovimentacoesEstoque(prev => [novaMovimentacao, ...prev]);

    setShowMovimentacaoModal(false);
  };

  // --- RENDER HELPERS ---

  const getStatusBadge = (p: Produto) => {
    if (p.estoqueAtual === 0) {
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">ZERADO</span>;
    }
    if (p.estoqueAtual <= p.estoqueMinimo) {
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">BAIXO</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">OK</span>;
  };

  const productHistory = useMemo(() => {
    if (!selectedProduto) return [];
    return movimentacoesEstoque.filter(m => m.produtoId === selectedProduto.id).sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
  }, [movimentacoesEstoque, selectedProduto]);

  return (
    <div className="p-6 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Módulo de Estoque</h1>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">+ Entrada</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">+ Saída</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">+ Ajuste</button>
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">Exportar</button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por produto, SKU ou código"
                className="w-full border rounded-md p-2"
            />
        </div>
        <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full border rounded-md p-2"
            >
                <option value="TODOS">Todos</option>
                <option value="BAIXO">Estoque Baixo</option>
                <option value="ZERADO">Sem Estoque</option>
            </select>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium h-[42px]">
            Pesquisar
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU / Cód</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque Atual</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Mínimo</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProdutos.map(produto => (
                        <tr key={produto.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {produto.sku || produto.codigoBarras || produto.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {produto.nome}
                                {produto.unidade && <span className="ml-1 text-xs text-gray-500">({produto.unidade})</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                                {produto.estoqueAtual}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                {produto.estoqueMinimo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                {getStatusBadge(produto)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => handleOpenMovimentacao(produto)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                    Movimentar
                                </button>
                                <button 
                                    onClick={() => handleOpenHistory(produto)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Histórico
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* MOVIMENTACAO MODAL */}
      {showMovimentacaoModal && selectedProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Movimentação de Estoque</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <div className="text-sm text-gray-500">Produto</div>
                    <div className="font-bold text-gray-800">{selectedProduto.nome}</div>
                    <div className="text-sm text-gray-500 mt-1">Estoque Atual: <span className="font-bold text-gray-800">{selectedProduto.estoqueAtual}</span></div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação</label>
                        <select 
                            value={movimentacaoForm.tipo}
                            onChange={(e) => setMovimentacaoForm({...movimentacaoForm, tipo: e.target.value as any})}
                            className="w-full border rounded p-2"
                        >
                            <option value="ENTRADA">Entrada</option>
                            <option value="SAIDA">Saída</option>
                            <option value="AJUSTE">Ajuste</option>
                            <option value="INVENTARIO">Inventário (Contagem)</option>
                        </select>
                    </div>

                    {movimentacaoForm.tipo === 'AJUSTE' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Direção do Ajuste</label>
                            <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        name="direcao" 
                                        value="SOMAR" 
                                        checked={movimentacaoForm.direcaoAjuste === 'SOMAR'}
                                        onChange={() => setMovimentacaoForm({...movimentacaoForm, direcaoAjuste: 'SOMAR'})}
                                        className="form-radio text-indigo-600"
                                    />
                                    <span className="ml-2">Somar (+)</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input 
                                        type="radio" 
                                        name="direcao" 
                                        value="SUBTRAIR" 
                                        checked={movimentacaoForm.direcaoAjuste === 'SUBTRAIR'}
                                        onChange={() => setMovimentacaoForm({...movimentacaoForm, direcaoAjuste: 'SUBTRAIR'})}
                                        className="form-radio text-indigo-600"
                                    />
                                    <span className="ml-2">Subtrair (-)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {movimentacaoForm.tipo === 'INVENTARIO' ? 'Quantidade Final (Contagem)' : 'Quantidade'}
                        </label>
                        <input 
                            type="number"
                            value={movimentacaoForm.quantidade}
                            onChange={(e) => setMovimentacaoForm({...movimentacaoForm, quantidade: Number(e.target.value)})}
                            className="w-full border rounded p-2"
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                        <input 
                            type="text"
                            value={movimentacaoForm.motivo}
                            onChange={(e) => setMovimentacaoForm({...movimentacaoForm, motivo: e.target.value})}
                            className="w-full border rounded p-2"
                            placeholder="Ex: Compra NF 123, Quebra, Doação..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                        <textarea 
                            value={movimentacaoForm.observacao}
                            onChange={(e) => setMovimentacaoForm({...movimentacaoForm, observacao: e.target.value})}
                            className="w-full border rounded p-2"
                            rows={2}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setShowMovimentacaoModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSaveMovimentacao}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistoryModal && selectedProduto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[700px] max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Histórico de Movimentações</h2>
                    <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded border">
                    <div className="font-bold text-gray-800">{selectedProduto.nome}</div>
                    <div className="text-sm text-gray-500">SKU: {selectedProduto.sku || '-'}</div>
                </div>

                <div className="flex-1 overflow-y-auto border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {productHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhuma movimentação registrada.</td>
                                </tr>
                            ) : (
                                productHistory.map(mov => (
                                    <tr key={mov.id}>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                            {new Date(mov.dataHora).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-800' :
                                                mov.tipo === 'SAIDA' ? 'bg-red-100 text-red-800' :
                                                mov.tipo === 'INVENTARIO' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {mov.tipo}
                                            </span>
                                            {mov.referencia && <div className="text-xs text-gray-400 mt-0.5">{mov.referencia}</div>}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-right font-mono font-bold">
                                            {mov.quantidade}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-600">
                                            {mov.motivo || '-'}
                                            {mov.observacao && <div className="text-xs text-gray-400 italic mt-0.5">{mov.observacao}</div>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
