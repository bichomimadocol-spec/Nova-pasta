import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { Usuario } from '../App';
import { Navigate } from 'react-router-dom';

interface LoginProps {
  usuarios: Usuario[];
  usuarioLogado: Usuario | null;
  setUsuarioLogado: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function Login({ usuarios, usuarioLogado, setUsuarioLogado }: LoginProps) {
  if (usuarioLogado) {
    return <Navigate to="/painel" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm usuarios={usuarios} setUsuarioLogado={setUsuarioLogado} />
    </div>
  );
}
