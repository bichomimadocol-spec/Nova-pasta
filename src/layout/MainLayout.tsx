import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UserInfo from '../components/layout/UserInfo';
import { Usuario } from '../App';

interface MainLayoutProps {
  usuarioLogado: Usuario | null;
  setUsuarioLogado: React.Dispatch<React.SetStateAction<Usuario | null>>;
  temPermissao: (modulo: string) => boolean;
}

export default function MainLayout({ usuarioLogado, setUsuarioLogado, temPermissao }: MainLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        temPermissao={temPermissao} 
        isCollapsed={isCollapsed} 
        toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
      />
      <UserInfo usuarioLogado={usuarioLogado} setUsuarioLogado={setUsuarioLogado} />
      <main className={`flex-1 p-8 bg-white transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
