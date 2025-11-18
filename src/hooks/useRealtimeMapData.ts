import { useState, useEffect, useCallback, useRef } from 'react';
import type { Voluntario, Ocorrencia, RiskZone, Activation, GeofenceAlert, ClimateAlert, VolunteerStatus, OcorrenciaStatus, TimelineEvent, User, SystemConfig, ChatMessage, OcorrenciaPrioridade, OcorrenciaGravidade, Recurso, RecursoStatus, Team, UserStatus, NotificationSettings, SosAlert } from '../types';
import { getRoute } from '../components/routingService';
import { db } from '../firebaseConfig';
import { getItem, setItem } from '../utils/localStorage';


declare const turf: any;

const NOTIFICATION_SETTINGS_KEY = 'nupdec_notification_settings';

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
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ status: 'verde', contacts: { samu: '192', bombeiros: '193', defesaCivil: '199' }, acceptingRequests: true, qualifications: [], resourceTypes: [], smsNotificationsEnabled: true });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const saved = getItem<NotificationSettings>(NOTIFICATION_SETTINGS_KEY);
    return saved || {
      sounds: { occurrence: true, geofence: true, climate_extreme: true, sos: true },
      volumes: { occurrence: 0.8, geofence: 0.6, climate_extreme: 1.0, sos: 1.0 },
      browser: true,
    };
  });
  const [dateFilter, setDateFilter] = useState<{ start: string, end: string } | null>(null);
  const [transientMessages, setTransientMessages] = useState<{ id: string; text: string; type: 'info' | 'success' | 'error' | 'warning' }[]>([]);

  const queueTransientMessage = useCallback((text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setTransientMessages(prev => [...prev, { id: `msg-${Date.now()}-${Math.random()}`, text, type }]);
  }, []);

  const dismissTransientMessage = useCallback((id: string) => {
    setTransientMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  useEffect(() => {
    setLoading(true);
    const collectionsToLoad = ['users', 'voluntarios', 'ocorrencias', 'teams', 'recursos', 'riskZones', 'systemConfig', 'timelineEvents', 'chatMessages', 'sosAlerts'];
    let loadedCount = 0;

    const checkLoadingDone = () => {
        loadedCount++;
        if (loadedCount === collectionsToLoad.length) {
            setLoading(false);
        }
    };

    const unsubscribes = [
      db.collection("users").onSnapshot((snapshot) => { setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))); checkLoadingDone(); }),
      db.collection("voluntarios").onSnapshot((snapshot) => { setAllVoluntarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voluntario))); checkLoadingDone(); }),
      db.collection("ocorrencias").orderBy('timestamp', 'desc').onSnapshot((snapshot) => { setAllOcorrencias(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ocorrencia))); checkLoadingDone(); }),
      db.collection("teams").onSnapshot((snapshot) => { setTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team))); checkLoadingDone(); }),
      db.collection("recursos").onSnapshot((snapshot) => { setAllRecursos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recurso))); checkLoadingDone(); }),
      db.collection("riskZones").onSnapshot((snapshot) => { setRiskZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RiskZone))); checkLoadingDone(); }),
      db.collection("system").doc("config").onSnapshot((doc) => { if (doc.exists) setSystemConfig(doc.data() as SystemConfig); checkLoadingDone(); }),
      db.collection("system").doc("activation").onSnapshot((doc) => { if (doc.exists) setActivation(doc.data() as Activation); }),
      db.collection("timelineEvents").orderBy('timestamp', 'desc').onSnapshot((snapshot) => { setEventLog(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent))); checkLoadingDone(); }),
      db.collection("chatMessages").orderBy('timestamp', 'asc').onSnapshot((snapshot) => { setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))); checkLoadingDone(); }),
      db.collection('sosAlerts').orderBy('timestamp', 'desc').onSnapshot((snapshot) => { setSosAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: (doc.data().timestamp as any).toDate() } as SosAlert))); checkLoadingDone(); }),
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);


  const volunteersInZones = useRef<Set<string>>(new Set());
  
  const checkGeofencing = useCallback(() => {
    if (typeof turf === 'undefined') return;

    const activeRiskZones = riskZones.filter(z => z.active);
    if (activeRiskZones.length === 0 || allVoluntarios.length === 0) {
      if(volunteersInZones.current.size > 0) volunteersInZones.current.clear();
      return;
    }

    const newAlerts: GeofenceAlert[] = [];
    const currentVolunteersInZones = new Set<string>();

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

  useEffect(() => {
    if (loading) return;
    checkGeofencing();
    const geofenceInterval = setInterval(() => {
      checkGeofencing();
    }, 5000); 
    return () => clearInterval(geofenceInterval);
  }, [loading, checkGeofencing]);


  useEffect(() => {
    const historyInterval = setInterval(() => {
      const now = Date.now();
      const thirtyMinutesAgo = now - 30 * 60 * 1000;

      setVolunteerHistory(prevHistory => {
        const newHistory = { ...prevHistory };
        allVoluntarios.forEach(v => {
          if (!newHistory[v.id]) {
            newHistory[v.id] = [];
          }
          const lastPoint = newHistory[v.id][newHistory[v.id].length - 1];
          if (!lastPoint || lastPoint.lat !== v.latitude || lastPoint.lng !== v.longitude) {
            newHistory[v.id].push({ lat: v.latitude, lng: v.longitude, timestamp: now });
          }
          newHistory[v.id] = newHistory[v.id].filter(p => p.timestamp > thirtyMinutesAgo);
        });
        return newHistory;
      });
    }, 10000); 

    return () => clearInterval(historyInterval);
  }, [allVoluntarios]);

  const logEvent = useCallback(async (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    const newEvent: Omit<TimelineEvent, 'id'> = { ...event, timestamp: new Date().toISOString() };
    await db.collection("timelineEvents").add(newEvent);
  }, []);
  
  const updateSystemConfig = useCallback(async (newConfig: SystemConfig, operatorName: string) => {
    const oldConfig = systemConfig;
    await db.collection("system").doc("config").set(newConfig);
    
    let title = 'Configuração do sistema alterada.';
    let description = `Ação realizada por ${operatorName}.`;
    if (oldConfig.status !== newConfig.status) {
        title = `Status do sistema alterado para: ${newConfig.status.toUpperCase()}`;
        description = `O nível de alerta do sistema foi modificado.`;
    } else if (oldConfig.acceptingRequests !== newConfig.acceptingRequests) {
        title = `Solicitações Públicas ${newConfig.acceptingRequests ? 'ATIVADAS' : 'DESATIVADAS'}`;
        description = `Recebimento de pedidos de ajuda de cidadãos foi ${newConfig.acceptingRequests ? 'habilitado' : 'desabilitado'}.`;
    }
    logEvent({ type: 'status_change', latitude: -32.035, longitude: -52.0986, title, description: `${description} Operador: ${operatorName}.`, operatorName, });
  }, [logEvent, systemConfig]);

  const updateActivation = useCallback(async (active: boolean, message: string | null, meetingPoint: { lat: number, lng: number } | null, operatorName: string) => {
    await db.collection("system").doc("activation").set({ active, message: message || '', meetingPoint });
    if (active) {
        logEvent({ type: 'status_change', latitude: meetingPoint?.lat || -32.035, longitude: meetingPoint?.lng || -52.0986, title: 'ACIONAMENTO GERAL DO SISTEMA', description: `Ponto de Encontro definido. Mensagem: "${message}"`, operatorName, });
        const availableVolunteers = allVoluntarios.filter(v => v.status === 'Disponível');
        queueTransientMessage(`Acionamento enviado para ${availableVolunteers.length} voluntários disponíveis.`, 'success');
    } else {
         logEvent({ type: 'status_change', latitude: -32.035, longitude: -52.0986, title: 'Sistema Desativado', description: `O acionamento geral foi encerrado.`, operatorName, });
        queueTransientMessage('Acionamento geral do sistema foi encerrado.');
    }
  }, [logEvent, allVoluntarios, queueTransientMessage]);

  const addOcorrencia = useCallback(async (o: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'>, operatorName: string, citizenId?: string): Promise<Ocorrencia> => {
    // FIX: Added explicit type annotation to resolve TS error.
    const newOcorrenciaData: Omit<Ocorrencia, 'id'> & { latitude: number; longitude: number; code: string; } = { 
        ...o,
        timestamp: new Date().toISOString(),
        citizenId,
    };
    const docRef = await db.collection("ocorrencias").add(newOcorrenciaData);
    logEvent({
        type: 'ocorrencia',
        latitude: newOcorrenciaData.latitude, // This line would fail without the explicit type
        longitude: newOcorrenciaData.longitude,
        title: `Nova ocorrência: ${newOcorrenciaData.code}`,
        description: `Registrada por ${operatorName}.`,
        operatorName,
    });
    return { id: docRef.id, ...newOcorrenciaData } as Ocorrencia;
  }, [logEvent]);

  const updateOcorrencia = useCallback(async (updatedOcorrencia: Ocorrencia, operatorName: string) => {
    const { id, ...data } = updatedOcorrencia;
    await db.collection("ocorrencias").doc(id).update(data);
  }, []);

  const updateOcorrenciaStatus = useCallback(async (ocorrenciaId: string, status: OcorrenciaStatus, operatorName: string) => {
    await db.collection("ocorrencias").doc(ocorrenciaId).update({ status });
  }, []);
    
  const updateOcorrenciaPriority = useCallback(async (ocorrenciaId: string, prioridade: OcorrenciaPrioridade, operatorName: string) => {
    await db.collection("ocorrencias").doc(ocorrenciaId).update({ prioridade });
  }, []);

  const deleteOcorrencia = useCallback(async (id: string, operatorName: string) => {
    await db.collection("ocorrencias").doc(id).delete();
  }, []);

  const addVolunteer = useCallback(async (v: Omit<Voluntario, 'id' | 'status' | 'startPosition' | 'creationDate'>, operatorName: string) => {
    const newVolunteer = { ...v, status: 'Disponível', startPosition: { lat: v.latitude, lng: v.longitude }, creationDate: new Date().toISOString() };
    await db.collection("voluntarios").add(newVolunteer);
  }, []);

  const updateVolunteer = useCallback(async (updated: Voluntario, operatorName: string) => {
    const { id, ...data } = updated;
    await db.collection("voluntarios").doc(id).update(data);
  }, []);

  const deleteVolunteer = useCallback(async (id: string, operatorName: string) => {
    await db.collection("voluntarios").doc(id).delete();
  }, []);

  const updateVolunteerStatus = useCallback(async (volunteerId: string, status: VolunteerStatus, operatorName: string) => {
    await db.collection("voluntarios").doc(volunteerId).update({ status });
    if (status === 'Em Perigo') {
      const volunteer = allVoluntarios.find(v => v.id === volunteerId);
      if (volunteer) {
        await db.collection("sosAlerts").add({
          volunteerId,
          volunteerName: volunteer.nome,
          timestamp: new Date(),
          location: { lat: volunteer.latitude, lng: volunteer.longitude },
          ocorrenciaId: volunteer.assignedOcorrenciaId || null,
        });
      }
    }
  }, [allVoluntarios]);

  const assignVolunteersToOcorrencia = useCallback(async (volunteerIds: string[], ocorrenciaId: string, operatorName: string) => {
    const ocorrencia = allOcorrencias.find(o => o.id === ocorrenciaId);
    if (!ocorrencia) return;

    const assignedVolunteers = allVoluntarios.filter(v => volunteerIds.includes(v.id));
    const batch = db.batch();
    
    const ocorrenciaRef = db.collection("ocorrencias").doc(ocorrenciaId);
    batch.update(ocorrenciaRef, { status: 'Em Atendimento', assignedVolunteerIds: [...new Set([...(ocorrencia.assignedVolunteerIds || []), ...volunteerIds])] });

    for (const volunteer of assignedVolunteers) {
        const route = await getRoute({ lat: volunteer.latitude, lng: volunteer.longitude }, { lat: ocorrencia.latitude, lng: ocorrencia.longitude });
        const volunteerRef = db.collection("voluntarios").doc(volunteer.id);
        batch.update(volunteerRef, {
            status: 'Em Missão',
            assignedOcorrenciaId: ocorrenciaId,
            eta: route ? `${Math.round(route.duration / 60)} min` : 'N/A',
            routeGeometry: route?.geometry || null,
            routeSteps: route?.steps || [],
            routeDistance: route?.distance || 0,
            routeDuration: route?.duration || 0,
        });
    }
    await batch.commit();
  }, [allOcorrencias, allVoluntarios]);

  const assignTeamToOcorrencia = useCallback(async (teamId: string, ocorrenciaId: string, operatorName: string) => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
        await assignVolunteersToOcorrencia(team.memberIds, ocorrenciaId, operatorName);
    }
  }, [teams, assignVolunteersToOcorrencia]);

  const addRecurso = useCallback(async (r: Omit<Recurso, 'id' | 'status'>, operatorName: string) => { await db.collection("recursos").add({ ...r, status: 'Disponível' }); }, []);
  const updateRecurso = useCallback(async (r: Recurso, operatorName: string) => { const { id, ...data } = r; await db.collection("recursos").doc(id).update(data); }, []);
  const deleteRecurso = useCallback(async (id: string, operatorName: string) => { await db.collection("recursos").doc(id).delete(); }, []);
  const assignResourcesToOcorrencia = useCallback(async (recursoIds: string[], ocorrenciaId: string, operatorName: string) => {
    const batch = db.batch();
    const ocorrenciaRef = db.collection("ocorrencias").doc(ocorrenciaId);
    const currentOcorrencia = allOcorrencias.find(o => o.id === ocorrenciaId);
    batch.update(ocorrenciaRef, { assignedResourceIds: [...new Set([...(currentOcorrencia?.assignedResourceIds || []), ...recursoIds])] });
    recursoIds.forEach(id => {
      const recursoRef = db.collection("recursos").doc(id);
      batch.update(recursoRef, { status: 'Em Uso', assignedOcorrenciaId: ocorrenciaId });
    });
    await batch.commit();
  }, [allOcorrencias]);

  const addRiskZone = useCallback(async (zone: Omit<RiskZone, 'id'>, operatorName: string) => { await db.collection("riskZones").add(zone); }, []);
  const updateRiskZone = useCallback(async (zone: RiskZone, operatorName: string) => { const { id, ...data } = zone; await db.collection("riskZones").doc(id).update(data); }, []);
  const deleteRiskZone = useCallback(async (id: string, operatorName: string) => { await db.collection("riskZones").doc(id).delete(); }, []);
  
  const clearDateFilter = useCallback(() => setDateFilter(null), []);
  const updateNotificationSettings = useCallback((newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    setItem(NOTIFICATION_SETTINGS_KEY, newSettings);
  }, []);
  
  const dismissGeofenceAlert = useCallback((id: string) => { setGeofenceAlerts(prev => prev.filter(a => a.id !== id)); }, []);
  const dismissClimateAlert = useCallback((id: string) => { setClimateAlerts(prev => prev.filter(a => a.id !== id)); }, []);
  const dismissSosAlert = useCallback(async (id: string) => { await db.collection("sosAlerts").doc(id).delete(); }, []);
  
  const sendChatMessage = useCallback(async (ocorrenciaId: string, message: string, senderId: string, senderName: string, type: 'text' | 'audio', audience: 'internal' | 'public') => { await db.collection("chatMessages").add({ ocorrenciaId, senderId, senderName, message, timestamp: new Date().toISOString(), type, status: 'sent', audience }); }, []);

  const addTeam = useCallback(async (team: Omit<Team, 'id'>, operatorName: string) => { await db.collection("teams").add(team); }, []);
  const updateTeam = useCallback(async (team: Team, operatorName: string) => { const { id, ...data } = team; await db.collection("teams").doc(id).update(data); }, []);
  const deleteTeam = useCallback(async (teamId: string, operatorName: string) => { await db.collection("teams").doc(teamId).delete(); }, []);

  const updateUserStatus = useCallback(async (userId: string, status: UserStatus, operatorName: string) => { await db.collection("users").doc(userId).update({ status }); }, []);
  const deleteUser = useCallback(async (userId: string) => { await db.collection("users").doc(userId).delete(); }, []);
  
  const recordUserLogout = useCallback(async (userId: string) => { await db.collection("users").doc(userId).update({ isOnline: false }); }, []);

  const voluntarios = dateFilter ? allVoluntarios.filter(v => v.creationDate >= dateFilter.start && v.creationDate <= dateFilter.end) : allVoluntarios;
  const ocorrencias = dateFilter ? allOcorrencias.filter(o => o.timestamp && o.timestamp >= dateFilter.start && o.timestamp <= dateFilter.end) : allOcorrencias;

  return {
    users, allVoluntarios, allOcorrencias, allRecursos, voluntarios, ocorrencias, riskZones, activation, geofenceAlerts, climateAlerts, sosAlerts, eventLog, loading, volunteerHistory, systemConfig, chatMessages, teams, notificationSettings, transientMessages, dateFilter,
    logEvent, updateSystemConfig, updateActivation, addOcorrencia, updateOcorrencia, deleteOcorrencia, updateOcorrenciaStatus, updateOcorrenciaPriority, addVolunteer, updateVolunteer, deleteVolunteer, updateVolunteerStatus, assignVolunteersToOcorrencia, assignTeamToOcorrencia, addRecurso, updateRecurso, deleteRecurso, assignResourcesToOcorrencia, addRiskZone, updateRiskZone, deleteRiskZone, setDateFilter, clearDateFilter, dismissGeofenceAlert, dismissClimateAlert, dismissSosAlert, sendChatMessage, addTeam, updateTeam, deleteTeam, updateNotificationSettings, queueTransientMessage, dismissTransientMessage,
    addUser: async () => {}, // Not needed, handled by signup
    updateUser: async (user: User) => { const {id, ...data} = user; await db.collection("users").doc(id).update(data)},
    deleteUser,
    recordUserLogin: async (userId: string) => { await db.collection("users").doc(userId).update({ isOnline: true })},
    recordUserLogout,
    updateUserStatus,
  };
};