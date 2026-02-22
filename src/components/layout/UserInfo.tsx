import React from 'react';
import { Usuario } from '../../App';

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
    <div className="fixed top-4 right-4 flex items-center gap-4 bg-white p-2 rounded shadow-md z-50">
      <div className="flex flex-col text-right">
        <span className="font-bold text-sm">{usuarioLogado.nome}</span>
        <span className="text-xs text-gray-500">{usuarioLogado.perfil}</span>
      </div>
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  );
}
