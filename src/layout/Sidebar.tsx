import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarGroup from '../components/layout/SidebarGroup';
import { 
  LayoutDashboard, 
  Users, 
  Dog, 
  Package, 
  Calendar, 
  ShoppingCart, 
  FileText, 
  DollarSign, 
  ShoppingBag, 
  Megaphone, 
  Settings, 
  UserCog,
  ChevronLeft,
  Menu
} from 'lucide-react';

interface SidebarProps {
  temPermissao: (modulo: string) => boolean;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ temPermissao, isCollapsed, toggleSidebar }: SidebarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white';

  const LinkItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: React.ElementType }) => (
    <Link 
      to={to} 
      className={`flex items-center py-2 px-3 mb-1 rounded-md text-sm transition-colors ${isActive(to)} ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? label : ''}
    >
      <Icon size={20} className={isCollapsed ? '' : 'mr-3'} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col overflow-y-auto z-20 border-r border-gray-800 transition-all duration-300`}>
      {/* LOGO SECTION */}
      <div className="h-20 flex items-center justify-center border-b border-gray-800 relative shrink-0">
        <button 
          onClick={toggleSidebar}
          className={`text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800 ${isCollapsed ? '' : 'absolute left-4'}`}
        >
          {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>

        {!isCollapsed && (
          <div className="text-center">
             <div className="font-bold text-xl tracking-tight select-none">
               <span className="text-blue-600">Pet</span>
               <span className="text-gray-400">Nexis</span>
             </div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 w-full space-y-2 overflow-x-hidden">
        {/* PAINEL */}
        {(temPermissao('PAINEL') || true) && (
          <SidebarGroup titulo="Painel" isCollapsed={isCollapsed}>
            <LinkItem to="/painel" label="Dashboard" icon={LayoutDashboard} />
          </SidebarGroup>
        )}

        {/* CADASTROS */}
        {(temPermissao('CLIENTES') || temPermissao('PETS') || temPermissao('PRODUTOS')) && (
          <SidebarGroup titulo="Cadastros" isCollapsed={isCollapsed}>
            {temPermissao('CLIENTES') && <LinkItem to="/clientes" label="Clientes" icon={Users} />}
            {temPermissao('PETS') && <LinkItem to="/pets" label="Pets" icon={Dog} />}
            {temPermissao('PRODUTOS') && <LinkItem to="/produtos" label="Produtos" icon={Package} />}
          </SidebarGroup>
        )}

        {/* OPERACIONAL */}
        {(temPermissao('PDV') || temPermissao('ESTOQUE')) && (
          <SidebarGroup titulo="Operacional" isCollapsed={isCollapsed}>
            <LinkItem to="/agenda" label="Agenda" icon={Calendar} />
            {temPermissao('PDV') && <LinkItem to="/atendimento" label="PDV" icon={ShoppingCart} />}
            {temPermissao('PDV') && <LinkItem to="/atendimento#contratos" label="Contratos" icon={FileText} />}
            {temPermissao('ESTOQUE') && <LinkItem to="/estoque" label="Estoque" icon={Package} />}
          </SidebarGroup>
        )}

        {/* FINANCEIRO */}
        {(temPermissao('FINANCEIRO') || temPermissao('COMPRAS')) && (
          <SidebarGroup titulo="Financeiro" isCollapsed={isCollapsed}>
            {temPermissao('FINANCEIRO') && <LinkItem to="/caixa" label="Caixa" icon={DollarSign} />}
            {temPermissao('FINANCEIRO') && <LinkItem to="/financeiro" label="Visão Geral" icon={DollarSign} />}
            {temPermissao('COMPRAS') && <LinkItem to="/compras" label="Compras" icon={ShoppingBag} />}
          </SidebarGroup>
        )}

        {/* MARKETING */}
        {temPermissao('MARKETING') && (
          <SidebarGroup titulo="Marketing" isCollapsed={isCollapsed}>
            <LinkItem to="/marketing" label="Campanhas" icon={Megaphone} />
          </SidebarGroup>
        )}

        {/* ADMINISTRAÇÃO */}
        {(temPermissao('CONFIGURACOES') || temPermissao('USUARIOS')) && (
          <SidebarGroup titulo="Administração" isCollapsed={isCollapsed}>
            {temPermissao('USUARIOS') && <LinkItem to="/usuarios" label="Usuários" icon={UserCog} />}
            {temPermissao('CONFIGURACOES') && <LinkItem to="/configuracoes" label="Configurações" icon={Settings} />}
          </SidebarGroup>
        )}
      </nav>
    </aside>
  );
}
