import React, { useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from './icons';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 7000); 

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div 
        className="bg-red-600/95 text-white px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down mb-2"
        role="alert"
    >
      <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
      <p className="font-semibold text-sm flex-grow">{message}</p>
      <button onClick={() => onDismiss()} className="ml-4 p-1 rounded-full hover:bg-black/20" aria-label="Fechar">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ErrorToast;