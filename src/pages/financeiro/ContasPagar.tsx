import React, { useState, useMemo } from 'react';
import { TituloFinanceiro, BaixaTitulo, Fornecedor, ContaBancaria, MovimentoConta } from '../../App';

interface ContasPagarProps {
  titulos: TituloFinanceiro[];
  setTitulos: React.Dispatch<React.SetStateAction<TituloFinanceiro[]>>;
  baixas: BaixaTitulo[];
  setBaixas: React.Dispatch<React.SetStateAction<BaixaTitulo[]>>;
  fornecedores: Fornecedor[];
  contasBancarias: ContaBancaria[];
  setMovimentosConta: React.Dispatch<React.SetStateAction<MovimentoConta[]>>;
}

export default function ContasPagarPage({ 
  titulos, 
  setTitulos, 
  baixas, 
  setBaixas, 
  fornecedores, 
  contasBancarias,
  setMovimentosConta 
}: ContasPagarProps) {
  const [showModal, setShowModal] = useState(false);
  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [selectedTitulo, setSelectedTitulo] = useState<TituloFinanceiro | null>(null);
  
  // Filter State
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State (New Title)
  const [form, setForm] = useState<Partial<TituloFinanceiro>>({
    descricao: '',
    pessoaId: 0,
    valorOriginal: 0,
    dataEmissao: new Date().toISOString().split('T')[0],
    dataVencimento: new Date().toISOString().split('T')[0],
    observacao: ''
  });

  // Form State (Baixa)
  const [baixaForm, setBaixaForm] = useState<{
    contaId: number;
    data: string;
    valor: number;
    formaPagamento: string;
    observacao: string;
  }>({
    contaId: 0,
    data: new Date().toISOString().split('T')[0],
    valor: 0,
    formaPagamento: 'DINHEIRO',
    observacao: ''
  });

  // --- HELPERS ---
  const getSaldo = (t: TituloFinanceiro) => {
    const totalBaixas = baixas.filter(b => b.tituloId === t.id).reduce((acc, b) => acc + b.valor, 0);
    return t.valorLiquido - totalBaixas;
  };

  const filteredTitulos = useMemo(() => {
    return titulos
      .filter(t => t.tipo === 'PAGAR')
      .filter(t => {
        if (filterStatus !== 'TODOS' && t.status !== filterStatus) return false;
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const fornecedorNome = t.pessoaNome || fornecedores.find(f => f.id === t.pessoaId)?.nome || '';
          return (
            t.descricao.toLowerCase().includes(searchLower) ||
            fornecedorNome.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
  }, [titulos, filterStatus, searchTerm, fornecedores]);

  // --- HANDLERS ---

  const handleOpenModal = () => {
    setForm({
      descricao: '',
      pessoaId: 0,
      valorOriginal: 0,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: new Date().toISOString().split('T')[0],
      observacao: ''
    });
    setShowModal(true);
  };

  const handleSaveTitulo = () => {
    if (!form.descricao || !form.valorOriginal) return;

    const fornecedor = fornecedores.find(f => f.id === form.pessoaId);
    
    const novo: TituloFinanceiro = {
      id: Date.now(),
      tipo: 'PAGAR',
      pessoaTipo: 'FORNECEDOR',
      pessoaId: form.pessoaId,
      pessoaNome: fornecedor?.nome || 'Fornecedor Avulso',
      descricao: form.descricao,
      dataEmissao: form.dataEmissao!,
      dataVencimento: form.dataVencimento!,
      valorOriginal: Number(form.valorOriginal),
      desconto: 0,
      juros: 0,
      multa: 0,
      valorLiquido: Number(form.valorOriginal), // Simple logic for now
      status: 'ABERTO',
      observacao: form.observacao,
      origem: 'MANUAL'
    };

    setTitulos(prev => [...prev, novo]);
    setShowModal(false);
  };

  const handleOpenBaixa = (t: TituloFinanceiro) => {
    setSelectedTitulo(t);
    const saldo = getSaldo(t);
    setBaixaForm({
      contaId: contasBancarias.find(c => c.ativo)?.id || 0,
      data: new Date().toISOString().split('T')[0],
      valor: saldo,
      formaPagamento: 'DINHEIRO',
      observacao: ''
    });
    setShowBaixaModal(true);
  };

  const handleConfirmBaixa = () => {
    if (!selectedTitulo || !baixaForm.contaId || baixaForm.valor <= 0) return;

    // 1. Create Baixa
    const novaBaixa: BaixaTitulo = {
      id: Date.now(),
      tituloId: selectedTitulo.id,
      contaId: baixaForm.contaId,
      data: baixaForm.data,
      valor: Number(baixaForm.valor),
      formaPagamento: baixaForm.formaPagamento as any,
      observacao: baixaForm.observacao
    };
    setBaixas(prev => [...prev, novaBaixa]);

    // 2. Update Title Status
    const saldoAtual = getSaldo(selectedTitulo);
    const novoSaldo = saldoAtual - Number(baixaForm.valor);
    let novoStatus: TituloFinanceiro['status'] = 'PARCIAL';
    if (novoSaldo <= 0.01) novoStatus = 'PAGO'; // Tolerance for float

    setTitulos(prev => prev.map(t => t.id === selectedTitulo.id ? { ...t, status: novoStatus } : t));

    // 3. Create Movimento Conta
    const novoMovimento: MovimentoConta = {
      id: Date.now() + 1, // Ensure unique ID if fast
      contaId: baixaForm.contaId,
      data: baixaForm.data,
      tipo: 'SAIDA',
      valor: Number(baixaForm.valor),
      historico: `Pagamento: ${selectedTitulo.descricao}`,
      referenciaTipo: 'AP',
      referenciaId: selectedTitulo.id,
      conciliado: true, // Auto-reconcile for now
      observacao: `Fornecedor: ${selectedTitulo.pessoaNome}`
    };
    setMovimentosConta(prev => [...prev, novoMovimento]);

    setShowBaixaModal(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Contas a Pagar</h2>
        <button 
          onClick={handleOpenModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Novo Título
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-4 bg-white p-4 rounded shadow-sm border">
        <input 
          type="text" 
          placeholder="Buscar por descrição ou fornecedor..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 border rounded p-2"
        />
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="TODOS">Todos Status</option>
          <option value="ABERTO">Aberto</option>
          <option value="PARCIAL">Parcial</option>
          <option value="PAGO">Pago</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex-1 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTitulos.map(t => {
              const saldo = getSaldo(t);
              const isLate = new Date(t.dataVencimento) < new Date() && saldo > 0 && t.status !== 'CANCELADO';
              
              return (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isLate ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    {new Date(t.dataVencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {t.pessoaNome}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                    {t.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    R$ {t.valorLiquido.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-700">
                    R$ {saldo.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      t.status === 'PAGO' ? 'bg-green-100 text-green-800' :
                      t.status === 'CANCELADO' ? 'bg-gray-100 text-gray-800' :
                      t.status === 'PARCIAL' ? 'bg-yellow-100 text-yellow-800' :
                      isLate ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {saldo > 0 && t.status !== 'CANCELADO' && (
                      <button 
                        onClick={() => handleOpenBaixa(t)}
                        className="text-red-600 hover:text-red-900 font-bold"
                      >
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL NOVO TITULO */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Novo Título a Pagar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  value={form.descricao} 
                  onChange={e => setForm({...form, descricao: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                <select 
                  value={form.pessoaId} 
                  onChange={e => setForm({...form, pessoaId: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                >
                  <option value={0}>Fornecedor Avulso / Não Cadastrado</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emissão</label>
                  <input 
                    type="date" 
                    value={form.dataEmissao} 
                    onChange={e => setForm({...form, dataEmissao: e.target.value})} 
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                  <input 
                    type="date" 
                    value={form.dataVencimento} 
                    onChange={e => setForm({...form, dataVencimento: e.target.value})} 
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  value={form.valorOriginal} 
                  onChange={e => setForm({...form, valorOriginal: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea 
                  value={form.observacao} 
                  onChange={e => setForm({...form, observacao: e.target.value})} 
                  className="w-full border rounded p-2"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveTitulo} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BAIXA (PAGAMENTO) */}
      {showBaixaModal && selectedTitulo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pagamento de Título</h2>
            
            <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
              <p><strong>Fornecedor:</strong> {selectedTitulo.pessoaNome}</p>
              <p><strong>Descrição:</strong> {selectedTitulo.descricao}</p>
              <p><strong>Vencimento:</strong> {new Date(selectedTitulo.dataVencimento).toLocaleDateString('pt-BR')}</p>
              <p><strong>Saldo Devedor:</strong> R$ {getSaldo(selectedTitulo).toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conta de Origem</label>
                <select 
                  value={baixaForm.contaId} 
                  onChange={e => setBaixaForm({...baixaForm, contaId: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                >
                  <option value={0}>Selecione...</option>
                  {contasBancarias.filter(c => c.ativo).map(c => (
                    <option key={c.id} value={c.id}>{c.descricao}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Pagamento</label>
                  <input 
                    type="date" 
                    value={baixaForm.data} 
                    onChange={e => setBaixaForm({...baixaForm, data: e.target.value})} 
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor a Pagar</label>
                  <input 
                    type="number" 
                    value={baixaForm.valor} 
                    onChange={e => setBaixaForm({...baixaForm, valor: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    max={getSaldo(selectedTitulo)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                <select 
                  value={baixaForm.formaPagamento} 
                  onChange={e => setBaixaForm({...baixaForm, formaPagamento: e.target.value})} 
                  className="w-full border rounded p-2"
                >
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="PIX">Pix</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="TRANSFERENCIA">Transferência</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea 
                  value={baixaForm.observacao} 
                  onChange={e => setBaixaForm({...baixaForm, observacao: e.target.value})} 
                  className="w-full border rounded p-2"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBaixaModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button onClick={handleConfirmBaixa} className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">Confirmar Pagamento</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
