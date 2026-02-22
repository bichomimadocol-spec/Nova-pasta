import React, { useState } from 'react';
import { EntradaMercadoria, Fornecedor, Produto, ItemEntrada, MovimentacaoEstoque } from '../../App';

interface EntradaMercadoriasProps {
  entradas: EntradaMercadoria[];
  setEntradas: React.Dispatch<React.SetStateAction<EntradaMercadoria[]>>;
  fornecedores: Fornecedor[];
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  setMovimentacoesEstoque: React.Dispatch<React.SetStateAction<MovimentacaoEstoque[]>>;
  onIntegrarFinanceiro?: (entrada: EntradaMercadoria) => void;
}

export default function EntradaMercadoriasPage({ 
  entradas, setEntradas, fornecedores, produtos, setProdutos, setMovimentacoesEstoque,
  onIntegrarFinanceiro
}: EntradaMercadoriasProps) {
  
  const [showModal, setShowModal] = useState(false);
  const [viewingEntrada, setViewingEntrada] = useState<EntradaMercadoria | null>(null);
  
  // Form State
  const [form, setForm] = useState<{
    data: string;
    fornecedorId: string;
    numeroDocumento: string;
    observacao: string;
    itens: ItemEntrada[];
  }>({
    data: new Date().toISOString().split('T')[0],
    fornecedorId: '',
    numeroDocumento: '',
    observacao: '',
    itens: []
  });

  // Item Addition State
  const [selectedProdutoId, setSelectedProdutoId] = useState('');
  const [itemQtd, setItemQtd] = useState(1);
  const [itemCusto, setItemCusto] = useState(0);

  const handleAddItem = () => {
    if (!selectedProdutoId) return;
    if (itemQtd <= 0) return;

    const produto = produtos.find(p => p.id === Number(selectedProdutoId));
    if (!produto) return;

    setForm(prev => ({
      ...prev,
      itens: [...prev.itens, {
        produtoId: produto.id,
        descricao: produto.nome,
        quantidade: itemQtd,
        custoUnitario: itemCusto
      }]
    }));

    // Reset item inputs
    setSelectedProdutoId('');
    setItemQtd(1);
    setItemCusto(0);
  };

  const handleRemoveItem = (index: number) => {
    setForm(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (form.itens.length === 0) return;

    const novaEntrada: EntradaMercadoria = {
      id: Date.now(),
      data: form.data,
      fornecedorId: form.fornecedorId ? Number(form.fornecedorId) : undefined,
      numeroDocumento: form.numeroDocumento,
      observacao: form.observacao,
      itens: form.itens
    };

    setEntradas(prev => [novaEntrada, ...prev]);

    // Update Stock and Record Movement
    const updatedProdutos = [...produtos];
    const newMovements: MovimentacaoEstoque[] = [];
    const now = new Date().toISOString();

    form.itens.forEach(item => {
      const prodIndex = updatedProdutos.findIndex(p => p.id === item.produtoId);
      if (prodIndex !== -1) {
        const prod = updatedProdutos[prodIndex];
        // Update stock
        updatedProdutos[prodIndex] = {
          ...prod,
          estoqueAtual: prod.estoqueAtual + item.quantidade
        };

        // Create movement record
        newMovements.push({
          id: Date.now() + Math.random(), // simple unique id
          produtoId: prod.id,
          dataHora: now,
          tipo: 'ENTRADA',
          quantidade: item.quantidade,
          motivo: 'Entrada de Mercadoria',
          referencia: `Entrada #${novaEntrada.id} ${form.numeroDocumento ? '- Doc: ' + form.numeroDocumento : ''}`,
          observacao: form.observacao
        });
      }
    });

    setProdutos(updatedProdutos);
    setMovimentacoesEstoque(prev => [...newMovements, ...prev]);

    // INTEGRATION CALL
    if (onIntegrarFinanceiro) {
      onIntegrarFinanceiro(novaEntrada);
    }

    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      data: new Date().toISOString().split('T')[0],
      fornecedorId: '',
      numeroDocumento: '',
      observacao: '',
      itens: []
    });
    setSelectedProdutoId('');
    setItemQtd(1);
    setItemCusto(0);
  };

  const integrarCompraNoFinanceiro = (entrada: EntradaMercadoria) => {
    // Stub function
    console.log("Integrar compra no financeiro (Stub):", entrada);
  };

  const getFornecedorNome = (id?: number) => {
    if (!id) return '-';
    return fornecedores.find(f => f.id === id)?.nome || 'Desconhecido';
  };

  const getProdutoNome = (id: number) => {
    return produtos.find(p => p.id === id)?.nome || 'Desconhecido';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Entrada de Mercadorias</h2>
        <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
            + Nova Entrada
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Itens</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {entradas.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhuma entrada registrada.</td>
                        </tr>
                    ) : (
                        entradas.map(entrada => (
                            <tr key={entrada.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(entrada.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getFornecedorNome(entrada.fornecedorId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {entrada.numeroDocumento || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                    {entrada.itens.reduce((acc, item) => acc + item.quantidade, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => setViewingEntrada(entrada)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        Ver Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* MODAL NOVA ENTRADA */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[800px] max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Entrada de Mercadoria</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input 
                            type="date"
                            value={form.data}
                            onChange={(e) => setForm({...form, data: e.target.value})}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                        <select 
                            value={form.fornecedorId}
                            onChange={(e) => setForm({...form, fornecedorId: e.target.value})}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Selecione...</option>
                            {fornecedores.filter(f => f.ativo).map(f => (
                                <option key={f.id} value={f.id}>{f.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº Documento</label>
                        <input 
                            type="text"
                            value={form.numeroDocumento}
                            onChange={(e) => setForm({...form, numeroDocumento: e.target.value})}
                            className="w-full border rounded p-2"
                            placeholder="Ex: NF 1234"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                    <input 
                        type="text"
                        value={form.observacao}
                        onChange={(e) => setForm({...form, observacao: e.target.value})}
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* ADD ITEMS AREA */}
                <div className="bg-gray-50 p-4 rounded border mb-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">Adicionar Itens</h3>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Produto</label>
                            <select 
                                value={selectedProdutoId}
                                onChange={(e) => setSelectedProdutoId(e.target.value)}
                                className="w-full border rounded p-2 text-sm"
                            >
                                <option value="">Selecione um produto...</option>
                                {produtos.filter(p => p.tipo === 'Produto' && p.ativo).map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-24">
                            <label className="block text-xs text-gray-500 mb-1">Qtd</label>
                            <input 
                                type="number"
                                value={itemQtd}
                                onChange={(e) => setItemQtd(Number(e.target.value))}
                                className="w-full border rounded p-2 text-sm"
                                min="1"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-500 mb-1">Custo Unit. (R$)</label>
                            <input 
                                type="number"
                                value={itemCusto}
                                onChange={(e) => setItemCusto(Number(e.target.value))}
                                className="w-full border rounded p-2 text-sm"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <button 
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold text-sm"
                        >
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* ITEMS LIST */}
                <div className="flex-1 overflow-y-auto border rounded mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produto</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qtd</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Custo Unit.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                <th className="px-4 py-2 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {form.itens.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum item adicionado.</td>
                                </tr>
                            ) : (
                                form.itens.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2 text-sm">{item.descricao}</td>
                                        <td className="px-4 py-2 text-sm text-right">{item.quantidade}</td>
                                        <td className="px-4 py-2 text-sm text-right">R$ {item.custoUnitario?.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-sm text-right font-bold">R$ {((item.custoUnitario || 0) * item.quantidade).toFixed(2)}</td>
                                        <td className="px-4 py-2 text-center">
                                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={form.itens.length === 0}
                        className={`flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold ${form.itens.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Salvar Entrada
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {viewingEntrada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[600px]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Detalhes da Entrada #{viewingEntrada.id}</h2>
                    <button onClick={() => setViewingEntrada(null)} className="text-gray-500 text-2xl">&times;</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="font-bold">Data:</span> {new Date(viewingEntrada.data).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-bold">Fornecedor:</span> {getFornecedorNome(viewingEntrada.fornecedorId)}</div>
                    <div><span className="font-bold">Documento:</span> {viewingEntrada.numeroDocumento || '-'}</div>
                    <div><span className="font-bold">Observação:</span> {viewingEntrada.observacao || '-'}</div>
                </div>

                <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Produto</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qtd</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Custo Unit.</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {viewingEntrada.itens.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-4 py-2 text-sm">{getProdutoNome(item.produtoId)}</td>
                                    <td className="px-4 py-2 text-sm text-right">{item.quantidade}</td>
                                    <td className="px-4 py-2 text-sm text-right">R$ {item.custoUnitario?.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
