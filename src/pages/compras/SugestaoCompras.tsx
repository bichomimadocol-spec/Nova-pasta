import React, { useMemo } from 'react';
import { Produto } from '../../App';

interface SugestaoComprasProps {
  produtos: Produto[];
}

export default function SugestaoComprasPage({ produtos }: SugestaoComprasProps) {
  
  const sugestoes = useMemo(() => {
    return produtos
      .filter(p => p.tipo === 'Produto' && p.ativo && p.controlaEstoque && p.estoqueAtual < p.estoqueMinimo)
      .map(p => ({
        ...p,
        sugestaoQtd: p.estoqueMinimo - p.estoqueAtual
      }));
  }, [produtos]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Sugestão de Compras</h2>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed opacity-50">Gerar Pré-Lista</button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-sm text-blue-800">
        Exibindo produtos com <strong>Estoque Atual</strong> abaixo do <strong>Estoque Mínimo</strong>.
      </div>

      <div className="bg-white rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor Pref.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Estoque Atual</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Mínimo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Sugestão de Compra</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sugestoes.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                Nenhum produto precisa de reposição no momento.
                            </td>
                        </tr>
                    ) : (
                        sugestoes.map(produto => (
                            <tr key={produto.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {produto.nome}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {produto.fornecedores || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-bold">
                                    {produto.estoqueAtual}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                                    {produto.estoqueMinimo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-600 bg-green-50">
                                    {produto.sugestaoQtd}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
