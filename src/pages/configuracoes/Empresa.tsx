import React, { useState, useEffect } from 'react';
import { Empresa } from '../../App';

interface EmpresaPageProps {
  empresa: Empresa | null;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa | null>>;
}

export default function EmpresaPage({ empresa, setEmpresa }: EmpresaPageProps) {
  const [form, setForm] = useState<Partial<Empresa>>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    ativo: true
  });

  useEffect(() => {
    if (empresa) {
      setForm(empresa);
    }
  }, [empresa]);

  const handleSave = () => {
    if (!form.razaoSocial) return;

    const novaEmpresa: Empresa = {
      id: empresa?.id || 1,
      razaoSocial: form.razaoSocial!,
      nomeFantasia: form.nomeFantasia,
      cnpj: form.cnpj,
      telefone: form.telefone,
      email: form.email,
      endereco: form.endereco,
      ativo: form.ativo !== undefined ? form.ativo : true
    };

    setEmpresa(novaEmpresa);
    alert('Dados da empresa salvos com sucesso!'); // Using alert as quick feedback, can be inline
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Dados da Empresa</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social *</label>
          <input 
            type="text" 
            value={form.razaoSocial} 
            onChange={e => setForm({...form, razaoSocial: e.target.value})} 
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
          <input 
            type="text" 
            value={form.nomeFantasia} 
            onChange={e => setForm({...form, nomeFantasia: e.target.value})} 
            className="w-full border rounded p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input 
              type="text" 
              value={form.cnpj} 
              onChange={e => setForm({...form, cnpj: e.target.value})} 
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input 
            type="email" 
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
          <textarea 
            value={form.endereco} 
            onChange={e => setForm({...form, endereco: e.target.value})} 
            className="w-full border rounded p-2"
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
