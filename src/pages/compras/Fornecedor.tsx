import React, { useState } from 'react';
import { Fornecedor } from '../../App';

interface FornecedorProps {
  fornecedores: Fornecedor[];
  setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
}

export default function FornecedorPage({ fornecedores, setFornecedores }: FornecedorProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [form, setForm] = useState<Partial<Fornecedor>>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    contato: '',
    observacao: '',
    ativo: true
  });

  const handleOpenModal = (fornecedor?: Fornecedor) => {
    if (fornecedor) {
      setForm(fornecedor);
      setEditingId(fornecedor.id);
    } else {
      setForm({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        contato: '',
        observacao: '',
        ativo: true
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome) return;

    if (editingId) {
      setFornecedores(prev => prev.map(f => f.id === editingId ? { ...f, ...form } as Fornecedor : f));
    } else {
      const novo: Fornecedor = {
        id: Date.now(),
        ...form as Fornecedor
      };
      setFornecedores(prev => [...prev, novo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este fornecedor?')) {
        setFornecedores(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFornecedores = fornecedores.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.cnpj && f.cnpj.includes(searchTerm)) ||
    (f.telefone && f.telefone.includes(searchTerm))
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Fornecedores</h2>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">Exportar</button>
            <button 
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
            >
                + Adicionar Fornecedor
            </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CNPJ ou telefone"
            className="w-full border rounded-md p-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome / Razão Social</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contato</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFornecedores.map(fornecedor => (
                        <tr key={fornecedor.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {fornecedor.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fornecedor.cnpj || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {fornecedor.telefone} {fornecedor.email && `| ${fornecedor.email}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${fornecedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => handleOpenModal(fornecedor)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                                <button onClick={() => handleDelete(fornecedor.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome / Razão Social *</label>
                        <input 
                            type="text"
                            value={form.nome}
                            onChange={(e) => setForm({...form, nome: e.target.value})}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                            <input 
                                type="text"
                                value={form.cnpj}
                                onChange={(e) => setForm({...form, cnpj: e.target.value})}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input 
                                type="text"
                                value={form.telefone}
                                onChange={(e) => setForm({...form, telefone: e.target.value})}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({...form, email: e.target.value})}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contato</label>
                        <input 
                            type="text"
                            value={form.contato}
                            onChange={(e) => setForm({...form, contato: e.target.value})}
                            className="w-full border rounded p-2"
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
                    <div className="flex items-center">
                        <input 
                            type="checkbox"
                            checked={form.ativo}
                            onChange={(e) => setForm({...form, ativo: e.target.checked})}
                            className="h-4 w-4 text-indigo-600 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">Ativo</label>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
