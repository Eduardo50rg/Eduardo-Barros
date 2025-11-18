import React from 'react';
import { MegaphoneIcon } from './icons';

interface ActivationNotificationProps {
  message: string;
  isActive: boolean;
}

const ActivationNotification: React.FC<ActivationNotificationProps> = ({ message, isActive }) => {
  if (!isActive) {
    return null;
  }

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[1100] bg-blue-600/95 text-white p-3 shadow-lg flex items-center justify-center animate-fade-in-down"
      role="alert"
    >
      <MegaphoneIcon className="h-6 w-6 mr-3 flex-shrink-0" />
      <p className="font-semibold text-sm md:text-base text-center">{message}</p>
    </div>
  );
};

export default ActivationNotification;
