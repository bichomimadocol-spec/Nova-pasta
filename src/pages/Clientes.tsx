import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cliente, Pet } from '../App';
import { syncClientesToDB } from '../lib/dbSync';

interface ClientesProps {
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
}

export default function Clientes({ clientes, setClientes, pets, setPets }: ClientesProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipoPessoa: 'FISICA',
    nome: '',
    cpf: '',
    rg: '',
    contribuinteICMS: false,
    consumidorFinal: true,
    dataNascimento: '',
    sexo: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    proximidade: '',
    telefone: '',
    tags: '',
    email: '',
    comoNosConheceu: '',
    limiteCredito: 0,
    perfilDesconto: '',
    grupoCliente: '',
    observacao: '',
    // PJ Fields
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    ramoAtividade: '',
    responsavelNome: '',
    responsavelCpf: '',
    responsavelEmail: '',
    responsavelTelefone: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- PETS MODAL STATE ---
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);
  const [petFormData, setPetFormData] = useState<Partial<Pet>>({
    nome: '',
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

  // Auxiliary Lists for Pets
  const [racas, setRacas] = useState<string[]>(['Vira-lata', 'Poodle', 'Bulldog', 'Labrador', 'Golden Retriever', 'Shih Tzu', 'Yorkshire', 'Persa', 'Siamês']);
  const [pelagens, setPelagens] = useState<string[]>(['Curta', 'Longa', 'Média', 'Dura', 'Lisa', 'Ondulada']);
  const [portes, setPortes] = useState<string[]>(['Pequeno', 'Médio', 'Grande', 'Gigante']);

  // Auxiliary Modals for Pets
  const [showRacaModal, setShowRacaModal] = useState(false);
  const [showPelagemModal, setShowPelagemModal] = useState(false);
  const [showPorteModal, setShowPorteModal] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');

  // --- SCROLL REFS ---
  const petModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'form') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  useEffect(() => {
    if (showPetModal && petModalRef.current) {
      petModalRef.current.scrollTop = 0;
    }
  }, [showPetModal]);

  // --- HANDLERS ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCepBlur = async () => {
    const cep = formData.cep?.replace(/\D/g, '') || '';
    if (cep.length === 8) {
      setCepLoading(true);
      setCepError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (data.erro) {
          setCepError('CEP não encontrado');
        } else {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }));
        }
      } catch (error) {
        setCepError('Erro ao buscar CEP');
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (formData.tipoPessoa === 'JURIDICA') {
      if (!formData.cnpj) {
        newErrors.cnpj = 'CNPJ é obrigatório.';
        isValid = false;
      } else if (formData.cnpj.replace(/\D/g, '').length !== 14) {
        newErrors.cnpj = 'CNPJ inválido.';
        isValid = false;
      }
      if (!formData.razaoSocial || formData.razaoSocial.length < 3) {
        newErrors.razaoSocial = 'Razão Social é obrigatória (min 3 caracteres).';
        isValid = false;
      }
      if (!formData.responsavelNome || formData.responsavelNome.length < 3) {
        newErrors.responsavelNome = 'Nome do responsável é obrigatório (min 3 caracteres).';
        isValid = false;
      }
      if (!formData.responsavelCpf || formData.responsavelCpf.replace(/\D/g, '').length !== 11) {
        newErrors.responsavelCpf = 'CPF do responsável inválido.';
        isValid = false;
      }
    } else {
      if (!formData.nome || formData.nome.length < 3) {
        newErrors.nome = 'Nome é obrigatório (min 3 caracteres).';
        isValid = false;
      }
      if (formData.cpf) {
        const cleanCpf = formData.cpf.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
             newErrors.cpf = 'CPF inválido.';
             isValid = false;
        }
      }
    }

    if (!formData.telefone && !formData.responsavelTelefone) {
        const field = formData.tipoPessoa === 'JURIDICA' ? 'responsavelTelefone' : 'telefone';
        newErrors[field] = 'Informe um telefone para contato.';
        isValid = false;
    }

    const emailToCheck = formData.tipoPessoa === 'JURIDICA' ? formData.responsavelEmail : formData.email;
    if (emailToCheck) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToCheck)) {
            const field = formData.tipoPessoa === 'JURIDICA' ? 'responsavelEmail' : 'email';
            newErrors[field] = 'E-mail inválido.';
            isValid = false;
        }
    }

    setErrors(newErrors);
    if (!isValid) return;

    if (editingId !== null) {
      // Update existing client
      // TODO: Implement API update
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === editingId
            ? { ...cliente, ...formData } as Cliente
            : cliente
        )
      );
      handleCancel();
    } else {
      // Create new client
      try {
        const newCliente = await syncClientesToDB(formData);
        setClientes((prev) => [newCliente, ...prev]); // Add to top of list
        handleCancel();
      } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        alert('Erro de conexão ao salvar cliente.');
      }
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setView('form');
  };

  const handleDelete = (id: number) => {
    // Inline confirmation (simple check, though user said "Sem alert/prompt/confirm", usually means native ones. 
    // I will just delete for now as per "Excluir: remover do array contratos (sem modal; pode usar confirmação inline)" pattern from previous step, 
    // but for clients usually a confirmation is good. Since "Sem alert/prompt/confirm" is strict, I'll delete directly or use a custom UI state if needed.
    // Given the strictness, I'll delete directly.)
    setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
  };

  const handleCancel = () => {
    setFormData({
      tipoPessoa: 'FISICA',
      nome: '',
      cpf: '',
      rg: '',
      contribuinteICMS: false,
      consumidorFinal: true,
      dataNascimento: '',
      sexo: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      proximidade: '',
      telefone: '',
      tags: '',
      email: '',
      comoNosConheceu: '',
      limiteCredito: 0,
      perfilDesconto: '',
      grupoCliente: '',
      observacao: '',
      // PJ Fields
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      ramoAtividade: '',
      responsavelNome: '',
      responsavelCpf: '',
      responsavelEmail: '',
      responsavelTelefone: ''
    });
    setEditingId(null);
    setView('list');
    setCepError('');
    setErrors({});
  };

  const handleAddPet = () => {
    if (editingId) {
      setPetFormData({
        nome: '',
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
      setEditingPetId(null);
      setShowPetModal(true);
    }
  };

  const handleEditPet = (pet: Pet) => {
    setPetFormData(pet);
    setEditingPetId(pet.id);
    setShowPetModal(true);
  };

  const handleDeletePet = (id: number) => {
    setPets((prev) => prev.filter((pet) => pet.id !== id));
  };

  const handlePetInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPetFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    if (editingPetId !== null) {
      // Update existing pet
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === editingPetId
            ? { ...pet, ...petFormData, clienteId: editingId } as Pet
            : pet
        )
      );
    } else {
      // Create new pet
      const newPet: Pet = {
        id: Date.now(),
        dataCadastro: new Date().toLocaleDateString(),
        nome: petFormData.nome || '',
        especie: petFormData.especie || '',
        raca: petFormData.raca || '',
        porte: petFormData.porte || '',
        pelagem: petFormData.pelagem || '',
        clienteId: editingId,
        ...petFormData
      } as Pet;
      setPets((prev) => [...prev, newPet]);
    }
    setShowPetModal(false);
  };

  const handleAddAuxiliary = (type: 'raca' | 'pelagem' | 'porte') => {
    if (!newItemValue.trim()) return;
    
    if (type === 'raca') {
      setRacas(prev => [...prev, newItemValue].sort());
      setPetFormData(prev => ({ ...prev, raca: newItemValue }));
      setShowRacaModal(false);
    } else if (type === 'pelagem') {
      setPelagens(prev => [...prev, newItemValue].sort());
      setPetFormData(prev => ({ ...prev, pelagem: newItemValue }));
      setShowPelagemModal(false);
    } else if (type === 'porte') {
      setPortes(prev => [...prev, newItemValue].sort());
      setPetFormData(prev => ({ ...prev, porte: newItemValue }));
      setShowPorteModal(false);
    }
    setNewItemValue('');
  };

  // --- FILTERING ---
  const filteredClientes = clientes.filter(cliente => {
    const searchLower = searchTerm.toLowerCase();
    const petNames = pets.filter(p => p.clienteId === cliente.id).map(p => p.nome.toLowerCase()).join(' ');
    
    return (
      cliente.nome.toLowerCase().includes(searchLower) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.cpf.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      petNames.includes(searchLower)
    );
  });

  // --- RENDER ---

  if (view === 'list') {
    return (
      <div className="p-6">
        {/* A1. Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Módulo de Clientes</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md cursor-not-allowed opacity-50">
              Exportar
            </button>
            <button 
              onClick={() => setView('form')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Adicionar Cliente
            </button>
          </div>
        </div>

        {/* A2. Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Pesquise pelo nome, telefone, cpf ou cnpj do cliente; nome ou microchip do pet"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClientes.map((cliente) => {
                const clientPets = pets.filter(p => p.clienteId === cliente.id);
                return (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clientPets.length > 0 
                        ? `${clientPets.length} (${clientPets.map(p => p.nome).slice(0, 2).join(', ')}${clientPets.length > 2 ? '...' : ''})`
                        : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Sim
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(cliente)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                      <button onClick={() => handleDelete(cliente.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                    </td>
                  </tr>
                );
              })}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhum cliente encontrado.</td>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {editingId ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={handleAddPet}
            disabled={!editingId}
            className={`px-4 py-2 rounded-md font-medium ${
              editingId 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Adicionar Pet
          </button>
          {!editingId && <span className="text-xs text-red-500 self-center">Salve o cliente antes de adicionar um pet.</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TIPO DE PESSOA */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="mb-6 border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">TIPO DE PESSOA:*</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipoPessoa"
                  value="FISICA"
                  checked={formData.tipoPessoa === 'FISICA'}
                  onChange={handleInputChange}
                  className="form-radio text-indigo-600 h-4 w-4"
                />
                <span className="ml-2 font-medium">Pessoa Física (CPF)</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="tipoPessoa"
                  value="JURIDICA"
                  checked={formData.tipoPessoa === 'JURIDICA'}
                  onChange={handleInputChange}
                  className="form-radio text-indigo-600 h-4 w-4"
                />
                <span className="ml-2 font-medium">Pessoa Jurídica (CNPJ)</span>
              </label>
            </div>
          </div>

          {/* CAMPOS CONDICIONAIS */}
          {formData.tipoPessoa === 'FISICA' ? (
            // PESSOA FÍSICA
            <div className="space-y-4">
              {/* LINHA 1: CPF, Nome */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF:*</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo:*</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                </div>
              </div>

              {/* LINHA 2: Email, Telefone, Tags (placeholder for Celular) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone:*</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.telefone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Tags:</label>
                   <input
                     type="text"
                     name="tags"
                     value={formData.tags}
                     onChange={handleInputChange}
                     className="w-full border border-gray-300 rounded-md p-2"
                     placeholder="Separe por vírgula"
                   />
                </div>
              </div>

              {/* LINHA 3: Data Nascimento, Gênero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Nascimento:</label>
                  <input
                    type="date"
                    name="dataNascimento"
                    value={formData.dataNascimento}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gênero:</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            // PESSOA JURÍDICA
            <div className="space-y-4">
              {/* LINHA 1: CNPJ, Razão Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ:*</label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.cnpj ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && <p className="text-xs text-red-500 mt-1">{errors.cnpj}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social:*</label>
                  <input
                    type="text"
                    name="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={handleInputChange}
                    className={`w-full border rounded-md p-2 ${errors.razaoSocial ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.razaoSocial && <p className="text-xs text-red-500 mt-1">{errors.razaoSocial}</p>}
                </div>
              </div>

              {/* LINHA 2: Nome Fantasia, IE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia:</label>
                  <input
                    type="text"
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Estadual (IE):</label>
                  <input
                    type="text"
                    name="inscricaoEstadual"
                    value={formData.inscricaoEstadual}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              {/* LINHA 3: Ramo de Atividade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ramo de Atividade:</label>
                <input
                  type="text"
                  name="ramoAtividade"
                  value={formData.ramoAtividade}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div className="border-t border-gray-200 my-4 pt-4">
                <h3 className="text-md font-semibold text-gray-700 mb-4">👤 CONTATO RESPONSÁVEL:</h3>
                
                {/* LINHA 4: Nome Resp, CPF Resp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Responsável:*</label>
                    <input
                      type="text"
                      name="responsavelNome"
                      value={formData.responsavelNome}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md p-2 ${errors.responsavelNome ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.responsavelNome && <p className="text-xs text-red-500 mt-1">{errors.responsavelNome}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF Responsável:*</label>
                    <input
                      type="text"
                      name="responsavelCpf"
                      value={formData.responsavelCpf}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md p-2 ${errors.responsavelCpf ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="000.000.000-00"
                    />
                    {errors.responsavelCpf && <p className="text-xs text-red-500 mt-1">{errors.responsavelCpf}</p>}
                  </div>
                </div>

                {/* LINHA 5: Email Resp, Tel Resp, Tags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Respons.:*</label>
                    <input
                      type="email"
                      name="responsavelEmail"
                      value={formData.responsavelEmail}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md p-2 ${errors.responsavelEmail ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.responsavelEmail && <p className="text-xs text-red-500 mt-1">{errors.responsavelEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Res.:*</label>
                    <input
                      type="text"
                      name="responsavelTelefone"
                      value={formData.responsavelTelefone}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md p-2 ${errors.responsavelTelefone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.responsavelTelefone && <p className="text-xs text-red-500 mt-1">{errors.responsavelTelefone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags:</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder="Separe por vírgula"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS (Address, etc) */}
          {/* LINHA 4/6: Endereço (full width) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo:</label>
            <div className="relative">
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Rua, Número, Bairro..."
                />
            </div>
          </div>

          {/* LINHA 5/7: Cidade, Estado, CEP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade:</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <input
                type="text"
                name="uf"
                value={formData.uf}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP:</label>
              <div className="relative">
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  onBlur={handleCepBlur}
                  className={`w-full border rounded-md p-2 ${cepError ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="00000-000"
                />
                {cepLoading && <span className="absolute right-2 top-2 text-xs text-gray-500">...</span>}
              </div>
              {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
            </div>
          </div>

          {/* LINHA 6/8: Observações */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações:</label>
            <textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
            />
          </div>
        </div>

        {/* PETS SECTION (Only if editing) */}
        {editingId && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex justify-between items-center mb-4 border-b pb-2">
               <h2 className="text-lg font-semibold text-indigo-700">Pets do Cliente</h2>
               <button 
                 type="button"
                 onClick={handleAddPet}
                 className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
               >
                 + Adicionar Pet
               </button>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                     <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Espécie/Raça</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {pets.filter(p => p.clienteId === editingId).map(pet => (
                     <tr key={pet.id}>
                       <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{pet.nome}</td>
                       <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{pet.especie} - {pet.raca}</td>
                       <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                         <button type="button" onClick={() => handleEditPet(pet)} className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                         <button type="button" onClick={() => handleDeletePet(pet.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                       </td>
                     </tr>
                   ))}
                   {pets.filter(p => p.clienteId === editingId).length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-4 py-4 text-center text-gray-500 text-sm">Nenhum pet cadastrado para este cliente.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        )}

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
            Salvar Cliente
          </button>
        </div>
      </form>

      {/* PET MODAL */}
      {showPetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={petModalRef} className="bg-white p-6 rounded-lg shadow-xl w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editingPetId ? 'Editar Pet' : 'Novo Pet'}</h2>
              <button onClick={() => setShowPetModal(false)} className="text-gray-500 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" name="nome" value={petFormData.nome} onChange={handlePetInputChange} required className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espécie</label>
                  <select name="especie" value={petFormData.especie} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2">
                    <option value="">Selecione</option>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raça</label>
                  <div className="flex gap-2">
                    <input 
                      list="racas-list" 
                      name="raca" 
                      value={petFormData.raca} 
                      onChange={handlePetInputChange} 
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
                  <select name="genero" value={petFormData.genero} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2">
                    <option value="">Selecione</option>
                    <option value="Macho">Macho</option>
                    <option value="Fêmea">Fêmea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                  <div className="flex gap-2">
                    <select name="porte" value={petFormData.porte} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2">
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
                    <select name="pelagem" value={petFormData.pelagem} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2">
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
                  <input type="date" name="dataNascimento" value={petFormData.dataNascimento} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                  <input type="text" name="idade" value={petFormData.idade} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chip</label>
                  <input type="text" name="chip" value={petFormData.chip} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pedigree RG</label>
                  <input type="text" name="pedigreeRg" value={petFormData.pedigreeRg} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alimentação</label>
                  <input type="text" name="alimentacao" value={petFormData.alimentacao} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input type="text" name="tags" value={petFormData.tags} onChange={handlePetInputChange} placeholder="Separe por vírgula" className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alergias</label>
                  <input type="text" name="alergias" value={petFormData.alergias} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                  <textarea name="observacao" value={petFormData.observacao} onChange={handlePetInputChange} className="w-full border border-gray-300 rounded-md p-2" rows={3} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowPetModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium"
                >
                  Salvar Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUXILIARY MODALS */}
      {(showRacaModal || showPelagemModal || showPorteModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
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
