import React, { useMemo, useEffect } from 'react';
import { useRealtimeMapData } from './hooks/useRealtimeMapData';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import CitizenPortal from './components/CitizenPortal';
import { MapPage } from './components/MapPage';
import { VolunteerPortal } from './components/VolunteerPortal';
import TelefonistaPortal from './components/TelefonistaPortal';
import { AdminPortal } from './components/AdminPortal';
import { LoadingSpinner } from './components/icons';
import type { User, Voluntario, Ocorrencia, HelpRequestData, ChatMessage } from './types';
import { logOut } from './services/authService';

type AppUser = User & { activeOcorrenciaId?: string };

interface AppProps {
  user: AppUser | null;
  setAppUser: (user: AppUser | null) => void;
  authLoading: boolean;
}

const App: React.FC<AppProps> = ({ user, setAppUser, authLoading }) => {
    const realtimeData = useRealtimeMapData(user); 

    const handleLogout = () => {
        if (user && user.role !== 'cidadao') {
            realtimeData.recordUserLogout(user.id);
        }
        logOut();
    };
    
    const queueHelpRequest = (requestData: HelpRequestData) => {
        const queuedRequests = JSON.parse(localStorage.getItem('queuedHelpRequests') || '[]');
        queuedRequests.push({ ...requestData, userName: user?.name, userId: user?.id });
        localStorage.setItem('queuedHelpRequests', JSON.stringify(queuedRequests));
    };

    const handleHelpRequest = async (requestData: HelpRequestData) => {
        if (!navigator.onLine) {
            queueHelpRequest(requestData);
            realtimeData.queueTransientMessage('Você está offline. O pedido foi salvo e será enviado quando a conexão voltar.', 'warning');
            return;
        }

        const newOcorrencia = await realtimeData.addOcorrencia(
            {
                ...requestData,
                code: requestData.code || `CIT-${Date.now().toString().slice(-6)}`,
                tipo: requestData.tipo || 'Pedido de Ajuda',
                status: 'Aberta',
                prioridade: requestData.prioridade || 'Normal',
                descricao: requestData.descricao || "Descrição não fornecida.",
            },
            user ? user.name : 'Cidadão',
            user?.id
        );
        if (user && user.role === 'cidadao') {
             const citizenWithOcorrencia = { ...user, activeOcorrenciaId: newOcorrencia.id };
             setAppUser(citizenWithOcorrencia); 
        }
    };
    
    useEffect(() => {
        const syncOfflineRequests = async () => {
            const queued = JSON.parse(localStorage.getItem('queuedHelpRequests') || '[]');
            if (queued.length > 0) {
                realtimeData.queueTransientMessage(`Sincronizando ${queued.length} pedido(s) offline...`, 'info');
                try {
                    for (const request of queued) {
                        const { userName, userId, ...requestData } = request;
                        await realtimeData.addOcorrencia(requestData, userName || 'Cidadão (Offline)', userId);
                    }
                    localStorage.removeItem('queuedHelpRequests');
                    realtimeData.queueTransientMessage('Sincronização concluída!', 'success');
                } catch (error) {
                    console.error("Failed to sync offline requests:", error);
                    realtimeData.queueTransientMessage('Falha ao sincronizar pedidos. Tente novamente mais tarde.', 'error');
                }
            }
        };

        window.addEventListener('online', syncOfflineRequests);
        syncOfflineRequests(); 

        return () => {
            window.removeEventListener('online', syncOfflineRequests);
        };
    }, [realtimeData]);


    const citizenOcorrencia = useMemo(() => {
        if (user?.role === 'cidadao' && user.activeOcorrenciaId) {
            return realtimeData.allOcorrencias.find((o: Ocorrencia) => o.id === user.activeOcorrenciaId) || null;
        }
        return null;
    }, [user, realtimeData.allOcorrencias]);

    const assignedVolunteersForCitizen = useMemo(() => {
        if (citizenOcorrencia && citizenOcorrencia.assignedVolunteerIds) {
            return realtimeData.allVoluntarios.filter((v: Voluntario) => citizenOcorrencia.assignedVolunteerIds!.includes(v.id));
        }
        return null;
    }, [citizenOcorrencia, realtimeData.allVoluntarios]);


    const renderContent = () => {
        if (authLoading || realtimeData.loading) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                    <LoadingSpinner className="h-12 w-12" />
                    <span className="ml-4 text-lg">Carregando Sistema...</span>
                </div>
            );
        }
        
        if (!user) {
            return <LoginScreen />;
        }
        
        switch (user.role) {
            case 'cidadao':
                const citizenUser = user || { id: 'user_citizen_temp', name: 'Cidadão', role: 'cidadao', status: 'active', isOnline: true, registrationDate: new Date().toISOString(), sessions: [] };
                return <CitizenPortal 
                            user={citizenUser} 
                            onLogout={handleLogout} 
                            onHelpRequest={handleHelpRequest}
                            ocorrencia={citizenOcorrencia}
                            assignedVolunteers={assignedVolunteersForCitizen}
                            systemConfig={realtimeData.systemConfig}
                            chatMessages={citizenOcorrencia ? realtimeData.chatMessages.filter((m: ChatMessage) => m.ocorrenciaId === citizenOcorrencia?.id) : []}
                            onSendMessage={(ocorrenciaId, msg, type) => realtimeData.sendChatMessage(ocorrenciaId, msg, user.id, user.name, type, 'public')}
                        />;
            case 'voluntario':
                const volunteerData = realtimeData.allVoluntarios.find((v: Voluntario) => v.id === user.volunteerId);
                if (!volunteerData) return <div>Erro: Dados do voluntário não encontrados. Faça logout e tente novamente.</div>;
                
                const assignedOcorrencia = volunteerData.assignedOcorrenciaId ? realtimeData.allOcorrencias.find((o: Ocorrencia) => o.id === volunteerData.assignedOcorrenciaId) : null;

                return <VolunteerPortal 
                            user={user}
                            volunteer={volunteerData}
                            assignedOcorrencia={assignedOcorrencia}
                            allOpenOcorrencias={realtimeData.ocorrencias.filter((o: Ocorrencia) => o.status === 'Aberta')}
                            onUpdateStatus={(status) => realtimeData.updateVolunteerStatus(volunteerData.id, status, user.name)}
                            onCompleteMission={(ocorrenciaId) => {
                                realtimeData.updateOcorrenciaStatus(ocorrenciaId, 'Fechada', user.name);
                                realtimeData.updateVolunteerStatus(volunteerData.id, 'Retornando', user.name);
                            }}
                            onLogout={handleLogout}
                            chatMessages={assignedOcorrencia ? realtimeData.chatMessages.filter((m: ChatMessage) => m.ocorrenciaId === assignedOcorrencia?.id) : []}
                            onAddChatMessage={(msg, type) => assignedOcorrencia && realtimeData.sendChatMessage(assignedOcorrencia.id, msg, user.id, user.name, type, 'internal')}
                            onRequestSOS={(volunteerId, volunteerName) => {
                                realtimeData.updateVolunteerStatus(volunteerId, 'Em Perigo', 'Sistema SOS');
                            }}
                            onSupportRequest={(volunteerId) => realtimeData.logEvent({ type: 'support_request', title: `Pedido de suporte de ${volunteerData.nome}`, description: 'Voluntário solicitou suporte não-urgente.', latitude: volunteerData.latitude, longitude: volunteerData.longitude, operatorName: 'Sistema' })}
                            onCheckIn={(volunteerId, status) => realtimeData.logEvent({ type: 'check_in', title: `Check-in de ${volunteerData.nome}: ${status.toUpperCase()}`, description: status === 'overdue' ? 'CHECK-IN ATRASADO' : 'Check-in de segurança OK', latitude: volunteerData.latitude, longitude: volunteerData.longitude, operatorName: 'Sistema' })}
                            onAcceptMission={(ocorrenciaId) => realtimeData.assignVolunteersToOcorrencia([volunteerData.id], ocorrenciaId, user.name)}
                            onUpdateVolunteer={(updatedVol) => realtimeData.updateVolunteer(updatedVol, user.name)}
                            systemConfig={realtimeData.systemConfig}
                            allVoluntarios={realtimeData.allVoluntarios}
                        />;
            case 'operador':
                return (
                    <>
                        <Header isUserLoggedIn={!!user} systemConfig={realtimeData.systemConfig} />
                        <MapPage user={user} onLogout={handleLogout} {...realtimeData} />
                    </>
                );
            case 'telefonista':
                return <TelefonistaPortal
                            user={user}
                            onLogout={handleLogout}
                            allOpenOcorrencias={realtimeData.ocorrencias.filter((o: Ocorrencia) => o.status !== 'Fechada')}
                            onAddOcorrencia={(o) => realtimeData.addOcorrencia(o, user.name)}
                            onUpdateOcorrencia={(o) => realtimeData.updateOcorrencia(o, user.name)}
                            chatMessages={realtimeData.chatMessages}
                            onSendMessage={(ocorrenciaId, msg, type) => realtimeData.sendChatMessage(ocorrenciaId, msg, user.id, user.name, type, 'internal')}
                        />;
            case 'administrador':
                return <AdminPortal 
                            user={user} 
                            onLogout={handleLogout}
                            users={realtimeData.users}
                            allOcorrencias={realtimeData.allOcorrencias}
                            allVoluntarios={realtimeData.allVoluntarios}
                            allRecursos={realtimeData.allRecursos}
                            systemConfig={realtimeData.systemConfig}
                            riskZones={realtimeData.riskZones}
                            activation={realtimeData.activation}
                            eventLog={realtimeData.eventLog}
                            geofenceAlerts={realtimeData.geofenceAlerts}
                            climateAlerts={realtimeData.climateAlerts}
                            sosAlerts={realtimeData.sosAlerts}
                            teams={realtimeData.teams}
                            onAddUser={realtimeData.addUser}
                            onUpdateUser={realtimeData.updateUser}
                            onDeleteUser={realtimeData.deleteUser}
                            onUpdateUserStatus={(userId, status) => realtimeData.updateUserStatus(userId, status, user.name)}
                            onUpdateSystemConfig={(config) => realtimeData.updateSystemConfig(config, user.name)}
                            onAddRiskZone={(zone) => realtimeData.addRiskZone(zone, user.name)}
                            onUpdateRiskZone={(zone) => realtimeData.updateRiskZone(zone, user.name)}
                            onDeleteRiskZone={(zoneId) => realtimeData.deleteRiskZone(zoneId, user.name)}
                            updateActivation={realtimeData.updateActivation}
                            onAddRecurso={(recurso) => realtimeData.addRecurso(recurso, user.name)}
                            onUpdateRecurso={(recurso) => realtimeData.updateRecurso(recurso, user.name)}
                            onDeleteRecurso={(recursoId) => realtimeData.deleteRecurso(recursoId, user.name)}
                            onAddVolunteer={(v) => realtimeData.addVolunteer(v, user.name)}
                            onUpdateVolunteer={(v) => realtimeData.updateVolunteer(v, user.name)}
                            onDeleteVolunteer={(id) => realtimeData.deleteVolunteer(id, user.name)}
                            dismissGeofenceAlert={realtimeData.dismissGeofenceAlert}
                            dismissClimateAlert={realtimeData.dismissClimateAlert}
                            dismissSosAlert={realtimeData.dismissSosAlert}
                            onAddTeam={(team) => realtimeData.addTeam(team, user.name)}
                            onUpdateTeam={(team) => realtimeData.updateTeam(team, user.name)}
                            onDeleteTeam={(teamId) => realtimeData.deleteTeam(teamId, user.name)}
                        />;
            default:
                 logOut(); 
                 return <div>Perfil de usuário desconhecido. Você foi desconectado.</div>;
        }
    };

    return <div className="font-sans">{renderContent()}</div>;
};

export default App;