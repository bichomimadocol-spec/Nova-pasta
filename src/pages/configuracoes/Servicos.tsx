import React, { useState, useEffect, useRef } from 'react';
import { Produto } from '../../App';

interface ServicosPageProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

export default function ServicosPage({ produtos, setProdutos }: ServicosPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Filter only services
  const servicos = produtos.filter(p => p.tipo === 'Serviço');

  const [form, setForm] = useState<Partial<Produto>>({
    nome: '',
    preco: 0,
    duracao: '30', // Default 30 min
    ativo: true
  });

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [showModal]);

  const handleOpenModal = (servico?: Produto) => {
    if (servico) {
      setForm(servico);
      setEditingId(servico.id);
    } else {
      setForm({
        nome: '',
        preco: 0,
        duracao: '30',
        ativo: true
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome) return;

    const commonFields = {
      tipo: 'Serviço' as const,
      controlaEstoque: false,
      estoqueAtual: 0,
      estoqueMinimo: 0,
      categoria: 'Geral', // Default category
      descricao: form.nome, // Use name as description if empty
      dataCadastro: new Date().toLocaleDateString()
    };

    if (editingId) {
      setProdutos(prev => prev.map(p => p.id === editingId ? { ...p, ...form, ...commonFields } as Produto : p));
    } else {
      const novo: Produto = {
        id: Date.now(),
        ...commonFields,
        ...form as Produto
      };
      setProdutos(prev => [...prev, novo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir este serviço?')) {
      setProdutos(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Serviços</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duração (min)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {servicos.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                  {s.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{s.duracao}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(s)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  value={form.nome} 
                  onChange={e => setForm({...form, nome: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={form.preco} 
                    onChange={e => setForm({...form, preco: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
                  <input 
                    type="number" 
                    value={form.duracao} 
                    onChange={e => setForm({...form, duracao: e.target.value})} 
                    className="w-full border rounded p-2"
                    min="1"
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
