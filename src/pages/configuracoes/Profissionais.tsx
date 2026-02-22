import React, { useState, useEffect, useRef } from 'react';
import { Profissional } from '../../App';

interface ProfissionaisPageProps {
  profissionais: Profissional[];
  setProfissionais: React.Dispatch<React.SetStateAction<Profissional[]>>;
}

export default function ProfissionaisPage({ profissionais, setProfissionais }: ProfissionaisPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Profissional>>({
    nome: '',
    apelido: '',
    telefone: '',
    funcao: '',
    comissaoPercentual: 0,
    ativo: true
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [showModal]);

  const handleOpenModal = (prof?: Profissional) => {
    if (prof) {
      setForm(prof);
      setEditingId(prof.id);
    } else {
      setForm({
        nome: '',
        apelido: '',
        telefone: '',
        funcao: '',
        comissaoPercentual: 0,
        ativo: true
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.funcao) return;

    if (editingId) {
      setProfissionais(prev => prev.map(p => p.id === editingId ? { ...p, ...form } as Profissional : p));
    } else {
      const novo: Profissional = {
        id: Date.now(),
        ...form as Profissional
      };
      setProfissionais(prev => [...prev, novo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir este profissional?')) {
      setProfissionais(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profissionais</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Novo Profissional
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comissão</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profissionais.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {p.nome}
                  {p.apelido && <span className="text-gray-500 font-normal ml-1">({p.apelido})</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.funcao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{p.comissaoPercentual}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={form.nome} 
                  onChange={e => setForm({...form, nome: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                  <input 
                    type="text" 
                    value={form.apelido} 
                    onChange={e => setForm({...form, apelido: e.target.value})} 
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="text" 
                    value={form.telefone} 
                    onChange={e => setForm({...form, telefone: e.target.value})} 
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                  <input 
                    type="text" 
                    value={form.funcao} 
                    onChange={e => setForm({...form, funcao: e.target.value})} 
                    className="w-full border rounded p-2"
                    placeholder="Ex: Tosador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comissão (%)</label>
                  <input 
                    type="number" 
                    value={form.comissaoPercentual} 
                    onChange={e => setForm({...form, comissaoPercentual: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                  />
                </div>
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
