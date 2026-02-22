import React, { useState } from 'react';
import { Usuario } from '../../App';

interface LoginFormProps {
  usuarios: Usuario[];
  setUsuarioLogado: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function LoginForm({ usuarios, setUsuarioLogado }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    if (usuario) {
      setUsuarioLogado(usuario);
      setErro('');
    } else {
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Entrar
      </button>
    </form>
  );
}
