import React, { useState, useEffect } from 'react';
import { Plano, PlanoServico } from '../../types/planos';
import { Produto } from '../../App';
import ServiceCompositionModal from './ServiceCompositionModal';
import { Plus, Trash2, X } from 'lucide-react';

interface PlanosFormProps {
  initialData?: Plano | null;
  onSave: (plano: Partial<Plano>) => void;
  onCancel: () => void;
  produtos: Produto[];
}

export default function PlanosForm({ initialData, onSave, onCancel, produtos }: PlanosFormProps) {
  const [formData, setFormData] = useState<Partial<Plano>>({
    nome: '',
    descricao: '',
    valor_mensal: 0,
    valor_trimestral: 0,
    valor_semestral: 0,
    valor_anual: 0,
    ativo: true,
    notas: '',
    servicos: []
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleAddService = (servico: Partial<PlanoServico>) => {
    setFormData(prev => ({
      ...prev,
      servicos: [...(prev.servicos || []), servico as PlanoServico]
    }));
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicos: prev.servicos?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor_mensal) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Plano' : 'Novo Plano'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SEÇÃO 1: Informações Básicas */}
        <div>
          <h3 className="text-lg font-medium text-indigo-700 mb-4">1. Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano*</label>
              <input 
                type="text" 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input 
                type="text" 
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.ativo}
                  onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                />
                <span className="ml-2 text-gray-700 font-medium">Plano Ativo</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas Internas</label>
              <textarea 
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                className="w-full border border-gray-300 rounded-md p-2"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: Valores */}
        <div>
          <h3 className="text-lg font-medium text-indigo-700 mb-4">2. Valores do Plano</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensal (30 dias)*</label>
              <input 
                type="number" 
                value={formData.valor_mensal}
                onChange={(e) => setFormData({...formData, valor_mensal: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trimestral (90 dias)</label>
              <input 
                type="number" 
                value={formData.valor_trimestral}
                onChange={(e) => setFormData({...formData, valor_trimestral: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semestral (180 dias)</label>
              <input 
                type="number" 
                value={formData.valor_semestral}
                onChange={(e) => setFormData({...formData, valor_semestral: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anual (365 dias)</label>
              <input 
                type="number" 
                value={formData.valor_anual}
                onChange={(e) => setFormData({...formData, valor_anual: Number(e.target.value)})}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: Composição */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-indigo-700">3. Composição do Plano (Serviços)</h3>
            <button 
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Adicionar Serviço
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serviço</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Freq/Mês</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.servicos?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-sm">
                      Nenhum serviço adicionado.
                    </td>
                  </tr>
                ) : (
                  formData.servicos?.map((servico, index) => {
                    const prod = produtos.find(p => p.id === servico.servico_id);
                    return (
                      <tr key={index} className="bg-white">
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                          {prod?.nome || servico.nome_servico || 'Serviço'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">
                          {servico.quantidade}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-center">
                          {servico.frequencia_mes}x
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {servico.descricao_adicional || '-'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-right text-sm text-gray-500">
            Total de Serviços: {formData.servicos?.length || 0}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm"
          >
            Salvar Plano
          </button>
        </div>
      </form>

      <ServiceCompositionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddService}
        produtos={produtos}
      />
    </div>
  );
}
