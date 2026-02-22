import React from 'react';
import { Plano } from '../../types/planos';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface PlanosTableProps {
  planos: Plano[];
  onEdit: (plano: Plano) => void;
  onDelete: (id: string) => void;
}

export default function PlanosTable({ planos, onEdit, onDelete }: PlanosTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Mensal</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Serviços</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Nenhum plano cadastrado.
              </td>
            </tr>
          ) : (
            planos.map((plano) => (
              <tr key={plano.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {plano.nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {plano.descricao || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                  R$ {plano.valor_mensal.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span className="bg-gray-100 text-gray-800 py-1 px-2 rounded-full text-xs font-medium">
                    {plano.servicos?.length || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {plano.ativo ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle size={12} className="mr-1" /> Inativo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit(plano)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(plano.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
