import React, { useState, useEffect } from 'react';
import { 
  DailyCashRegister, 
  CashTransaction, 
  CardOperator,
  Usuario
} from '../App';
import { CaixaService } from '../services/caixaService';
import { 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Lock, 
  Unlock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CaixaProps {
  usuarioLogado: Usuario | null;
}

export default function Caixa({ usuarioLogado }: CaixaProps) {
  const [caixaHoje, setCaixaHoje] = useState<DailyCashRegister | null>(null);
  const [transacoes, setTransacoes] = useState<CashTransaction[]>([]);
  const [operadoras, setOperadoras] = useState<CardOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  
  // Modal States
  const [showAbrirCaixa, setShowAbrirCaixa] = useState(false);
  const [showFecharCaixa, setShowFecharCaixa] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState(0);
  const [observacoesFechamento, setObservacoesFechamento] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const caixa = await CaixaService.getCaixaHoje();
      setCaixaHoje(caixa);
      
      if (caixa) {
        const trs = await CaixaService.getTransacoes(caixa.id);
        setTransacoes(trs);
      }

      const ops = await CaixaService.getOperadoras();
      setOperadoras(ops);
    } catch (error) {
      console.error("Erro ao carregar dados do caixa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirCaixa = async () => {
    if (!usuarioLogado) return;
    try {
      await CaixaService.abrirCaixa(usuarioLogado.nome, saldoInicial);
      setShowAbrirCaixa(false);
      carregarDados();
    } catch (error) {
      alert('Erro ao abrir caixa: ' + error);
    }
  };

  const handleFecharCaixa = async () => {
    if (!caixaHoje || !usuarioLogado) return;
    try {
      await CaixaService.fecharCaixa(caixaHoje.id, usuarioLogado.nome, observacoesFechamento);
      setShowFecharCaixa(false);
      carregarDados();
    } catch (error) {
      alert('Erro ao fechar caixa: ' + error);
    }
  };

  const handleConciliar = async (transacaoId: string) => {
    // In a real app, call API to update status
    // For mock, we update local state
    const updatedTransacoes = transacoes.map(t => 
      t.id === transacaoId ? { ...t, status_conciliacao: 'conciliado' as const } : t
    );
    setTransacoes(updatedTransacoes);
    // Update storage
    localStorage.setItem('petnexis_transacoes', JSON.stringify(updatedTransacoes));
  };

  // Cálculos de Totais
  const totalDinheiro = transacoes.filter(t => t.tipo === 'dinheiro').reduce((acc, t) => acc + t.valor, 0);
  const totalPix = transacoes.filter(t => t.tipo === 'pix').reduce((acc, t) => acc + t.valor, 0);
  const totalDebito = transacoes.filter(t => t.tipo === 'debito').reduce((acc, t) => acc + t.valor, 0);
  const totalCredito = transacoes.filter(t => t.tipo === 'credito').reduce((acc, t) => acc + t.valor, 0);
  const totalCrediario = transacoes.filter(t => t.tipo === 'crediario').reduce((acc, t) => acc + t.valor, 0);

  const transacoesFiltradas = transacoes.filter(t => {
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const matchBusca = t.descricao.toLowerCase().includes(busca.toLowerCase()) || 
                       t.subtipo.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  if (loading) return <div className="p-8 text-center">Carregando módulo de caixa...</div>;

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: Header com Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-indigo-600" />
            Caixa - {new Date().toLocaleDateString()}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${caixaHoje?.status === 'aberto' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Status: {caixaHoje?.status === 'aberto' ? 'ABERTO' : 'FECHADO'}
            </span>
            {caixaHoje && (
              <span className="text-sm text-gray-500">
                Aberto por: {caixaHoje.usuario_abertura} às {new Date(caixaHoje.dt_abertura).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          {!caixaHoje ? (
            <button 
              onClick={() => setShowAbrirCaixa(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Unlock size={18} /> Abrir Caixa
            </button>
          ) : caixaHoje.status === 'aberto' ? (
            <button 
              onClick={() => setShowFecharCaixa(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Lock size={18} /> Fechar Caixa
            </button>
          ) : (
            <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed flex items-center gap-2">
              <Lock size={18} /> Caixa Fechado
            </button>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <CardResumo titulo="Dinheiro" valor={totalDinheiro} icon={DollarSign} color="text-green-600" />
        <CardResumo titulo="PIX" valor={totalPix} icon={Smartphone} color="text-blue-600" />
        <CardResumo titulo="Débito" valor={totalDebito} icon={CreditCard} color="text-orange-600" />
        <CardResumo titulo="Crédito" valor={totalCredito} icon={CreditCard} color="text-purple-600" />
        <CardResumo titulo="Crediário" valor={totalCrediario} icon={Calendar} color="text-gray-600" />
      </div>

      {/* SEÇÃO 3: Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
            <option value="crediario">Crediário</option>
          </select>
          {/* Outros filtros podem ser adicionados aqui */}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transação..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-64"
          />
        </div>
      </div>

      {/* SEÇÃO 4: Tabela de Movimentações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transacoesFiltradas.length > 0 ? (
              transacoesFiltradas.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(t.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {t.tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {t.subtipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {t.origem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    R$ {t.valor.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t.status_conciliacao === 'conciliado' ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14} /> OK</span>
                    ) : t.status_conciliacao === 'pendente' ? (
                      <button 
                        onClick={() => handleConciliar(t.id)}
                        className="text-orange-500 flex items-center gap-1 hover:text-orange-700 hover:underline"
                        title="Clique para conciliar"
                      >
                        <AlertCircle size={14} /> Pendente
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma movimentação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ABRIR CAIXA */}
      {showAbrirCaixa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Abrir Caixa</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial (R$)</label>
              <input 
                type="number" 
                value={saldoInicial} 
                onChange={(e) => setSaldoInicial(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowAbrirCaixa(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAbrirCaixa}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirmar Abertura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FECHAR CAIXA */}
      {showFecharCaixa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Fechar Caixa</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita hoje.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
              <textarea 
                value={observacoesFechamento} 
                onChange={(e) => setObservacoesFechamento(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowFecharCaixa(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={handleFecharCaixa}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CardResumo = ({ titulo, valor, icon: Icon, color }: { titulo: string, valor: number, icon: any, color: string }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{titulo}</p>
      <p className="text-xl font-bold text-gray-900">R$ {valor.toFixed(2)}</p>
    </div>
    <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
      <Icon className={color} size={24} />
    </div>
  </div>
);
