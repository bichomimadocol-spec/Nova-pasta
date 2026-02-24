import React, { useState, useRef, useEffect } from 'react';
import styles from './companyUserMenu.module.css';

interface CompanyUserMenuProps {
  companyName?: string;
  companySubtitle?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}

export default function CompanyUserMenu({
  companyName = 'Bicho Mimado Pet Shop',
  companySubtitle = 'Administração',
  userName = 'Usuário',
  userRole = 'USER',
  onLogout
}: CompanyUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={styles.container}>
      {/* Company Identity */}
      <div className={styles.companyInfo}>
        <div className={styles.companyLogo}>
          {getInitials(companyName)}
        </div>
        <div className={styles.companyDetails}>
          <span className={styles.companyName}>{companyName}</span>
          <span className={styles.companySubtitle}>{companySubtitle}</span>
        </div>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          ref={triggerRef}
          className={styles.userTrigger}
          onClick={toggleMenu}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Menu do usuário"
        >
          <div className={styles.userDetails}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole}</span>
          </div>
          <div className={styles.userAvatar}>
            {getInitials(userName)}
          </div>
        </button>

        {isOpen && (
          <div 
            ref={menuRef}
            className={styles.dropdown}
            role="menu"
            aria-orientation="vertical"
          >
            <button 
              className={styles.menuItem} 
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Meu Perfil
            </button>
            <button 
              className={styles.menuItem} 
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              Configurações
            </button>
            <button 
              className={`${styles.menuItem} ${styles.danger}`} 
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
            >
              Sair do Sistema
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
