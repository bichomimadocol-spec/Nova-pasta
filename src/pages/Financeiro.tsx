import React, { useState } from 'react';
import { Cliente, Fornecedor, Banco, ContaBancaria, HistoricoPadrao, TituloFinanceiro, BaixaTitulo, MovimentoConta, OperadoraCartao, RecebivelCartao, RecebimentoOperadora } from '../App';
import ContasReceberPage from './financeiro/ContasReceber';
import ContasPagarPage from './financeiro/ContasPagar';
import MinhasContasPage from './conta/MinhasContas';
import MovimentoContaPage from './conta/MovimentoConta';
import BancosPage from './conta/Bancos';
import HistoricoPadraoPage from './conta/HistoricoPadrao';
import OperadoraCartaoPage from './cartao/OperadoraCartao';
import RecebimentoOperadoraPage from './cartao/RecebimentoOperadora';

interface FinanceiroProps {
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  bancos: Banco[];
  setBancos: React.Dispatch<React.SetStateAction<Banco[]>>;
  contasBancarias: ContaBancaria[];
  setContasBancarias: React.Dispatch<React.SetStateAction<ContaBancaria[]>>;
  historicosPadrao: HistoricoPadrao[];
  setHistoricosPadrao: React.Dispatch<React.SetStateAction<HistoricoPadrao[]>>;
  titulosFinanceiros: TituloFinanceiro[];
  setTitulosFinanceiros: React.Dispatch<React.SetStateAction<TituloFinanceiro[]>>;
  baixasTitulos: BaixaTitulo[];
  setBaixasTitulos: React.Dispatch<React.SetStateAction<BaixaTitulo[]>>;
  movimentosConta: MovimentoConta[];
  setMovimentosConta: React.Dispatch<React.SetStateAction<MovimentoConta[]>>;
  operadorasCartao: OperadoraCartao[];
  setOperadorasCartao: React.Dispatch<React.SetStateAction<OperadoraCartao[]>>;
  recebiveisCartao: RecebivelCartao[];
  setRecebiveisCartao: React.Dispatch<React.SetStateAction<RecebivelCartao[]>>;
  recebimentosOperadora: RecebimentoOperadora[];
  setRecebimentosOperadora: React.Dispatch<React.SetStateAction<RecebimentoOperadora[]>>;
}

export default function Financeiro({
  clientes,
  fornecedores,
  bancos,
  setBancos,
  contasBancarias,
  setContasBancarias,
  historicosPadrao,
  setHistoricosPadrao,
  titulosFinanceiros,
  setTitulosFinanceiros,
  baixasTitulos,
  setBaixasTitulos,
  movimentosConta,
  setMovimentosConta,
  operadorasCartao,
  setOperadorasCartao,
  recebiveisCartao,
  setRecebiveisCartao,
  recebimentosOperadora,
  setRecebimentosOperadora
}: FinanceiroProps) {
  const [activeTab, setActiveTab] = useState<'RECEBER' | 'PAGAR' | 'CAIXA' | 'CARTAO'>('RECEBER');
  const [activeCaixaTab, setActiveCaixaTab] = useState<'CONTAS' | 'MOVIMENTO' | 'BANCOS' | 'HISTORICO'>('CONTAS');
  const [activeCartaoTab, setActiveCartaoTab] = useState<'OPERADORAS' | 'CONCILIACAO'>('CONCILIACAO');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* MAIN TABS */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mr-4">Financeiro</h1>
        <button 
          onClick={() => setActiveTab('RECEBER')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'RECEBER' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Contas a Receber
        </button>
        <button 
          onClick={() => setActiveTab('PAGAR')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'PAGAR' ? 'bg-red-100 text-red-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Contas a Pagar
        </button>
        <button 
          onClick={() => setActiveTab('CAIXA')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'CAIXA' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Caixa e Bancos
        </button>
        <button 
          onClick={() => setActiveTab('CARTAO')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'CARTAO' ? 'bg-orange-100 text-orange-800' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          Cartões
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'RECEBER' && (
          <ContasReceberPage 
            titulos={titulosFinanceiros}
            setTitulos={setTitulosFinanceiros}
            baixas={baixasTitulos}
            setBaixas={setBaixasTitulos}
            clientes={clientes}
            contasBancarias={contasBancarias}
            setMovimentosConta={setMovimentosConta}
          />
        )}

        {activeTab === 'PAGAR' && (
          <ContasPagarPage 
            titulos={titulosFinanceiros}
            setTitulos={setTitulosFinanceiros}
            baixas={baixasTitulos}
            setBaixas={setBaixasTitulos}
            fornecedores={fornecedores}
            contasBancarias={contasBancarias}
            setMovimentosConta={setMovimentosConta}
          />
        )}

        {activeTab === 'CAIXA' && (
          <div className="h-full flex flex-col">
            {/* SUB TABS */}
            <div className="flex border-b mb-6">
              <button 
                onClick={() => setActiveCaixaTab('CONTAS')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCaixaTab === 'CONTAS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Minhas Contas
              </button>
              <button 
                onClick={() => setActiveCaixaTab('MOVIMENTO')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCaixaTab === 'MOVIMENTO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Movimentação
              </button>
              <button 
                onClick={() => setActiveCaixaTab('BANCOS')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCaixaTab === 'BANCOS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Bancos
              </button>
              <button 
                onClick={() => setActiveCaixaTab('HISTORICO')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCaixaTab === 'HISTORICO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Histórico Padrão
              </button>
            </div>

            {/* SUB CONTENT */}
            <div className="flex-1 overflow-hidden">
              {activeCaixaTab === 'CONTAS' && (
                <MinhasContasPage 
                  contas={contasBancarias}
                  setContas={setContasBancarias}
                  bancos={bancos}
                  movimentos={movimentosConta}
                />
              )}
              {activeCaixaTab === 'MOVIMENTO' && (
                <MovimentoContaPage 
                  movimentos={movimentosConta}
                  setMovimentos={setMovimentosConta}
                  contas={contasBancarias}
                  historicos={historicosPadrao}
                />
              )}
              {activeCaixaTab === 'BANCOS' && (
                <BancosPage 
                  bancos={bancos}
                  setBancos={setBancos}
                />
              )}
              {activeCaixaTab === 'HISTORICO' && (
                <HistoricoPadraoPage 
                  historicos={historicosPadrao}
                  setHistoricos={setHistoricosPadrao}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'CARTAO' && (
          <div className="h-full flex flex-col">
            {/* SUB TABS */}
            <div className="flex border-b mb-6">
              <button 
                onClick={() => setActiveCartaoTab('CONCILIACAO')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCartaoTab === 'CONCILIACAO' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Conciliação / Recebimento
              </button>
              <button 
                onClick={() => setActiveCartaoTab('OPERADORAS')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeCartaoTab === 'OPERADORAS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Operadoras
              </button>
            </div>

            {/* SUB CONTENT */}
            <div className="flex-1 overflow-hidden">
              {activeCartaoTab === 'CONCILIACAO' && (
                <RecebimentoOperadoraPage 
                  operadoras={operadorasCartao}
                  recebiveis={recebiveisCartao}
                  setRecebiveis={setRecebiveisCartao}
                  recebimentos={recebimentosOperadora}
                  setRecebimentos={setRecebimentosOperadora}
                  contasBancarias={contasBancarias}
                  setMovimentosConta={setMovimentosConta}
                />
              )}
              {activeCartaoTab === 'OPERADORAS' && (
                <OperadoraCartaoPage 
                  operadoras={operadorasCartao}
                  setOperadoras={setOperadorasCartao}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
