import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Voluntario, Ocorrencia, VolunteerStatus, User, ChatMessage, OcorrenciaGravidade, MapControlHandles, SystemConfig, OcorrenciaPrioridade } from '../types';
import { UserIcon, ExclamationTriangleIcon, MapPinIcon, ArrowRightOnRectangleIcon, CheckCircleIcon, ShieldExclamationIcon, ChatBubbleLeftRightIcon, SparklesIcon, GlobeAltIcon, XMarkIcon, ClockIcon, UserGroupIcon, PhoneIcon, WhatsAppIcon, HomeIcon, InformationCircleIcon, ArrowUpIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from './icons';
import { ChatPanel } from './ChatPanel';
import LeafletMap from './LeafletMap';
import GeminiQuickGuide from './GeminiQuickGuide';
import SuccessToast from './SuccessToast';
import { useWeatherData } from '../hooks/useWeatherData';
import WeatherDisplay from './WeatherDisplay';
import EmergencyContactsModal from './EmergencyContactsModal';

declare const L: any;

interface VolunteerPortalProps {
  user: User;
  volunteer: Voluntario;
  assignedOcorrencia?: Ocorrencia | null;
  allOpenOcorrencias: Ocorrencia[];
  onUpdateStatus: (status: VolunteerStatus) => void;
  onCompleteMission: (ocorrenciaId: string) => void;
  onLogout: () => void;
  chatMessages: ChatMessage[];
  onAddChatMessage: (message: string, type: 'text' | 'audio') => void;
  onRequestSOS: (volunteerId: string, volunteerName: string) => void;
  onSupportRequest: (volunteerId: string) => void;
  onCheckIn: (volunteerId: string, status: 'ok' | 'overdue') => void;
  onAcceptMission: (ocorrenciaId: string) => void;
  onUpdateVolunteer: (volunteer: Voluntario) => void;
  systemConfig: SystemConfig;
  allVoluntarios: Voluntario[];
}

const CHECKIN_INTERVAL = 1 * 60 * 1000; // For demo: 1 minute
const CHECKIN_DEADLINE = 15 * 1000; // For demo: 15 seconds

const NavigationPanel: React.FC<{
  steps: any[];
  onClose: () => void;
  onPanToLocation: (location: [number, number]) => void;
}> = ({ steps, onClose, onPanToLocation }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Pan to the first step when the panel opens
    if (steps.length > 0) {
      onPanToLocation(steps[0].maneuver.location);
    }
  }, [steps, onPanToLocation]);

  const handleStepSelect = (index: number) => {
    setCurrentStepIndex(index);
    onPanToLocation(steps[index].maneuver.location);
  };
  
  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      handleStepSelect(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleStepSelect(currentStepIndex - 1);
    }
  };

  const ManeuverIcon: React.FC<{ maneuver: any, className?: string }> = ({ maneuver, className = "h-12 w-12" }) => {
    const { type, modifier } = maneuver;

    if (type === 'arrive') return <MapPinIcon className={className} />;
    if (modifier?.includes('uturn')) {
      return modifier.includes('left') ? <ArrowUturnLeftIcon className={className} /> : <ArrowUturnRightIcon className={className} />;
    }
    if (modifier?.includes('left')) return <ArrowLeftIcon className={className} />;
    if (modifier?.includes('right')) return <ArrowRightIcon className={className} />;

    return <ArrowUpIcon className={className} />; // Default for straight, depart, continue etc.
  };

  const formatDistance = (meters: number) => {
    if (meters > 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
        <h2 className="text-xl font-bold">Navegação da Rota</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700"><XMarkIcon className="h-5 w-5"/></button>
      </div>

      {currentStep && (
        <div className="p-6 bg-gray-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-cyan-400"><ManeuverIcon maneuver={currentStep.maneuver} /></div>
            <div>
              <p className="text-2xl font-bold">{formatDistance(currentStep.distance)}</p>
              <p className="text-gray-300">{currentStep.name || 'Continue em frente'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        <ul className="divide-y divide-gray-700">
          {steps.map((step, index) => (
            <li key={index}>
              <button 
                onClick={() => handleStepSelect(index)}
                className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${index === currentStepIndex ? 'bg-cyan-900/50' : 'hover:bg-gray-700/50'}`}
              >
                <div className="text-gray-400"><ManeuverIcon maneuver={step.maneuver} className="h-6 w-6" /></div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold">{step.name || 'Continue em frente'}</p>
                  <p className="text-xs text-gray-500">{formatDistance(step.distance)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-3 border-t border-gray-700 flex justify-between items-center flex-shrink-0">
        <button onClick={handlePrev} disabled={currentStepIndex === 0} className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50">Anterior</button>
        <span className="text-sm font-mono">{currentStepIndex + 1} / {steps.length}</span>
        <button onClick={handleNext} disabled={currentStepIndex === steps.length - 1} className="px-4 py-2 bg-gray-700 rounded-md disabled:opacity-50">Próximo</button>
      </div>
    </div>
  );
};


const ProfileEditModal: React.FC<{
  volunteer: Voluntario;
  onClose: () => void;
  onSave: (updatedData: Partial<Voluntario>) => void;
  availableQualifications: string[];
}> = ({ volunteer, onClose, onSave, availableQualifications }) => {
  const [pictureUrl, setPictureUrl] = useState(volunteer.profilePictureUrl || '');
  const [selectedQuals, setSelectedQuals] = useState(new Set(volunteer.qualifications || []));

  const handleQualToggle = (qual: string) => {
    setSelectedQuals(prev => {
        const newSet = new Set(prev);
        if (newSet.has(qual)) {
            newSet.delete(qual);
        } else {
            newSet.add(qual);
        }
        return newSet;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      profilePictureUrl: pictureUrl,
      qualifications: Array.from(selectedQuals),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[6000] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Editar Perfil</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><XMarkIcon className="h-5 w-5"/></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label htmlFor="profile-pic-url" className="block text-sm font-medium text-gray-300 mb-1">URL da Foto de Perfil</label>
                <input
                    id="profile-pic-url"
                    type="url"
                    value={pictureUrl}
                    onChange={(e) => setPictureUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Qualificações</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableQualifications.map(qual => (
                        <label key={qual} className={`flex items-center p-2 rounded-md cursor-pointer transition-colors text-sm ${selectedQuals.has(qual) ? 'bg-cyan-900/50' : 'bg-gray-700/50'}`}>
                            <input
                                type="checkbox"
                                checked={selectedQuals.has(qual)}
                                onChange={() => handleQualToggle(qual)}
                                className="hidden"
                            />
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-2 flex-shrink-0 ${selectedQuals.has(qual) ? 'bg-cyan-500 border-cyan-400' : 'border-gray-500 bg-gray-800'}`}>
                                {selectedQuals.has(qual) && <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                           {qual}
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Salvar</button>
            </div>
        </form>
      </div>
    </div>
  );
};


const GravidadeBadge: React.FC<{ gravidade: OcorrenciaGravidade }> = ({ gravidade }) => {
    const styles = {
        'Crítico': { text: 'text-red-400' },
        'Moderado': { text: 'text-yellow-400' },
        'Controle': { text: 'text-green-400' }
    };
    const style = styles[gravidade] || styles['Moderado'];
    return <span className={`font-bold ${style.text}`}>{gravidade}</span>;
}

const statusOptions: { value: VolunteerStatus; label: string; icon: React.ReactNode; }[] = [
    { value: 'Disponível', label: 'Disponível', icon: <GlobeAltIcon className="h-5 w-5 mr-3"/> },
    { value: 'Em Missão', label: 'Em Missão', icon: <ExclamationTriangleIcon className="h-5 w-5 mr-3"/> },
    { value: 'Retornando', label: 'Retornando para Base', icon: <HomeIcon className="h-5 w-5 mr-3"/> },
    { value: 'Inativo', label: 'Inativo / Indisponível', icon: <UserIcon className="h-5 w-5 mr-3"/> }
];


const VitimasDetails: React.FC<{ vitimas: Ocorrencia['vitimas'] }> = ({ vitimas }) => {
    if (!vitimas) return <p className="text-sm text-gray-500 mt-1">Nenhuma vítima informada.</p>;
    const items = [{ label: "Adultos", value: vitimas.adultos }, { label: "Crianças", value: vitimas.criancas }, { label: "Idosos", value: vitimas.idosos }, { label: "PCD", value: vitimas.pcd }, { label: "Animais", value: vitimas.animais }];
    const hasVitimas = items.some(i => i.value > 0);
    if (!hasVitimas) return <p className="text-sm text-gray-500 mt-1">Nenhuma vítima informada.</p>;
    return (
      <div className="grid grid-cols-3 gap-2 mt-2">
        {items.filter(i => i.value > 0).map(item => (
          <div key={item.label} className="bg-gray-900/50 p-2 rounded text-center">
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="font-bold text-lg text-white">{item.value}</p>
          </div>
        ))}
      </div>
    );
};

const priorityStyles: Record<OcorrenciaPrioridade, { color: string, label: string }> = {
    'Urgente': { color: 'text-red-400', label: 'Urgente' },
    'Alta': { color: 'text-orange-400', label: 'Alta' },
    'Normal': { color: 'text-yellow-400', label: 'Normal' },
    'Baixa': { color: 'text-gray-400', label: 'Baixa' }
};

export const VolunteerPortal: React.FC<VolunteerPortalProps> = ({ user, volunteer, assignedOcorrencia, allOpenOcorrencias, allVoluntarios, onUpdateStatus, onCompleteMission, onLogout, chatMessages, onAddChatMessage, onRequestSOS, onSupportRequest, onCheckIn, onAcceptMission, onUpdateVolunteer, systemConfig }) => {
  
  const [commsTab, setCommsTab] = useState<'chat' | 'ia'>('chat');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(CHECKIN_DEADLINE / 1000);
  const [selectedOpenOcorrencia, setSelectedOpenOcorrencia] = useState<Ocorrencia | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showStatusToast, setShowStatusToast] = useState(false);
  const [statusToastMessage, setStatusToastMessage] = useState('');
  const [navigationMode, setNavigationMode] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapControlHandles>(null);

  const { weatherData, loading: weatherLoading, error: weatherError } = useWeatherData(volunteer.latitude, volunteer.longitude);

  const teammates = useMemo(() => {
    if (!assignedOcorrencia) return [];
    return allVoluntarios.filter(v =>
        v.id !== volunteer.id &&
        assignedOcorrencia.assignedVolunteerIds?.includes(v.id)
    );
  }, [assignedOcorrencia, allVoluntarios, volunteer.id]);

  useEffect(() => {
    if (assignedOcorrencia && volunteer.routeGeometry && mapRef.current) {
        const coords = volunteer.routeGeometry.coordinates;
        if (coords && coords.length > 0) {
            // OSRM/GeoJSON provides [lng, lat], Leaflet needs [lat, lng]
            const latLngs = coords.map((coord: [number, number]) => [coord[1], coord[0]]);
            const bounds = L.latLngBounds(latLngs);
            mapRef.current.fitToBounds(bounds);
        }
    }
  }, [assignedOcorrencia, volunteer.routeGeometry]);
  
  // Check-in logic
  useEffect(() => {
    const handleCheckInFail = () => {
        onCheckIn(volunteer.id, 'overdue');
    };

    const startTimer = () => {
        setCheckInCountdown(CHECKIN_DEADLINE / 1000);
        setShowCheckIn(true);
        timerRef.current = setInterval(() => {
            setCheckInCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setShowCheckIn(false);
                    handleCheckInFail();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const interval = setInterval(startTimer, CHECKIN_INTERVAL);
    return () => {
        clearInterval(interval);
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onCheckIn, volunteer.id]);
  
  const handleCheckIn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowCheckIn(false);
    onCheckIn(volunteer.id, 'ok');
  };

  const handleStatusChange = (newStatus: VolunteerStatus) => {
    if (newStatus !== volunteer.status) {
        onUpdateStatus(newStatus);
        setStatusToastMessage(`Status alterado para: ${newStatus}`);
        setShowStatusToast(true);
        setTimeout(() => setShowStatusToast(false), 3000);
    }
  };
  
  const handleSaveProfile = (updatedData: Partial<Voluntario>) => {
    onUpdateVolunteer({ ...volunteer, ...updatedData });
  };
  
  const renderContent = () => {
    if (volunteer.status === 'Em Perigo') {
      return (
        <div className="text-center p-8 bg-red-900/50 rounded-lg border-2 border-red-500 animate-pulse-strong">
          <ShieldExclamationIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">SINAL DE SOS ATIVADO</h2>
          <p className="mt-2 text-red-200">Seu pedido de socorro foi enviado. Permaneça em um local seguro, se possível. A equipe de resgate já foi notificada.</p>
        </div>
      );
    }

    if (assignedOcorrencia) {
      return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">Missão Ativa: <span className="text-cyan-400">{assignedOcorrencia.tipo}</span></h3>
              <p className="text-xs text-gray-400 font-mono">OC: {assignedOcorrencia.code}</p>
            </div>
            <p className={`font-bold text-sm ${priorityStyles[assignedOcorrencia.prioridade].color}`}>{priorityStyles[assignedOcorrencia.prioridade].label}</p>
          </div>
          <div className="text-sm space-y-1">
            <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-400"/> {assignedOcorrencia.endereco ? `${assignedOcorrencia.endereco.logradouro}, ${assignedOcorrencia.endereco.numero}` : 'Localização GPS'}</p>
            <p className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-gray-400"/> ETA: <span className="font-semibold text-white">{volunteer.eta || 'Calculando...'}</span></p>
             {teammates.length > 0 && <p className="flex items-center gap-2"><UserGroupIcon className="h-4 w-4 text-gray-400"/> Equipe: <span className="font-semibold text-white">{teammates.map(t => t.nome).join(', ')}</span></p>}
          </div>

          <div className="border-t border-gray-700 pt-3">
             <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Detalhes da Missão</h4>
             <p className="text-sm bg-gray-900/50 p-3 rounded-md">{assignedOcorrencia.descricao}</p>
          </div>

          {assignedOcorrencia.vitimas && <VitimasDetails vitimas={assignedOcorrencia.vitimas} />}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button onClick={() => setNavigationMode(true)} disabled={!volunteer.routeSteps || volunteer.routeSteps.length === 0} className="flex-1 text-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-600">Ver Rota</button>
            <button onClick={() => onCompleteMission(assignedOcorrencia.id)} className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm">Missão Concluída</button>
          </div>
        </div>
      );
    }

    const suggestedMission = allOpenOcorrencias[0];

    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Painel do Voluntário</h2>
        {suggestedMission ? (
          <div className="bg-blue-900/50 rounded-lg border border-blue-500 p-4 space-y-3">
             <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-blue-300"/> Missão Sugerida</h3>
                  <p className="text-sm text-blue-200">{suggestedMission.tipo}</p>
                </div>
                <GravidadeBadge gravidade={suggestedMission.gravidade || 'Moderado'} />
              </div>
            <p className="text-sm text-blue-300">{suggestedMission.descricao}</p>
            <button onClick={() => onAcceptMission(suggestedMission.id)} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md text-sm">Aceitar Missão</button>
          </div>
        ) : (
          <p className="text-gray-400">Nenhuma missão aberta no momento. Aguardando novas ocorrências.</p>
        )}
      </div>
    );
  };
  
  if (!volunteer) return null; // Should not happen if user role is volunteer

  return (
    <>
      {isEditingProfile && <ProfileEditModal volunteer={volunteer} onClose={() => setIsEditingProfile(false)} onSave={handleSaveProfile} availableQualifications={systemConfig.qualifications} />}
      {showStatusToast && <SuccessToast message={statusToastMessage} />}
      {showContacts && <EmergencyContactsModal contacts={systemConfig.contacts} onClose={() => setShowContacts(false)} />}

      <div className="fixed inset-0 bg-gray-900 z-[3000] p-4 sm:p-6 lg:p-8 flex flex-col animate-fade-in-up text-white">
        <header className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
                <img src={volunteer.profilePictureUrl || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`} alt="Perfil" className="w-12 h-12 rounded-full border-2 border-gray-600"/>
                <button onClick={() => setIsEditingProfile(true)} className="absolute -bottom-1 -right-1 bg-gray-600 p-1 rounded-full text-white hover:bg-cyan-500"><UserIcon className="h-3 w-3"/></button>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-400">{volunteer.status}</p>
            </div>
          </div>
          <button onClick={onLogout} title="Sair" className="p-2 rounded-full bg-gray-700 hover:bg-red-600"><ArrowRightOnRectangleIcon className="h-6 w-6" /></button>
        </header>

        {showCheckIn && (
          <div className="fixed inset-x-4 top-24 z-50 bg-yellow-500 text-black p-4 rounded-lg shadow-lg flex items-center justify-between animate-fade-in-down">
            <div>
              <p className="font-bold">Check-in de Segurança</p>
              <p className="text-sm">Por favor, confirme que está tudo bem.</p>
            </div>
            <button onClick={handleCheckIn} className="bg-black/80 text-white font-bold py-2 px-4 rounded-lg flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2"/> OK ({checkInCountdown}s)
            </button>
          </div>
        )}
        
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-4">
            {renderContent()}
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 border border-gray-700">
               <h3 className="text-xs font-bold uppercase text-gray-500 px-1">Meu Status</h3>
               <select onChange={(e) => handleStatusChange(e.target.value as VolunteerStatus)} value={volunteer.status} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600">
                  {statusOptions.filter(opt => opt.value !== 'Em Missão').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
               </select>
            </div>
             <WeatherDisplay weatherData={weatherData} loading={weatherLoading} error={weatherError} />
             <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 border border-gray-700">
               <h3 className="text-xs font-bold uppercase text-gray-500 px-1">Ações Rápidas</h3>
                <button onClick={() => onSupportRequest(volunteer.id)} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"><InformationCircleIcon className="h-5 w-5 mr-3 text-cyan-400"/> Pedir Suporte (Não-Urgente)</button>
                <button onClick={() => setShowContacts(true)} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center text-sm"><PhoneIcon className="h-5 w-5 mr-3 text-green-400"/> Contatos de Emergência</button>
                <button onClick={() => onRequestSOS(volunteer.id, volunteer.nome)} className="w-full text-left p-3 bg-red-800 hover:bg-red-700 rounded-md flex items-center text-sm font-bold animate-pulse-strong"><ShieldExclamationIcon className="h-5 w-5 mr-3"/> PEDIR SOCORRO (SOS)</button>
             </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6 overflow-hidden">
            <div className={`rounded-lg overflow-hidden border border-gray-700 transition-all duration-300 ${navigationMode ? 'h-1/2' : 'h-2/3'}`}>
              <LeafletMap
                ref={mapRef}
                voluntarios={[volunteer]}
                teammates={teammates}
                ocorrencias={assignedOcorrencia ? [assignedOcorrencia] : []}
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
                selectedOcorrenciaId={assignedOcorrencia?.id}
                assignedRoute={volunteer.routeGeometry}
                onLocationError={(message: string) => alert(`Erro de localização: ${message}`)}
              />
            </div>
            <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 ${navigationMode ? 'h-1/2' : 'h-1/3'}`}>
                {navigationMode ? (
                  <NavigationPanel
                    steps={volunteer.routeSteps || []}
                    onClose={() => setNavigationMode(false)}
                    onPanToLocation={(location) => mapRef.current?.panToLocation(location[1], location[0])}
                  />
                ) : (
                  <>
                    <div className="flex border-b border-gray-700">
                      <button onClick={() => setCommsTab('chat')} className={`flex-1 text-center py-2 text-sm font-bold flex items-center justify-center gap-2 ${commsTab==='chat' ? 'bg-gray-700/50' : 'text-gray-400 hover:bg-gray-700/30'}`}><ChatBubbleLeftRightIcon className="h-5 w-5"/> Chat</button>
                      <button onClick={() => setCommsTab('ia')} className={`flex-1 text-center py-2 text-sm font-bold flex items-center justify-center gap-2 ${commsTab==='ia' ? 'bg-gray-700/50' : 'text-gray-400 hover:bg-gray-700/30'}`}><SparklesIcon className="h-5 w-5"/> Guia Rápido IA</button>
                    </div>
                    {commsTab === 'chat' && assignedOcorrencia && (
                      <ChatPanel user={user} ocorrencia={assignedOcorrencia} messages={chatMessages} onSendMessage={onAddChatMessage} />
                    )}
                    {commsTab === 'ia' && (
                        <GeminiQuickGuide />
                    )}
                    {!assignedOcorrencia && commsTab === 'chat' && (
                      <div className="h-full flex items-center justify-center text-center p-4">
                        <p className="text-gray-500">O chat fica disponível quando você está em uma missão.</p>
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};