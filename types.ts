// This file was re-created based on type usage across the application components.

export interface EmergencyContacts {
  samu: string;
  bombeiros: string;
  defesaCivil: string;
  samuWhatsapp?: string;
  bombeirosWhatsapp?: string;
  defesaCivilWhatsapp?: string;
}

export type SystemStatusLevel = 'verde' | 'amarelo' | 'vermelho' | 'roxo';

export interface SystemConfig {
  status: SystemStatusLevel;
  contacts: EmergencyContacts;
  acceptingRequests: boolean;
  qualifications: string[];
  resourceTypes: string[];
  smsNotificationsEnabled: boolean;
}

export type UserRole = 'cidadao' | 'voluntario' | 'operador' | 'administrador' | 'telefonista';
export type UserStatus = 'active' | 'pending' | 'blocked';

export interface UserSession {
  login: string;
  logout?: string;
  duration?: number; // in minutes
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  volunteerId?: string;
  status: UserStatus;
  isOnline: boolean;
  registrationDate: string;
  sessions: UserSession[];
}

export type VolunteerStatus = 'Disponível' | 'Em Missão' | 'Retornando' | 'Inativo' | 'Em Perigo';

export interface Voluntario {
  id: string;
  nome: string;
  telefone: string;
  latitude: number;
  longitude: number;
  status: VolunteerStatus;
  qualifications?: string[];
  eta?: string;
  profilePictureUrl?: string;
  assignedOcorrenciaId?: string;
  assignedOcorrenciaCode?: string;
  routeGeometry?: any;
  routeSteps?: any[];
  routeDistance?: number;
  routeDuration?: number;
  teamId?: string;
  startPosition: { lat: number; lng: number };
  creationDate: string;
}

export type OcorrenciaStatus = 'Aberta' | 'Em Atendimento' | 'Fechada';
export type OcorrenciaGravidade = 'Crítico' | 'Moderado' | 'Controle';
export type OcorrenciaPrioridade = 'Urgente' | 'Alta' | 'Normal' | 'Baixa';

export interface Vitimas {
  adultos: number;
  criancas: number;
  idosos: number;
  pcd: number; // Pessoas com Deficiência
  animais: number;
}

export interface Ocorrencia {
  id: string;
  code: string;
  tipo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  status: OcorrenciaStatus;
  gravidade?: OcorrenciaGravidade;
  prioridade: OcorrenciaPrioridade;
  solicitante?: {
    nome: string;
    telefone: string;
    isTerceiro?: boolean;
    nomeVitima?: string;
  };
  vitimas?: Vitimas;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    referencia?: string;
  };
  assignedVolunteerIds?: string[];
  assignedVolunteerNames?: string[];
  assignedTeamId?: string;
  assignedResourceIds?: string[];
  requiredQualifications?: string[];
  citizenId?: string;
  closedBy?: string;
  closedTimestamp?: string;
}

export interface MapControlHandles {
  locateUser: () => void;
  resetView: () => void;
  searchLocation: (lat: number, lng: number, label: string) => void;
  panToLocation: (lat: number, lng: number) => void;
  fitToBounds: (bounds: any) => void;
}

export interface RiskZone {
  id: string;
  nome: string;
  descricao?: string;
  coordenadas: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  active: boolean;
}

export interface Weather {
  temp: number;
  description: string;
  icon: string;
  windSpeed: number;
  humidity: number;
  locationName: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'ocorrencia' | 'status_change' | 'assignment' | 'zone_created' | 'check_in' | 'support_request';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  operatorName: string;
}

export type NotificationType = 'occurrence' | 'geofence' | 'climate_extreme' | 'sos';

export interface NotificationSettings {
  sounds: Record<NotificationType, boolean>;
  volumes: Record<NotificationType, number>;
  browser: boolean;
}

export interface ChatMessage {
  id: string;
  ocorrenciaId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'audio';
  status: 'sending' | 'sent' | 'failed' | 'queued';
  audience: 'internal' | 'public';
}

export interface SosAlert {
  id: string;
  volunteerId: string;
  volunteerName: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  ocorrenciaId?: string;
}

export type RecursoStatus = 'Disponível' | 'Em Uso' | 'Manutenção';

export interface Recurso {
  id: string;
  nome: string;
  tipo: string;
  status: RecursoStatus;
  latitude?: number;
  longitude?: number;
  assignedOcorrenciaId?: string;
}

export interface SearchSuggestion {
  type: 'location' | 'volunteer' | 'ocorrencia';
  data: any;
}

export interface ClimateAlert {
  id: string;
  title: string;
  description: string;
  severity: 'moderate' | 'severe' | 'extreme';
  area: string;
  areaCoordinates?: any; // GeoJSON
  timestamp: Date;
}

export interface GeofenceAlert {
  id: string;
  volunteerName: string;
  zoneName: string;
  timestamp: Date;
  eventType: 'enter' | 'exit';
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
}

export interface HelpRequestData extends Partial<Omit<Ocorrencia, 'solicitante'>> {
  solicitante: {
    nome: string;
    telefone: string;
    isTerceiro: boolean;
    nomeVitima: string;
  };
  latitude: number;
  longitude: number;
}

export interface Activation {
  active: boolean;
  message: string;
  meetingPoint: { lat: number, lng: number } | null;
}

export interface AdminZonasProps {
  onClose: () => void;
  onSave: (zone: Omit<RiskZone, 'id'> | RiskZone) => void;
  initialCenter: [number, number];
  zoneToEdit: RiskZone | null;
}

export interface HistoryPanelProps {
  onClose: () => void;
  onApply: (start: string, end: string) => void;
  onClear: () => void;
  ocorrencias: Ocorrencia[];
  voluntarios: Voluntario[];
}

export interface DataManagementPanelProps {
  onClose: () => void;
  operatorName: string;
  voluntarios: Voluntario[];
  ocorrencias: Ocorrencia[];
  // FIX: Updated function prop types to correctly reflect their async nature and return Promises, aligning with the Firestore implementation.
  onAddVolunteer: (v: Omit<Voluntario, 'id' | 'status' | 'startPosition' | 'creationDate'>, operatorName: string) => Promise<void>;
  onUpdateVolunteer: (v: Voluntario, operatorName: string) => Promise<void>;
  onDeleteVolunteer: (id: string, operatorName: string) => Promise<void>;
  onAddOcorrencia: (o: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId'>, operatorName: string) => Promise<Ocorrencia>;
  onUpdateOcorrencia: (o: Ocorrencia, operatorName: string) => Promise<void>;
  onDeleteOcorrencia: (id: string, operatorName: string) => Promise<void>;
}

export interface AdminMapViewProps {
    voluntarios: Voluntario[];
    ocorrencias: Ocorrencia[];
    riskZones: RiskZone[];
    activation: Activation;
    geofenceAlerts: GeofenceAlert[];
    climateAlerts: ClimateAlert[];
    sosAlerts: SosAlert[];
    dismissGeofenceAlert: (id: string) => void;
    dismissClimateAlert: (id: string) => void;
    dismissSosAlert: (id: string) => void;
    onEditRiskZone?: (zone: RiskZone) => void;
    onDeleteRiskZone?: (zoneId: string) => void;
    onAddNewRiskZone?: () => void;
    isRiskZonesVisible?: boolean;
    onToggleRiskZones?: () => void;
}