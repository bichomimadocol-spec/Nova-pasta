import React, { useState } from 'react';
import { Usuario, Perfil } from '../../App';

interface UsuariosPageProps {
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  perfis: Perfil[];
}

export default function UsuariosPage({ usuarios, setUsuarios, perfis }: UsuariosPageProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Usuario>>({
    nome: '',
    email: '',
    senha: '',
    perfil: 'ATENDENTE'
  });

  const handleOpenModal = (user?: Usuario) => {
    if (user) {
      setForm(user);
      setEditingId(user.id);
    } else {
      setForm({
        nome: '',
        email: '',
        senha: '',
        perfil: 'ATENDENTE'
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.email || !form.senha) return;

    if (editingId) {
      setUsuarios(prev => prev.map(u => u.id === editingId ? { ...u, ...form } as Usuario : u));
    } else {
      const novo: Usuario = {
        id: Date.now(),
        ...form as Usuario
      };
      setUsuarios(prev => [...prev, novo]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Usuários</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login/Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.perfil}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(u)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login / Email</label>
                <input 
                  type="text" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input 
                  type="password" 
                  value={form.senha} 
                  onChange={e => setForm({...form, senha: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select 
                  value={form.perfil} 
                  onChange={e => setForm({...form, perfil: e.target.value as any})} 
                  className="w-full border rounded p-2"
                >
                  <option value="ADMIN">Administrador</option>
                  <option value="GERENTE">Gerente</option>
                  <option value="ATENDENTE">Atendente</option>
                </select>
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
