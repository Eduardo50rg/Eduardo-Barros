import React from 'react';
import { ShieldExclamationIcon, XMarkIcon } from './icons';
import type { GeofenceAlert } from '../types';

interface GeofenceAlertsPanelProps {
  alerts: GeofenceAlert[];
  onDismiss: (alertId: string) => void;
}

const GeofenceAlertsPanel: React.FC<GeofenceAlertsPanelProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <>
      {alerts.map((alert) => {
        const isEnter = alert.eventType === 'enter';
        const styles = {
            bg: isEnter ? 'bg-yellow-500/90' : 'bg-cyan-500/90',
            border: isEnter ? 'border-yellow-600' : 'border-cyan-600',
            iconColor: isEnter ? 'text-yellow-900' : 'text-cyan-900',
            titleColor: isEnter ? 'text-yellow-900' : 'text-cyan-900',
            textColor: 'text-black',
            buttonHover: 'hover:bg-black/20',
        };

        return (
          <div 
            key={alert.id}
            className={`${styles.bg} backdrop-blur-md p-3 rounded-lg shadow-lg flex items-start animate-fade-in-up border ${styles.border}`}
            role="alert"
          >
            <ShieldExclamationIcon className={`h-6 w-6 mr-3 mt-1 flex-shrink-0 ${styles.iconColor}`} />
            <div className="flex-grow">
              <p className={`font-bold text-sm ${styles.titleColor}`}>{isEnter ? 'Entrada em Zona de Risco' : 'Saída de Zona de Risco'}</p>
              <p className={`text-xs ${styles.textColor}`}>
                <span className="font-semibold">{alert.volunteerName}</span> {isEnter ? 'entrou na' : 'saiu da'} zona{' '}
                <span className="font-semibold">"{alert.zoneName}"</span>.
              </p>
               <p className={`text-xs ${styles.textColor} opacity-80 mt-1`}>{alert.timestamp.toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={() => onDismiss(alert.id)}
              className={`p-1 rounded-full ${styles.buttonHover} ${styles.iconColor}`}
              aria-label={`Dispensar alerta para ${alert.volunteerName}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </>
  );
};

export default GeofenceAlertsPanel;
