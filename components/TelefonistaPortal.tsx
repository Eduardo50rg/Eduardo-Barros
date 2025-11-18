import React, { useState, useMemo } from 'react';
import type { User, Ocorrencia, ChatMessage, OcorrenciaPrioridade } from '../types';
import { ArrowRightOnRectangleIcon, PlusIcon, ExclamationTriangleIcon, PencilIcon, UserGroupIcon, CogIcon, MagnifyingGlassIcon } from './icons';
import LeafletMap from './LeafletMap';
import { ChatPanel } from './ChatPanel';
// FIX: Module '"file:///src/components/ManualRequestForm"' has no default export. Changed to named import.
import { ManualRequestForm } from './ManualRequestForm';
import SuccessToast from './SuccessToast';

interface TelefonistaPortalProps {
    user: User;
    onLogout: () => void;
    allOpenOcorrencias: Ocorrencia[];
    onAddOcorrencia: (ocorrencia: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'>) => Ocorrencia;
    onUpdateOcorrencia: (ocorrencia: Ocorrencia) => void;
    chatMessages: ChatMessage[];
    onSendMessage: (ocorrenciaId: string, message: string, type: 'text' | 'audio') => void;
}

const TelefonistaPortal: React.FC<TelefonistaPortalProps> = ({ user, onLogout, allOpenOcorrencias, onAddOcorrencia, onUpdateOcorrencia, chatMessages, onSendMessage }) => {
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
    const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successToastMessage, setSuccessToastMessage] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<OcorrenciaPrioridade | 'all'>('all');
    const [lastViewedChat, setLastViewedChat] = useState<Record<string, string>>({});


    const handleSaveOcorrencia = (data: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'> | Ocorrencia) => {
        if ('id' in data && data.id) {
            onUpdateOcorrencia(data as Ocorrencia);
            setSuccessToastMessage('Solicitação atualizada com sucesso!');
        } else {
            onAddOcorrencia(data as Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'>);
            setSuccessToastMessage('Solicitação registrada com sucesso!');
        }
        setFormVisible(false);
        setEditingOcorrencia(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const handleAddNewClick = () => {
        setEditingOcorrencia(null);
        setFormVisible(true);
    };

    const handleEditClick = (ocorrencia: Ocorrencia) => {
        setEditingOcorrencia(ocorrencia);
        setFormVisible(true);
    };

    const handleCloseForm = () => {
        setEditingOcorrencia(null);
        setFormVisible(false);
    };

    const handleSelectOcorrencia = (ocorrencia: Ocorrencia) => {
        setSelectedOcorrencia(ocorrencia);
        setLastViewedChat(prev => ({...prev, [ocorrencia.id]: new Date().toISOString()}));
    };

    const filteredOcorrencias = useMemo(() => {
        return allOpenOcorrencias
            .filter(o => {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = !searchTerm ||
                    o.code.toLowerCase().includes(searchLower) ||
                    o.tipo.toLowerCase().includes(searchLower) ||
                    o.solicitante?.nome.toLowerCase().includes(searchLower) ||
                    o.endereco?.logradouro.toLowerCase().includes(searchLower);

                const matchesPriority = filterPriority === 'all' || o.prioridade === filterPriority;

                return matchesSearch && matchesPriority;
            })
            .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
    }, [allOpenOcorrencias, searchTerm, filterPriority]);

    const chatMessagesForSelected = useMemo(() => {
        if (!selectedOcorrencia) return [];
        return chatMessages.filter(m => m.ocorrenciaId === selectedOcorrencia.id);
    }, [chatMessages, selectedOcorrencia]);

    return (
        <>
            {showSuccessToast && <SuccessToast message={successToastMessage} />}
            {isFormVisible && (
                <ManualRequestForm 
                    onClose={handleCloseForm}
                    onSubmit={handleSaveOcorrencia}
                    initialData={editingOcorrencia}
                />
            )}
            <div className="fixed inset-0 bg-gray-900 z-[3000] p-4 sm:p-6 lg:p-8 flex flex-col animate-fade-in-up">
                <header className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Portal do Telefonista</h1>
                        <p className="text-gray-400">Operador(a): {user.name}</p>
                    </div>
                    <button onClick={onLogout} className="flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-red-600 text-white transition-colors">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Sair
                    </button>
                </header>

                <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                    <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
                        <button 
                            onClick={handleAddNewClick}
                            className="w-full flex items-center justify-center p-4 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-bold text-lg"
                        >
                            <PlusIcon className="h-6 w-6 mr-2" />
                            Nova Solicitação
                        </button>
                        
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-grow flex flex-col">
                           <h2 className="text-xl font-bold mb-4 text-white">Ocorrências Abertas</h2>
                           
                           <div className="space-y-3 mb-4">
                                <div className="relative">
                                    <input
                                        type="search"
                                        placeholder="Buscar por código, tipo, solicitante..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-4 py-2 text-sm text-white"
                                    />
                                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                <select 
                                    value={filterPriority}
                                    onChange={e => setFilterPriority(e.target.value as OcorrenciaPrioridade | 'all')}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="all">Todas as Prioridades</option>
                                    <option value="Urgente">Urgente</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Baixa">Baixa</option>
                                </select>
                           </div>

                           <div className="flex-grow overflow-y-auto">
                                <ul className="space-y-2">
                                    {filteredOcorrencias.map(o => {
                                        const hasNewMessages = chatMessages.some(m => m.ocorrenciaId === o.id && m.senderId !== user.id && (!lastViewedChat[o.id] || m.timestamp > lastViewedChat[o.id]));
                                        const isBeingHandled = o.status === 'Em Atendimento';
                                        const isAssigned = !!o.assignedVolunteerIds && o.assignedVolunteerIds.length > 0;

                                        return (
                                        <li key={o.id}>
                                            <div className={`w-full text-left p-3 rounded-lg border transition-all ${selectedOcorrencia?.id === o.id ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}>
                                                <button onClick={() => handleSelectOcorrencia(o)} className="w-full">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold text-sm flex items-center">{o.tipo} {hasNewMessages && <span className="ml-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>}</p>
                                                        <span className="text-xs font-mono text-gray-400">{o.code}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-400 truncate">{o.endereco ? `${o.endereco.logradouro}, ${o.endereco.numero}` : 'Localização via GPS'}</p>
                                                </button>
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                                                    <div className="flex items-center gap-2">
                                                        {isBeingHandled && <span title="Em Atendimento pelo Operador" className="flex items-center text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded-full"><CogIcon className="h-3 w-3 mr-1"/> Em Atendimento</span>}
                                                        {isAssigned && <span title="Equipe Designada" className="flex items-center text-xs text-green-300 bg-green-900/50 px-2 py-1 rounded-full"><UserGroupIcon className="h-3 w-3 mr-1"/> Equipe em rota</span>}
                                                    </div>
                                                    <button onClick={() => handleEditClick(o)} className="p-1 text-gray-400 hover:text-yellow-300" title="Editar Ocorrência">
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )})}
                                    {filteredOcorrencias.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-8">Nenhuma ocorrência encontrada.</p>
                                    )}
                                </ul>
                           </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
                        <div className="rounded-lg overflow-hidden h-2/5 border border-gray-700">
                           <LeafletMap
                                voluntarios={[]}
                                ocorrencias={allOpenOcorrencias}
                                riskZones={[]}
                                climateAlerts={[]}
                                activation={{ active: false, message: '', meetingPoint: null }}
                                showHeatmap={false}
                                showRoutes={false}
                                onOcorrenciaSelect={handleSelectOcorrencia}
                                onClearSelection={() => setSelectedOcorrencia(null)}
                                onViewVolunteerPath={() => {}}
                                onEditRiskZone={() => {}}
                                onDeleteRiskZone={() => {}}
                                selectedOcorrenciaId={selectedOcorrencia?.id}
                                onLocationError={(message: string) => alert(`Erro de localização: ${message}`)}
                            />
                        </div>
                         <div className="h-3/5">
                            {selectedOcorrencia ? (
                                <ChatPanel 
                                    user={user}
                                    ocorrencia={selectedOcorrencia}
                                    messages={chatMessagesForSelected}
                                    onSendMessage={(message, type) => onSendMessage(selectedOcorrencia.id, message, type)}
                                />
                            ) : (
                                <div className="bg-gray-800 border border-gray-700 rounded-lg h-full flex flex-col items-center justify-center text-center p-4">
                                    <ExclamationTriangleIcon className="h-10 w-10 text-gray-500 mb-4" />
                                    <h3 className="font-bold text-lg text-gray-300">Selecione uma Ocorrência</h3>
                                    <p className="text-sm text-gray-500">Clique em uma ocorrência na lista ou no mapa para ver o chat.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default TelefonistaPortal;