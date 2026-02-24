import React from 'react';
import { Usuario } from '../../App';
import CompanyUserMenu from '../CompanyUserMenu/CompanyUserMenu';

interface UserInfoProps {
  usuarioLogado: Usuario | null;
  setUsuarioLogado: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function UserInfo({ usuarioLogado, setUsuarioLogado }: UserInfoProps) {
  if (!usuarioLogado) return null;

  const handleLogout = () => {
    setUsuarioLogado(null);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-md border border-gray-100 p-2">
      <CompanyUserMenu 
        companyName="Bicho Mimado Pet Shop"
        companySubtitle="Administração"
        userName={usuarioLogado.nome}
        userRole={usuarioLogado.perfil}
        onLogout={handleLogout}
      />
    </div>
  );
}
