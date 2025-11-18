import { useState, useEffect, useCallback, useRef } from 'react';
import type { Voluntario, Ocorrencia, RiskZone, Activation, GeofenceAlert, ClimateAlert, VolunteerStatus, OcorrenciaStatus, TimelineEvent, User, SystemConfig, ChatMessage, OcorrenciaPrioridade, OcorrenciaGravidade, Recurso, RecursoStatus, Team, UserStatus, NotificationSettings, SosAlert } from '../types';
import { getRoute } from '../components/routingService';

declare const turf: any;


export const useRealtimeMapData = (user: User | null) => {
  const [users, setUsers] = useState<User[]>([]);
  const [allVoluntarios, setAllVoluntarios] = useState<Voluntario[]>([]);
  const [allOcorrencias, setAllOcorrencias] = useState<Ocorrencia[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allRecursos, setAllRecursos] = useState<Recurso[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [activation, setActivation] = useState<Activation>({ active: false, message: '', meetingPoint: null });
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [climateAlerts, setClimateAlerts] = useState<ClimateAlert[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>([]);
  const [eventLog, setEventLog] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [volunteerHistory, setVolunteerHistory] = useState<Record<string, { lat: number, lng: number, timestamp: number }[]>>({});
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    status: 'verde',
    contacts: { samu: '192', bombeiros: '193', defesaCivil: '199' },
    acceptingRequests: true,
    qualifications: ['Primeiros Socorros', 'Resgate em Altura', 'Operador de Barco', 'Comunicação via Rádio'],
    resourceTypes: ['Embarcação', 'Veículo 4x4', 'Kit Médico', 'Gerador Elétrico', 'Motosserra', 'Carro de Apoio'],
    smsNotificationsEnabled: true,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    sounds: { occurrence: true, geofence: true, climate_extreme: true, sos: true },
    volumes: { occurrence: 0.8, geofence: 0.6, climate_extreme: 1.0, sos: 1.0 },
    browser: true,
  });
  
  const [dateFilter, setDateFilter] = useState<{ start: string, end: string } | null>(null);

  // FIX: Update transientMessages state to include a message type.
  const [transientMessages, setTransientMessages] = useState<{ id: string; text: string; type: 'info' | 'success' | 'error' | 'warning' }[]>([]);

  // FIX: Update queueTransientMessage to accept a message type argument.
  const queueTransientMessage = useCallback((text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setTransientMessages(prev => [...prev, { id: `msg-${Date.now()}-${Math.random()}`, text, type }]);
  }, []);

  const dismissTransientMessage = useCallback((id: string) => {
    setTransientMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const volunteersInZones = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    // Simulate fetching non-user data after a short delay
    const timer = setTimeout(() => {
        // Here you would fetch data from Firestore/Realtime Database
        // For now, we keep the mock data for other collections
        setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Memoize the geofencing check function to avoid re-creating it unless dependencies change.
  const checkGeofencing = useCallback(() => {
    if (typeof turf === 'undefined') return;

    const activeRiskZones = riskZones.filter(z => z.active);
    if (activeRiskZones.length === 0 || allVoluntarios.length === 0) {
      if(volunteersInZones.current.size > 0) volunteersInZones.current.clear();
      return;
    }

    const newAlerts: GeofenceAlert[] = [];
    const currentVolunteersInZones = new Set<string>();

    // Check for entries
    allVoluntarios.forEach(v => {
      if (v.status === 'Inativo') return;

      const volunteerPoint = turf.point([v.longitude, v.latitude]);
      for (const zone of activeRiskZones) {
        const zoneIdentifier = `${v.id}-${zone.id}`;
        try {
          const zonePolygon = turf.polygon(zone.coordenadas.coordinates);
          if (turf.booleanPointInPolygon(volunteerPoint, zonePolygon)) {
            currentVolunteersInZones.add(zoneIdentifier);
            if (!volunteersInZones.current.has(zoneIdentifier)) {
              newAlerts.push({
                id: `geofence-enter-${Date.now()}-${v.id}`,
                volunteerName: v.nome,
                zoneName: zone.nome,
                timestamp: new Date(),
                eventType: 'enter',
              });
            }
          }
        } catch (e) {
          console.error(`Invalid polygon for zone ${zone.nome} (${zone.id})`, e);
        }
      }
    });

    // Check for exits
    volunteersInZones.current.forEach(zoneIdentifier => {
      if (!currentVolunteersInZones.has(zoneIdentifier)) {
        const [volunteerId, zoneId] = zoneIdentifier.split('-');
        const volunteer = allVoluntarios.find(v => v.id === volunteerId);
        const zone = riskZones.find(z => z.id === zoneId);

        if (volunteer && zone) {
          newAlerts.push({
            id: `geofence-exit-${Date.now()}-${volunteer.id}`,
            volunteerName: volunteer.nome,
            zoneName: zone.nome,
            timestamp: new Date(),
            eventType: 'exit',
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      setGeofenceAlerts(prev => [...newAlerts.reverse(), ...prev].slice(0, 10));
    }

    volunteersInZones.current = currentVolunteersInZones;
  }, [allVoluntarios, riskZones]);

  // Throttled Geofencing Logic to run periodically instead of on every data update
  useEffect(() => {
    if (loading) return;
    
    // Run once immediately on load
    checkGeofencing();
    
    // Then run on a throttled interval to avoid performance issues with frequent data updates
    const geofenceInterval = setInterval(() => {
      checkGeofencing();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(geofenceInterval);
  }, [loading, checkGeofencing]);


  // Volunteer History Tracking
  useEffect(() => {
    const historyInterval = setInterval(() => {
      const now = Date.now();
      const thirtyMinutesAgo = now - 30 * 60 * 1000;

      setVolunteerHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        
        allVoluntarios.forEach(v => {
          // Add new point
          if (!newHistory[v.id]) {
            newHistory[v.id] = [];
          }
          const lastPoint = newHistory[v.id][newHistory[v.id].length - 1];
          // Only add if location has changed to avoid redundant data
          if (!lastPoint || lastPoint.lat !== v.latitude || lastPoint.lng !== v.longitude) {
            newHistory[v.id].push({ lat: v.latitude, lng: v.longitude, timestamp: now });
          }

          // Clean up old points
          newHistory[v.id] = newHistory[v.id].filter(p => p.timestamp > thirtyMinutesAgo);
        });
        
        return newHistory;
      });
    }, 10000); // Record history every 10 seconds

    return () => clearInterval(historyInterval);
  }, [allVoluntarios]);

  const logEvent = useCallback((event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: TimelineEvent = {
        ...event,
        id: `evt-${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    setEventLog(prev => [newEvent, ...prev]);
  }, []);
  
  const updateSystemConfig = useCallback((newConfig: SystemConfig, operatorName: string) => {
    const oldConfig = systemConfig;
    setSystemConfig(newConfig);

    let title = 'Configuração do sistema alterada.';
    let description = `Ação realizada por ${operatorName}.`;

    if (oldConfig.status !== newConfig.status) {
        title = `Status do sistema alterado para: ${newConfig.status.toUpperCase()}`;
        description = `O nível de alerta do sistema foi modificado.`;
    } else if (oldConfig.acceptingRequests !== newConfig.acceptingRequests) {
        title = `Solicitações Públicas ${newConfig.acceptingRequests ? 'ATIVADAS' : 'DESATIVADAS'}`;
        description = `Recebimento de pedidos de ajuda de cidadãos foi ${newConfig.acceptingRequests ? 'habilitado' : 'desabilitado'}.`;
    }

    logEvent({
      type: 'status_change',
      latitude: -32.035,
      longitude: -52.0986,
      title: title,
      description: `${description} Operador: ${operatorName}.`,
      operatorName,
    });
  }, [logEvent, systemConfig]);

    const updateActivation = useCallback((active: boolean, message: string | null, meetingPoint: { lat: number, lng: number } | null, operatorName: string) => {
        setActivation({ active, message: message || '', meetingPoint });

        if (active) {
            logEvent({
                type: 'status_change',
                latitude: meetingPoint?.lat || -32.035,
                longitude: meetingPoint?.lng || -52.0986,
                title: 'ACIONAMENTO GERAL DO SISTEMA',
                description: `Ponto de Encontro definido. Mensagem: "${message}"`,
                operatorName,
            });

            const availableVolunteers = allVoluntarios.filter(v => v.status === 'Disponível');
            // FIX: Explicitly set the message type to 'success' for better user feedback.
            queueTransientMessage(`Acionamento enviado para ${availableVolunteers.length} voluntários disponíveis.`, 'success');
        } else {
             logEvent({
                type: 'status_change',
                latitude: -32.035,
                longitude: -52.0986,
                title: 'Sistema Desativado',
                description: `O acionamento geral foi encerrado.`,
                operatorName,
            });
            queueTransientMessage('Acionamento geral do sistema foi encerrado.');
        }
    }, [logEvent, allVoluntarios, queueTransientMessage]);

  const addOcorrencia = useCallback((o: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'>, operatorName: string, citizenId?: string): Ocorrencia => {
    const newOcorrencia: Ocorrencia = { 
        ...o,
        id: `o${Date.now()}`,
        timestamp: new Date().toISOString(),
        citizenId,
    };
    setAllOcorrencias(prev => [newOcorrencia, ...prev]);
    logEvent({
        type: 'ocorrencia',
        latitude: newOcorrencia.latitude,
        longitude: newOcorrencia.longitude,
        title: `Nova ocorrência: ${newOcorrencia.code} - ${newOcorrencia.tipo}`,
        description: `Registrada por ${operatorName}.`,
        operatorName,
    });
    return newOcorrencia;
  }, [logEvent]);

    const updateOcorrencia = useCallback((updatedOcorrencia: Ocorrencia, operatorName: string) => {
        setAllOcorrencias(prev => prev.map(o => o.id === updatedOcorrencia.id ? updatedOcorrencia : o));
    }, []);

    const updateOcorrenciaStatus = useCallback((ocorrenciaId: string, status: OcorrenciaStatus, operatorName: string) => {
        setAllOcorrencias(prev => prev.map(o => (o.id === ocorrenciaId ? { ...o, status } : o)));
    }, []);
    
    const updateOcorrenciaPriority = useCallback((ocorrenciaId: string, prioridade: OcorrenciaPrioridade, operatorName: string) => {
        setAllOcorrencias(prev => prev.map(o => (o.id === ocorrenciaId ? { ...o, prioridade } : o)));
    }, []);

    const deleteOcorrencia = useCallback((id: string, operatorName: string) => {
        setAllOcorrencias(prev => prev.filter(o => o.id !== id));
    }, []);

    const addVolunteer = useCallback((v: Omit<Voluntario, 'id' | 'status' | 'startPosition' | 'creationDate'>, operatorName: string) => {
        const newVolunteer: Voluntario = {
            ...v,
            id: `v${Date.now()}`,
            status: 'Disponível',
            startPosition: { lat: v.latitude, lng: v.longitude },
            creationDate: new Date().toISOString(),
        };
        setAllVoluntarios(prev => [...prev, newVolunteer]);
    }, []);

    const updateVolunteer = useCallback((updated: Voluntario, operatorName: string) => {
        setAllVoluntarios(prev => prev.map(v => v.id === updated.id ? updated : v));
    }, []);

    const deleteVolunteer = useCallback((id: string, operatorName: string) => {
        setAllVoluntarios(prev => prev.filter(v => v.id !== id));
    }, []);

    const updateVolunteerStatus = useCallback((volunteerId: string, status: VolunteerStatus, operatorName: string) => {
        setAllVoluntarios(prev => prev.map(v => (v.id === volunteerId ? { ...v, status } : v)));
    }, []);

    const assignVolunteersToOcorrencia = useCallback(async (volunteerIds: string[], ocorrenciaId: string, operatorName: string) => {
        const ocorrencia = allOcorrencias.find(o => o.id === ocorrenciaId);
        if (!ocorrencia) return;

        const assignedVolunteers = allVoluntarios.filter(v => volunteerIds.includes(v.id));

        setAllOcorrencias(prev => prev.map(o => o.id === ocorrenciaId ? {
            ...o,
            status: 'Em Atendimento',
            assignedVolunteerIds: [...new Set([...(o.assignedVolunteerIds || []), ...volunteerIds])],
        } : o));

        for (const volunteer of assignedVolunteers) {
            const route = await getRoute({ lat: volunteer.latitude, lng: volunteer.longitude }, { lat: ocorrencia.latitude, lng: ocorrencia.longitude });
            const eta = route ? `${Math.round(route.duration / 60)} min` : 'N/A';
            setAllVoluntarios(prev => prev.map(v => v.id === volunteer.id ? {
                ...v,
                status: 'Em Missão',
                assignedOcorrenciaId: ocorrenciaId,
                eta,
                routeGeometry: route?.geometry,
                // FIX: Populate route step details for navigation.
                routeSteps: route?.steps,
                routeDistance: route?.distance,
                routeDuration: route?.duration,
            } : v));
        }
    }, [allOcorrencias, allVoluntarios]);
    
    const assignTeamToOcorrencia = useCallback((teamId: string, ocorrenciaId: string, operatorName: string) => {
        const team = teams.find(t => t.id === teamId);
        if (team) {
            assignVolunteersToOcorrencia(team.memberIds, ocorrenciaId, operatorName);
        }
    }, [teams, assignVolunteersToOcorrencia]);

    // Other CRUD functions remain largely the same, but would point to Firestore in a real app
    const addRecurso = useCallback((r: Omit<Recurso, 'id' | 'status'>, operatorName: string) => { setAllRecursos(prev => [...prev, { ...r, id: `r-${Date.now()}`, status: 'Disponível' }]); }, []);
    const updateRecurso = useCallback((r: Recurso, operatorName: string) => { setAllRecursos(prev => prev.map(res => res.id === r.id ? r : res)); }, []);
    const deleteRecurso = useCallback((id: string, operatorName: string) => { setAllRecursos(prev => prev.filter(r => r.id !== id)); }, []);
    const assignResourcesToOcorrencia = useCallback((recursoIds: string[], ocorrenciaId: string, operatorName: string) => {
        setAllOcorrencias(prev => prev.map(o => o.id === ocorrenciaId ? { ...o, assignedResourceIds: [...new Set([...(o.assignedResourceIds || []), ...recursoIds])] } : o));
        setAllRecursos(prev => prev.map(r => recursoIds.includes(r.id) ? { ...r, status: 'Em Uso', assignedOcorrenciaId: ocorrenciaId } : r));
    }, []);
    const addRiskZone = useCallback((zone: Omit<RiskZone, 'id'>, operatorName: string) => { setRiskZones(prev => [...prev, { ...zone, id: `rz-${Date.now()}` }]); }, []);
    const updateRiskZone = useCallback((zone: RiskZone, operatorName: string) => { setRiskZones(prev => prev.map(z => z.id === zone.id ? zone : z)); }, []);
    const deleteRiskZone = useCallback((id: string, operatorName: string) => { setRiskZones(prev => prev.filter(z => z.id !== id)); }, []);
    const clearDateFilter = useCallback(() => setDateFilter(null), []);
    const updateNotificationSettings = useCallback((newSettings: NotificationSettings) => { setNotificationSettings(newSettings); }, []);
    const dismissGeofenceAlert = useCallback((id: string) => { setGeofenceAlerts(prev => prev.filter(a => a.id !== id)); }, []);
    const dismissClimateAlert = useCallback((id: string) => { setClimateAlerts(prev => prev.filter(a => a.id !== id)); }, []);
    const dismissSosAlert = useCallback((id: string) => { setSosAlerts(prev => prev.filter(a => a.id !== id)); }, []);
    const sendChatMessage = useCallback((ocorrenciaId: string, message: string, senderId: string, senderName: string, type: 'text' | 'audio', audience: 'internal' | 'public') => { setChatMessages(prev => [...prev, { id: `msg-${Date.now()}`, ocorrenciaId, senderId, senderName, message, timestamp: new Date().toISOString(), type, status: 'sent', audience }]); }, []);
    const addTeam = useCallback((team: Omit<Team, 'id'>, operatorName: string) => { setTeams(prev => [...prev, { ...team, id: `team-${Date.now()}` }]); }, []);
    const updateTeam = useCallback((team: Team, operatorName: string) => { setTeams(prev => prev.map(t => t.id === team.id ? team : t)); }, []);
    // FIX: Changed `id` to `teamId` to match the function parameter.
    const deleteTeam = useCallback((teamId: string, operatorName: string) => { setTeams(prev => prev.filter(t => t.id !== teamId)); }, []);

  const voluntarios = dateFilter ? allVoluntarios.filter(v => v.creationDate >= dateFilter.start && v.creationDate <= dateFilter.end) : allVoluntarios;
  const ocorrencias = dateFilter ? allOcorrencias.filter(o => o.timestamp && o.timestamp >= dateFilter.start && o.timestamp <= dateFilter.end) : allOcorrencias;

  return {
    users,
    allVoluntarios,
    allOcorrencias,
    allRecursos,
    voluntarios,
    ocorrencias,
    riskZones,
    activation,
    geofenceAlerts,
    climateAlerts,
    sosAlerts,
    eventLog,
    loading,
    volunteerHistory,
    systemConfig,
    chatMessages,
    teams,
    notificationSettings,
    transientMessages,
    dateFilter,
    logEvent,
    updateSystemConfig,
    updateActivation,
    addOcorrencia,
    updateOcorrencia,
    deleteOcorrencia,
    updateOcorrenciaStatus,
    updateOcorrenciaPriority,
    addVolunteer,
    updateVolunteer,
    deleteVolunteer,
    updateVolunteerStatus,
    assignVolunteersToOcorrencia,
    assignTeamToOcorrencia,
    addRecurso,
    updateRecurso,
    deleteRecurso,
    assignResourcesToOcorrencia,
    addRiskZone,
    updateRiskZone,
    deleteRiskZone,
    setDateFilter,
    clearDateFilter,
    dismissGeofenceAlert,
    dismissClimateAlert,
    dismissSosAlert,
    sendChatMessage,
    addTeam,
    updateTeam,
    deleteTeam,
    updateNotificationSettings,
    queueTransientMessage,
    dismissTransientMessage,
    // Note: User management functions are removed from here as they will be handled by auth service
    addUser: (...args: any[]) => {},
    updateUser: (...args: any[]) => {},
    deleteUser: (...args: any[]) => {},
    recordUserLogin: (...args: any[]) => {},
    recordUserLogout: (...args: any[]) => {},
    updateUserStatus: (...args: any[]) => {},
  };
};