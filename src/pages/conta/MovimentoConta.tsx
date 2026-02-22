import React, { useState, useMemo } from 'react';
import { MovimentoConta, ContaBancaria, HistoricoPadrao } from '../../App';

interface MovimentoContaProps {
  movimentos: MovimentoConta[];
  setMovimentos: React.Dispatch<React.SetStateAction<MovimentoConta[]>>;
  contas: ContaBancaria[];
  historicos: HistoricoPadrao[];
}

export default function MovimentoContaPage({ movimentos, setMovimentos, contas, historicos }: MovimentoContaProps) {
  const [selectedContaId, setSelectedContaId] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState<{
    data: string;
    tipo: 'ENTRADA' | 'SAIDA';
    valor: number;
    historico: string;
    observacao: string;
  }>({
    data: new Date().toISOString().split('T')[0],
    tipo: 'ENTRADA',
    valor: 0,
    historico: '',
    observacao: ''
  });

  const filteredMovimentos = useMemo(() => {
    if (!selectedContaId) return [];
    return movimentos
      .filter(m => m.contaId === Number(selectedContaId))
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [movimentos, selectedContaId]);

  const handleSave = () => {
    if (!selectedContaId || !form.valor || !form.historico) return;

    const novo: MovimentoConta = {
      id: Date.now(),
      contaId: Number(selectedContaId),
      data: form.data,
      tipo: form.tipo,
      valor: Number(form.valor),
      historico: form.historico,
      referenciaTipo: 'MANUAL',
      conciliado: false,
      observacao: form.observacao
    };

    setMovimentos(prev => [novo, ...prev]);
    setShowModal(false);
    setForm({
      data: new Date().toISOString().split('T')[0],
      tipo: 'ENTRADA',
      valor: 0,
      historico: '',
      observacao: ''
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Movimentação de Conta</h2>
        <div className="flex gap-2">
            <select 
                value={selectedContaId} 
                onChange={(e) => setSelectedContaId(e.target.value)}
                className="border rounded p-2 min-w-[200px]"
            >
                <option value="">Selecione uma conta...</option>
                {contas.map(c => (
                    <option key={c.id} value={c.id}>{c.descricao}</option>
                ))}
            </select>
            <button 
                onClick={() => setShowModal(true)}
                disabled={!selectedContaId}
                className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium ${!selectedContaId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                + Lançamento Manual
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Histórico</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Entrada</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saída</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMovimentos.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                {selectedContaId ? 'Nenhum movimento registrado.' : 'Selecione uma conta para ver o extrato.'}
                            </td>
                        </tr>
                    ) : (
                        filteredMovimentos.map(mov => (
                            <tr key={mov.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(mov.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {mov.historico}
                                    {mov.observacao && <div className="text-xs text-gray-400">{mov.observacao}</div>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                    {mov.referenciaTipo || 'MANUAL'} {mov.referenciaId && `#${mov.referenciaId}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                                    {mov.tipo === 'ENTRADA' ? `R$ ${mov.valor.toFixed(2)}` : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                                    {mov.tipo === 'SAIDA' ? `R$ ${mov.valor.toFixed(2)}` : '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Lançamento Manual</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select 
                                value={form.tipo}
                                onChange={(e) => setForm({...form, tipo: e.target.value as any})}
                                className="w-full border rounded p-2"
                            >
                                <option value="ENTRADA">Entrada</option>
                                <option value="SAIDA">Saída</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Histórico</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={form.historico}
                                onChange={(e) => setForm({...form, historico: e.target.value})}
                                className="w-full border rounded p-2"
                                list="historicos-list"
                            />
                            <datalist id="historicos-list">
                                {historicos.filter(h => h.ativo).map(h => (
                                    <option key={h.id} value={h.descricao} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                        <input 
                            type="number"
                            value={form.valor}
                            onChange={(e) => setForm({...form, valor: Number(e.target.value)})}
                            className="w-full border rounded p-2"
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                        <textarea 
                            value={form.observacao}
                            onChange={(e) => setForm({...form, observacao: e.target.value})}
                            className="w-full border rounded p-2"
                            rows={2}
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
