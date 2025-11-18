import React from 'react';
import type { SosAlert, GeofenceAlert, ClimateAlert, Activation } from '../types';
import {
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon,
    ShieldExclamationIcon,
    CloudBoltIcon,
    MegaphoneIcon
} from './icons';

// Props for the unified panel
interface AlertsPanelProps {
    sosAlerts: SosAlert[];
    geofenceAlerts: GeofenceAlert[];
    climateAlerts: ClimateAlert[];
    activation: Activation;
    onDismissSos: (id: string) => void;
    onDismissGeofence: (id: string) => void;
    onDismissClimate: (id: string) => void;
    onLocateSos?: (lat: number, lng: number) => void;
    onOpenSosChat?: (ocorrenciaId: string) => void;
    highlightedAlertId?: string | null;
}

const AlertItem: React.FC<{
    id: string;
    children: React.ReactNode;
    onDismiss: (id: string) => void;
    className: string;
}> = ({ id, children, onDismiss, className }) => {
    const [isExiting, setIsExiting] = React.useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            onDismiss(id);
        }, 300); // Match animation duration
    };

    return (
        <div
            className={`flex items-start p-3 rounded-lg shadow-lg border animate-fade-in-up relative ${className} ${isExiting ? 'animate-slide-out-right' : ''}`}
            role="alert"
        >
            {children}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full text-black/50 hover:bg-black/20"
              aria-label="Dispensar alerta"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
        </div>
    );
};


