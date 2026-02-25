import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Pet, Cliente } from '../App';

interface PetsProps {
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  clientes: Cliente[];
}

export default function Pets({ pets, setPets, clientes }: PetsProps) {
  const location = useLocation();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<Partial<Pet>>({
    nome: '',
    clienteId: undefined,
    especie: '',
    raca: '',
    genero: '',
    porte: '',
    pelagem: '',
    dataNascimento: '',
    idade: '',
    chip: '',
    pedigreeRg: '',
    alimentacao: '',
    tags: '',
    alergias: '',
    observacao: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Auxiliary Lists State
  const [racas, setRacas] = useState<string[]>(['Vira-lata', 'Poodle', 'Bulldog', 'Labrador', 'Golden Retriever', 'Shih Tzu', 'Yorkshire', 'Persa', 'Siamês']);
  const [pelagens, setPelagens] = useState<string[]>(['Curta', 'Longa', 'Média', 'Dura', 'Lisa', 'Ondulada']);
  const [portes, setPortes] = useState<string[]>(['Pequeno', 'Médio', 'Grande', 'Gigante']);

  // Modals State
  const [showRacaModal, setShowRacaModal] = useState(false);
  const [showPelagemModal, setShowPelagemModal] = useState(false);
  const [showPorteModal, setShowPorteModal] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');

  // --- SCROLL REFS ---
  const auxModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'form') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  useEffect(() => {
    if ((showRacaModal || showPelagemModal || showPorteModal) && auxModalRef.current) {
      auxModalRef.current.scrollTop = 0;
    }
  }, [showRacaModal, showPelagemModal, showPorteModal]);

  // Pre-select client if passed via state
  useEffect(() => {
    if (location.state && location.state.clienteId) {
      setFormData(prev => ({ ...prev, clienteId: Number(location.state.clienteId) }));
      setView('form');
    }
  }, [location.state]);

  // Carregar pets da API
  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await fetch('/api/pets');
        if (response.ok) {
          const data = await response.json();
          setPets(data);
        } else {
          console.error('Erro ao carregar pets:', response.statusText);
        }
      } catch (error) {
        console.error('Erro de conexão ao carregar pets:', error);
      }
    };
    loadPets();
  }, [setPets, location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId !== null) {
      // Update existing pet
      // TODO: Implement API update
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === editingId
            ? { ...pet, ...formData, clienteId: Number(formData.clienteId) } as Pet
            : pet
        )
      );
      handleCancel();
    } else {
      // Create new pet
      try {
        const response = await fetch('/api/pets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cliente_id: Number(formData.clienteId),
            nome: formData.nome,
            especie: formData.especie,
            raca: formData.raca,
            data_nascimento: formData.dataNascimento, // enviar em formato 'YYYY-MM-DD'
            observacoes: formData.observacao,
          }),
        });

        const data = await response.json();
        console.log('RESPOSTA_API_PETS', response.status, data);

        if (!response.ok) {
          alert(`Erro ao salvar pet: ${data.error || response.statusText}`);
          return;
        }

        // Normalizar o retorno da API (snake_case) para o formato da interface Pet (camelCase)
        const novoPet: Pet = {
          id: data.id,
          nome: data.nome,
          clienteId: Number(data.cliente_id || formData.clienteId),
          especie: formData.especie || '',
          raca: formData.raca || '',
          genero: formData.genero || '',
          porte: formData.porte || '',
          pelagem: formData.pelagem || '',
          dataNascimento: formData.dataNascimento || '',
          idade: formData.idade || '',
          chip: formData.chip || '',
          pedigreeRg: formData.pedigreeRg || '',
          alimentacao: formData.alimentacao || '',
          tags: formData.tags || '',
          alergias: formData.alergias || '',
          observacao: formData.observacao || '',
          dataCadastro: new Date().toISOString(), // campo obrigatório
        };

        setPets((prev) => [novoPet, ...prev]);
        handleCancel();
      } catch (error) {
        console.error('Erro ao salvar pet:', error);
        alert('Erro de conexão ao salvar pet.');
      }
    }
  };

  const handleEdit = (pet: Pet) => {
    setFormData(pet);
    setEditingId(pet.id);
    setView('form');
  };

  const handleDelete = (id: number) => {
    setPets((prev) => prev.filter((pet) => pet.id !== id));
  };

  const handleCancel = () => {
    setFormData({
      nome: '',
      clienteId: undefined,
      especie: '',
      raca: '',
      genero: '',
      porte: '',
      pelagem: '',
      dataNascimento: '',
      idade: '',
      chip: '',
      pedigreeRg: '',
      alimentacao: '',
      tags: '',
      alergias: '',
      observacao: ''
    });
    setEditingId(null);
    setView('list');
  };

  const getClienteNome = (id: number) => {
    const cliente = clientes.find(c => c.id === id);
    return cliente ? cliente.nome : 'Desconhecido';
  };

  // --- AUXILIARY MODAL HANDLERS ---
  const handleAddAuxiliary = (type: 'raca' | 'pelagem' | 'porte') => {
    if (!newItemValue.trim()) return;
    
    if (type === 'raca') {
      setRacas(prev => [...prev, newItemValue].sort());
      setFormData(prev => ({ ...prev, raca: newItemValue }));
      setShowRacaModal(false);
    } else if (type === 'pelagem') {
      setPelagens(prev => [...prev, newItemValue].sort());
      setFormData(prev => ({ ...prev, pelagem: newItemValue }));
      setShowPelagemModal(false);
    } else if (type === 'porte') {
      setPortes(prev => [...prev, newItemValue].sort());
      setFormData(prev => ({ ...prev, porte: newItemValue }));
      setShowPorteModal(false);
    }
    setNewItemValue('');
  };

  // --- FILTERING ---
  const filteredPets = pets.filter(pet => {
    const searchLower = searchTerm.toLowerCase();
    const clienteNome = getClienteNome(pet.clienteId).toLowerCase();
    
    return (
      pet.nome.toLowerCase().includes(searchLower) ||
      (pet.chip && pet.chip.toLowerCase().includes(searchLower)) ||
      String(pet.id).includes(searchLower) ||
      clienteNome.includes(searchLower)
    );
  });

  // --- RENDER ---

  if (view === 'list') {
    return (
      <div className="p-6">
        {/* A1. Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Módulo de Pets</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed opacity-50">
              Exportar
            </button>
            <button 
              onClick={() => setView('form')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Adicionar Pet
            </button>
          </div>
        </div>

        {/* A2. Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Você pode pesquisar pelo nome do pet, microchip, código ou nome do cliente"
              className="flex-1 border border-gray-300 rounded-md p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Mais filtros
            </button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Pesquisar
            </button>
          </div>
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
              Filtros avançados (placeholder)
            </div>
          )}
        </div>

        {/* A3. Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPets.map((pet) => (
                <tr key={pet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pet.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pet.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClienteNome(pet.clienteId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Sim
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(pet)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                    <button onClick={() => handleDelete(pet.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                  </td>
                </tr>
              ))}
              {filteredPets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Nenhum pet encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editingId ? 'Editar Pet' : 'Cadastro de Pet'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select name="clienteId" value={formData.clienteId || ''} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Digite para pesquisar clientes</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
              {!formData.clienteId && <p className="text-xs text-red-500 mt-1">* Selecione um cliente</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
              <div className="flex gap-2">
                <input 
                  list="racas-list" 
                  name="raca" 
                  value={formData.raca} 
                  onChange={handleInputChange} 
                  placeholder="Digite para pesquisar" 
                  className="w-full border border-gray-300 rounded-md p-2" 
                />
                <datalist id="racas-list">
                  {racas.map(r => <option key={r} value={r} />)}
                </datalist>
                <button 
                  type="button" 
                  onClick={() => { setNewItemValue(''); setShowRacaModal(true); }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select name="genero" value={formData.genero} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="">Selecione</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
              <div className="flex gap-2">
                <select name="porte" value={formData.porte} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione</option>
                  {portes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={() => { setNewItemValue(''); setShowPorteModal(true); }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pelagem</label>
              <div className="flex gap-2">
                <select name="pelagem" value={formData.pelagem} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione</option>
                  {pelagens.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={() => { setNewItemValue(''); setShowPelagemModal(true); }}
                  className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
              <input type="text" name="idade" value={formData.idade} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chip</label>
              <input type="text" name="chip" value={formData.chip} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pedigree RG</label>
              <input type="text" name="pedigreeRg" value={formData.pedigreeRg} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alimentação</label>
              <input type="text" name="alimentacao" value={formData.alimentacao} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Separe por vírgula" className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
              <input type="text" name="alergias" value={formData.alergias} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>

            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <textarea name="observacao" value={formData.observacao} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md p-2" rows={3} />
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium"
          >
            Salvar
          </button>
        </div>
      </form>

      {/* MODALS */}
      {(showRacaModal || showPelagemModal || showPorteModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={auxModalRef} className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">
              {showRacaModal ? 'Nova Raça' : showPelagemModal ? 'Nova Pelagem' : 'Novo Porte'}
            </h3>
            <input 
              type="text" 
              value={newItemValue} 
              onChange={(e) => setNewItemValue(e.target.value)}
              placeholder="Nome"
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => { setShowRacaModal(false); setShowPelagemModal(false); setShowPorteModal(false); }}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleAddAuxiliary(showRacaModal ? 'raca' : showPelagemModal ? 'pelagem' : 'porte')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
