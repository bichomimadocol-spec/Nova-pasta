import React, { useState } from 'react';
import { Fornecedor, Produto, EntradaMercadoria, MovimentacaoEstoque } from '../App';
import FornecedorPage from './compras/Fornecedor';
import EntradaMercadoriasPage from './compras/EntradaMercadorias';
import RelatoriosComprasPage from './compras/RelatoriosCompras';
import SugestaoComprasPage from './compras/SugestaoCompras';

interface ComprasProps {
  fornecedores?: Fornecedor[];
  setFornecedores?: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
  produtos?: Produto[];
  setProdutos?: React.Dispatch<React.SetStateAction<Produto[]>>;
  entradasMercadoria?: EntradaMercadoria[];
  setEntradasMercadoria?: React.Dispatch<React.SetStateAction<EntradaMercadoria[]>>;
  movimentacoesEstoque?: MovimentacaoEstoque[];
  setMovimentacoesEstoque?: React.Dispatch<React.SetStateAction<MovimentacaoEstoque[]>>;
  onIntegrarFinanceiro?: (entrada: EntradaMercadoria) => void;
}

export default function Compras({ 
  fornecedores = [], setFornecedores = () => {},
  produtos = [], setProdutos = () => {},
  entradasMercadoria = [], setEntradasMercadoria = () => {},
  setMovimentacoesEstoque = () => {},
  onIntegrarFinanceiro
}: ComprasProps) {
  
  const [activeTab, setActiveTab] = useState<'FORNECEDOR' | 'ENTRADA' | 'RELATORIOS' | 'SUGESTAO'>('FORNECEDOR');

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Módulo de Compras</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b">
        <button 
            onClick={() => setActiveTab('FORNECEDOR')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === 'FORNECEDOR' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            Fornecedores
        </button>
        <button 
            onClick={() => setActiveTab('ENTRADA')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === 'ENTRADA' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            Entrada de Mercadorias
        </button>
        <button 
            onClick={() => setActiveTab('RELATORIOS')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === 'RELATORIOS' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            Relatórios
        </button>
        <button 
            onClick={() => setActiveTab('SUGESTAO')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === 'SUGESTAO' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            Sugestão de Compras
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'FORNECEDOR' && (
            <FornecedorPage fornecedores={fornecedores} setFornecedores={setFornecedores} />
        )}
        {activeTab === 'ENTRADA' && (
            <EntradaMercadoriasPage 
                entradas={entradasMercadoria} 
                setEntradas={setEntradasMercadoria}
                fornecedores={fornecedores}
                produtos={produtos}
                setProdutos={setProdutos}
                setMovimentacoesEstoque={setMovimentacoesEstoque}
                onIntegrarFinanceiro={onIntegrarFinanceiro}
            />
        )}
        {activeTab === 'RELATORIOS' && (
            <RelatoriosComprasPage 
                entradas={entradasMercadoria}
                fornecedores={fornecedores}
                produtos={produtos}
            />
        )}
        {activeTab === 'SUGESTAO' && (
            <SugestaoComprasPage produtos={produtos} />
        )}
      </div>
    </div>
  );
}
