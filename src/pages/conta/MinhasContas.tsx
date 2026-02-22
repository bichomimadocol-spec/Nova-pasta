import React, { useState } from 'react';
import { ContaBancaria, Banco, MovimentoConta } from '../../App';

interface MinhasContasProps {
  contas: ContaBancaria[];
  setContas: React.Dispatch<React.SetStateAction<ContaBancaria[]>>;
  bancos: Banco[];
  movimentos: MovimentoConta[];
}

export default function MinhasContasPage({ contas, setContas, bancos, movimentos }: MinhasContasProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<ContaBancaria>>({
    descricao: '',
    tipo: 'CAIXA',
    saldoInicial: 0,
    ativo: true
  });

  const handleOpenModal = (conta?: ContaBancaria) => {
    if (conta) {
      setForm(conta);
      setEditingId(conta.id);
    } else {
      setForm({ descricao: '', tipo: 'CAIXA', saldoInicial: 0, ativo: true });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.descricao) return;

    if (editingId) {
      setContas(prev => prev.map(c => c.id === editingId ? { ...c, ...form } as ContaBancaria : c));
    } else {
      const nova: ContaBancaria = {
        id: Date.now(),
        ...form as ContaBancaria
      };
      setContas(prev => [...prev, nova]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir esta conta?')) {
      setContas(prev => prev.filter(c => c.id !== id));
    }
  };

  const getSaldoAtual = (conta: ContaBancaria) => {
    const movs = movimentos.filter(m => m.contaId === conta.id);
    const entradas = movs.filter(m => m.tipo === 'ENTRADA').reduce((acc, m) => acc + m.valor, 0);
    const saidas = movs.filter(m => m.tipo === 'SAIDA').reduce((acc, m) => acc + m.valor, 0);
    // Transferencias logic could be added here (ENTRADA vs SAIDA based on source/dest)
    // For simplicity, assuming TRANSFERENCIA type needs direction or separate logic, 
    // but sticking to simple ENTRADA/SAIDA for now as per MovimentoConta structure which has 'tipo'.
    // If 'TRANSFERENCIA' is a type, we need to know if it's in or out. 
    // Assuming MovimentoConta is a single record per account movement.
    const transferencias = movs.filter(m => m.tipo === 'TRANSFERENCIA').reduce((acc, m) => acc + m.valor, 0); 
    // Usually transfers are pairs of movements. If single record, it's ambiguous. 
    // Let's assume for now movements are strictly signed by type or we use ENTRADA/SAIDA for everything.
    // The interface has "ENTRADA" | "SAIDA" | "TRANSFERENCIA". 
    // I'll treat TRANSFERENCIA as 0 effect here unless I know direction, or assume it's handled by 2 records (one SAIDA, one ENTRADA).
    
    return conta.saldoInicial + entradas - saidas; 
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Minhas Contas</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Nova Conta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contas.map(conta => {
          const saldo = getSaldoAtual(conta);
          return (
            <div key={conta.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{conta.descricao}</h3>
                  <p className="text-xs text-gray-500">{conta.tipo} {conta.bancoId && ` - ${bancos.find(b => b.id === conta.bancoId)?.nome}`}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${conta.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {conta.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase">Saldo Atual</p>
                <p className={`text-xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {saldo.toFixed(2)}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => handleOpenModal(conta)} className="text-sm text-indigo-600 hover:underline">Editar</button>
                <button onClick={() => handleDelete(conta.id)} className="text-sm text-red-600 hover:underline">Excluir</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Conta' : 'Nova Conta'}</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select 
                    value={form.tipo} 
                    onChange={e => setForm({...form, tipo: e.target.value as any})} 
                    className="w-full border rounded p-2"
                  >
                    <option value="CAIXA">Caixa Físico</option>
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Poupança</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <select 
                    value={form.bancoId || ''} 
                    onChange={e => setForm({...form, bancoId: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    disabled={form.tipo === 'CAIXA'}
                  >
                    <option value="">Selecione...</option>
                    {bancos.filter(b => b.ativo).map(b => (
                      <option key={b.id} value={b.id}>{b.nome}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                  <input 
                    type="text" 
                    value={form.agencia || ''} 
                    onChange={e => setForm({...form, agencia: e.target.value})} 
                    className="w-full border rounded p-2"
                    disabled={form.tipo === 'CAIXA'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                  <input 
                    type="text" 
                    value={form.conta || ''} 
                    onChange={e => setForm({...form, conta: e.target.value})} 
                    className="w-full border rounded p-2"
                    disabled={form.tipo === 'CAIXA'}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
                <input 
                  type="number" 
                  value={form.saldoInicial} 
                  onChange={e => setForm({...form, saldoInicial: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={form.ativo} 
                  onChange={e => setForm({...form, ativo: e.target.checked})} 
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Ativo</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
