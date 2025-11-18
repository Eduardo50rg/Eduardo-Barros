import React from 'react';
import { ShieldExclamationIcon } from './icons';

interface AlertToastProps {
  message: string;
}

const AlertToast: React.FC<AlertToastProps> = ({ message }) => {
  return (
    <div 
        className="z-[3000] bg-yellow-500 text-black px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down w-full"
        role="alert"
    >
      <ShieldExclamationIcon className="h-6 w-6 mr-3" />
      <p className="font-semibold">{message}</p>
    </div>
  );
};

export default AlertToast;
