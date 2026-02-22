import React, { useState, useEffect } from 'react';
import { Plano } from '../../types/planos';
import { Produto } from '../../App';
import { PlanosService } from '../../api/planos/route';
import PlanosTable from '../../components/planos/PlanosTable';
import PlanosForm from '../../components/planos/PlanosForm';
import { Plus, Search, Filter } from 'lucide-react';

interface PlanosPageProps {
  produtos: Produto[];
}

export default function PlanosPage({ produtos }: PlanosPageProps) {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlanos();
  }, []);

  const loadPlanos = async () => {
    setLoading(true);
    try {
      const data = await PlanosService.getPlanos();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlano(null);
    setView('form');
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      try {
        await PlanosService.deletePlano(id);
        loadPlanos();
      } catch (error) {
        alert('Erro ao excluir plano: ' + error);
      }
    }
  };

  const handleSave = async (planoData: Partial<Plano>) => {
    try {
      if (editingPlano) {
        await PlanosService.updatePlano(editingPlano.id, planoData);
      } else {
        await PlanosService.createPlano(planoData as any);
      }
      loadPlanos();
      setView('list');
    } catch (error) {
      alert('Erro ao salvar plano: ' + error);
    }
  };

  const filteredPlanos = planos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'form') {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <PlanosForm 
          initialData={editingPlano}
          onSave={handleSave}
          onCancel={() => setView('list')}
          produtos={produtos}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📋 Planos de Atendimento
        </h1>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} /> Novo Plano
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar planos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Filter size={18} />
          <select className="border border-gray-300 rounded-md p-2 bg-white">
            <option value="todos">Todos</option>
            <option value="ativos">Ativos</option>
            <option value="inativos">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Carregando planos...</div>
      ) : (
        <PlanosTable 
          planos={filteredPlanos}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
