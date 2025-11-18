import React from 'react';
import { ClockIcon } from './icons';

interface HistoricalNotificationProps {
  range: { start: string, end: string };
}

const HistoricalNotification: React.FC<HistoricalNotificationProps> = ({ range }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!range || !range.start || !range.end) {
    return null;
  }

  return (
    <div
      className="absolute top-0 left-0 right-0 z-[1100] bg-yellow-600/95 text-white p-3 shadow-lg flex items-center justify-center animate-fade-in-down"
      role="alert"
    >
      <ClockIcon className="h-6 w-6 mr-3 flex-shrink-0" />
      <p className="font-semibold text-sm md:text-base text-center">
        Visualizando dados históricos de {formatDate(range.start)} até {formatDate(range.end)}
      </p>
    </div>
  );
};

export default HistoricalNotification;