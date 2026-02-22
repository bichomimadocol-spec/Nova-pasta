import React, { useState } from 'react';

interface SidebarGroupProps {
  titulo: string;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

export default function SidebarGroup({ titulo, children, isCollapsed }: SidebarGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  // If children is empty or null, don't render the group
  if (!children) return null;

  if (isCollapsed) {
    return (
      <div className="mb-2 w-full border-t border-gray-800 pt-2">
        <div className="space-y-1 flex flex-col items-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors rounded-md"
      >
        <span className="font-semibold text-sm uppercase tracking-wider">{titulo}</span>
        <span className="text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}
