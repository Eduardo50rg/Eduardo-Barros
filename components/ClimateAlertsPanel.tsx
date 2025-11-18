import React from 'react';
import { CloudBoltIcon, XMarkIcon } from './icons';
import type { ClimateAlert } from '../types';

interface ClimateAlertsPanelProps {
  alerts: ClimateAlert[];
  onDismiss: (alertId: string) => void;
}

const severityStyles = {
    moderate: {
        bg: 'bg-cyan-500/90',
        border: 'border-cyan-600',
        iconColor: 'text-cyan-900',
        titleColor: 'text-cyan-900',
        textColor: 'text-black',
        buttonHover: 'hover:bg-black/20',
        flash: '',
    },
    severe: {
        bg: 'bg-purple-500/90',
        border: 'border-purple-600',
        iconColor: 'text-purple-900',
        titleColor: 'text-purple-900',
        textColor: 'text-black',
        buttonHover: 'hover:bg-black/20',
        flash: '',
    },
    extreme: {
        bg: 'bg-indigo-600/90',
        border: 'border-indigo-700',
        iconColor: 'text-indigo-200',
        titleColor: 'text-white',
        textColor: 'text-indigo-100',
        buttonHover: 'hover:bg-white/20',
        flash: 'animate-pulse',
    }
};

const ClimateAlertsPanel: React.FC<ClimateAlertsPanelProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <>
      {alerts.map((alert, index) => {
        const styles = severityStyles[alert.severity] || severityStyles.moderate;
        // Apply flash only to the newest extreme alert
        const flashClass = alert.severity === 'extreme' && index === 0 ? styles.flash : '';
        return (
          <div 
            key={alert.id}
            className={`${styles.bg} ${flashClass} backdrop-blur-md p-3 rounded-lg shadow-lg flex items-start animate-fade-in-up border ${styles.border}`}
            role="alert"
          >
            <CloudBoltIcon className={`h-8 w-8 mr-3 mt-1 flex-shrink-0 ${styles.iconColor}`} />
            <div className="flex-grow">
              <p className={`font-bold text-sm ${styles.titleColor}`}>{alert.title} - {alert.area}</p>
              <p className={`text-xs ${styles.textColor}`}>
                {alert.description}
              </p>
               <p className={`text-xs ${styles.textColor} opacity-80 mt-1`}>{alert.timestamp.toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={() => onDismiss(alert.id)}
              className={`p-1 rounded-full ${styles.buttonHover} ${styles.titleColor}`}
              aria-label={`Dispensar alerta ${alert.title}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </>
  );
};

export default ClimateAlertsPanel;