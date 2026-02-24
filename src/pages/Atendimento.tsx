import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PaymentMethodSelector from '../components/pagamentos/PaymentMethodSelector';
import { Cliente, Pet, Produto, Venda, ItemVenda, MovimentoCaixa, ContaReceber, Contrato, OperadoraCartao } from '../App';
import { CaixaService } from '../services/caixaService';

interface AtendimentoProps {
  clientes: Cliente[];
  pets: Pet[];
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  vendas: Venda[];
  setVendas: React.Dispatch<React.SetStateAction<Venda[]>>;
  caixaAberto: boolean;
  setMovimentosCaixa: React.Dispatch<React.SetStateAction<MovimentoCaixa[]>>;
  setContasReceber: React.Dispatch<React.SetStateAction<ContaReceber[]>>;
  contratos: Contrato[];
  setContratos: React.Dispatch<React.SetStateAction<Contrato[]>>;
  operadorasCartao?: OperadoraCartao[];
  onIntegrarFinanceiro?: (venda: Venda, operadoraId?: number) => void;
}

export default function Atendimento({ 
  clientes, pets, produtos, setProdutos, vendas, setVendas, 
  caixaAberto, setMovimentosCaixa, setContasReceber, contratos, setContratos,
  operadorasCartao = [], onIntegrarFinanceiro
}: AtendimentoProps) {
  const location = useLocation();
  const isContratos = location.hash === '#contratos';

  // --- PDV STATES ---
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Produto[]>([]);

  // Cart State
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [desconto, setDesconto] = useState<number>(0);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    formaPagamento: 'DINHEIRO',
    operadoraId: 0,
    valorRecebido: 0,
    observacao: ''
  });

  // --- CAIXA VALIDATION STATE ---
  const [showAbrirCaixaModal, setShowAbrirCaixaModal] = useState(false);
  const [saldoInicialCaixa, setSaldoInicialCaixa] = useState(0);

  // --- CREDIARIO STATE ---
  const [showCrediarioModal, setShowCrediarioModal] = useState(false);
  const [crediarioConfig, setCrediarioConfig] = useState({
    parcelas: 1,
    intervalo: 30,
    primeiroVencimento: new Date().toISOString().split('T')[0]
  });
  const [parcelasSimuladas, setParcelasSimuladas] = useState<{num: number, valor: number, vencimento: string}[]>([]);
  const [currentSaleId, setCurrentSaleId] = useState<number>(0);

  const subtotalVenda = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + item.subtotal, 0);
  }, [carrinho]);

  const totalVenda = useMemo(() => {
    return Math.max(0, subtotalVenda - desconto);
  }, [subtotalVenda, desconto]);

  const simularParcelas = () => {
    const valorParcela = totalVenda / crediarioConfig.parcelas;
    const novasParcelas = [];
    for (let i = 0; i < crediarioConfig.parcelas; i++) {
      const data = new Date(crediarioConfig.primeiroVencimento);
      data.setDate(data.getDate() + (i * crediarioConfig.intervalo));
      novasParcelas.push({
        num: i + 1,
        valor: valorParcela,
        vencimento: data.toISOString().split('T')[0]
      });
    }
    setParcelasSimuladas(novasParcelas);
  };

  useEffect(() => {
    if (showCrediarioModal) {
      simularParcelas();
    }
  }, [crediarioConfig, totalVenda, showCrediarioModal]);

  const verificarCaixa = async () => {
    try {
      const caixa = await CaixaService.getCaixaHoje();
      if (!caixa || caixa.status !== 'aberto') {
        setShowAbrirCaixaModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao verificar caixa:", error);
      return false;
    }
  };

  const handleAbrirCaixaPDV = async () => {
    try {
      // Assuming 'Sistema' or current user if available. 
      // In a real app, pass the logged user.
      await CaixaService.abrirCaixa('Sistema (PDV)', saldoInicialCaixa);
      setShowAbrirCaixaModal(false);
      setShowCheckoutModal(true); // Continue flow
    } catch (error) {
      alert('Erro ao abrir caixa: ' + error);
    }
  };

  const handlePDVPaymentComplete = (transacao: any) => {
    // 1. Deduct stock
    const updatedProdutos = [...produtos];
    
    carrinho.forEach(item => {
      const prodIndex = updatedProdutos.findIndex(p => p.id === item.produtoId);
      if (prodIndex !== -1) {
        const prod = updatedProdutos[prodIndex];
        if (prod.controlaEstoque) {
             updatedProdutos[prodIndex] = { ...prod, estoqueAtual: prod.estoqueAtual - item.quantidade };
        }
      }
    });

    // 2. Create Venda Object
    const novaVenda: Venda = {
      id: currentSaleId,
      clienteId: Number(selectedClienteId) || 0,
      petId: selectedPetId ? Number(selectedPetId) : null,
      itens: carrinho,
      subtotal: subtotalVenda,
      desconto: desconto,
      total: totalVenda,
      formaPagamento: transacao.tipo.toUpperCase(),
      valorRecebido: transacao.valor,
      troco: 0, 
      statusPagamento: 'PAGO',
      observacao: transacao.notas || '',
      dataVenda: new Date().toLocaleString()
    };

    // 3. Finalize
    setProdutos(updatedProdutos);
    setVendas(prev => [...prev, novaVenda]);

    if (onIntegrarFinanceiro) {
      const opId = transacao.operadora_id ? Number(transacao.operadora_id) : undefined;
      onIntegrarFinanceiro(novaVenda, opId);
    }

    // Reset form
    setSelectedClienteId('');
    setSelectedPetId('');
    setCarrinho([]);
    setDesconto(0);
    setCheckoutForm({
        formaPagamento: 'DINHEIRO',
        operadoraId: 0,
        valorRecebido: 0,
        observacao: ''
    });
    setParcelasSimuladas([]);
    setShowCheckoutModal(false);
  };

  // --- CONTRATOS STATES ---
  const [contratoForm, setContratoForm] = useState<Partial<Contrato>>({
    ativo: true,
    levaETraz: 'Não',
    recorrente: false,
    valor: 0,
    valorTotal: 0,
    prazoVencimentoDias: 5,
    agendamento: 'SEM',
    diasUsoPlano: [],
    dataInicioContrato: new Date().toISOString().split('T')[0],
    textoContratoSnapshot: '',
    observacao: ''
  });
  const [editingContratoId, setEditingContratoId] = useState<number | null>(null);

  // Filter pets based on selected client (PDV)
  const filteredPets = useMemo(() => {
    if (!selectedClienteId) return [];
    return pets.filter(pet => pet.clienteId === Number(selectedClienteId));
  }, [selectedClienteId, pets]);

  // Filter pets based on selected client (Contratos)
  const filteredPetsContrato = useMemo(() => {
    if (!contratoForm.clienteId) return [];
    return pets.filter(pet => pet.clienteId === Number(contratoForm.clienteId));
  }, [contratoForm.clienteId, pets]);

  // --- CONTRATOS EFFECTS ---
  
  // Auto-fill clienteId when pet is selected in Contratos
  useEffect(() => {
    if (contratoForm.petId) {
      const pet = pets.find(p => p.id === Number(contratoForm.petId));
      if (pet) {
        setContratoForm(prev => ({ ...prev, clienteId: pet.clienteId }));
      }
    }
  }, [contratoForm.petId, pets]);

  // Auto-fill textoContratoSnapshot and valor when plan is selected
  useEffect(() => {
    if (contratoForm.planoId) {
      const plano = produtos.find(p => p.id === Number(contratoForm.planoId));
      if (plano) {
        setContratoForm(prev => ({ 
          ...prev, 
          textoContratoSnapshot: plano.textoContrato || '',
          valor: plano.preco || 0,
          valorTotal: plano.preco || 0 // Initial total value matches base value
        }));
      }
    }
  }, [contratoForm.planoId, produtos]);

  // Sync valorTotal with valor (simple logic for now)
  useEffect(() => {
    setContratoForm(prev => ({ ...prev, valorTotal: prev.valor }));
  }, [contratoForm.valor]);


  // --- PDV HANDLERS ---

  // Search Products (Only Products, No Services)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = produtos.filter(p => {
      // STRICT RULE: Only 'Produto' type allowed in PDV
      if (p.tipo !== 'Produto') return false;
      if (!p.ativo) return false;

      return (
        p.nome.toLowerCase().includes(term) ||
        (p.codigoBarras && p.codigoBarras.includes(term)) ||
        p.id.toString().includes(term)
      );
    });
    setSearchResults(results);
  }, [searchTerm, produtos]);

  const handleAddToCart = (produto: Produto) => {
    // Check if it is a service (double check)
    if (produto.tipo !== 'Produto') {
        // Should not happen due to filter, but good safety
        return;
    }

    // Check stock
    if (produto.controlaEstoque) {
        const currentInCart = carrinho.find(item => item.produtoId === produto.id)?.quantidade || 0;
        if (produto.estoqueAtual <= currentInCart) {
            // Inline feedback (no alert)
            console.warn("Estoque insuficiente");
            return;
        }
    }

    setCarrinho(prev => {
        const existing = prev.find(item => item.produtoId === produto.id);
        if (existing) {
            return prev.map(item => item.produtoId === produto.id ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.preco } : item);
        } else {
            return [...prev, {
                produtoId: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1,
                subtotal: produto.preco
            }];
        }
    });
    setSearchTerm(''); // Clear search after adding
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCarrinho(prev => {
        const newCarrinho = [...prev];
        const item = newCarrinho[index];
        const newQty = item.quantidade + delta;

        if (newQty <= 0) {
            return prev.filter((_, i) => i !== index);
        }

        // Check stock limit if increasing
        if (delta > 0) {
            const produto = produtos.find(p => p.id === item.produtoId);
            if (produto && produto.controlaEstoque && produto.estoqueAtual < newQty) {
                return prev; // Cannot increase
            }
        }

        newCarrinho[index] = { ...item, quantidade: newQty, subtotal: newQty * item.preco };
        return newCarrinho;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
  };



  // Stub function for future integration
  const integrarVendaNoFinanceiro = (venda: Venda) => {
    // TODO: Implement Financeiro integration when module is ready
    // - Create ContaReceber
    // - Create MovimentoCaixa
    // - Update DRE
    console.log("Integrar venda no financeiro (Stub):", venda);
  };

  const handleFinalizarVenda = async () => {
    if (carrinho.length === 0) return;

    // 1. Validate Caixa (Double check)
    const caixa = await CaixaService.getCaixaHoje();
    if (!caixa || caixa.status !== 'aberto') {
      setShowCheckoutModal(false);
      setShowAbrirCaixaModal(true);
      return;
    }

    // 2. Validate Payment Specifics
    if (checkoutForm.formaPagamento === 'CREDIARIO') {
        if (!selectedClienteId) {
            alert('Crediário requer um cliente identificado.');
            return;
        }
        if (parcelasSimuladas.length === 0) {
            alert('Configure as parcelas do crediário.');
            return;
        }
    }
    
    if ((checkoutForm.formaPagamento === 'DEBITO' || checkoutForm.formaPagamento === 'CREDITO') && !checkoutForm.operadoraId) {
      alert('Selecione a operadora do cartão.');
      return;
    }

    // 3. Deduct stock
    const updatedProdutos = [...produtos];
    let stockError = false;

    carrinho.forEach(item => {
      const prodIndex = updatedProdutos.findIndex(p => p.id === item.produtoId);
      if (prodIndex !== -1) {
        const prod = updatedProdutos[prodIndex];
        if (prod.controlaEstoque) {
          if (prod.estoqueAtual < item.quantidade) {
            stockError = true;
          } else {
            updatedProdutos[prodIndex] = { ...prod, estoqueAtual: prod.estoqueAtual - item.quantidade };
          }
        }
      }
    });

    if (stockError) {
        alert("Estoque insuficiente para um ou mais itens.");
        return;
    }

    // 4. Create Venda Object
    const novaVenda: Venda = {
      id: Date.now(),
      clienteId: Number(selectedClienteId) || 0, // 0 for anonymous/balcao
      petId: selectedPetId ? Number(selectedPetId) : null,
      itens: carrinho,
      subtotal: subtotalVenda,
      desconto: desconto,
      total: totalVenda,
      formaPagamento: checkoutForm.formaPagamento,
      valorRecebido: checkoutForm.valorRecebido,
      troco: checkoutForm.valorRecebido > totalVenda ? checkoutForm.valorRecebido - totalVenda : 0,
      statusPagamento: 'PAGO',
      observacao: checkoutForm.observacao,
      dataVenda: new Date().toLocaleString()
    };

    // 5. Create Cash Transaction
    const transactionData: any = {
      caixa_id: caixa.id,
      tipo: checkoutForm.formaPagamento.toLowerCase(),
      subtipo: 'vendas',
      descricao: `Venda PDV #${novaVenda.id}`,
      valor: totalVenda,
      origem: 'vendas',
      referencia_id: novaVenda.id.toString(),
      referencia_tipo: 'venda',
      usuario_criacao: 'Sistema',
      status_conciliacao: ['DINHEIRO', 'PIX'].includes(checkoutForm.formaPagamento) ? 'conciliado' : 'pendente'
    };

    if (checkoutForm.formaPagamento === 'DEBITO' || checkoutForm.formaPagamento === 'CREDITO') {
      transactionData.operadora_id = checkoutForm.operadoraId.toString();
    }

    if (checkoutForm.formaPagamento === 'CREDIARIO') {
        transactionData.parcelas = parcelasSimuladas.map(p => ({
            num_parcela: p.num,
            total_parcelas: crediarioConfig.parcelas,
            valor_parcela: p.valor,
            intervalo_dias: crediarioConfig.intervalo,
            data_vencimento: p.vencimento,
            cliente_id: Number(selectedClienteId),
            status: 'pendente'
        }));
    }

    try {
        await CaixaService.criarTransacao(transactionData);
    } catch (e) {
        alert('Erro ao salvar transação no caixa: ' + e);
        return;
    }

    // 6. Finalize
    try {
      const response = await fetch('/api/sync/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaVenda),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Erro ao salvar venda: ${errorData.error || response.statusText}`);
        return;
      }

      const vendaSalva = await response.json();
      setProdutos(updatedProdutos);
      setVendas(prev => [...prev, vendaSalva]);

      if (onIntegrarFinanceiro) {
        onIntegrarFinanceiro(vendaSalva, checkoutForm.operadoraId);
      }

      // Reset form
      setSelectedClienteId('');
      setSelectedPetId('');
      setCarrinho([]);
      setDesconto(0);
      setCheckoutForm({
          formaPagamento: 'DINHEIRO',
          operadoraId: 0,
          valorRecebido: 0,
          observacao: ''
      });
      setParcelasSimuladas([]);
      setShowCheckoutModal(false);

    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro de conexão ao salvar venda.');
    }
  };

  const getClienteNome = (id: number) => {
    if (!id || id === 0) return 'Cliente Balcão';
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  const getPetNome = (id: number | null) => {
    if (!id) return '-';
    const pet = pets.find(p => p.id === id);
    return pet ? pet.nome : 'Desconhecido';
  };


  // --- CONTRATOS HANDLERS ---
  
  const handleSaveContrato = () => {
    if (!contratoForm.planoId || !contratoForm.valor || !contratoForm.prazoVencimentoDias || !contratoForm.dataInicioContrato) {
      return; 
    }

    const novoContrato: Contrato = {
      id: editingContratoId || Date.now(),
      numero: editingContratoId ? (contratos.find(c => c.id === editingContratoId)?.numero || Date.now()) : Date.now(),
      clienteId: Number(contratoForm.clienteId),
      petId: contratoForm.petId ? Number(contratoForm.petId) : null,
      planoId: Number(contratoForm.planoId),
      ativo: contratoForm.ativo ?? true,
      levaETraz: contratoForm.levaETraz as "Sim" | "Não",
      recorrente: contratoForm.recorrente ?? false,
      valor: Number(contratoForm.valor),
      valorTotal: Number(contratoForm.valorTotal),
      prazoVencimentoDias: Number(contratoForm.prazoVencimentoDias),
      agendamento: contratoForm.agendamento as "COM" | "SEM",
      diasUsoPlano: contratoForm.diasUsoPlano || [],
      dataInicioContrato: contratoForm.dataInicioContrato || '',
      textoContratoSnapshot: contratoForm.textoContratoSnapshot || '',
      observacao: contratoForm.observacao
    };

    if (editingContratoId) {
      setContratos(prev => prev.map(c => c.id === editingContratoId ? novoContrato : c));
    } else {
      setContratos(prev => [...prev, novoContrato]);
    }

    handleCancelContrato();
  };

  const handleCancelContrato = () => {
    setContratoForm({
      ativo: true,
      levaETraz: 'Não',
      recorrente: false,
      valor: 0,
      valorTotal: 0,
      prazoVencimentoDias: 5,
      agendamento: 'SEM',
      diasUsoPlano: [],
      dataInicioContrato: new Date().toISOString().split('T')[0],
      textoContratoSnapshot: '',
      observacao: ''
    });
    setEditingContratoId(null);
  };

  const handleEditContrato = (contrato: Contrato) => {
    setContratoForm(contrato);
    setEditingContratoId(contrato.id);
  };

  const handleDeleteContrato = (id: number) => {
    setContratos(prev => prev.filter(c => c.id !== id));
  };

  const toggleDiaUso = (dia: number) => {
    setContratoForm(prev => {
      const dias = prev.diasUsoPlano || [];
      if (dias.includes(dia)) {
        return { ...prev, diasUsoPlano: dias.filter(d => d !== dia) };
      } else {
        return { ...prev, diasUsoPlano: [...dias, dia].sort() };
      }
    });
  };

  // --- RENDER ---

  if (isContratos) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="text-2xl font-bold text-gray-800">Cadastro de Contrato</h1>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${contratoForm.ativo ? 'text-green-600' : 'text-gray-500'}`}>
              {contratoForm.ativo ? 'Ativo' : 'Inativo'}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={contratoForm.ativo}
                onChange={(e) => setContratoForm(prev => ({ ...prev, ativo: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* BLOCO 1 - Identificação */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">1. Identificação e Plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet - Cliente</label>
              <select 
                value={contratoForm.petId || ''} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, petId: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Selecione...</option>
                {pets.map(pet => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nome} - {getClienteNome(pet.clienteId)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
              <select 
                value={contratoForm.planoId || ''} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, planoId: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Selecione...</option>
                {produtos.filter(p => p.tipo === 'Plano' && p.ativo).map(plano => (
                  <option key={plano.id} value={plano.id}>{plano.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leva & Traz</label>
              <select 
                value={contratoForm.levaETraz} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, levaETraz: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </select>
            </div>

            <div className="flex items-center mt-6">
              <label className="inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={contratoForm.recorrente} 
                  onChange={(e) => setContratoForm(prev => ({ ...prev, recorrente: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded" 
                />
                <span className="ml-2 text-gray-700 font-medium">Recorrente</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Vencimento (dias)</label>
              <input 
                type="number" 
                value={contratoForm.prazoVencimentoDias} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, prazoVencimentoDias: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input 
                type="number" 
                value={contratoForm.valor} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, valor: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$)</label>
              <input 
                type="number" 
                value={contratoForm.valorTotal} 
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* BLOCO 2 - Agendamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">2. Agendamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opção de Agendamento</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="agendamento" 
                    value="SEM" 
                    checked={contratoForm.agendamento === 'SEM'}
                    onChange={() => setContratoForm(prev => ({ ...prev, agendamento: 'SEM' }))}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">Sem Agendamento</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="agendamento" 
                    value="COM" 
                    checked={contratoForm.agendamento === 'COM'}
                    onChange={() => setContratoForm(prev => ({ ...prev, agendamento: 'COM' }))}
                    className="form-radio text-indigo-600"
                  />
                  <span className="ml-2">Com Agendamento</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início Contrato</label>
              <input 
                type="date" 
                value={contratoForm.dataInicioContrato} 
                onChange={(e) => setContratoForm(prev => ({ ...prev, dataInicioContrato: e.target.value }))}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {contratoForm.agendamento === 'COM' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Uso</label>
                <div className="flex gap-2 flex-wrap">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDiaUso(index)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        contratoForm.diasUsoPlano?.includes(index)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {dia}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BLOCO 3 - Termos */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-indigo-700 mb-4 border-b pb-2">3. Termos do Contrato</h2>
          <textarea 
            value={contratoForm.textoContratoSnapshot} 
            readOnly
            className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 text-gray-600 text-sm"
            rows={6}
            placeholder="O texto do contrato aparecerá aqui após selecionar um plano..."
          />
        </div>

        {/* Ações */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={handleSaveContrato}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm"
          >
            Salvar Contrato
          </button>
          <button 
            onClick={handleCancelContrato}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancelar / Limpar
          </button>
        </div>

        {/* Listagem */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contratos Cadastrados</h2>
          {contratos.length === 0 ? (
            <p className="text-gray-500">Nenhum contrato cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Pet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contratos.map(contrato => {
                    const plano = produtos.find(p => p.id === contrato.planoId);
                    return (
                      <tr key={contrato.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{contrato.numero}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getClienteNome(contrato.clienteId)} <br/>
                          <span className="text-gray-500 text-xs">{getPetNome(contrato.petId)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plano?.nome || 'Plano Removido'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {contrato.valorTotal.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contrato.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {contrato.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleEditContrato(contrato)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                          <button onClick={() => handleDeleteContrato(contrato.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- PDV RENDER ---
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Caixa (PDV)</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => {
                    setCarrinho([]);
                    setSelectedClienteId('');
                    setSelectedPetId('');
                    setSearchTerm('');
                    setDesconto(0);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
            >
                Cancelar Venda
            </button>
            <button 
                onClick={async () => {
                    // Check stock first
                    let stockError = false;
                    carrinho.forEach(item => {
                        const prod = produtos.find(p => p.id === item.produtoId);
                        if (prod && prod.controlaEstoque && prod.estoqueAtual < item.quantidade) {
                            stockError = true;
                        }
                    });
                    
                    if (stockError) {
                        alert("Estoque insuficiente para um ou mais itens.");
                        return;
                    }

                    if (await verificarCaixa()) {
                        setCurrentSaleId(Date.now());
                        setShowCheckoutModal(true);
                    }
                }}
                disabled={carrinho.length === 0}
                className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium ${carrinho.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Finalizar Venda
            </button>
        </div>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
        
        {/* LEFT COLUMN: Search & Cart */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            
            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Produto</label>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar produto por nome, código ou código de barras"
                    className="w-full border rounded-md p-3 text-lg"
                    autoFocus
                />
                {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-60 overflow-y-auto bg-white shadow-lg">
                        {searchResults.map(prod => (
                            <div 
                                key={prod.id} 
                                onClick={() => handleAddToCart(prod)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold text-gray-800">{prod.nome}</div>
                                    <div className="text-xs text-gray-500">Estoque: {prod.estoqueAtual}</div>
                                </div>
                                <div className="font-bold text-indigo-600">R$ {prod.preco.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex-1 flex flex-col">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Carrinho</h2>
                <div className="flex-1 overflow-y-auto">
                    {carrinho.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">Carrinho vazio</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="text-left p-2">Produto</th>
                                    <th className="text-center p-2">Qtd</th>
                                    <th className="text-right p-2">Unit.</th>
                                    <th className="text-right p-2">Total</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {carrinho.map((item, idx) => (
                                    <tr key={idx} className="border-b last:border-b-0">
                                        <td className="p-2 font-medium">{item.nome}</td>
                                        <td className="p-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleUpdateQuantity(idx, -1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                                                <span className="w-8 text-center">{item.quantidade}</span>
                                                <button onClick={() => handleUpdateQuantity(idx, 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                                            </div>
                                        </td>
                                        <td className="p-2 text-right">R$ {item.preco.toFixed(2)}</td>
                                        <td className="p-2 text-right font-bold">R$ {item.subtotal.toFixed(2)}</td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-bold">R$ {subtotalVenda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-600">Desconto (R$):</span>
                        <input 
                            type="number" 
                            value={desconto} 
                            onChange={(e) => setDesconto(Number(e.target.value))}
                            className="w-24 border rounded p-1 text-right text-red-600"
                        />
                    </div>
                    <div className="flex justify-between text-xl font-bold bg-gray-100 p-3 rounded">
                        <span>Total:</span>
                        <span className="text-green-700">R$ {totalVenda.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Client & History */}
        <div className="w-1/3 flex flex-col gap-6">
            
            {/* Client Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Cliente (Opcional)</h2>
                <div className="space-y-3">
                    <div>
                        <select 
                            value={selectedClienteId} 
                            onChange={(e) => {
                                setSelectedClienteId(e.target.value);
                                setSelectedPetId('');
                            }}
                            className="w-full border rounded-md p-2 text-sm"
                        >
                            <option value="">Cliente Balcão (Não identificado)</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                    {selectedClienteId && (
                        <div>
                            <select 
                                value={selectedPetId} 
                                onChange={(e) => setSelectedPetId(e.target.value)}
                                className="w-full border rounded-md p-2 text-sm"
                            >
                                <option value="">Selecione um pet (Opcional)</option>
                                {filteredPets.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white p-4 rounded-lg shadow-sm border flex-1 overflow-hidden flex flex-col">
                <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">Últimas Vendas</h2>
                <div className="flex-1 overflow-y-auto">
                    {vendas.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center mt-4">Nenhuma venda hoje.</p>
                    ) : (
                        <div className="space-y-2">
                            {vendas.slice().reverse().map(venda => (
                                <div key={venda.id} className="border rounded p-2 text-sm hover:bg-gray-50">
                                    <div className="flex justify-between font-bold">
                                        <span>#{venda.id}</span>
                                        <span className="text-green-600">R$ {venda.total.toFixed(2)}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex justify-between mt-1">
                                        <span>{getClienteNome(venda.clienteId)}</span>
                                        <span>{venda.itens.length} itens</span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {venda.dataVenda}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODAL ABRIR CAIXA (PDV INTERCEPT) */}
      {showAbrirCaixaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex items-center gap-2 mb-4 text-orange-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <h2 className="text-xl font-bold">Caixa Fechado</h2>
            </div>
            <p className="text-gray-600 mb-4">
              O caixa está fechado. É necessário abri-lo antes de realizar recebimentos.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial (R$)</label>
              <input 
                type="number" 
                value={saldoInicialCaixa} 
                onChange={(e) => setSaldoInicialCaixa(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md p-2"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setShowAbrirCaixaModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAbrirCaixaPDV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Abrir Caixa Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-0 rounded-lg shadow-xl w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Finalizar Venda</h2>
                    <button onClick={() => setShowCheckoutModal(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <PaymentMethodSelector 
                        valorTotal={totalVenda}
                        origem="pdv"
                        referencia_id={currentSaleId.toString()}
                        onPaymentComplete={handlePDVPaymentComplete}
                        onCancel={() => setShowCheckoutModal(false)}
                    />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
