import React, { useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from './icons';

interface InfoToastProps {
  message: string;
  onDismiss: () => void;
}

const InfoToast: React.FC<InfoToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
        className="bg-blue-600/95 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down mb-2"
        role="status"
    >
      <PaperAirplaneIcon className="h-5 w-5 mr-3 flex-shrink-0" />
      <p className="font-semibold text-sm flex-grow">{message}</p>
      <button onClick={() => onDismiss()} className="ml-4 p-1 rounded-full hover:bg-black/20" aria-label="Fechar">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default InfoToast;