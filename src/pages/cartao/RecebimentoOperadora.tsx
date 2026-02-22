import React, { useState, useMemo } from 'react';
import { OperadoraCartao, RecebivelCartao, RecebimentoOperadora, ContaBancaria, MovimentoConta } from '../../App';

interface RecebimentoOperadoraProps {
  operadoras: OperadoraCartao[];
  recebiveis: RecebivelCartao[];
  setRecebiveis: React.Dispatch<React.SetStateAction<RecebivelCartao[]>>;
  recebimentos: RecebimentoOperadora[];
  setRecebimentos: React.Dispatch<React.SetStateAction<RecebimentoOperadora[]>>;
  contasBancarias: ContaBancaria[];
  setMovimentosConta: React.Dispatch<React.SetStateAction<MovimentoConta[]>>;
}

export default function RecebimentoOperadoraPage({
  operadoras,
  recebiveis,
  setRecebiveis,
  recebimentos,
  setRecebimentos,
  contasBancarias,
  setMovimentosConta
}: RecebimentoOperadoraProps) {
  const [selectedOperadoraId, setSelectedOperadoraId] = useState<number | ''>('');
  const [filterStatus, setFilterStatus] = useState<string>('ABERTO');
  const [selectedRecebivelIds, setSelectedRecebivelIds] = useState<number[]>([]);
  
  // Manual Entry Form
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState<Partial<RecebivelCartao>>({
    valorBruto: 0,
    taxaPercentual: 0,
    modalidade: 'CREDITO_AVISTA',
    parcelas: 1,
    dataVenda: new Date().toISOString().split('T')[0]
  });

  // Conciliation Form
  const [conciliacaoForm, setConciliacaoForm] = useState<{
    contaId: number;
    dataRecebimento: string;
    valorRecebido: number;
    taxaTotal: number;
    observacao: string;
  }>({
    contaId: 0,
    dataRecebimento: new Date().toISOString().split('T')[0],
    valorRecebido: 0,
    taxaTotal: 0,
    observacao: ''
  });

  // --- HELPERS ---
  const filteredRecebiveis = useMemo(() => {
    if (!selectedOperadoraId) return [];
    return recebiveis.filter(r => {
      if (r.operadoraId !== selectedOperadoraId) return false;
      if (filterStatus === 'ABERTO' && (r.status === 'RECEBIDO' || r.status === 'CANCELADO')) return false;
      if (filterStatus === 'RECEBIDO' && r.status !== 'RECEBIDO') return false;
      return true;
    }).sort((a, b) => new Date(a.dataPrevistaRecebimento).getTime() - new Date(b.dataPrevistaRecebimento).getTime());
  }, [recebiveis, selectedOperadoraId, filterStatus]);

  const totalSelecionado = useMemo(() => {
    return filteredRecebiveis
      .filter(r => selectedRecebivelIds.includes(r.id))
      .reduce((acc, r) => acc + (r.valorLiquidoPrevisto - r.valorRecebidoAcumulado), 0);
  }, [filteredRecebiveis, selectedRecebivelIds]);

  // --- HANDLERS ---

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRecebivelIds(prev => [...prev, id]);
    } else {
      setSelectedRecebivelIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleManualSave = () => {
    if (!selectedOperadoraId || !manualForm.valorBruto) return;

    const op = operadoras.find(o => o.id === selectedOperadoraId);
    let taxa = 0;
    let dias = 0;

    if (manualForm.modalidade === 'DEBITO') {
      taxa = op?.taxaDebito || 0;
      dias = op?.diasLiquidezDebito || 1;
    } else if (manualForm.modalidade === 'CREDITO_AVISTA') {
      taxa = op?.taxaCreditoAvista || 0;
      dias = op?.diasLiquidezCredito || 30;
    } else {
      taxa = op?.taxaCreditoParcelado || 0;
      dias = op?.diasLiquidezCredito || 30;
    }

    const valorTaxa = (manualForm.valorBruto * taxa) / 100;
    const liquido = manualForm.valorBruto - valorTaxa;
    const dataPrev = new Date(manualForm.dataVenda!);
    dataPrev.setDate(dataPrev.getDate() + dias);

    const novo: RecebivelCartao = {
      id: Date.now(),
      operadoraId: Number(selectedOperadoraId),
      origem: 'MANUAL',
      dataVenda: manualForm.dataVenda!,
      valorBruto: Number(manualForm.valorBruto),
      taxaPercentual: taxa,
      valorTaxa: valorTaxa,
      valorLiquidoPrevisto: liquido,
      modalidade: manualForm.modalidade!,
      parcelas: manualForm.parcelas,
      parcelaNumero: 1,
      dataPrevistaRecebimento: dataPrev.toISOString().split('T')[0],
      status: 'ABERTO',
      valorRecebidoAcumulado: 0,
      conciliado: false,
      observacao: 'Lançamento manual'
    };

    setRecebiveis(prev => [...prev, novo]);
    setShowManualModal(false);
  };

  const handleConciliar = () => {
    if (selectedRecebivelIds.length === 0 || !conciliacaoForm.contaId || conciliacaoForm.valorRecebido <= 0) return;

    // 1. Create RecebimentoOperadora
    const itensConciliados = selectedRecebivelIds.map(id => {
      const r = recebiveis.find(item => item.id === id);
      const saldo = r ? r.valorLiquidoPrevisto - r.valorRecebidoAcumulado : 0;
      // Simple logic: distribute received value proportionally or fully pay selected items?
      // For simplicity in this "controlled implementation": assume full payment of selected items matches the deposit, 
      // or user is manually selecting items that sum up to the deposit. 
      // If deposit < sum, we'd need complex logic. 
      // Let's assume we fully settle selected items up to their balance.
      return { recebivelId: id, valorConciliado: saldo };
    });

    const novoRecebimento: RecebimentoOperadora = {
      id: Date.now(),
      operadoraId: Number(selectedOperadoraId),
      contaId: conciliacaoForm.contaId,
      dataRecebimento: conciliacaoForm.dataRecebimento,
      valorRecebido: Number(conciliacaoForm.valorRecebido),
      taxaTotal: Number(conciliacaoForm.taxaTotal),
      observacao: conciliacaoForm.observacao,
      itensConciliados
    };

    setRecebimentos(prev => [...prev, novoRecebimento]);

    // 2. Update Recebiveis
    setRecebiveis(prev => prev.map(r => {
      if (selectedRecebivelIds.includes(r.id)) {
        const item = itensConciliados.find(i => i.recebivelId === r.id);
        const valorConciliado = item ? item.valorConciliado : 0;
        const novoAcumulado = r.valorRecebidoAcumulado + valorConciliado;
        const novoStatus = novoAcumulado >= (r.valorLiquidoPrevisto - 0.01) ? 'RECEBIDO' : 'PARCIAL';
        const conciliado = novoStatus === 'RECEBIDO';
        
        return {
          ...r,
          valorRecebidoAcumulado: novoAcumulado,
          status: novoStatus,
          conciliado
        };
      }
      return r;
    }));

    // 3. Create MovimentoConta
    const novoMovimento: MovimentoConta = {
      id: Date.now() + 1,
      contaId: conciliacaoForm.contaId,
      data: conciliacaoForm.dataRecebimento,
      tipo: 'ENTRADA',
      valor: Number(conciliacaoForm.valorRecebido),
      historico: `Repasse Operadora: ${operadoras.find(o => o.id === selectedOperadoraId)?.nome}`,
      referenciaTipo: 'CARTAO_OPERADORA',
      referenciaId: novoRecebimento.id,
      conciliado: true,
      observacao: conciliacaoForm.observacao
    };
    setMovimentosConta(prev => [...prev, novoMovimento]);

    // Reset
    setSelectedRecebivelIds([]);
    setConciliacaoForm({
      contaId: 0,
      dataRecebimento: new Date().toISOString().split('T')[0],
      valorRecebido: 0,
      taxaTotal: 0,
      observacao: ''
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Conciliação de Cartões</h2>
        <div className="flex gap-2">
            <select 
                value={selectedOperadoraId} 
                onChange={(e) => setSelectedOperadoraId(Number(e.target.value))}
                className="border rounded p-2 min-w-[200px]"
            >
                <option value="">Selecione a Operadora...</option>
                {operadoras.filter(o => o.ativo).map(o => (
                    <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
            </select>
            <button 
                onClick={() => setShowManualModal(true)}
                disabled={!selectedOperadoraId}
                className={`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium ${!selectedOperadoraId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                + Recebível Manual
            </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* LEFT: LIST */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Recebíveis Previstos</h3>
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded p-1 text-sm"
                >
                    <option value="ABERTO">Em Aberto / Parcial</option>
                    <option value="RECEBIDO">Recebidos</option>
                    <option value="TODOS">Todos</option>
                </select>
            </div>
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-center w-10">
                                <input type="checkbox" disabled />
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Venda</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prev. Receb.</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modalidade</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor Bruto</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Líquido Prev.</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRecebiveis.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhum recebível encontrado.</td></tr>
                        ) : (
                            filteredRecebiveis.map(r => (
                                <tr key={r.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRecebivelIds.includes(r.id)}
                                            onChange={(e) => handleCheckboxChange(r.id, e.target.checked)}
                                            disabled={r.status === 'RECEBIDO'}
                                        />
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(r.dataVenda).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 font-medium">{new Date(r.dataPrevistaRecebimento).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-2 text-xs text-gray-500">{r.modalidade}</td>
                                    <td className="px-4 py-2 text-sm text-right text-gray-500">R$ {r.valorBruto.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm text-right text-gray-900 font-bold">R$ {r.valorLiquidoPrevisto.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'RECEBIDO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* RIGHT: CONCILIATION PANEL */}
        <div className="w-80 bg-white rounded-lg shadow-sm border p-4 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Registrar Repasse</h3>
            
            <div className="space-y-4 flex-1">
                <div className="bg-indigo-50 p-3 rounded text-center">
                    <p className="text-xs text-indigo-600 uppercase font-bold">Total Selecionado</p>
                    <p className="text-2xl font-bold text-indigo-700">R$ {totalSelecionado.toFixed(2)}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conta Destino</label>
                    <select 
                        value={conciliacaoForm.contaId} 
                        onChange={(e) => setConciliacaoForm({...conciliacaoForm, contaId: Number(e.target.value)})} 
                        className="w-full border rounded p-2"
                    >
                        <option value={0}>Selecione...</option>
                        {contasBancarias.filter(c => c.ativo).map(c => (
                            <option key={c.id} value={c.id}>{c.descricao}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Recebimento</label>
                    <input 
                        type="date" 
                        value={conciliacaoForm.dataRecebimento} 
                        onChange={(e) => setConciliacaoForm({...conciliacaoForm, dataRecebimento: e.target.value})} 
                        className="w-full border rounded p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Recebido (Extrato)</label>
                    <input 
                        type="number" 
                        value={conciliacaoForm.valorRecebido} 
                        onChange={(e) => setConciliacaoForm({...conciliacaoForm, valorRecebido: Number(e.target.value)})} 
                        className="w-full border rounded p-2 font-bold"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taxas Extras (Opcional)</label>
                    <input 
                        type="number" 
                        value={conciliacaoForm.taxaTotal} 
                        onChange={(e) => setConciliacaoForm({...conciliacaoForm, taxaTotal: Number(e.target.value)})} 
                        className="w-full border rounded p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                    <textarea 
                        value={conciliacaoForm.observacao} 
                        onChange={(e) => setConciliacaoForm({...conciliacaoForm, observacao: e.target.value})} 
                        className="w-full border rounded p-2"
                        rows={2}
                    />
                </div>
            </div>

            <button 
                onClick={handleConciliar}
                disabled={selectedRecebivelIds.length === 0 || !conciliacaoForm.contaId}
                className={`w-full py-3 mt-4 rounded font-bold text-white ${selectedRecebivelIds.length > 0 && conciliacaoForm.contaId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
                Confirmar Conciliação
            </button>
        </div>
      </div>

      {/* MANUAL ENTRY MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Lançamento Manual de Venda</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Venda</label>
                        <input 
                            type="date" 
                            value={manualForm.dataVenda} 
                            onChange={(e) => setManualForm({...manualForm, dataVenda: e.target.value})} 
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Bruto</label>
                        <input 
                            type="number" 
                            value={manualForm.valorBruto} 
                            onChange={(e) => setManualForm({...manualForm, valorBruto: Number(e.target.value)})} 
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                        <select 
                            value={manualForm.modalidade} 
                            onChange={(e) => setManualForm({...manualForm, modalidade: e.target.value as any})} 
                            className="w-full border rounded p-2"
                        >
                            <option value="DEBITO">Débito</option>
                            <option value="CREDITO_AVISTA">Crédito à Vista</option>
                            <option value="CREDITO_PARCELADO">Crédito Parcelado</option>
                        </select>
                    </div>
                    {manualForm.modalidade === 'CREDITO_PARCELADO' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                            <input 
                                type="number" 
                                value={manualForm.parcelas} 
                                onChange={(e) => setManualForm({...manualForm, parcelas: Number(e.target.value)})} 
                                className="w-full border rounded p-2"
                                min="2"
                            />
                        </div>
                    )}
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowManualModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleManualSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
