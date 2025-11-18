import React from 'react';
import type { TimelineEvent } from '../types';
import { ExclamationTriangleIcon, UserIcon, XMarkIcon, CogIcon, ShieldExclamationIcon, CheckCircleIcon, InformationCircleIcon } from './icons';

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "agora";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
};

const EventIcon: React.FC<{type: TimelineEvent['type']}> = ({ type }) => {
    switch (type) {
        case 'ocorrencia':
            return <div className="bg-yellow-900/50 rounded-full p-1.5"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" /></div>;
        case 'status_change':
            return <div className="bg-green-900/50 rounded-full p-1.5"><UserIcon className="h-5 w-5 text-green-400" /></div>;
        case 'assignment':
             return <div className="bg-blue-900/50 rounded-full p-1.5"><CogIcon className="h-5 w-5 text-blue-400" /></div>;
        case 'zone_created':
             return <div className="bg-red-900/50 rounded-full p-1.5"><ShieldExclamationIcon className="h-5 w-5 text-red-400" /></div>;
        case 'check_in':
             return <div className="bg-cyan-900/50 rounded-full p-1.5"><CheckCircleIcon className="h-5 w-5 text-cyan-400" /></div>;
        case 'support_request':
             return <div className="bg-purple-900/50 rounded-full p-1.5"><InformationCircleIcon className="h-5 w-5 text-purple-400" /></div>;
        default:
            return <div className="bg-gray-700 rounded-full p-1.5"><UserIcon className="h-5 w-5 text-gray-400" /></div>;
    }
};

interface EventLogPanelProps {
    events: TimelineEvent[];
    onEventClick: (lat: number, lng: number) => void;
    onClose?: () => void;
}

const EventLogPanel: React.FC<EventLogPanelProps> = ({ events, onEventClick, onClose }) => {
    return (
        <div className="bg-gray-800/90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 flex flex-col h-full animate-fade-in-up">
            <div className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
                <h3 className="font-bold text-base text-white">Log de Eventos</h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 text-gray-400">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                {events.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 p-4">Nenhum evento registrado.</p>
                ) : (
                    <ul className="space-y-2">
                        {events.map(event => (
                            <li key={event.id}>
                                <button
                                    onClick={() => onEventClick(event.latitude, event.longitude)}
                                    className="w-full text-left p-2.5 rounded-lg bg-gray-900/50 hover:bg-cyan-600/20 border border-gray-700 hover:border-cyan-500 transition-colors"
                                >
                                    <div className="flex items-start">
                                        <div className="mr-3 flex-shrink-0">
                                            <EventIcon type={event.type} />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-sm text-gray-200 truncate">{event.title}</p>
                                            <p className="text-xs text-gray-400 truncate">{event.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Por: {event.operatorName}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTimeAgo(event.timestamp)}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EventLogPanel;