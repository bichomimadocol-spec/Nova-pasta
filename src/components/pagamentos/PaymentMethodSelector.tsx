import React, { useState, useEffect } from 'react';
import { CardOperator, PaymentAccount } from '../../App';
import { CaixaService } from '../../services/caixaService';
import { DollarSign, Smartphone, CreditCard, Calendar, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface PaymentMethodSelectorProps {
  valorTotal: number;
  origem: 'pdv' | 'agenda';
  referencia_id: string;
  onPaymentComplete: (transacaoData: any) => void;
  onCancel: () => void;
}

export default function PaymentMethodSelector({
  valorTotal,
  origem,
  referencia_id,
  onPaymentComplete,
  onCancel
}: PaymentMethodSelectorProps) {
  const [methodSelected, setMethodSelected] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [checkingCaixa, setCheckingCaixa] = useState(true);
  
  // Data lists
  const [operadoras, setOperadoras] = useState<CardOperator[]>([]);
  const [pixAccounts, setPixAccounts] = useState<PaymentAccount[]>([]);

  // Form states
  const [valorRecebido, setValorRecebido] = useState<number>(valorTotal);
  const [selectedOperadora, setSelectedOperadora] = useState<string>('');
  const [selectedPixKey, setSelectedPixKey] = useState<string>('');
  const [parcelas, setParcelas] = useState<number>(1);
  const [cardNumber, setCardNumber] = useState<string>('');
  
  // Crediário specific
  const [crediarioParcelas, setCrediarioParcelas] = useState<number>(3);
  const [crediarioIntervalo, setCrediarioIntervalo] = useState<number>(30);
  const [crediarioVencimento, setCrediarioVencimento] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    checkCaixaAndLoadData();
  }, []);

  useEffect(() => {
    // Auto-update valorRecebido if total changes (and user hasn't modified it manually?)
    // For simplicity, always sync unless we want complex dirty checking
    setValorRecebido(valorTotal);
  }, [valorTotal]);

  const checkCaixaAndLoadData = async () => {
    setCheckingCaixa(true);
    try {
      // 1. Check Caixa
      const caixa = await CaixaService.getCaixaHoje();
      setCaixaAberto(!!caixa && caixa.status === 'aberto');

      // 2. Load Operators
      const ops = await CaixaService.getOperadoras();
      setOperadoras(ops.filter(o => o.ativo));

      // 3. Load Pix Accounts (Mock or Real)
      // Assuming CaixaService has this or we filter from a generic list
      // For now, let's mock or fetch if available
      // const pix = await CaixaService.getPaymentAccounts('pix'); 
      // setPixAccounts(pix);
      
      // Mocking PIX accounts for now as requested in the prompt example
      setPixAccounts([
        { id: '1', tipo_pagamento: 'pix', chave_pix: 'joao@petnexis.com', ativo: true, criado_em: '', atualizado_em: '' },
        { id: '2', tipo_pagamento: 'pix', chave_pix: '(11) 99999-9999', ativo: true, criado_em: '', atualizado_em: '' },
        { id: '3', tipo_pagamento: 'pix', chave_pix: '12.345.678/0001-90', ativo: true, criado_em: '', atualizado_em: '' }
      ]);

    } catch (error) {
      console.error("Error loading payment data:", error);
    } finally {
      setCheckingCaixa(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!caixaAberto) {
      alert("O caixa precisa estar aberto para processar pagamentos.");
      return;
    }

    setLoading(true);
    try {
      const caixa = await CaixaService.getCaixaHoje();
      if (!caixa) throw new Error("Caixa não encontrado");

      const transactionData: any = {
        caixa_id: caixa.id,
        tipo: methodSelected,
        subtipo: origem === 'pdv' ? 'vendas' : 'atendimento',
        descricao: `${origem === 'pdv' ? 'Venda PDV' : 'Atendimento Agenda'} #${referencia_id}`,
        valor: valorTotal,
        origem: origem === 'pdv' ? 'vendas' : 'atendimento',
        referencia_id: referencia_id,
        referencia_tipo: origem === 'pdv' ? 'venda' : 'atendimento',
        usuario_criacao: 'Sistema', // Should be logged user
        status_conciliacao: ['dinheiro', 'pix'].includes(methodSelected) ? 'conciliado' : 'pendente'
      };

      // Add specific fields
      if (methodSelected === 'debito' || methodSelected === 'credito') {
        if (!selectedOperadora) {
          alert("Selecione uma operadora.");
          setLoading(false);
          return;
        }
        transactionData.operadora_id = selectedOperadora;
        transactionData.notas = `Cartão final: ${cardNumber}`;
        
        if (methodSelected === 'credito') {
             transactionData.notas += ` | Parcelas: ${parcelas}x`;
        }
      }

      if (methodSelected === 'pix') {
        if (!selectedPixKey) {
            alert("Selecione uma chave PIX.");
            setLoading(false);
            return;
        }
        transactionData.notas = `Chave: ${selectedPixKey}`;
      }

      if (methodSelected === 'crediario') {
        transactionData.crediario_config = {
            parcelas: crediarioParcelas,
            intervalo: crediarioIntervalo,
            primeiro_vencimento: crediarioVencimento
        };
      }

      // Create transaction in backend
      const novaTransacao = await CaixaService.criarTransacao(transactionData);
      
      // Notify parent with the created transaction
      onPaymentComplete(novaTransacao);

    } catch (error) {
      console.error("Payment error:", error);
      alert("Erro ao processar pagamento: " + error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingCaixa) {
    return <div className="p-8 text-center text-gray-500">Verificando status do caixa...</div>;
  }

  if (!caixaAberto) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center bg-red-50 rounded-lg border border-red-200">
        <Lock className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-red-800 mb-2">Caixa Fechado</h3>
        <p className="text-red-600 mb-6">É necessário abrir o caixa antes de realizar recebimentos.</p>
        <button 
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded hover:bg-red-50"
        >
            Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Pagamento</h3>
        <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">Total a Pagar:</span>
            <span className="text-2xl font-bold text-indigo-600">R$ {valorTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Method Selection */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto p-2">
            <div className="space-y-2">
                {[
                    { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign, color: 'text-green-600' },
                    { id: 'pix', label: 'PIX', icon: Smartphone, color: 'text-blue-600' },
                    { id: 'debito', label: 'Débito', icon: CreditCard, color: 'text-orange-600' },
                    { id: 'credito', label: 'Crédito', icon: CreditCard, color: 'text-purple-600' },
                    { id: 'crediario', label: 'Crediário', icon: Calendar, color: 'text-gray-600' },
                ].map(method => (
                    <button
                        key={method.id}
                        onClick={() => setMethodSelected(method.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                            methodSelected === method.id 
                            ? 'bg-white shadow-md border-l-4 border-indigo-600 ring-1 ring-black/5' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                        <method.icon className={method.color} size={20} />
                        <span className={`font-medium ${methodSelected === method.id ? 'text-gray-900' : ''}`}>{method.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Right: Method Details */}
        <div className="w-2/3 p-6 overflow-y-auto bg-white">
            {!methodSelected && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <CreditCard size={48} className="mb-4 opacity-20" />
                    <p>Selecione uma forma de pagamento</p>
                </div>
            )}

            {methodSelected === 'dinheiro' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                        <DollarSign size={20} />
                        <span className="font-bold">Pagamento em Dinheiro</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Recebido</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                            <input 
                                type="number" 
                                value={valorRecebido}
                                onChange={(e) => setValorRecebido(Number(e.target.value))}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Total da Venda:</span>
                            <span className="font-bold">R$ {valorTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-800 font-bold">Troco:</span>
                            <span className={`font-bold ${valorRecebido >= valorTotal ? 'text-green-600' : 'text-red-500'}`}>
                                R$ {Math.max(0, valorRecebido - valorTotal).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                        <CheckCircle size={14} className="mt-0.5 text-blue-500" />
                        <div>
                            <p className="font-bold text-blue-700">Destino do Valor:</p>
                            <p>Entra no Caixa do dia (Hoje). Status: <span className="font-mono bg-blue-100 px-1 rounded">CONCILIADO</span></p>
                        </div>
                    </div>
                </div>
            )}

            {methodSelected === 'pix' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <Smartphone size={20} />
                        <span className="font-bold">Pagamento via PIX</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX de Recebimento</label>
                        <select 
                            value={selectedPixKey}
                            onChange={(e) => setSelectedPixKey(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Selecione a chave...</option>
                            {pixAccounts.map(acc => (
                                <option key={acc.id} value={acc.chave_pix}>{acc.chave_pix}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-gray-500 flex items-start gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                        <CheckCircle size={14} className="mt-0.5 text-blue-500" />
                        <div>
                            <p className="font-bold text-blue-700">Destino do Valor:</p>
                            <p>Conta Bancária vinculada. Status: <span className="font-mono bg-blue-100 px-1 rounded">CONCILIADO</span></p>
                        </div>
                    </div>
                </div>
            )}

            {(methodSelected === 'debito' || methodSelected === 'credito') && (
                <div className="space-y-6 animate-fade-in">
                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${methodSelected === 'debito' ? 'text-orange-700 bg-orange-50 border-orange-100' : 'text-purple-700 bg-purple-50 border-purple-100'}`}>
                        <CreditCard size={20} />
                        <span className="font-bold">Pagamento no {methodSelected === 'debito' ? 'Débito' : 'Crédito'}</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operadora da Maquininha</label>
                        <select 
                            value={selectedOperadora}
                            onChange={(e) => setSelectedOperadora(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Selecione a operadora...</option>
                            {operadoras.map(op => (
                                <option key={op.id} value={op.id}>{op.nome}</option>
                            ))}
                        </select>
                    </div>

                    {methodSelected === 'credito' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                            <select 
                                value={parcelas}
                                onChange={(e) => setParcelas(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value={1}>1x - À vista (R$ {valorTotal.toFixed(2)})</option>
                                <option value={2}>2x - R$ {(valorTotal/2).toFixed(2)}</option>
                                <option value={3}>3x - R$ {(valorTotal/3).toFixed(2)}</option>
                                <option value={4}>4x - R$ {(valorTotal/4).toFixed(2)}</option>
                                <option value={5}>5x - R$ {(valorTotal/5).toFixed(2)}</option>
                                <option value={6}>6x - R$ {(valorTotal/6).toFixed(2)}</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 dígitos do cartão (Opcional)</label>
                        <input 
                            type="text" 
                            maxLength={4}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ex: 1234"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div className="text-xs text-gray-500 flex items-start gap-2 bg-yellow-50 p-3 rounded border border-yellow-100">
                        <AlertCircle size={14} className="mt-0.5 text-yellow-600" />
                        <div>
                            <p className="font-bold text-yellow-700">Destino do Valor:</p>
                            <p>Recebimento de Operadora. Status: <span className="font-mono bg-yellow-100 px-1 rounded">PENDENTE</span></p>
                            <p className="mt-1">Necessário conciliação bancária posterior.</p>
                        </div>
                    </div>
                </div>
            )}

            {methodSelected === 'crediario' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-100 p-3 rounded-lg border border-gray-200">
                        <Calendar size={20} />
                        <span className="font-bold">Crediário Próprio (Fiado)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nº Parcelas</label>
                            <input 
                                type="number" 
                                min={1}
                                max={12}
                                value={crediarioParcelas}
                                onChange={(e) => setCrediarioParcelas(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Intervalo (dias)</label>
                            <select 
                                value={crediarioIntervalo}
                                onChange={(e) => setCrediarioIntervalo(Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg p-3"
                            >
                                <option value={7}>7 dias (Semanal)</option>
                                <option value={15}>15 dias (Quinzenal)</option>
                                <option value={30}>30 dias (Mensal)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento 1ª Parcela</label>
                        <input 
                            type="date"
                            value={crediarioVencimento}
                            onChange={(e) => setCrediarioVencimento(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3"
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">Resumo do Parcelamento:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            {Array.from({ length: crediarioParcelas }).map((_, i) => {
                                const date = new Date(crediarioVencimento);
                                date.setDate(date.getDate() + (i * crediarioIntervalo));
                                return (
                                    <div key={i} className="flex justify-between">
                                        <span>{i + 1}ª Parcela ({date.toLocaleDateString()})</span>
                                        <span className="font-mono">R$ {(valorTotal / crediarioParcelas).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 flex items-start gap-2 bg-yellow-50 p-3 rounded border border-yellow-100">
                        <AlertCircle size={14} className="mt-0.5 text-yellow-600" />
                        <div>
                            <p className="font-bold text-yellow-700">Destino do Valor:</p>
                            <p>Contas a Receber (Fiado). Status: <span className="font-mono bg-yellow-100 px-1 rounded">PENDENTE</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
        <button 
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-white transition-colors"
        >
            Cancelar
        </button>
        <button 
            onClick={handleProcessPayment}
            disabled={!methodSelected || loading || (methodSelected === 'dinheiro' && valorRecebido < valorTotal)}
            className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                !methodSelected || loading || (methodSelected === 'dinheiro' && valorRecebido < valorTotal)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
        >
            {loading ? 'Processando...' : 'Confirmar Pagamento'}
        </button>
      </div>
    </div>
  );
}
