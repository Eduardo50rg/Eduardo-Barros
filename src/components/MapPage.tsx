import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import LeafletMap from './LeafletMap';
// FIX: Changed to named import for MapControls.
import { MapControls } from './MapControls';
import SuccessToast from './SuccessToast';
import { AlertsPanel } from './AlertsPanel';
import AdminZonas from './AdminZonas';
import type { MapControlHandles, RiskZone, Ocorrencia, Weather, Voluntario, VolunteerStatus, OcorrenciaStatus, TimelineEvent, User, NotificationSettings, NotificationType, ChatMessage, SosAlert, Vitimas, OcorrenciaGravidade, OcorrenciaPrioridade, Recurso, SearchSuggestion, ClimateAlert, GeofenceAlert, Team } from '../types';
import { LoadingSpinner, ExclamationTriangleIcon, CogIcon, XMarkIcon, ShieldExclamationIcon, MapPinIcon, UserGroupIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, ListBulletIcon, SparklesIcon, CubeIcon, ClockIcon, CheckCircleIcon, DocumentTextIcon, UserIcon, MinusIcon, PlusIcon, Bars3Icon } from './icons';
import DashboardPanel from './DashboardPanel';
import SearchBar from './SearchBar';
import HistoryPanel from './HistoryPanel';
import HistoricalNotification from './HistoricalNotification';
import DataManagementPanel from './DataManagementPanel';
import EventLogPanel from './EventLogPanel';
import NotificationSettingsPanel from './NotificationSettingsPanel';
// FIX: ChatPanel is a named export, not a default export. This is now corrected.
import { ChatPanel } from './ChatPanel';
import WeatherDisplay from './WeatherDisplay';
import InfoToast from './InfoToast';
import ErrorToast from './ErrorToast';
import { useWeatherData } from '../hooks/useWeatherData';
import { getItem, setItem } from '../utils/localStorage';


declare const turf: any;
declare const L: any;

const MAP_PREFERENCES_KEY = 'nupdec_map_preferences';

interface MapPreferences {
    showVoluntarios: boolean;
    showOcorrencias: boolean;
    showRiskZones: boolean;
    showRoutes: boolean;
    showHeatmap: boolean;
    heatmapRadius: number;
    heatmapIntensity: number;
    filterTipo: string[];
    filterStatus: OcorrenciaStatus | 'all';
    filterGravidade: OcorrenciaGravidade[];
    isDashboardOpen: boolean;
    isEventLogOpen: boolean;
}

const playNotificationSound = (type: NotificationType, volume: number) => {
  if (volume <= 0) return;
  const soundConfigs: Record<NotificationType, { type: OscillatorType; frequency: number; }> = {
    occurrence: { type: 'sine', frequency: 523.25 },
    geofence: { type: 'triangle', frequency: 783.99 },
    climate_extreme: { type: 'sawtooth', frequency: 349.23 },
    sos: { type: 'square', frequency: 880.00 },
  };

  const config = soundConfigs[type];
  if (!config) return;

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);
    
    const duration = type === 'sos' ? 1.5 : 0.7;
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Could not play notification sound:", error);
  }
};


const PrioritySelector: React.FC<{ current: OcorrenciaPrioridade, onSelect: (p: OcorrenciaPrioridade) => void }> = ({ current, onSelect }) => {
    const priorities: { level: OcorrenciaPrioridade; label: string; color: string; }[] = [
        { level: 'Baixa', label: 'Baixa', color: 'bg-gray-600 hover:bg-gray-500' },
        { level: 'Normal', label: 'Normal', color: 'bg-blue-600 hover:bg-blue-500' },
        { level: 'Alta', label: 'Alta', color: 'bg-yellow-600 hover:bg-yellow-500' },
        { level: 'Urgente', label: 'Urgente', color: 'bg-red-600 hover:bg-red-500' },
    ];
    const activeColor = 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white';

    return (
        <div className="flex justify-between space-x-1">
            {priorities.map(p => (
                <button key={p.level} onClick={() => onSelect(p.level)} className={`w-full text-center px-2 py-1.5 text-xs font-bold rounded-md text-white transition-all ${p.color} ${current === p.level ? activeColor : ''}`}>
                    {p.label}
                </button>
            ))}
        </div>
    );
};

