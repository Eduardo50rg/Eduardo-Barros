import React, { useState } from 'react';
import { PhoneIcon } from './icons';
import type { SystemConfig } from '../types';
import EmergencyContactsModal from './EmergencyContactsModal';

const NupdecLogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="headerHandsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4b5563' }} /> {/* gray-600 */}
        <stop offset="100%" style={{ stopColor: '#374151' }} /> {/* gray-700 */}
      </linearGradient>
      <filter id="headerLogoShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5"/>
      </filter>
    </defs>
    <g filter="url(#headerLogoShadow)">
      {/* Heart */}
      <path d="M50 25 C 40 15, 25 25, 25 40 C 25 55, 50 75, 50 75 S 75 55, 75 40 C 75 25, 60 15, 50 25 Z" fill="#0891B2" />
      {/* Hands */}
      <path d="M20 90 C 25 70, 35 60, 50 60 C 65 60, 75 70, 80 90 L 70 95 C 65 80, 60 75, 50 75 C 40 75, 35 80, 30 95 Z" fill="url(#headerHandsGrad)" />
    </g>
  </svg>
);


interface HeaderProps {
  isUserLoggedIn: boolean;
  systemConfig: SystemConfig;
}

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'verde': return { text: 'Sistema Operando Normalmente', color: 'bg-green-600' };
        case 'amarelo': return { text: 'Sistema em Atenção', color: 'bg-yellow-500 animate-pulse' };
        case 'vermelho': return { text: 'Alerta Ativado', color: 'bg-red-600 animate-pulse-strong' };
        case 'roxo': return { text: 'Alerta Máximo', color: 'bg-purple-600 animate-pulse-strong' };
        default: return { text: 'Status Desconhecido', color: 'bg-gray-600' };
    }
};

export const Header: React.FC<HeaderProps> = ({ isUserLoggedIn, systemConfig }) => {
  const [showContacts, setShowContacts] = useState(false);
  const statusInfo = getStatusInfo(systemConfig.status);

  return (
    <>
      {showContacts && <EmergencyContactsModal contacts={systemConfig.contacts} onClose={() => setShowContacts(false)} />}
      <header className="bg-gray-800/80 backdrop-blur-md shadow-md p-2 flex justify-between items-center z-[1500] border-b border-gray-700 sticky top-0">
        <div className="flex items-center">
          <NupdecLogoIcon className="h-8 mr-3" />
          <h1 className="text-sm font-bold text-gray-200 hidden md:block">Sistema de Comando e Controle</h1>
        </div>
        <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusInfo.color}`}>
                {statusInfo.text}
            </div>
            <button 
                onClick={() => setShowContacts(true)}
                className="p-2 rounded-full bg-gray-700 hover:bg-red-600 text-white transition-colors"
                title="Contatos de Emergência"
            >
                <PhoneIcon className="h-5 w-5" />
            </button>
        </div>
      </header>
    </>
  );
};