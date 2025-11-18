import React from 'react';
import type { EmergencyContacts } from '../types';
import { PhoneIcon, XMarkIcon, WhatsAppIcon } from './icons';

interface EmergencyContactsModalProps {
  contacts: EmergencyContacts;
  onClose: () => void;
}

const ContactButton: React.FC<{ label: string, number: string, isWhatsApp?: boolean }> = ({ label, number, isWhatsApp }) => {
    const link = isWhatsApp ? `https://wa.me/${number.replace(/\D/g, '')}` : `tel:${number.replace(/\D/g, '')}`;
    return (
        <a 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-green-600/80 rounded-lg transition-colors duration-200 border border-gray-600"
        >
            <div>
                <p className="font-bold text-white">{label}</p>
                <p className="text-sm text-gray-300 font-mono">{number}</p>
            </div>
            {isWhatsApp ? <WhatsAppIcon className="h-6 w-6 text-green-400" /> : <PhoneIcon className="h-6 w-6 text-green-400" />}
        </a>
    );
}

const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({ contacts, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/70 z-[5000] flex items-center justify-center p-4" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm border border-gray-700 animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Discagem Rápida</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 text-gray-400" aria-label="Fechar">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
        <div className="p-6 space-y-3">
            <ContactButton label="SAMU (Telefone)" number={contacts.samu} />
            {contacts.samuWhatsapp && <ContactButton label="SAMU (WhatsApp)" number={contacts.samuWhatsapp} isWhatsApp />}
            <ContactButton label="Bombeiros (Telefone)" number={contacts.bombeiros} />
            {contacts.bombeirosWhatsapp && <ContactButton label="Bombeiros (WhatsApp)" number={contacts.bombeirosWhatsapp} isWhatsApp />}
            <ContactButton label="Defesa Civil (Telefone)" number={contacts.defesaCivil} />
            {contacts.defesaCivilWhatsapp && <ContactButton label="Defesa Civil (WhatsApp)" number={contacts.defesaCivilWhatsapp} isWhatsApp />}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsModal;