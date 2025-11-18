import React, { useState, useRef, useEffect } from 'react';
import type { Activation } from '../types';
import { MegaphoneIcon, XMarkIcon, MapPinIcon, LoadingSpinner } from './icons';

declare const L: any;

interface ActivationPanelProps {
    activation: Activation;
    onUpdateActivation: (active: boolean, message: string | null, meetingPoint: { lat: number, lng: number } | null) => void;
}

const ActivationModal: React.FC<{
    onClose: () => void;
    onConfirm: (message: string, meetingPoint: { lat: number, lng: number }) => void;
}> = ({ onClose, onConfirm }) => {
    const [message, setMessage] = useState('');
    const [meetingPoint, setMeetingPoint] = useState<{ lat: number, lng: number } | null>(null);
    const [error, setError] = useState('');
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);
    const markerRef = useRef<any | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const initialCenter: [number, number] = [-32.035, -52.0986];
        mapRef.current = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 13,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(mapRef.current);
        
        mapRef.current.on('click', (e: any) => {
            const coords = e.latlng;
            setMeetingPoint(coords);
            if (markerRef.current) {
                markerRef.current.setLatLng(coords);
            } else {
                markerRef.current = L.marker(coords).addTo(mapRef.current);
            }
        });

        setTimeout(() => mapRef.current?.invalidateSize(), 400);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    const handleConfirm = () => {
        if (!message.trim()) {
            setError('A mensagem de acionamento é obrigatória.');
            return;
        }
        if (!meetingPoint) {
            setError('É necessário definir um ponto de encontro no mapa.');
            return;
        }
        onConfirm(message, meetingPoint);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Iniciar Acionamento em Massa</h2>
                </div>
                <div className="p-6 space-y-4 flex-grow flex flex-col overflow-y-auto">
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">{error}</p>}
                    <div>
                        <label htmlFor="activation-message" className="block text-sm font-medium text-gray-300 mb-1">Mensagem de Acionamento</label>
                        <textarea
                            id="activation-message"
                            rows={3}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"
                            placeholder="Ex: Alerta de enchente no bairro X. Voluntários disponíveis, apresentar-se no ponto de encontro."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Ponto de Encontro</label>
                        <p className="text-xs text-gray-400 mb-2">Clique no mapa para definir a localização.</p>
                        <div ref={mapContainerRef} className="w-full h-64 bg-gray-900 rounded-md border border-gray-600"></div>
                        {meetingPoint && (
                            <p className="text-sm text-green-400 mt-2">Ponto definido em: Lat {meetingPoint.lat.toFixed(4)}, Lng {meetingPoint.lng.toFixed(4)}</p>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleConfirm} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md">Confirmar e Enviar</button>
                </div>
            </div>
        </div>
    );
};

const ActivationPanel: React.FC<ActivationPanelProps> = ({ activation, onUpdateActivation }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirmActivation = (message: string, meetingPoint: { lat: number, lng: number }) => {
        onUpdateActivation(true, message, meetingPoint);
        setIsModalOpen(false);
    };
    
    const handleDeactivate = () => {
        if (window.confirm("Tem certeza que deseja desativar o sistema? Isso irá notificar a todos que o acionamento foi encerrado.")) {
            onUpdateActivation(false, null, null);
        }
    };

    return (
        <>
            {isModalOpen && <ActivationModal onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmActivation} />}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Acionamento Geral do Sistema</h2>
                
                {activation.active ? (
                    <div className="space-y-4">
                        <div className="bg-green-900/50 p-4 rounded-lg border border-green-700">
                            <h3 className="font-bold text-xl text-green-300">SISTEMA ATIVO</h3>
                            <p className="text-gray-300 mt-2">"{activation.message}"</p>
                            {activation.meetingPoint && (
                                <p className="text-sm text-gray-400 mt-2 font-mono">Ponto de Encontro: [{activation.meetingPoint.lat.toFixed(5)}, {activation.meetingPoint.lng.toFixed(5)}]</p>
                            )}
                        </div>
                        <button
                            onClick={handleDeactivate}
                            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                        >
                            Desativar Sistema
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <h3 className="font-bold text-xl text-yellow-400">Sistema Inativo</h3>
                            <p className="text-gray-400 mt-2">O sistema está em modo de espera. Nenhum acionamento em massa está em vigor.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full md:w-auto px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                        >
                            <MegaphoneIcon className="h-6 w-6" />
                            Iniciar Acionamento em Massa
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ActivationPanel;