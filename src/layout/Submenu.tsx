import React from 'react';

export default function Submenu() {
  return (
    <aside className="w-64 bg-gray-100 h-screen fixed left-20 top-0 border-r border-gray-200 p-4 z-10">
      <h2 className="font-bold text-lg mb-4">Submenu</h2>
      <ul className="space-y-2">
        <li className="text-gray-600">Opção 1</li>
        <li className="text-gray-600">Opção 2</li>
        <li className="text-gray-600">Opção 3</li>
      </ul>
    </aside>
  );
}