export const AlertsPanel: React.FC<AlertsPanelProps> = ({
    sosAlerts,
    geofenceAlerts,
    climateAlerts,
    activation,
    onDismissSos,
    onDismissGeofence,
    onDismissClimate,
    onLocateSos,
    onOpenSosChat,
    highlightedAlertId,
}) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const totalAlerts = sosAlerts.length + geofenceAlerts.length + climateAlerts.length + (activation.active ? 1 : 0);

    // Effect to auto-manage collapse state based on alerts
    React.useEffect(() => {
        if (totalAlerts > 0 && isCollapsed) {
            setIsCollapsed(false);
        }
    }, [totalAlerts]);
    
    const geofenceEnterStyle = 'bg-yellow-500/90 border-yellow-600 text-yellow-900';
    const geofenceExitStyle = 'bg-cyan-500/90 border-cyan-600 text-cyan-900';

    const climateStyles = {
        moderate: {
            bg: 'bg-cyan-500/90',
            border: 'border-cyan-600',
            iconColor: 'text-cyan-900',
            titleColor: 'text-cyan-900',
            textColor: 'text-black',
        },
        severe: {
            bg: 'bg-purple-500/90',
            border: 'border-purple-600',
            iconColor: 'text-purple-900',
            titleColor: 'text-purple-900',
            textColor: 'text-black',
        },
        extreme: {
            bg: 'bg-indigo-600/90',
            border: 'border-indigo-700',
            iconColor: 'text-indigo-200',
            titleColor: 'text-white',
            textColor: 'text-indigo-100',
        },
    };
    
    const sosStyle = 'bg-red-600/95 border-red-500 text-white animate-pulse-strong';
    const activationStyle = 'bg-blue-600/95 border-blue-500 text-white';


    return (
        <div className={`absolute top-4 right-4 z-[1000] transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
            <div className="relative">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -left-5 top-1/2 -translate-y-1/2 bg-gray-800/80 backdrop-blur-md text-white p-1 rounded-l-md border-y border-l border-gray-700 hover:bg-cyan-600"
                    title={isCollapsed ? 'Mostrar Alertas' : 'Ocultar Alertas'}
                >
                    {isCollapsed ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                    {totalAlerts > 0 && isCollapsed && (
                        <span className="absolute -top-2 -right-2 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center">{totalAlerts > 9 ? '9+' : totalAlerts}</span>
                        </span>
                    )}
                </button>

                <div className={`backdrop-blur-md bg-gray-800/20 rounded-lg transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="max-h-[calc(100vh-3rem)] p-2 space-y-3 overflow-y-auto">
                        {activation.active && (
                            <div className={`flex items-start p-3 rounded-lg shadow-lg border animate-fade-in-down ${activationStyle}`} role="alert">
                                <MegaphoneIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">ATIVAÇÃO DO SISTEMA</p>
                                    <p className="text-xs">{activation.message}</p>
                                </div>
                            </div>
                        )}
                        {sosAlerts.map(alert => {
                            const isHighlighted = alert.id === highlightedAlertId;
                            return (
                                <AlertItem key={alert.id} id={alert.id} onDismiss={onDismissSos} className={`${sosStyle} ${isHighlighted ? 'animate-flash' : ''}`}>
                                    <ShieldExclamationIcon className="h-8 w-8 mr-3 mt-1 flex-shrink-0" />
                                    <div className="flex-grow pr-4">
                                        <p className="font-bold text-sm">ALERTA DE SOS</p>
                                        <p className="text-xs">Voluntário <span className="font-semibold">{alert.volunteerName}</span> precisa de ajuda!</p>
                                        {(onLocateSos || (alert.ocorrenciaId && onOpenSosChat)) && (
                                            <div className="mt-2 flex gap-2">
                                                {onLocateSos && <button onClick={() => onLocateSos(alert.location.lat, alert.location.lng)} className="text-xs bg-black/30 hover:bg-black/50 px-2 py-1 rounded">Localizar</button>}
                                                {(alert.ocorrenciaId && onOpenSosChat) && <button onClick={() => onOpenSosChat(alert.ocorrenciaId!)} className="text-xs bg-black/30 hover:bg-black/50 px-2 py-1 rounded">Abrir Chat</button>}
                                            </div>
                                        )}
                                    </div>
                                </AlertItem>
                            );
                        })}
                        {climateAlerts.map((alert) => {
                             const styleInfo = climateStyles[alert.severity] || climateStyles.moderate;
                             const isHighlighted = alert.id === highlightedAlertId;
                             
                             return (
                                <AlertItem key={alert.id} id={alert.id} onDismiss={onDismissClimate} className={`${styleInfo.bg} ${styleInfo.border} ${isHighlighted ? 'animate-flash' : ''}`}>
                                    <CloudBoltIcon className={`h-8 w-8 mr-3 mt-1 flex-shrink-0 ${styleInfo.iconColor}`} />
                                    <div className={`flex-grow pr-4 ${alert.severity === 'extreme' ? 'text-white' : 'text-black'}`}>
                                        <p className={`font-bold text-sm ${styleInfo.titleColor}`}>{alert.title}</p>
                                        <p className={`text-xs opacity-90 ${styleInfo.textColor}`}>{alert.description}</p>
                                        <p className={`text-xs opacity-70 mt-1 ${styleInfo.textColor}`}>{alert.timestamp.toLocaleTimeString()}</p>
                                    </div>
                                </AlertItem>
                             );
                        })}
                        {geofenceAlerts.map(alert => {
                            const isEnter = alert.eventType === 'enter';
                            const style = isEnter ? geofenceEnterStyle : geofenceExitStyle;
                            const isHighlighted = alert.id === highlightedAlertId;
                            return(
                                <AlertItem key={alert.id} id={alert.id} onDismiss={onDismissGeofence} className={`${style} ${isHighlighted ? 'animate-flash' : ''}`}>
                                    <ShieldExclamationIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                                    <div className="flex-grow pr-4 text-black">
                                        <p className="font-bold text-sm">{isEnter ? 'Entrada em Zona de Risco' : 'Saída de Zona de Risco'}</p>
                                        <p className="text-xs opacity-90"><span className="font-semibold">{alert.volunteerName}</span> {isEnter ? 'entrou na' : 'saiu da'} zona <span className="font-semibold">"{alert.zoneName}"</span>.</p>
                                        <p className="text-xs opacity-70 mt-1">{alert.timestamp.toLocaleTimeString()}</p>
                                    </div>
                                </AlertItem>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};