const OcorrenciaOverview: React.FC<{ ocorrencia: Ocorrencia, onUpdatePriority: (p: OcorrenciaPrioridade) => void }> = ({ ocorrencia, onUpdatePriority }) => {
    const statusInfo = {
        'Aberta': 'bg-yellow-500/20 text-yellow-300',
        'Em Atendimento': 'bg-blue-500/20 text-blue-300',
        'Fechada': 'bg-gray-500/20 text-gray-400',
    };
     const gravidadeInfo = {
        'Crítico': 'bg-red-500/20 text-red-300',
        'Moderado': 'bg-orange-500/20 text-orange-300',
        'Controle': 'bg-green-500/20 text-green-300',
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-2 rounded-md ${statusInfo[ocorrencia.status]}`}>
                    <p className="text-xs uppercase font-bold tracking-wider opacity-70">Status</p>
                    <p className="font-semibold">{ocorrencia.status}</p>
                </div>
                <div className={`p-2 rounded-md ${gravidadeInfo[ocorrencia.gravidade || 'Moderado']}`}>
                     <p className="text-xs uppercase font-bold tracking-wider opacity-70">Gravidade</p>
                    <p className="font-semibold">{ocorrencia.gravidade || 'Moderado'}</p>
                </div>
            </div>
            <div>
                 <p className="text-xs uppercase font-bold tracking-wider opacity-70 text-center mb-2">Prioridade</p>
                 <PrioritySelector current={ocorrencia.prioridade} onSelect={onUpdatePriority} />
            </div>
        </div>
    );
};

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="border-b border-gray-700/50 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        {children}
    </div>
);


const OcorrenciaDetailsPanel: React.FC<{
  ocorrencia: Ocorrencia;
  onClose: () => void;
  availableVolunteers: Voluntario[];
  assignedVolunteers: Voluntario[];
  allTeams: Team[];
  suggestedVolunteerIds: string[];
  availableRecursos: Recurso[];
  chatMessages: ChatMessage[];
  user: User;
  onAssignVolunteers: (volunteerIds: string[]) => void;
  onAssignRecursos: (recursoIds: string[]) => void;
  onSendMessage: (message: string, type: 'text' | 'audio') => void;
  onUpdatePriority: (priority: OcorrenciaPrioridade) => void;
  onUpdateStatus: (status: OcorrenciaStatus) => void;
  onViewHistory: (volunteerId: string) => void;
  initialTab?: 'details' | 'chat';
}> = (props) => {
  const { ocorrencia, onClose, availableVolunteers, assignedVolunteers, allTeams, suggestedVolunteerIds, availableRecursos, chatMessages, user, onAssignVolunteers, onAssignRecursos, onSendMessage, onUpdatePriority, onUpdateStatus, onViewHistory, initialTab = 'details' } = props;
  
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>(initialTab);
  const [assignmentMode, setAssignmentMode] = useState<'individuals' | 'teams'>('individuals');
  const [selectedVolunteerIds, setSelectedVolunteerIds] = useState<string[]>([]);
  const [selectedRecursoIds, setSelectedRecursoIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentSectionRef, setAssignmentSectionRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setSelectedVolunteerIds([]);
    setSelectedRecursoIds([]);
    setSearchTerm('');
  }, [ocorrencia.id, initialTab]);


  const handleToggleVolunteer = (id: string) => setSelectedVolunteerIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  
  const handleSubmitAssignment = () => {
    if (selectedVolunteerIds.length > 0) {
        onAssignVolunteers(selectedVolunteerIds);
    }
  };
  const handleSubmitRecursos = () => { if (selectedRecursoIds.length > 0) { onAssignRecursos(selectedRecursoIds); setSelectedRecursoIds([]); } };
  
  const filteredVolunteers = useMemo(() => {
    return availableVolunteers.filter(v =>
      (v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.qualifications?.some(q => q.toLowerCase().includes(searchTerm.toLowerCase())))
    ).sort((a, b) => {
        const aIsSuggested = suggestedVolunteerIds.includes(a.id);
        const bIsSuggested = suggestedVolunteerIds.includes(b.id);
        if (aIsSuggested && !bIsSuggested) return -1;
        if (!aIsSuggested && bIsSuggested) return 1;
        return a.nome.localeCompare(b.nome);
    });
  }, [availableVolunteers, searchTerm, suggestedVolunteerIds]);

  const availableTeams = useMemo(() => {
    return allTeams.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allTeams, searchTerm]);

  const handleSelectTeam = (team: Team) => {
    const availableMemberIds = team.memberIds.filter(memberId =>
        availableVolunteers.some(v => v.id === memberId)
    );
    setSelectedVolunteerIds(availableMemberIds);
    setAssignmentMode('individuals');
  };
  
  const assignedRecursos = availableRecursos.filter(r => ocorrencia.assignedResourceIds?.includes(r.id));
  const unassignedRecursos = availableRecursos.filter(r => r.status === 'Disponível');

  const VitimasDetails: React.FC<{ vitimas?: Vitimas }> = ({ vitimas }) => {
    const victimLabels: Record<keyof Vitimas, string> = { adultos: 'Adultos', criancas: 'Crianças', idosos: 'Idosos', pcd: 'PCD', animais: 'Animais' };
    const items = (Object.keys(victimLabels) as Array<keyof Vitimas>).map(key => ({ label: victimLabels[key], value: vitimas?.[key] })).filter(item => typeof item.value === 'number' && item.value > 0);
    if (items.length === 0) return <p className="text-sm text-gray-400">Nenhuma vítima informada.</p>;
    return ( <div className="grid grid-cols-3 gap-2 mt-1">{items.map(item => (<div key={item.label} className="bg-gray-700/50 p-2 rounded text-center"><p className="text-xs text-gray-400">{item.label}</p><p className="font-bold text-lg text-white">{String(item.value)}</p></div>))}</div> );
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full sm:max-w-sm lg:max-w-md bg-gray-800/90 backdrop-blur-md border-l border-gray-700 z-[1200] flex flex-col animate-slide-in-right">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div><h2 className="text-xl font-bold text-white">{ocorrencia.tipo}</h2><p className="text-sm text-gray-400">Ocorrência <span className="font-mono">{ocorrencia.code}</span></p></div>
          <button onClick={() => onClose()} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex mt-3 border-b border-gray-700 -mb-4">
          <button onClick={() => setActiveTab('details')} className={`flex items-center justify-center gap-2 flex-1 text-sm font-bold py-2 border-b-2 ${activeTab === 'details' ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-white'}`}><ListBulletIcon className="h-5 w-5" />Detalhes</button>
          <button onClick={() => setActiveTab('chat')} className={`flex items-center justify-center gap-2 flex-1 text-sm font-bold py-2 border-b-2 ${activeTab === 'chat' ? 'text-cyan-400 border-cyan-400' : 'text-gray-400 border-transparent hover:text-white'}`}><ChatBubbleLeftRightIcon className="h-5 w-5" />Chat</button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeTab === 'details' && (
          <div className="p-4 space-y-4">
            <DetailSection title="Ações Rápidas" icon={<CheckCircleIcon className="h-4 w-4"/>}>
                <div className="flex flex-col gap-2">
                    {ocorrencia.status === 'Aberta' && <button onClick={() => assignmentSectionRef?.scrollIntoView({ behavior: 'smooth' })} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors"><UserGroupIcon className="h-5 w-5 mr-2" /> Atribuir Equipe</button>}
                    {ocorrencia.status !== 'Fechada' && <button onClick={() => onUpdateStatus('Fechada')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center transition-colors"><CheckCircleIcon className="h-5 w-5 mr-2" /> Marcar como Concluída</button>}
                </div>
            </DetailSection>
            <DetailSection title="Resumo da Situação" icon={<ListBulletIcon className="h-4 w-4"/>}><OcorrenciaOverview ocorrencia={ocorrencia} onUpdatePriority={onUpdatePriority} /></DetailSection>
             <DetailSection title="Vítimas Identificadas" icon={<UserGroupIcon className="h-4 w-4"/>}><VitimasDetails vitimas={ocorrencia.vitimas} /></DetailSection>
            <DetailSection title="Descrição" icon={<DocumentTextIcon className="h-4 w-4"/>}><p className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded">{ocorrencia.descricao}</p></DetailSection>
            <DetailSection title="Endereço" icon={<MapPinIcon className="h-4 w-4"/>}><p className="text-sm text-gray-300">{ocorrencia.endereco ? `${ocorrencia.endereco.logradouro}, ${ocorrencia.endereco.numero} - ${ocorrencia.endereco.bairro}` : 'Não informado'}</p></DetailSection>
            {ocorrencia.solicitante && <DetailSection title="Solicitante" icon={<UserIcon className="h-4 w-4"/>}><p className="text-sm text-gray-300">{ocorrencia.solicitante.nome} ({ocorrencia.solicitante.telefone})</p></DetailSection>}
            
            <DetailSection title="Equipe Designada" icon={<UserGroupIcon className="h-4 w-4"/>}>
                {ocorrencia.status === 'Em Atendimento' && assignedVolunteers && assignedVolunteers.length > 0 ? (<ul className="space-y-2">{assignedVolunteers.map(v => (<li key={v.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md"><p className="text-sm font-semibold text-cyan-300">{v.nome}</p><button onClick={() => onViewHistory(v.id)} className="text-xs text-purple-400 hover:underline flex items-center gap-1"><ClockIcon className="h-3 w-3" /> Ver Histórico</button></li>))}</ul>) : <p className="text-sm text-gray-500">Nenhuma equipe designada.</p>}
            </DetailSection>

            {ocorrencia.status === 'Aberta' && (
              <div ref={setAssignmentSectionRef}><DetailSection title="Designar Voluntários" icon={<UserGroupIcon className="h-4 w-4"/>}>
                <div className="flex border-b border-gray-600 mb-2"><button onClick={() => { setAssignmentMode('individuals'); setSearchTerm(''); }} className={`flex-1 text-center text-sm py-2 ${assignmentMode==='individuals' ? 'border-b-2 border-cyan-400 font-bold' : 'text-gray-400'}`}>Individuais</button><button onClick={() => { setAssignmentMode('teams'); setSearchTerm(''); }} className={`flex-1 text-center text-sm py-2 ${assignmentMode==='teams' ? 'border-b-2 border-cyan-400 font-bold' : 'text-gray-400'}`}>Equipes</button></div>
                <div className="relative mb-2"><input type="text" placeholder={`Buscar por ${assignmentMode==='individuals' ? 'nome ou qualificação' : 'nome da equipe'}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md pl-8 pr-4 py-2 text-sm text-white" /><MagnifyingGlassIcon className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /></div>
                
                {assignmentMode === 'individuals' && <ul className="space-y-1 max-h-48 overflow-y-auto">{filteredVolunteers.map(v => (<li key={v.id}><label className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${selectedVolunteerIds.includes(v.id) ? 'bg-cyan-900/50' : 'bg-gray-700/50'} ${suggestedVolunteerIds.includes(v.id) && !selectedVolunteerIds.includes(v.id) ? 'bg-green-900/40 border border-green-500' : 'border border-transparent'}`}><input type="checkbox" checked={selectedVolunteerIds.includes(v.id)} onChange={() => handleToggleVolunteer(v.id)} className="hidden" /><div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-2 flex-shrink-0 ${selectedVolunteerIds.includes(v.id) ? 'bg-cyan-500 border-cyan-400' : 'border-gray-500 bg-gray-800'}`}>{selectedVolunteerIds.includes(v.id) && <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}</div><div><p className="text-sm font-semibold">{v.nome}</p>{suggestedVolunteerIds.includes(v.id) && (<div className="flex items-center text-xs text-green-400 mt-0.5"><SparklesIcon className="h-3 w-3 mr-1" /><span>Sugerido</span></div>)}</div></label></li>))}</ul>}
                
                {assignmentMode === 'teams' && 
                  <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {availableTeams.map(t => (
                      <li key={t.id}>
                        <button
                          onClick={() => handleSelectTeam(t)}
                          className="w-full text-left p-2 rounded-md bg-gray-700/50 hover:bg-cyan-900/50 transition-colors"
                        >
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.memberIds.length} membros</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                }

                <button onClick={() => handleSubmitAssignment()} disabled={selectedVolunteerIds.length === 0} className="w-full mt-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors">Designar</button>
              </DetailSection></div>
            )}
            
            <DetailSection title="Alocar Recursos" icon={<CubeIcon className="h-4 w-4"/>}>
              {assignedRecursos.length > 0 && <ul className="space-y-1 mb-2">{assignedRecursos.map(r => (<li key={r.id} className="text-sm text-gray-300 bg-gray-700/50 p-2 rounded">{r.nome} ({r.tipo})</li>))}</ul>}
              <div className="flex gap-2">
                  <select onChange={e => setSelectedRecursoIds([e.target.value])} value={selectedRecursoIds[0] || ''} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white">
                      <option value="">Selecione um recurso...</option>
                      {unassignedRecursos.map(r => <option key={r.id} value={r.id}>{r.nome} ({r.tipo})</option>)}
                  </select>
                  <button onClick={() => handleSubmitRecursos()} disabled={selectedRecursoIds.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-700">Alocar</button>
              </div>
            </DetailSection>
          </div>
        )}
        {activeTab === 'chat' && (<div className="h-full"><ChatPanel user={user} ocorrencia={ocorrencia} messages={chatMessages} onSendMessage={onSendMessage} /></div>)}
      </div>
    </div>
  );
};

export const MapPage: React.FC<any> = (props) => {
  const { user, onLogout, voluntarios, ocorrencias, allVoluntarios, allOcorrencias, allRecursos, riskZones, activation, geofenceAlerts, climateAlerts, sosAlerts, dismissSosAlert, dismissGeofenceAlert, dismissClimateAlert, eventLog, volunteerHistory, assignVolunteersToOcorrencia, assignTeamToOcorrencia, updateOcorrenciaStatus, updateOcorrenciaPriority, addOcorrencia, updateOcorrencia, deleteOcorrencia, addVolunteer, updateVolunteer, deleteVolunteer, addRiskZone, updateRiskZone, deleteRiskZone, dateFilter, setDateFilter, clearDateFilter, chatMessages, sendChatMessage, onRequestSOS, assignResourcesToOcorrencia, teams, notificationSettings, updateNotificationSettings, transientMessages, dismissTransientMessage, queueTransientMessage } = props;
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [detailPanelTab, setDetailPanelTab] = useState<'details' | 'chat'>('details');
  const [viewingHistoryFor, setViewingHistoryFor] = useState<Voluntario | null>(null);
  const [volunteerHistoryPath, setVolunteerHistoryPath] = useState<Array<[number, number]> | null>(null);
  const [assignedRoute, setAssignedRoute] = useState<any | null>(null);
  const [selectedOcorrenciaRoutes, setSelectedOcorrenciaRoutes] = useState<any[]>([]);
  const [isAdminZonasOpen, setAdminZonasOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<RiskZone | null>(null);
  const [isHistoryPanelOpen, setHistoryPanelOpen] = useState(false);
  const [isDataManagementPanelOpen, setDataManagementPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [center, setCenter] = useState({ lat: -32.035, lng: -52.0986 });
  const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(center.lat, center.lng);
  const mapControlRef = useRef<MapControlHandles>(null);
  const [newestIncidentId, setNewestIncidentId] = useState<string | null>(null);
  const [isLeftPanelVisible, setLeftPanelVisible] = useState(false);
  const [highlightedAlert, setHighlightedAlert] = useState<{ id: string; lat: number; lng: number; } | null>(null);

  const [mapPrefs, setMapPrefs] = useState<MapPreferences>(() => {
    const saved = getItem<MapPreferences>(MAP_PREFERENCES_KEY);
    const defaults: MapPreferences = {
        showVoluntarios: true,
        showOcorrencias: true,
        showRiskZones: true,
        showRoutes: true,
        showHeatmap: false,
        heatmapRadius: 30,
        heatmapIntensity: 0.5,
        filterTipo: [],
        filterStatus: 'Aberta',
        filterGravidade: [],
        isDashboardOpen: true,
        isEventLogOpen: true,
    };
    return { ...defaults, ...saved };
  });

  useEffect(() => {
    setItem(MAP_PREFERENCES_KEY, mapPrefs);
  }, [mapPrefs]);
  
  const triggerHighlight = useCallback((alert: {id: string; lat: number; lng: number;}) => {
    setHighlightedAlert(alert);
    mapControlRef.current?.panToLocation(alert.lat, alert.lng);
    setTimeout(() => {
        setHighlightedAlert(prev => (prev?.id === alert.id ? null : prev));
    }, 5000); // Highlight lasts for 5 seconds
  }, []);

  const suggestedVolunteerIds = useMemo(() => {
    if (!selectedOcorrencia || typeof turf === 'undefined') {
      return [];
    }
    const ocorrenciaPoint = turf.point([selectedOcorrencia.longitude, selectedOcorrencia.latitude]);
    const availableVolunteers = allVoluntarios.filter((v: Voluntario) => v.status === 'Disponível');

    const volunteersWithDistance = availableVolunteers
      .map((volunteer: Voluntario) => {
        const volunteerPoint = turf.point([volunteer.longitude, volunteer.latitude]);
        const distance = turf.distance(ocorrenciaPoint, volunteerPoint, { units: 'kilometers' });
        
        // Qualification check
        const hasRequiredQual = !selectedOcorrencia.requiredQualifications ||
            selectedOcorrencia.requiredQualifications.length === 0 ||
            selectedOcorrencia.requiredQualifications.some(q => volunteer.qualifications?.includes(q));

        if (!hasRequiredQual) {
            return null;
        }

        return { id: volunteer.id, distance };
      })
      .filter((v): v is { id: string, distance: number } => v !== null);

    volunteersWithDistance.sort((a, b) => a.distance - b.distance);
    
    return volunteersWithDistance.slice(0, 3).map(v => v.id);

  }, [selectedOcorrencia, allVoluntarios]);

  useEffect(() => {
    if (notificationSettings.browser && Notification.permission === "default") {
        Notification.requestPermission();
    }
  }, [notificationSettings.browser]);

  const usePrevious = <T,>(value: T): T | undefined => {
    const ref = useRef<T>();
    useEffect(() => { ref.current = value; });
    return ref.current;
  };
  
  const showNotification = (title: string, options: NotificationOptions) => {
    if (Notification.permission === 'granted') {
        new Notification(title, options);
    }
  };

  // Sound & Push Notifications & Map Highlights
  const prevSosAlerts = usePrevious(sosAlerts);
  useEffect(() => {
    if (sosAlerts.length > (prevSosAlerts?.length || 0)) {
        const newAlert = sosAlerts.find(a => !(prevSosAlerts || []).some(pa => pa.id === a.id));
        if (newAlert) {
            triggerHighlight({ id: newAlert.id, lat: newAlert.location.lat, lng: newAlert.location.lng });
            if(notificationSettings.sounds.sos) playNotificationSound('sos', notificationSettings.volumes.sos);
            if(notificationSettings.browser) {
                showNotification('ALERTA DE SOS', {
                    body: `Voluntário ${newAlert.volunteerName} precisa de ajuda!`,
                    icon: '/vite.svg',
                    tag: newAlert.id
                });
            }
        }
    }
  }, [sosAlerts, prevSosAlerts, notificationSettings, triggerHighlight]);
  
  const prevGeofenceAlerts = usePrevious(geofenceAlerts);
  useEffect(() => {
      if (geofenceAlerts.length > (prevGeofenceAlerts?.length || 0)) {
          const newAlert = geofenceAlerts.find(a => !(prevGeofenceAlerts || []).some(pa => pa.id === a.id));
          if (newAlert) {
              const volunteer = allVoluntarios.find((v: Voluntario) => v.nome === newAlert.volunteerName);
              if (volunteer) {
                  triggerHighlight({ id: newAlert.id, lat: volunteer.latitude, lng: volunteer.longitude });
              }
          }
      }
  }, [geofenceAlerts, prevGeofenceAlerts, allVoluntarios, triggerHighlight]);

  const prevClimateAlerts = usePrevious(climateAlerts);
  useEffect(() => {
    if (climateAlerts.length > (prevClimateAlerts?.length || 0)) {
        const newAlert = climateAlerts.find((a: any) => !(prevClimateAlerts || []).some((pa: any) => pa.id === a.id));
        if (newAlert) {
            if (newAlert.areaCoordinates) {
                 try {
                    const polygon = turf.polygon(newAlert.areaCoordinates.coordinates);
                    const centerOfMass = turf.centerOfMass(polygon);
                    const [lng, lat] = centerOfMass.geometry.coordinates;
                    triggerHighlight({ id: newAlert.id, lat, lng });
                 } catch(e) { console.error("Could not find center of climate alert area", e); }
            }
            if (newAlert.severity === 'extreme') {
                if(notificationSettings.sounds.climate_extreme) playNotificationSound('climate_extreme', notificationSettings.volumes.climate_extreme);
                if(notificationSettings.browser) {
                    showNotification(`ALERTA CLIMÁTICO EXTREMO: ${newAlert.title}`, {
                        body: newAlert.description,
                        icon: '/vite.svg',
                        tag: newAlert.id
                    });
                }
            }
        }
    }
  }, [climateAlerts, prevClimateAlerts, notificationSettings, triggerHighlight]);

  useEffect(() => {
    if (ocorrencias.length > 0 && allOcorrencias.length > ocorrencias.length) {
      const latestOcorrencia = ocorrencias.reduce((latest: any, current: any) => new Date(latest.timestamp!) > new Date(current.timestamp!) ? latest : current);
      if (latestOcorrencia.id !== newestIncidentId) {
        setNewestIncidentId(latestOcorrencia.id);
        if(notificationSettings.sounds.occurrence) playNotificationSound('occurrence', notificationSettings.volumes.occurrence);
      }
    }
  }, [ocorrencias, allOcorrencias, newestIncidentId, notificationSettings]);

  const criticalAlertsCount = useMemo(() => sosAlerts.length + climateAlerts.filter((a: any) => a.severity === 'extreme').length, [sosAlerts, climateAlerts]);

  const clearSelection = useCallback(() => {
    setSelectedOcorrencia(null);
    setViewingHistoryFor(null);
    setVolunteerHistoryPath(null);
    setAssignedRoute(null);
    setSelectedOcorrenciaRoutes([]);
  }, []);

  const handleOcorrenciaSelect = useCallback((ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setDetailPanelTab('details');
    setViewingHistoryFor(null);
    setVolunteerHistoryPath(null);
    setAssignedRoute(null);

    const routes = (ocorrencia.assignedVolunteerIds || [])
      .map(id => allVoluntarios.find((v: Voluntario) => v.id === id))
      .filter((v: Voluntario | undefined): v is Voluntario => !!v && !!v.routeGeometry)
      .map((v: Voluntario) => v.routeGeometry!);
    setSelectedOcorrenciaRoutes(routes);
    
    if(mapControlRef.current) mapControlRef.current.panToLocation(ocorrencia.latitude, ocorrencia.longitude);
  }, [allVoluntarios]);
  
  const filteredOcorrencias = useMemo(() => {
    return ocorrencias.filter((o: Ocorrencia) => {
        if (!mapPrefs.showOcorrencias) return false;
        const matchesTipo = mapPrefs.filterTipo.length === 0 || mapPrefs.filterTipo.includes(o.tipo);
        const matchesStatus = mapPrefs.filterStatus === 'all' || o.status === mapPrefs.filterStatus;
        const matchesGravidade = mapPrefs.filterGravidade.length === 0 || mapPrefs.filterGravidade.includes(o.gravidade || 'Moderado');
        return matchesTipo && matchesStatus && matchesGravidade;
    });
  }, [ocorrencias, mapPrefs]);
  
  const handleSearchSelect = (selection: SearchSuggestion) => {
    switch (selection.type) {
      case 'location': mapControlRef.current?.searchLocation(parseFloat(selection.data.lat), parseFloat(selection.data.lon), selection.data.display_name); break;
      case 'volunteer': mapControlRef.current?.panToLocation(selection.data.latitude, selection.data.longitude); break;
      case 'ocorrencia': handleOcorrenciaSelect(selection.data); break;
    }
  };
  
  const handleViewVolunteerHistoryPath = useCallback((volunteerId: string) => {
    const volunteer = allVoluntarios.find((v: Voluntario) => v.id === volunteerId);
    if(volunteer && volunteerHistory[volunteer.id]) {
      const path = volunteerHistory[volunteer.id].map((p: {lat: number, lng: number}) => [p.lat, p.lng] as [number, number]);
      clearSelection();
      setVolunteerHistoryPath(path);
      setViewingHistoryFor(volunteer);
    }
  }, [allVoluntarios, volunteerHistory, clearSelection]);

  const handleViewAssignedRoute = useCallback((volunteerId: string) => {
    const volunteer = allVoluntarios.find((v: Voluntario) => v.id === volunteerId);
    if (volunteer && volunteer.routeGeometry) {
        clearSelection();
        setAssignedRoute(volunteer.routeGeometry);
        setViewingHistoryFor(volunteer); 
    }
  }, [allVoluntarios, clearSelection]);

  const handleAssignVolunteers = (volunteerIds: string[]) => {
    if (selectedOcorrencia) {
      assignVolunteersToOcorrencia(volunteerIds, selectedOcorrencia.id, user.name);
      setSelectedOcorrencia(null);
    }
  };

  const handleAssignRecursos = (recursoIds: string[]) => {
      if (selectedOcorrencia) { assignResourcesToOcorrencia(recursoIds, selectedOcorrencia.id, user.name); }
  };

  const handleOpenSosChat = (ocorrenciaId: string) => {
      const ocorrencia = allOcorrencias.find((o: Ocorrencia) => o.id === ocorrenciaId);
      if(ocorrencia) { setSelectedOcorrencia(ocorrencia); setDetailPanelTab('chat'); }
  };

  return (
    <div className="h-full w-full flex">
      {/* Mobile Menu Toggle & Backdrop */}
      <button 
        onClick={() => setLeftPanelVisible(!isLeftPanelVisible)} 
        className="md:hidden fixed top-4 left-4 z-[1200] p-2 bg-gray-800/80 backdrop-blur-md rounded-lg text-white shadow-lg"
        aria-label="Toggle menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
      {isLeftPanelVisible && <div onClick={() => setLeftPanelVisible(false)} className="md:hidden fixed inset-0 bg-black/50 z-[1099]"></div>}

      {/* Left Side Panel Container */}
      <div className={`fixed inset-y-0 left-0 w-80 z-[1100] bg-gray-800/90 backdrop-blur-md transition-transform duration-300 ease-in-out md:relative md:w-80 md:translate-x-0 flex-shrink-0 ${isLeftPanelVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full overflow-y-auto p-4 space-y-4">
          <MapControls
              operatorName={user.name} onLogout={onLogout}
              showVoluntarios={mapPrefs.showVoluntarios} setShowVoluntarios={(v) => setMapPrefs(p => ({...p, showVoluntarios: v}))}
              showOcorrencias={mapPrefs.showOcorrencias} setShowOcorrencias={(v) => setMapPrefs(p => ({...p, showOcorrencias: v}))}
              showRiskZones={mapPrefs.showRiskZones} setShowRiskZones={(v) => setMapPrefs(p => ({...p, showRiskZones: v}))}
              showRoutes={mapPrefs.showRoutes} setShowRoutes={(v) => setMapPrefs(p => ({...p, showRoutes: v}))}
              showHeatmap={mapPrefs.showHeatmap} setShowHeatmap={(v) => setMapPrefs(p => ({...p, showHeatmap: v}))}
              heatmapRadius={mapPrefs.heatmapRadius} setHeatmapRadius={(v) => setMapPrefs(p => ({...p, heatmapRadius: v}))}
              heatmapIntensity={mapPrefs.heatmapIntensity} setHeatmapIntensity={(v) => setMapPrefs(p => ({...p, heatmapIntensity: v}))}
              onLocateUser={() => mapControlRef.current?.locateUser()}
              onResetView={clearSelection}
              onOpenHistoryPanel={() => setHistoryPanelOpen(true)}
              onOpenRiskZoneAdmin={() => { setAdminZonasOpen(true); setZoneToEdit(null); }}
              onOpenSettingsPanel={() => setSettingsPanelOpen(true)} 
              onToggleDashboard={() => setMapPrefs(p => ({...p, isDashboardOpen: !p.isDashboardOpen}))}
              isDashboardOpen={mapPrefs.isDashboardOpen} 
              onToggleEventLog={() => setMapPrefs(p => ({...p, isEventLogOpen: !p.isEventLogOpen}))}
              isEventLogOpen={mapPrefs.isEventLogOpen} 
              onOpenDataManagementPanel={() => setDataManagementPanelOpen(true)}
              ocorrenciaCount={filteredOcorrencias.length} riskZoneCount={riskZones.length}
              volunteerCount={voluntarios.length}
              filterTipo={mapPrefs.filterTipo} onToggleTipoFilter={(tipo: string) => setMapPrefs(p => ({...p, filterTipo: p.filterTipo.includes(tipo) ? p.filterTipo.filter(t => t !== tipo) : [...p.filterTipo, tipo]}))}
              filterStatus={mapPrefs.filterStatus}
              onFilterStatusChange={(value) => setMapPrefs(p => ({...p, filterStatus: value as OcorrenciaStatus | 'all'}))}
              filterGravidade={mapPrefs.filterGravidade} onToggleGravidadeFilter={(g: OcorrenciaGravidade) => setMapPrefs(p => ({...p, filterGravidade: p.filterGravidade.includes(g) ? p.filterGravidade.filter(gr => gr !== g) : [...p.filterGravidade, g]}))}
              ocorrenciaTipos={Array.from(new Set(allOcorrencias.map((o: Ocorrencia) => o.tipo)))}
              selectedOcorrencia={selectedOcorrencia} onClearSelection={clearSelection}
              viewingHistoryFor={viewingHistoryFor}
              dateFilter={dateFilter} setDateFilter={setDateFilter} clearDateFilter={clearDateFilter}
          />
          {mapPrefs.isDashboardOpen && <DashboardPanel voluntarios={voluntarios} ocorrencias={ocorrencias} criticalAlertsCount={criticalAlertsCount} />}
          <WeatherDisplay weatherData={weatherData} loading={weatherLoading} error={weatherError} />
          {mapPrefs.isEventLogOpen && <EventLogPanel events={eventLog} onEventClick={(lat, lng) => mapControlRef.current?.panToLocation(lat, lng)} />}
        </div>
      </div>

      <div className="flex-grow h-full relative">
        <LeafletMap
          ref={mapControlRef} 
          voluntarios={voluntarios.filter((v: Voluntario) => mapPrefs.showVoluntarios)} 
          ocorrencias={filteredOcorrencias}
          heatmapOcorrencias={allOcorrencias}
          riskZones={mapPrefs.showRiskZones ? riskZones : []} 
          climateAlerts={climateAlerts} 
          activation={activation}
          showHeatmap={mapPrefs.showHeatmap} 
          heatmapRadius={mapPrefs.heatmapRadius} 
          heatmapIntensity={mapPrefs.heatmapIntensity}
          showRoutes={mapPrefs.showRoutes} 
          newestIncidentId={newestIncidentId}
          selectedOcorrenciaId={selectedOcorrencia?.id} onOcorrenciaSelect={handleOcorrenciaSelect}
          onClearSelection={clearSelection} onViewChange={(newCenter) => setCenter(newCenter)}
          onViewVolunteerPath={handleViewVolunteerHistoryPath} onViewAssignedRoute={handleViewAssignedRoute}
          onEditRiskZone={(zone) => { setAdminZonasOpen(true); setZoneToEdit(zone); }}
          onDeleteRiskZone={(zoneId) => deleteRiskZone(zoneId, user.name)}
          volunteerHistoryPath={volunteerHistoryPath} assignedRoute={assignedRoute}
          highlightedRoutes={selectedOcorrenciaRoutes}
          highlightedAlert={highlightedAlert}
          onLocationError={(message) => queueTransientMessage(`Erro de localização: ${message}`, 'error')}
        />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-96 max-w-[calc(100%-8rem)]"><SearchBar onSelect={handleSearchSelect} voluntarios={allVoluntarios} ocorrencias={allOcorrencias} /></div>
        <div className="absolute top-4 left-4 z-[2500] w-72">
            {transientMessages.map((msg: {id: string; text: string; type: 'info' | 'success' | 'error' | 'warning'}) => {
                if (msg.type === 'error') {
                    return <ErrorToast key={msg.id} message={msg.text} onDismiss={() => dismissTransientMessage(msg.id)} />
                }
                return <InfoToast key={msg.id} message={msg.text} onDismiss={() => dismissTransientMessage(msg.id)} />;
            })}
        </div>

        <AlertsPanel 
            sosAlerts={sosAlerts} geofenceAlerts={geofenceAlerts} climateAlerts={climateAlerts} activation={activation}
            onDismissSos={dismissSosAlert} onDismissGeofence={dismissGeofenceAlert} onDismissClimate={dismissClimateAlert}
            onLocateSos={(lat, lng) => mapControlRef.current?.panToLocation(lat, lng)} onOpenSosChat={handleOpenSosChat}
            highlightedAlertId={highlightedAlert?.id}
        />
        {selectedOcorrencia && (
          <OcorrenciaDetailsPanel
            ocorrencia={selectedOcorrencia}
            onClose={clearSelection}
            availableVolunteers={allVoluntarios.filter((v: Voluntario) => v.status === 'Disponível')}
            assignedVolunteers={allVoluntarios.filter((v: Voluntario) => selectedOcorrencia.assignedVolunteerIds?.includes(v.id))}
            allTeams={teams}
            suggestedVolunteerIds={suggestedVolunteerIds}
            availableRecursos={allRecursos}
            chatMessages={chatMessages.filter((m: ChatMessage) => m.ocorrenciaId === selectedOcorrencia.id)}
            user={user}
            onAssignVolunteers={handleAssignVolunteers}
            onAssignRecursos={handleAssignRecursos}
            onSendMessage={(msg, type) => sendChatMessage(selectedOcorrencia.id, msg, user.id, user.name, type, 'internal')}
            onUpdatePriority={(priority) => updateOcorrenciaPriority(selectedOcorrencia.id, priority, user.name)}
            onUpdateStatus={(status) => updateOcorrenciaStatus(selectedOcorrencia.id, status, user.name)}
            onViewHistory={handleViewVolunteerHistoryPath}
            initialTab={detailPanelTab}
          />
        )}
        {isHistoryPanelOpen && <HistoryPanel onClose={() => setHistoryPanelOpen(false)} onApply={(start, end) => setDateFilter({start, end})} onClear={clearDateFilter} ocorrencias={allOcorrencias} voluntarios={allVoluntarios} />}
        {isAdminZonasOpen && <AdminZonas onClose={() => setAdminZonasOpen(false)} onSave={(zone) => 'id' in zone ? updateRiskZone(zone, user.name) : addRiskZone(zone, user.name)} initialCenter={[center.lat, center.lng]} zoneToEdit={zoneToEdit} />}
        {isDataManagementPanelOpen && <DataManagementPanel onClose={() => setDataManagementPanelOpen(false)} operatorName={user.name} voluntarios={allVoluntarios} ocorrencias={allOcorrencias} onAddVolunteer={addVolunteer} onUpdateVolunteer={updateVolunteer} onDeleteVolunteer={deleteVolunteer} onAddOcorrencia={addOcorrencia} onUpdateOcorrencia={updateOcorrencia} onDeleteOcorrencia={deleteOcorrencia} />}
        {isSettingsPanelOpen && <NotificationSettingsPanel settings={notificationSettings} onUpdate={updateNotificationSettings} onClose={() => setSettingsPanelOpen(false)} />}
        {dateFilter && <HistoricalNotification range={dateFilter} />}
      </div>
    </div>
  );
};