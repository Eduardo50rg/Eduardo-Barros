import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { User, Ocorrencia, Voluntario, SystemConfig, EmergencyContacts, Weather, ChatMessage, HelpRequestData } from '../types';
import { HomeIcon, ArrowRightOnRectangleIcon, ExclamationTriangleIcon, UserGroupIcon, ClockIcon, WindIcon, WaterDropIcon, WeatherConditionIcon, LoadingSpinner, MapPinIcon, GlobeAltIcon, UserIcon } from './icons';
import HelpRequestForm from './HelpRequestForm';
import LeafletMap from './LeafletMap';
import SuccessToast from './SuccessToast';
import { ChatPanel } from './ChatPanel';

const EmergencyInfoPanel: React.FC<{ contacts: EmergencyContacts; }> = ({ contacts }) => (
    <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
        <div>
            <h3 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Contatos de Emergência</h3>
            <div className="space-y-1 text-sm">
                <p><strong>SAMU:</strong> {contacts.samu}</p>
                <p><strong>Bombeiros:</strong> {contacts.bombeiros}</p>
                <p><strong>Defesa Civil:</strong> {contacts.defesaCivil}</p>
                {contacts.samuWhatsapp && <p><strong>WhatsApp SAMU:</strong> {contacts.samuWhatsapp}</p>}
                {contacts.bombeirosWhatsapp && <p><strong>WhatsApp Bombeiros:</strong> {contacts.bombeirosWhatsapp}</p>}
                {contacts.defesaCivilWhatsapp && <p><strong>WhatsApp Defesa Civil:</strong> {contacts.defesaCivilWhatsapp}</p>}
            </div>
        </div>
    </div>
);


interface CitizenPortalProps {
    user: User;
    onLogout: () => void;
    onHelpRequest: (request: HelpRequestData) => void;
    ocorrencia: Ocorrencia | null;
    assignedVolunteers: Voluntario[] | null;
    systemConfig: SystemConfig;
    chatMessages: ChatMessage[];
    onSendMessage: (ocorrenciaId: string, message: string, type: 'text' | 'audio') => void;
}

const CitizenPortal: React.FC<CitizenPortalProps> = ({ user, onLogout, onHelpRequest, ocorrencia, assignedVolunteers, systemConfig, chatMessages, onSendMessage }) => {
    const [isHelpFormVisible, setHelpFormVisible] = useState(false);

    const isSystemActive = systemConfig.acceptingRequests;

    const handleFormSubmit = (requestData: HelpRequestData) => {
        onHelpRequest(requestData);
        // The form now handles its own success message and closing.
    };
    
    const handleOpenHelpForm = () => {
        setHelpFormVisible(true);
    };

    const initialHelpRequestData = useMemo(() => ({
        solicitante: { nome: user.name, telefone: '', isTerceiro: false, nomeVitima: '' }
    }), [user.name]);

    const mapRef = useRef<any>(null);

    const mapOcorrencias = useMemo(() => {
        return ocorrencia ? [ocorrencia] : [];
    }, [ocorrencia]);
    
    const mapVolunteers = useMemo(() => {
        return assignedVolunteers || [];
    }, [assignedVolunteers]);
    
    const renderMainContent = () => {
        if (ocorrencia) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold mb-1 text-white">Seu Pedido de Ajuda está Ativo</h2>
                    <p className="text-sm text-gray-400 mb-4">Acompanhe o status e comunique-se com a equipe.</p>
                    
                    <div className="space-y-4 mb-4">
                        <div className="flex items-start text-sm">
                            <div className="text-cyan-400 mt-0.5"><ExclamationTriangleIcon className="h-5 w-5" /></div>
                            <div className="ml-2">
                                <p className="text-gray-400">Status do Pedido</p>
                                <p className="font-semibold text-white">{ocorrencia.status}</p>
                            </div>
                        </div>
                        <div className="flex items-start text-sm">
                            <div className="text-cyan-400 mt-0.5"><UserGroupIcon className="h-5 w-5" /></div>
                            <div className="ml-2">
                                <p className="text-gray-400">Equipe Designada</p>
                                <p className="font-semibold text-white">{assignedVolunteers ? assignedVolunteers.map(v => v.nome).join(', ') : 'Aguardando designação...'}</p>
                            </div>
                        </div>
                        {assignedVolunteers && assignedVolunteers[0]?.eta &&
                            <div className="flex items-start text-sm">
                                <div className="text-cyan-400 mt-0.5"><ClockIcon className="h-5 w-5" /></div>
                                <div className="ml-2">
                                    <p className="text-gray-400">Tempo Estimado de Chegada (ETA)</p>
                                    <p className="font-semibold text-white">{assignedVolunteers[0].eta}</p>
                                </div>
                            </div>
                        }
                    </div>
                    <div className="flex-grow min-h-[300px]">
                        <ChatPanel 
                            user={user}
                            ocorrencia={ocorrencia}
                            messages={chatMessages}
                            onSendMessage={(message, type) => onSendMessage(ocorrencia.id, message, type)}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 text-white">Precisa de Ajuda?</h2>
                {isSystemActive ? (
                    <>
                        <p className="text-gray-300 mb-8">Clique no botão abaixo para iniciar sua solicitação. Sua localização será solicitada para agilizar o atendimento.</p>
                        <div className="space-y-4">
                            <button 
                                onClick={handleOpenHelpForm}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-3 animate-pulse-strong"
                            >
                                <ExclamationTriangleIcon className="h-6 w-6"/> SOLICITAR AJUDA
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-yellow-300 mb-4">O sistema de solicitações online não está ativo no momento. Em caso de emergência, utilize os contatos abaixo.</p>
                        <EmergencyInfoPanel contacts={systemConfig.contacts} />
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            {isHelpFormVisible && (
                <HelpRequestForm 
                    onSubmit={handleFormSubmit} 
                    onQueueForSync={() => {}}
                    onClose={() => setHelpFormVisible(false)}
                    initialData={initialHelpRequestData}
                />
            )}
            <div className="fixed inset-0 bg-gray-900 z-[3000] p-4 sm:p-6 lg:p-8 flex flex-col animate-fade-in-up">
                <header className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Portal do Cidadão</h1>
                        <p className="text-gray-400">Bem-vindo(a), {user.name}</p>
                    </div>
                    <button onClick={onLogout} className="flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-red-600 text-white transition-colors">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Sair
                    </button>
                </header>
                <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                        {renderMainContent()}
                        <EmergencyInfoPanel contacts={systemConfig.contacts} />
                    </div>
                    <div className="lg:col-span-2 rounded-lg overflow-hidden h-full min-h-[400px] lg:min-h-0">
                       <LeafletMap
                            ref={mapRef}
                            voluntarios={mapVolunteers}
                            ocorrencias={mapOcorrencias}
                            riskZones={[]}
                            climateAlerts={[]}
                            activation={{ active: false, message: '', meetingPoint: null }}
                            showHeatmap={false}
                            showRoutes={true}
                            onOcorrenciaSelect={() => {}}
                            onClearSelection={() => {}}
                            onViewVolunteerPath={() => {}}
                            onEditRiskZone={() => {}}
                            onDeleteRiskZone={() => {}}
                            selectedOcorrenciaId={ocorrencia?.id}
                            onLocationError={(message: string) => alert(`Erro de localização: ${message}`)}
                        />
                    </div>
                </main>
            </div>
        </>
    );
};

export default CitizenPortal;