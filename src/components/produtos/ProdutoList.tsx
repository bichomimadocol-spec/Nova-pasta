import React, { useState } from 'react';
import { Produto } from '../../App';

interface ProdutoListProps {
  produtos: Produto[];
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
}

export default function ProdutoList({ produtos, onEdit, onDelete }: ProdutoListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'TODOS' | 'Produto' | 'Serviço' | 'Plano'>('TODOS');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Filter logic
  const filtered = produtos.filter(p => {
    const matchesSearch = 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toString().includes(searchTerm) ||
      (p.codigoBarras && p.codigoBarras.includes(searchTerm));
    
    const matchesType = filterType === 'TODOS' || p.tipo === filterType;

    return matchesSearch && matchesType;
  });

  const toggleMenu = (id: number) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
      setConfirmDeleteId(null); // Reset delete confirmation when opening menu
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Você pode pesquisar pelo nome, código ou código de barras" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
              Mais filtros
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
              Pesquisar
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['TODOS', 'Produto', 'Serviço', 'Plano'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                filterType === type 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
              }`}
            >
              {type === 'TODOS' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 w-20">Código</th>
              <th className="px-6 py-3">Descrição</th>
              <th className="px-6 py-3 w-32">Custo</th>
              <th className="px-6 py-3 w-32">Preço</th>
              <th className="px-6 py-3 w-24 text-center">Estoque</th>
              <th className="px-6 py-3 w-24 text-center">Ativo</th>
              <th className="px-6 py-3 w-24 text-center">Editar</th>
              <th className="px-6 py-3 w-24 text-center">Opções</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">#{item.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.nome}</div>
                  <div className="text-xs text-gray-500">{item.categoria}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {item.custo ? `R$ ${Number(item.custo).toFixed(2)}` : '—'}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  R$ {item.preco.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-center">
                  {item.tipo === 'Produto' && item.controlaEstoque ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.estoqueAtual <= item.estoqueMinimo 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.estoqueAtual}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex h-2.5 w-2.5 rounded-full ${item.ativo ? 'bg-green-500' : 'bg-red-500'}`} title={item.ativo ? 'Ativo' : 'Inativo'}></span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-xs uppercase border border-indigo-200 px-3 py-1 rounded hover:bg-indigo-50"
                  >
                    Editar
                  </button>
                </td>
                <td className="px-6 py-4 text-center relative">
                  <button 
                    onClick={() => toggleMenu(item.id)}
                    className="text-gray-500 hover:text-gray-700 font-bold px-2"
                  >
                    •••
                  </button>
                  
                  {openMenuId === item.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        {confirmDeleteId === item.id ? (
                          <button
                            onClick={() => { onDelete(item.id); setOpenMenuId(null); }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2">🔍</span>
                    <p>Nenhum item encontrado com os filtros atuais.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer / Pagination Placeholder */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center bg-gray-50 rounded-b-lg">
        <span>Mostrando {filtered.length} registros</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>&lt; Anterior</button>
          <button className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50" disabled>Próximo &gt;</button>
        </div>
      </div>
    </div>
  );
}
