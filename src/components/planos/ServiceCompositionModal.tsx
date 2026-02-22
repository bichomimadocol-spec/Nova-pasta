import React, { useState, useEffect } from 'react';
import { Produto } from '../../App'; // Assuming Produto is available globally or passed down
import { PlanoServico } from '../../types/planos';
import { X } from 'lucide-react';

interface ServiceCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (servico: Partial<PlanoServico>) => void;
  produtos: Produto[];
}

export default function ServiceCompositionModal({ isOpen, onClose, onAdd, produtos }: ServiceCompositionModalProps) {
  const [servicoId, setServicoId] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState(1);
  const [frequenciaMes, setFrequenciaMes] = useState(1);
  const [descricaoAdicional, setDescricaoAdicional] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setServicoId('');
      setQuantidade(1);
      setFrequenciaMes(1);
      setDescricaoAdicional('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const servicosDisponiveis = produtos.filter(p => p.tipo === 'Serviço' && p.ativo);
  const selectedServico = servicosDisponiveis.find(s => s.id === Number(servicoId));

  const handleSubmit = () => {
    if (!servicoId) {
      alert('Selecione um serviço.');
      return;
    }
    if (quantidade < 1) {
      alert('Quantidade deve ser maior que 0.');
      return;
    }
    if (frequenciaMes < 1) {
      alert('Frequência deve ser maior que 0.');
      return;
    }

    onAdd({
      servico_id: Number(servicoId),
      quantidade,
      frequencia_mes: frequenciaMes,
      descricao_adicional: descricaoAdicional,
      nome_servico: selectedServico?.nome,
      preco_servico: selectedServico?.preco
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Adicionar Serviço ao Plano</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Serviço*</label>
            <select 
              value={servicoId}
              onChange={(e) => setServicoId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Escolha um serviço...</option>
              {servicosDisponiveis.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nome} (R$ {s.preco.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade*</label>
              <input 
                type="number" 
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Freq. Mensal*</label>
              <input 
                type="number" 
                min="1"
                max="31"
                value={frequenciaMes}
                onChange={(e) => setFrequenciaMes(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Adicional (Opcional)</label>
            <textarea 
              value={descricaoAdicional}
              onChange={(e) => setDescricaoAdicional(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={2}
              placeholder="Ex: Apenas tosa higiênica"
            />
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
