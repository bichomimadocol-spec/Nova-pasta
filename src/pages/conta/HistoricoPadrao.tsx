import React, { useState } from 'react';
import { HistoricoPadrao } from '../../App';

interface HistoricoPadraoProps {
  historicos: HistoricoPadrao[];
  setHistoricos: React.Dispatch<React.SetStateAction<HistoricoPadrao[]>>;
}

export default function HistoricoPadraoPage({ historicos, setHistoricos }: HistoricoPadraoProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<HistoricoPadrao>>({
    descricao: '',
    tipo: 'RECEBIMENTO',
    ativo: true
  });

  const handleOpenModal = (hist?: HistoricoPadrao) => {
    if (hist) {
      setForm(hist);
      setEditingId(hist.id);
    } else {
      setForm({ descricao: '', tipo: 'RECEBIMENTO', ativo: true });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.descricao) return;

    if (editingId) {
      setHistoricos(prev => prev.map(h => h.id === editingId ? { ...h, ...form } as HistoricoPadrao : h));
    } else {
      const novo: HistoricoPadrao = {
        id: Date.now(),
        ...form as HistoricoPadrao
      };
      setHistoricos(prev => [...prev, novo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir este histórico?')) {
      setHistoricos(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Histórico Padrão</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Novo Histórico
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historicos.map(hist => (
              <tr key={hist.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hist.descricao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hist.tipo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${hist.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {hist.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(hist)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(hist.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Histórico' : 'Novo Histórico'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  value={form.descricao} 
                  onChange={e => setForm({...form, descricao: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  value={form.tipo} 
                  onChange={e => setForm({...form, tipo: e.target.value as any})} 
                  className="w-full border rounded p-2"
                >
                  <option value="RECEBIMENTO">Recebimento</option>
                  <option value="PAGAMENTO">Pagamento</option>
                  <option value="AJUSTE">Ajuste</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                </select>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={form.ativo} 
                  onChange={e => setForm({...form, ativo: e.target.checked})} 
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Ativo</label>
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
