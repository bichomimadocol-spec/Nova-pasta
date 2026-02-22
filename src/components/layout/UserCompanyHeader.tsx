import React, { useEffect, useState, useRef } from 'react';
import { Usuario, Empresa } from '../../App';
import { LogOut, ChevronDown, Building2, User } from 'lucide-react';

interface UserCompanyHeaderProps {
  user: Usuario | null;
  empresa: Empresa | null;
  onLogout: () => void;
}

export default function UserCompanyHeader({ user, empresa, onLogout }: UserCompanyHeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  if (!user) return null;

  // Dados de exibição
  const empresaNome = empresa?.nomeFantasia || empresa?.razaoSocial || 'Minha Empresa';
  const empresaLogo = empresa?.logoUrl;
  const userCargo = user.perfil || 'Usuário';
  const userNome = user.nome || 'Usuário';
  
  // Cor de fundo para avatar (hash simples do nome)
  const getAvatarColor = (name: string) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarColor = getAvatarColor(empresaNome);
  const firstLetter = empresaNome.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      {/* DESKTOP CARD */}
      <div className="hidden md:flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-w-[280px] transition-all hover:shadow-md">
        <div className="flex items-center justify-between p-4 gap-3">
          <div className="flex flex-col flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate" title={empresaNome}>
              {empresaNome}
            </h3>
            <p className="text-xs font-medium text-gray-500 truncate flex items-center gap-1">
              <User size={10} />
              {userCargo}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {empresaLogo ? (
              <img 
                src={empresaLogo} 
                alt={empresaNome}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner"
                style={{ backgroundColor: avatarColor }}
              >
                {firstLetter}
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gray-100 w-full"></div>

        <button 
          onClick={onLogout}
          className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2 group"
        >
          <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          Sair do Sistema
        </button>
      </div>

      {/* MOBILE TRIGGER */}
      <button 
        className="md:hidden flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 bg-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
          style={{ backgroundColor: avatarColor }}
        >
          {empresaLogo ? (
            <img src={empresaLogo} alt={empresaNome} className="w-full h-full rounded-full object-cover" />
          ) : (
            firstLetter
          )}
        </div>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* MOBILE DROPDOWN */}
      {isMobileOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {empresaLogo ? (
                  <img src={empresaLogo} alt={empresaNome} className="w-full h-full rounded-full object-cover" />
                ) : (
                  firstLetter
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">{empresaNome}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 size={12} />
                  ID: {empresa?.id || '---'}
                </p>
              </div>
            </div>
            <div className="bg-white p-2 rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-800">{userNome}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-full">
                {userCargo}
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>
      )}
    </div>
  );
}
