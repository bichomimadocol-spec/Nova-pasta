import React, { useState } from 'react';
import { Empresa, Usuario, Perfil, Profissional, CentroResultado, CategoriaFinanceira, Produto } from '../App';

// Sub-pages
import EmpresaPage from './configuracoes/Empresa';
import UsuariosPage from './configuracoes/Usuarios';
import PermissoesPage from './configuracoes/Permissoes';
import ProfissionaisPage from './configuracoes/Profissionais';
import CentroResultadosPage from './configuracoes/CentroResultados';
import CategoriaFinanceiraPage from './configuracoes/CategoriaFinanceira';
import ServicosPage from './configuracoes/Servicos';

interface ConfiguracoesProps {
  empresa: Empresa | null;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa | null>>;
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  perfis: Perfil[];
  setPerfis: React.Dispatch<React.SetStateAction<Perfil[]>>;
  profissionais: Profissional[];
  setProfissionais: React.Dispatch<React.SetStateAction<Profissional[]>>;
  centrosResultados: CentroResultado[];
  setCentrosResultados: React.Dispatch<React.SetStateAction<CentroResultado[]>>;
  categoriasFinanceiras: CategoriaFinanceira[];
  setCategoriasFinanceiras: React.Dispatch<React.SetStateAction<CategoriaFinanceira[]>>;
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

export default function Configuracoes({
  empresa, setEmpresa,
  usuarios, setUsuarios,
  perfis, setPerfis,
  profissionais, setProfissionais,
  centrosResultados, setCentrosResultados,
  categoriasFinanceiras, setCategoriasFinanceiras,
  produtos, setProdutos
}: ConfiguracoesProps) {
  const [activeTab, setActiveTab] = useState<'EMPRESA' | 'USUARIOS' | 'PERMISSOES' | 'PROFISSIONAIS' | 'CENTRO_RESULTADOS' | 'CATEGORIA_FINANCEIRA' | 'SERVICOS'>('EMPRESA');

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-6 shadow-sm overflow-x-auto">
        <h1 className="text-2xl font-bold text-gray-800 mr-4">Configurações</h1>
        <button onClick={() => setActiveTab('EMPRESA')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'EMPRESA' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Empresa</button>
        <button onClick={() => setActiveTab('USUARIOS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'USUARIOS' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Usuários</button>
        <button onClick={() => setActiveTab('PERMISSOES')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'PERMISSOES' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Permissões</button>
        <button onClick={() => setActiveTab('PROFISSIONAIS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'PROFISSIONAIS' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Profissionais</button>
        <button onClick={() => setActiveTab('CENTRO_RESULTADOS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'CENTRO_RESULTADOS' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Centro de Resultados</button>
        <button onClick={() => setActiveTab('CATEGORIA_FINANCEIRA')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'CATEGORIA_FINANCEIRA' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Categoria Financeira</button>
        <button onClick={() => setActiveTab('SERVICOS')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeTab === 'SERVICOS' ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}>Serviços</button>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {activeTab === 'EMPRESA' && <EmpresaPage empresa={empresa} setEmpresa={setEmpresa} />}
        {activeTab === 'USUARIOS' && <UsuariosPage usuarios={usuarios} setUsuarios={setUsuarios} perfis={perfis} />}
        {activeTab === 'PERMISSOES' && <PermissoesPage perfis={perfis} setPerfis={setPerfis} />}
        {activeTab === 'PROFISSIONAIS' && <ProfissionaisPage profissionais={profissionais} setProfissionais={setProfissionais} />}
        {activeTab === 'CENTRO_RESULTADOS' && <CentroResultadosPage centros={centrosResultados} setCentros={setCentrosResultados} />}
        {activeTab === 'CATEGORIA_FINANCEIRA' && <CategoriaFinanceiraPage categorias={categoriasFinanceiras} setCategorias={setCategoriasFinanceiras} />}
        {activeTab === 'SERVICOS' && <ServicosPage produtos={produtos} setProdutos={setProdutos} />}
      </div>
    </div>
  );
}
