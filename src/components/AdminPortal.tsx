import React, { useMemo, useState, useEffect } from 'react';
import type { User, Ocorrencia, Voluntario, UserRole, SystemConfig, SystemStatusLevel, RiskZone, Activation, GeofenceAlert, ClimateAlert, SosAlert, EmergencyContacts, Recurso, RecursoStatus, TimelineEvent, VolunteerStatus, Team, UserStatus, OcorrenciaStatus } from '../types';
import { ArrowRightOnRectangleIcon, ChartBarIcon, UserGroupIcon, CogIcon, PencilIcon, TrashIcon, PlusIcon, GlobeAltIcon, CubeIcon, DocumentTextIcon, ShieldExclamationIcon, TableCellsIcon, ClockIcon, XMarkIcon, MagnifyingGlassIcon, LockClosedIcon, CheckBadgeIcon, NoSymbolIcon, LockOpenIcon, MegaphoneIcon } from './icons';
import SuccessToast from './SuccessToast';
import AdminMapView from './AdminMapView';
import AdminZonas from './AdminZonas';
import EventLogPanel from './EventLogPanel';
import ActivationPanel from './ActivationPanel';
import { InventoryPanel } from './InventoryPanel';

interface AdminPortalProps {
    user: User;
    onLogout: () => void;
    users: User[];
    onAddUser: (user: Omit<User, 'id' | 'status' | 'isOnline' | 'registrationDate' | 'sessions'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    allOcorrencias: Ocorrencia[];
    allVoluntarios: Voluntario[];
    allRecursos: Recurso[];
    onAddRecurso: (recurso: Omit<Recurso, 'id' | 'status'>, operatorName: string) => void;
    onUpdateRecurso: (recurso: Recurso, operatorName: string) => void;
    onDeleteRecurso: (recursoId: string, operatorName: string) => void;
    systemConfig: SystemConfig;
    onUpdateSystemConfig: (config: SystemConfig, operatorName: string) => void;
    riskZones: RiskZone[];
    onAddRiskZone: (zone: Omit<RiskZone, 'id'>, operatorName: string) => void;
    onUpdateRiskZone: (zone: RiskZone, operatorName: string) => void;
    onDeleteRiskZone: (zoneId: string, operatorName: string) => void;
    activation: Activation;
    updateActivation: (active: boolean, message: string | null, meetingPoint: { lat: number, lng: number } | null, operatorName: string) => void;
    eventLog: TimelineEvent[];
    onAddVolunteer: (v: Omit<Voluntario, 'id' | 'status' | 'startPosition' | 'creationDate'>, operatorName: string) => void;
    onUpdateVolunteer: (v: Voluntario, operatorName: string) => void;
    onDeleteVolunteer: (id: string, operatorName: string) => void;
    geofenceAlerts: GeofenceAlert[];
    climateAlerts: ClimateAlert[];
    sosAlerts: SosAlert[];
    dismissGeofenceAlert: (id: string) => void;
    dismissClimateAlert: (id: string) => void;
    dismissSosAlert: (id: string) => void;
    teams: Team[];
    onAddTeam: (team: Omit<Team, 'id'>, operatorName: string) => void;
    onUpdateTeam: (team: Team, operatorName: string) => void;
    onDeleteTeam: (teamId: string, operatorName: string) => void;
}

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div><label className="block text-sm font-medium text-gray-300 mb-1">{label}</label><input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white" /></div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[], optionLabels?: Record<string, string> }> = ({ label, options, optionLabels, ...props }) => (
    <div><label className="block text-sm font-medium text-gray-300 mb-1">{label}</label><select {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
        {props.children}
        {options.map(opt => <option key={opt} value={opt}>{optionLabels ? optionLabels[opt] : opt}</option>)}
    </select></div>
);

const TeamFormModal: React.FC<{
    team: Team | null;
    allVoluntarios: Voluntario[];
    onClose: () => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    error: string | null;
}> = ({ team, allVoluntarios, onClose, onSubmit, error }) => {
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(team?.memberIds || []));

