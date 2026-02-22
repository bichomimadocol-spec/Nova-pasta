import React from 'react';
import { Navigate } from 'react-router-dom';
import { Usuario } from '../../App';

interface ProtectedRouteProps {
  usuarioLogado: Usuario | null;
  children: React.ReactElement;
}

export default function ProtectedRoute({ usuarioLogado, children }: ProtectedRouteProps) {
  if (!usuarioLogado) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
