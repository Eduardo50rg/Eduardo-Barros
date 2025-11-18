
import React from 'react';
import { CheckCircleIcon } from './icons';

interface SuccessToastProps {
  message: string;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message }) => {
  return (
    <div 
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[3000] bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down"
        role="alert"
    >
      <CheckCircleIcon className="h-6 w-6 mr-3" />
      <p className="font-semibold">{message}</p>
    </div>
  );
};

export default SuccessToast;