    const handleToggleMember = (id: string) => {
        setSelectedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleLeaderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const leaderId = e.target.value;
        if (leaderId) {
            setSelectedMembers(prev => new Set(prev).add(leaderId));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold">{team ? 'Editar Equipe' : 'Nova Equipe'}</h3>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        {error && <p className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md">{error}</p>}
                        <InputField label="Nome da Equipe" name="name" defaultValue={team?.name} required />
                        <SelectField label="Líder da Equipe" name="leaderId" defaultValue={team?.leaderId} options={[]} onChange={handleLeaderChange} required>
                            <option value="">Selecione um líder...</option>
                            {allVoluntarios.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                        </SelectField>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Membros da Equipe</label>
                            <div className="grid grid-cols-2 gap-2 p-2 bg-gray-700/50 rounded-md max-h-64 overflow-y-auto">
                                {allVoluntarios.map(v => (
                                    <label key={v.id} className="flex items-center space-x-2 text-sm p-1 rounded hover:bg-gray-600">
                                        <input type="checkbox" name="memberIds" value={v.id} checked={selectedMembers.has(v.id)} onChange={() => handleToggleMember(v.id)} className="w-4 h-4 rounded text-cyan-600 bg-gray-600 border-gray-500 focus:ring-cyan-500"/>
                                        <span>{v.nome}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 p-4 bg-gray-900/50 rounded-b-lg mt-auto">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Salvar Equipe</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VolunteerHistoryModal: React.FC<{ volunteer: Voluntario, events: TimelineEvent[], onClose: () => void }> = ({ volunteer, events, onClose }) => {
    const history = useMemo(() => {
        return events.filter(e => e.type === 'status_change' && (e.title.startsWith(volunteer.nome) || e.description.includes(volunteer.nome)));
    }, [events, volunteer.nome]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg border border-gray-700 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Histórico de Status: {volunteer.nome}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><XMarkIcon className="h-5 w-5"/></button>
                </div>
                <div className="p-6 space-y-2 overflow-y-auto">
                    {history.length > 0 ? history.map(e => (
                         <div key={e.id} className="p-3 bg-gray-700/50 rounded-md">
                             <p className="font-semibold text-sm">{e.title}</p>
                             <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString('pt-BR')} - por {e.operatorName}</p>
                         </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">Nenhum histórico de status encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    )
};

const AuditReportPage: React.FC<{
    users: User[];
    allOcorrencias: Ocorrencia[];
    allVoluntarios: Voluntario[];
    eventLog: TimelineEvent[];
    allRecursos: Recurso[];
    onClose: () => void;
}> = ({ users, allOcorrencias, allVoluntarios, eventLog, allRecursos, onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-900 z-[6000] p-8 overflow-y-auto" onClick={onClose}>
            <div className="max-w-5xl mx-auto bg-gray-800 p-8 rounded-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                    <h1 className="text-3xl font-bold">Relatório de Auditoria</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Resumo de Atividade de Usuários</h2>
                        <p>{users.length} usuários no sistema.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Resumo de Ocorrências</h2>
                        <p>{allOcorrencias.length} ocorrências totais.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Log de Eventos Recentes</h2>
                        <div className="max-h-96 overflow-y-auto bg-gray-900/50 p-4 rounded-md">
                            {eventLog.slice(0, 20).map(e => (
                                <div key={e.id} className="border-b border-gray-700 py-2">
                                    <p className="text-sm font-semibold">{e.title}</p>
                                    <p className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString('pt-BR')} por {e.operatorName}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// --- Sub-components for each tab ---

const DashboardBI: React.FC<{ocorrencias: Ocorrencia[], voluntarios: Voluntario[]}> = ({ocorrencias, voluntarios}) => {
    const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; children?: React.ReactNode }> = ({ title, value, subtext, children }) => (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
            {children}
        </div>
    );

    const ocorrenciaStats = useMemo(() => {
        return ocorrencias.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {} as Record<OcorrenciaStatus, number>);
    }, [ocorrencias]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total de Voluntários" value={voluntarios.length} />
            <StatCard title="Total de Ocorrências" value={ocorrencias.length} />
            <StatCard title="Ocorrências por Status" value={ocorrenciaStats['Aberta'] || 0} subtext="Abertas">
                 <p className="text-xs text-yellow-400">Em Atendimento: {ocorrenciaStats['Em Atendimento'] || 0}</p>
                 <p className="text-xs text-gray-400">Fechadas: {ocorrenciaStats['Fechada'] || 0}</p>
            </StatCard>
        </div>
    );
};

const UserManagementPanel: React.FC<{users: User[], onUpdateStatus: (id: string, status: UserStatus) => void}> = ({users, onUpdateStatus}) => {
    const roleLabels: Record<UserRole, string> = {
        administrador: 'Administrador',
        operador: 'Operador',
        telefonista: 'Telefonista',
        voluntario: 'Voluntário',
        cidadao: 'Cidadão',
    };

    const StatusBadge: React.FC<{status: UserStatus}> = ({status}) => {
        const styles = {
            active: 'bg-green-900/50 text-green-300',
            pending: 'bg-yellow-900/50 text-yellow-300',
            blocked: 'bg-red-900/50 text-red-300',
        };
        const labels = { active: 'Ativo', pending: 'Pendente', blocked: 'Bloqueado' };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>;
    };
    
    return(
         <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Perfil</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>
                    </tr>
                </thead>
                 <tbody className="divide-y divide-gray-700">
                     {users.map(u => (
                         <tr key={u.id} className="hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-sm font-medium">{u.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-400">{roleLabels[u.role] || u.role}</td>
                            <td className="px-4 py-3 text-sm"><StatusBadge status={u.status} /></td>
                            <td className="px-4 py-3 text-right text-sm space-x-1">
                                {u.status !== 'active' && <button onClick={() => onUpdateStatus(u.id, 'active')} className="p-1 text-gray-400 hover:text-green-400" title="Ativar"><CheckBadgeIcon className="h-5 w-5"/></button>}
                                {u.status !== 'blocked' && <button onClick={() => onUpdateStatus(u.id, 'blocked')} className="p-1 text-gray-400 hover:text-red-400" title="Bloquear"><NoSymbolIcon className="h-5 w-5"/></button>}
                                {u.status === 'blocked' && <button onClick={() => onUpdateStatus(u.id, 'active')} className="p-1 text-gray-400 hover:text-yellow-400" title="Desbloquear"><LockOpenIcon className="h-5 w-5"/></button>}
                            </td>
                         </tr>
                     ))}
                 </tbody>
            </table>
         </div>
    );
};

const ConfigPanel: React.FC<{
    config: SystemConfig,
    onSave: (newConfig: SystemConfig) => void
}> = ({ config, onSave }) => {
    const [localConfig, setLocalConfig] = useState(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setLocalConfig(prev => ({ ...prev, [name]: checked }));
        } else {
            setLocalConfig(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalConfig(prev => ({
            ...prev,
            contacts: {
                ...prev.contacts,
                [name]: value,
            }
        }));
    };

    return (
        <div className="max-w-xl mx-auto">
            <div className="space-y-4">
                <SelectField label="Status do Sistema" name="status" value={localConfig.status} options={['verde', 'amarelo', 'vermelho', 'roxo']} optionLabels={{ verde: 'Verde (Normal)', amarelo: 'Amarelo (Atenção)', vermelho: 'Vermelho (Alerta)', roxo: 'Roxo (Alerta Máximo)'}} onChange={(e) => setLocalConfig(prev => ({...prev, status: e.target.value as SystemStatusLevel}))} />
                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="acceptingRequests" checked={localConfig.acceptingRequests} onChange={handleConfigChange} /><span>Aceitar Pedidos de Ajuda Públicos</span></label>
                <label className="flex items-center space-x-2 text-sm"><input type="checkbox" name="smsNotificationsEnabled" checked={localConfig.smsNotificationsEnabled} onChange={handleConfigChange} /><span>Notificações por SMS</span></label>
                
                <fieldset className="border-t border-gray-700 pt-4 mt-4">
                    <legend className="text-sm font-semibold mb-2">Contatos de Emergência</legend>
                    <div className="space-y-2">
                        <InputField label="SAMU" name="samu" value={localConfig.contacts.samu} onChange={handleContactChange} />
                        <InputField label="Bombeiros" name="bombeiros" value={localConfig.contacts.bombeiros} onChange={handleContactChange} />
                        <InputField label="Defesa Civil" name="defesaCivil" value={localConfig.contacts.defesaCivil} onChange={handleContactChange} />
                    </div>
                </fieldset>

                <div className="pt-4 text-right">
                    <button onClick={() => onSave(localConfig)} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-sm">Salvar Configurações</button>
                </div>
            </div>
        </div>
    );
};

const VolunteerManagementPanel: React.FC<{
    voluntarios: Voluntario[],
    onEdit: (v: Voluntario) => void,
    onDelete: (id: string) => void,
    onViewHistory: (v: Voluntario) => void,
}> = ({ voluntarios, onEdit, onDelete, onViewHistory }) => {
     return(
         <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900/50 sticky top-0">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>
                    </tr>
                </thead>
                 <tbody className="divide-y divide-gray-700">
                     {voluntarios.map(v => (
                         <tr key={v.id} className="hover:bg-gray-700/50">
                            <td className="px-4 py-3 text-sm font-medium">{v.nome}</td>
                            <td className="px-4 py-3 text-sm text-gray-400">{v.status}</td>
                            <td className="px-4 py-3 text-right text-sm space-x-1">
                                <button onClick={() => onViewHistory(v)} className="p-1 text-gray-400 hover:text-cyan-400" title="Ver Histórico"><ClockIcon className="h-5 w-5"/></button>
                                <button onClick={() => onDelete(v.id)} className="p-1 text-gray-400 hover:text-red-400" title="Excluir"><TrashIcon className="h-5 w-5"/></button>
                            </td>
                         </tr>
                     ))}
                 </tbody>
            </table>
         </div>
    );
};

const TeamManagementPanel: React.FC<{
    teams: Team[],
    allVoluntarios: Voluntario[],
    onEdit: (t: Team) => void,
    onDelete: (id: string) => void,
    onAddNew: () => void,
}> = ({ teams, allVoluntarios, onEdit, onDelete, onAddNew }) => {
    const volunteerMap = useMemo(() => new Map(allVoluntarios.map(v => [v.id, v.nome])), [allVoluntarios]);
    return(
         <div>
            <div className="flex justify-end mb-2">
                <button onClick={onAddNew} className="flex items-center py-1 px-3 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-xs"><PlusIcon className="h-4 w-4 mr-1" />Nova Equipe</button>
            </div>
             <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900/50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nome</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Líder</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">Ações</th>
                        </tr>
                    </thead>
                     <tbody className="divide-y divide-gray-700">
                         {teams.map(t => (
                             <tr key={t.id} className="hover:bg-gray-700/50">
                                <td className="px-4 py-3 text-sm font-medium">{t.name} ({t.memberIds.length})</td>
                                <td className="px-4 py-3 text-sm text-gray-400">{volunteerMap.get(t.leaderId) || 'N/A'}</td>
                                <td className="px-4 py-3 text-right text-sm space-x-1">
                                    <button onClick={() => onEdit(t)} className="p-1 text-gray-400 hover:text-yellow-400" title="Editar"><PencilIcon className="h-5 w-5"/></button>
                                    <button onClick={() => onDelete(t.id)} className="p-1 text-gray-400 hover:text-red-400" title="Excluir"><TrashIcon className="h-5 w-5"/></button>
                                </td>
                             </tr>
                         ))}
                     </tbody>
                </table>
             </div>
         </div>
    );
};

const RiskZoneManagementPanel: React.FC<{
    riskZones: RiskZone[], 
    onAddNew: () => void, 
    onEdit: (z: RiskZone) => void, 
    onDelete: (id: string) => void
}> = ({riskZones, onAddNew, onEdit, onDelete}) => {
    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={onAddNew} className="flex items-center py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-sm">
                    <PlusIcon className="h-5 w-5 mr-2" />Adicionar Nova Zona
                </button>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Descrição</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {riskZones.map(z => (
                            <tr key={z.id} className="hover:bg-gray-700/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{z.nome}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${z.active ? 'bg-green-900/50 text-green-300' : 'bg-gray-600 text-gray-200'}`}>
                                        {z.active ? 'Ativa' : 'Inativa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 truncate max-w-xs">{z.descricao || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => onEdit(z)} className="p-2 text-gray-400 hover:text-yellow-400"><PencilIcon className="h-4 w-4" /></button>
                                    <button onClick={() => onDelete(z.id)} className="p-2 text-gray-400 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Main Portal Component
export const AdminPortal: React.FC<AdminPortalProps> = (props) => {
    const { user, onLogout, users, onUpdateUserStatus, systemConfig, onUpdateSystemConfig, riskZones, onAddRiskZone, onUpdateRiskZone, onDeleteRiskZone, activation, updateActivation, allOcorrencias, allVoluntarios, eventLog, allRecursos, onAddRecurso, onUpdateRecurso, onDeleteRecurso, onAddVolunteer, onUpdateVolunteer, onDeleteVolunteer, teams, onAddTeam, onUpdateTeam, onDeleteTeam } = props;

    const [activeTab, setActiveTab] = useState('dashboard');
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isZonasAdminOpen, setZonasAdminOpen] = useState(false);
    const [zoneToEdit, setZoneToEdit] = useState<RiskZone | null>(null);
    const [editingTeam, setEditingTeam] = useState<Team | null | undefined>(undefined);
    const [teamFormError, setTeamFormError] = useState<string | null>(null);
    const [viewingVolunteerHistory, setViewingVolunteerHistory] = useState<Voluntario | null>(null);

    const displaySuccess = (message: string) => {
        setSuccessMessage(message);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleOpenZoneEditor = (zone: RiskZone | null) => {
        setZoneToEdit(zone);
        setZonasAdminOpen(true);
    };

    const handleSaveZone = (zoneData: RiskZone | Omit<RiskZone, 'id'>) => {
        if ('id' in zoneData) {
            onUpdateRiskZone(zoneData, user.name);
            displaySuccess('Zona de risco atualizada!');
        } else {
            onAddRiskZone(zoneData, user.name);
            displaySuccess('Nova zona de risco criada!');
        }
        setZonasAdminOpen(false);
    };

    const handleDeleteZone = (zoneId: string) => {
        if (window.confirm("Tem certeza que deseja excluir esta zona de risco?")) {
            onDeleteRiskZone(zoneId, user.name);
            displaySuccess('Zona de risco excluída.');
        }
    };
    
    const handleSaveTeam = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTeamFormError(null);
        const formData = new FormData(e.currentTarget);
        const memberIds = formData.getAll('memberIds') as string[];
        const name = formData.get('name') as string;
        const leaderId = formData.get('leaderId') as string;

        if (!name || !leaderId) {
            setTeamFormError("Nome da equipe e líder são obrigatórios.");
            return;
        }
        if (!memberIds.includes(leaderId)) {
            setTeamFormError("O líder deve ser um membro da equipe.");
            return;
        }
        
        if (editingTeam) {
            onUpdateTeam({ ...editingTeam, name, leaderId, memberIds }, user.name);
            displaySuccess("Equipe atualizada com sucesso!");
        } else {
            onAddTeam({ name, leaderId, memberIds }, user.name);
            displaySuccess("Equipe criada com sucesso!");
        }
        setEditingTeam(undefined);
    };

    const TABS = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="h-5 w-5 mr-3" /> },
        { id: 'map', label: 'Mapa Geral', icon: <GlobeAltIcon className="h-5 w-5 mr-3" /> },
        { id: 'activation', label: 'Acionamento', icon: <MegaphoneIcon className="h-5 w-5 mr-3" /> },
        { id: 'event-log', label: 'Log de Eventos', icon: <ClockIcon className="h-5 w-5 mr-3" /> },
        { id: 'users', label: 'Ger. Usuários', icon: <UserGroupIcon className="h-5 w-5 mr-3" /> },
        { id: 'volunteers', label: 'Ger. Voluntários', icon: <UserGroupIcon className="h-5 w-5 mr-3" /> },
        { id: 'teams', label: 'Ger. Equipes', icon: <UserGroupIcon className="h-5 w-5 mr-3" /> },
        { id: 'resources', label: 'Ger. Recursos', icon: <CubeIcon className="h-5 w-5 mr-3" /> },
        { id: 'risk-zones', label: 'Zonas de Risco', icon: <ShieldExclamationIcon className="h-5 w-5 mr-3" /> },
        { id: 'config', label: 'Configurações', icon: <CogIcon className="h-5 w-5 mr-3" /> },
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardBI ocorrencias={allOcorrencias} voluntarios={allVoluntarios} />;
            case 'map':
                return <AdminMapView {...props} voluntarios={props.allVoluntarios} ocorrencias={props.allOcorrencias} isRiskZonesVisible={true} onToggleRiskZones={() => {}} onAddNewRiskZone={() => handleOpenZoneEditor(null)} onEditRiskZone={(z) => handleOpenZoneEditor(z)} onDeleteRiskZone={handleDeleteZone} />;
            case 'activation':
                return <ActivationPanel activation={activation} onUpdateActivation={(active, message, meetingPoint) => updateActivation(active, message, meetingPoint, user.name)} />;
            case 'event-log':
                return <div className="h-full"><EventLogPanel events={eventLog} onEventClick={() => {}} /></div>;
            case 'users':
                return <UserManagementPanel users={users} onUpdateStatus={onUpdateUserStatus} />;
            case 'volunteers':
                return <VolunteerManagementPanel voluntarios={allVoluntarios} onEdit={() => {}} onDelete={(id) => onDeleteVolunteer(id, user.name)} onViewHistory={setViewingVolunteerHistory} />;
            case 'teams':
                return <TeamManagementPanel teams={teams} allVoluntarios={allVoluntarios} onEdit={(t) => setEditingTeam(t)} onDelete={(id) => onDeleteTeam(id, user.name)} onAddNew={() => setEditingTeam(null)} />;
            case 'resources':
                return <InventoryPanel recursos={allRecursos} assignedOcorrencias={allOcorrencias} onAddNew={() => {}} onEdit={() => {}} onDelete={(id) => onDeleteRecurso(id, user.name)} />;
            case 'risk-zones':
                return <RiskZoneManagementPanel riskZones={riskZones} onAddNew={() => handleOpenZoneEditor(null)} onEdit={handleOpenZoneEditor} onDelete={handleDeleteZone} />;
            case 'config':
                return <ConfigPanel config={systemConfig} onSave={(newConfig) => onUpdateSystemConfig(newConfig, user.name)} />;
            default:
                return null;
        }
    };

    const isMapActive = activeTab === 'map';

    return (
        <>
            {showSuccess && <SuccessToast message={successMessage} />}
            {isZonasAdminOpen && <AdminZonas onClose={() => setZonasAdminOpen(false)} onSave={handleSaveZone} initialCenter={[-32.035, -52.0986]} zoneToEdit={zoneToEdit} />}
            {editingTeam !== undefined && <TeamFormModal team={editingTeam} allVoluntarios={allVoluntarios} onClose={() => setEditingTeam(undefined)} onSubmit={handleSaveTeam} error={teamFormError} />}
            {viewingVolunteerHistory && <VolunteerHistoryModal volunteer={viewingVolunteerHistory} events={eventLog} onClose={() => setViewingVolunteerHistory(null)} />}
            
            <div className="min-h-screen bg-gray-900 text-white flex flex-col">
                <header className="bg-gray-800/80 backdrop-blur-md shadow-md p-3 flex justify-between items-center z-20 border-b border-gray-700 sticky top-0">
                    <div>
                        <h1 className="text-xl font-bold">Portal do Administrador</h1>
                        <p className="text-xs text-gray-400">Operador: <span className="font-semibold text-cyan-400">{user.name}</span></p>
                    </div>
                    <button onClick={() => onLogout()} className="flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-red-600 transition-colors text-sm">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />Sair
                    </button>
                </header>

                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-64 bg-gray-800/50 flex-shrink-0 p-4 border-r border-gray-700 overflow-y-auto">
                        <ul className="space-y-2">
                            {TABS.map(tab => (
                                <li key={tab.id}>
                                    <button
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-cyan-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <main className={`flex-grow overflow-y-auto ${isMapActive ? 'p-0' : 'p-6'}`}>
                        <h1 className="text-2xl font-bold mb-6 px-6 pt-6">{TABS.find(t => t.id === activeTab)?.label}</h1>
                        <div className={`${isMapActive ? 'h-full' : 'px-6'}`}>
                           {renderActiveTabContent()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};