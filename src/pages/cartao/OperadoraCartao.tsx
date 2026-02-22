import React, { useState, useEffect, useRef } from 'react';
import { OperadoraCartao, AdquirenteOperadora } from '../../App';

interface OperadoraCartaoProps {
  operadoras: OperadoraCartao[];
  setOperadoras: React.Dispatch<React.SetStateAction<OperadoraCartao[]>>;
}

export default function OperadoraCartaoPage({ operadoras, setOperadoras }: OperadoraCartaoProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<OperadoraCartao>>({
    nome: '',
    taxaDebito: 0,
    taxaCreditoAvista: 0,
    taxaCreditoParcelado: 0,
    diasLiquidezDebito: 1,
    diasLiquidezCredito: 30,
    maxParcelas: 12,
    minParcelas: 1,
    permiteDebito: true,
    permiteCredito: true,
    ativo: true,
    adquirentes: []
  });

  // Adquirente Sub-Modal State
  const [showAdquirenteModal, setShowAdquirenteModal] = useState(false);
  const [adquirenteForm, setAdquirenteForm] = useState<Partial<AdquirenteOperadora>>({
    nome: '',
    tipo: 'ADQUIRENTE',
    ativo: true,
    credenciais: []
  });
  const [editingAdquirenteId, setEditingAdquirenteId] = useState<string | null>(null);

  const commonAdquirentes = ['Cielo', 'Rede', 'Getnet', 'Stone', 'PagSeguro', 'Mercado Pago', 'Safra', 'Bin', 'Sipag', 'Global Payments'];

  // --- SCROLL REFS ---
  const modalRef = useRef<HTMLDivElement>(null);
  const adquirenteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [showModal]);

  useEffect(() => {
    if (showAdquirenteModal && adquirenteModalRef.current) {
      adquirenteModalRef.current.scrollTop = 0;
    }
  }, [showAdquirenteModal]);

  // SEED INITIAL DATA
  useEffect(() => {
    const seedOperadoras = [
      { nome: 'Cielo', maxParcelas: 12 },
      { nome: 'Rede', maxParcelas: 12 },
      { nome: 'Getnet', maxParcelas: 12 },
      { nome: 'Stone', maxParcelas: 12 },
      { nome: 'PagSeguro', maxParcelas: 12 },
      { nome: 'Mercado Pago', maxParcelas: 12 }
    ];

    let newOperadoras: OperadoraCartao[] = [];
    let hasChanges = false;

    seedOperadoras.forEach(seed => {
      const exists = operadoras.some(op => op.nome.toLowerCase() === seed.nome.toLowerCase());
      if (!exists) {
        newOperadoras.push({
          id: Date.now() + Math.random(),
          nome: seed.nome,
          taxaDebito: 0,
          taxaCreditoAvista: 0,
          taxaCreditoParcelado: 0,
          diasLiquidezDebito: 1,
          diasLiquidezCredito: 30,
          maxParcelas: seed.maxParcelas,
          minParcelas: 1,
          permiteDebito: true,
          permiteCredito: true,
          ativo: true,
          adquirentes: []
        });
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setOperadoras(prev => [...prev, ...newOperadoras]);
    }
  }, []); 

  const handleOpenModal = (op?: OperadoraCartao) => {
    if (op) {
      setForm({ ...op, adquirentes: op.adquirentes || [] });
      setEditingId(op.id);
    } else {
      setForm({
        nome: '',
        taxaDebito: 0,
        taxaCreditoAvista: 0,
        taxaCreditoParcelado: 0,
        diasLiquidezDebito: 1,
        diasLiquidezCredito: 30,
        maxParcelas: 12,
        minParcelas: 1,
        permiteDebito: true,
        permiteCredito: true,
        ativo: true,
        adquirentes: []
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome) return;

    if (editingId) {
      setOperadoras(prev => prev.map(o => o.id === editingId ? { ...o, ...form } as OperadoraCartao : o));
    } else {
      const nova: OperadoraCartao = {
        id: Date.now(),
        ...form as OperadoraCartao
      };
      setOperadoras(prev => [...prev, nova]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Excluir esta operadora?')) {
      setOperadoras(prev => prev.filter(o => o.id !== id));
    }
  };

  // --- ADQUIRENTE HANDLERS ---
  const handleOpenAdquirenteModal = (adq?: AdquirenteOperadora) => {
    if (adq) {
      setAdquirenteForm(adq);
      setEditingAdquirenteId(adq.id);
    } else {
      setAdquirenteForm({
        nome: '',
        tipo: 'ADQUIRENTE',
        ativo: true,
        credenciais: []
      });
      setEditingAdquirenteId(null);
    }
    setShowAdquirenteModal(true);
  };

  const handleSaveAdquirente = () => {
    if (!adquirenteForm.nome) return;

    // Check duplicate name
    const isDuplicate = (form.adquirentes || []).some(
      a => a.nome.toLowerCase() === adquirenteForm.nome?.toLowerCase() && a.id !== editingAdquirenteId
    );
    if (isDuplicate) {
      alert('Já existe uma adquirente com este nome nesta operadora.');
      return;
    }

    const newAdquirente = {
      ...adquirenteForm,
      id: editingAdquirenteId || Date.now().toString() + Math.random().toString()
    } as AdquirenteOperadora;

    if (editingAdquirenteId) {
      setForm(prev => ({
        ...prev,
        adquirentes: prev.adquirentes?.map(a => a.id === editingAdquirenteId ? newAdquirente : a)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        adquirentes: [...(prev.adquirentes || []), newAdquirente]
      }));
    }
    setShowAdquirenteModal(false);
  };

  const handleDeleteAdquirente = (id: string) => {
    if (window.confirm('Remover esta adquirente?')) {
      setForm(prev => ({
        ...prev,
        adquirentes: prev.adquirentes?.filter(a => a.id !== id)
      }));
    }
  };

  const handleAddCredential = () => {
    setAdquirenteForm(prev => ({
      ...prev,
      credenciais: [...(prev.credenciais || []), { chave: '', valor: '' }]
    }));
  };

  const handleCredentialChange = (index: number, field: 'chave' | 'valor', value: string) => {
    const newCreds = [...(adquirenteForm.credenciais || [])];
    newCreds[index] = { ...newCreds[index], [field]: value };
    setAdquirenteForm(prev => ({ ...prev, credenciais: newCreds }));
  };

  const handleRemoveCredential = (index: number) => {
    const newCreds = [...(adquirenteForm.credenciais || [])];
    newCreds.splice(index, 1);
    setAdquirenteForm(prev => ({ ...prev, credenciais: newCreds }));
  };

  const handleAddFromList = (nome: string) => {
    const exists = (form.adquirentes || []).some(a => a.nome.toLowerCase() === nome.toLowerCase());
    if (exists) return;

    const newAdquirente: AdquirenteOperadora = {
      id: Date.now().toString() + Math.random().toString(),
      nome: nome,
      tipo: 'ADQUIRENTE',
      ativo: true,
      credenciais: []
    };

    setForm(prev => ({
      ...prev,
      adquirentes: [...(prev.adquirentes || []), newAdquirente]
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Operadoras de Cartão</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium"
        >
          + Adicionar Operadora
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxa Débito</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxa Crédito (1x)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Taxa Parc.</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Máx. Parc.</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operadoras.map(op => (
              <tr key={op.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{op.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{op.taxaDebito}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{op.taxaCreditoAvista}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{op.taxaCreditoParcelado}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{op.maxParcelas || 12}x</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${op.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {op.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(op)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                  <button onClick={() => handleDelete(op.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Operadora' : 'Nova Operadora'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Operadora</label>
                <input 
                  type="text" 
                  value={form.nome} 
                  onChange={e => setForm({...form, nome: e.target.value})} 
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taxa Débito (%)</label>
                  <input 
                    type="number" 
                    value={form.taxaDebito} 
                    onChange={e => setForm({...form, taxaDebito: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taxa Créd. 1x (%)</label>
                  <input 
                    type="number" 
                    value={form.taxaCreditoAvista} 
                    onChange={e => setForm({...form, taxaCreditoAvista: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taxa Parc. (%)</label>
                  <input 
                    type="number" 
                    value={form.taxaCreditoParcelado} 
                    onChange={e => setForm({...form, taxaCreditoParcelado: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Liq. Débito (Dias)</label>
                  <input 
                    type="number" 
                    value={form.diasLiquidezDebito} 
                    onChange={e => setForm({...form, diasLiquidezDebito: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Liq. Crédito (Dias)</label>
                  <input 
                    type="number" 
                    value={form.diasLiquidezCredito} 
                    onChange={e => setForm({...form, diasLiquidezCredito: Number(e.target.value)})} 
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Máximo de Parcelas</label>
                <input 
                  type="number" 
                  min="1"
                  max="24"
                  value={form.maxParcelas} 
                  onChange={e => setForm({...form, maxParcelas: Number(e.target.value)})} 
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.permiteDebito} 
                    onChange={e => setForm({...form, permiteDebito: e.target.checked})} 
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Aceita Débito</label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.permiteCredito} 
                    onChange={e => setForm({...form, permiteCredito: e.target.checked})} 
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Aceita Crédito</label>
                </div>
              </div>

              <div className="flex items-center border-t pt-4">
                <input 
                  type="checkbox" 
                  checked={form.ativo} 
                  onChange={e => setForm({...form, ativo: e.target.checked})} 
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Ativo</label>
              </div>

              {/* ADQUIRENTES SECTION */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Adquirentes Vinculadas</h3>
                  <div className="flex gap-2">
                    <select 
                      className="text-xs border rounded p-1 w-32"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddFromList(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">+ Lista Rápida</option>
                      {commonAdquirentes.map(adq => (
                        <option key={adq} value={adq}>{adq}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleOpenAdquirenteModal()}
                      className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 font-bold"
                    >
                      + Novo
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100 text-gray-500">
                      <tr>
                        <th className="p-2 text-left">Nome</th>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-center">Status</th>
                        <th className="p-2 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.adquirentes || []).map(adq => (
                        <tr key={adq.id} className="border-t border-gray-200">
                          <td className="p-2 font-medium">{adq.nome}</td>
                          <td className="p-2 text-gray-500">{adq.tipo}</td>
                          <td className="p-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${adq.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {adq.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="p-2 text-right">
                            <button onClick={() => handleOpenAdquirenteModal(adq)} className="text-indigo-600 hover:text-indigo-800 mr-2">Editar</button>
                            <button onClick={() => handleDeleteAdquirente(adq.id)} className="text-red-600 hover:text-red-800">&times;</button>
                          </td>
                        </tr>
                      ))}
                      {(form.adquirentes || []).length === 0 && (
                        <tr><td colSpan={4} className="p-3 text-center text-gray-400 italic">Nenhuma adquirente vinculada</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* ADQUIRENTE MODAL */}
      {showAdquirenteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div ref={adquirenteModalRef} className="bg-white p-5 rounded-lg shadow-xl w-[400px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingAdquirenteId ? 'Editar Adquirente' : 'Nova Adquirente'}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                <input 
                  type="text" 
                  value={adquirenteForm.nome} 
                  onChange={e => setAdquirenteForm({...adquirenteForm, nome: e.target.value})} 
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Ex: Cielo"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  value={adquirenteForm.tipo} 
                  onChange={e => setAdquirenteForm({...adquirenteForm, tipo: e.target.value as any})} 
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="ADQUIRENTE">Adquirente</option>
                  <option value="SUBADQUIRENTE">Subadquirente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Credenciais</label>
                <div className="text-[10px] text-gray-500 mb-2">
                  Chaves específicas (ex: MerchantId, Token).
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto border p-2 rounded bg-gray-50">
                  {(adquirenteForm.credenciais || []).map((cred, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        placeholder="Chave" 
                        value={cred.chave} 
                        onChange={e => handleCredentialChange(idx, 'chave', e.target.value)}
                        className="w-1/3 border rounded p-1 text-xs"
                      />
                      <input 
                        placeholder="Valor" 
                        value={cred.valor} 
                        onChange={e => handleCredentialChange(idx, 'valor', e.target.value)}
                        className="flex-1 border rounded p-1 text-xs"
                      />
                      <button onClick={() => handleRemoveCredential(idx)} className="text-red-500 hover:text-red-700 px-1">&times;</button>
                    </div>
                  ))}
                  <button onClick={handleAddCredential} className="text-xs text-indigo-600 hover:underline">+ Adicionar Credencial</button>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <input 
                  type="checkbox" 
                  checked={adquirenteForm.ativo} 
                  onChange={e => setAdquirenteForm({...adquirenteForm, ativo: e.target.checked})} 
                  className="h-4 w-4 text-indigo-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Ativo</label>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdquirenteModal(false)} className="flex-1 px-3 py-2 border rounded text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveAdquirente} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
