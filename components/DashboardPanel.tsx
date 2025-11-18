
import React, { useMemo } from 'react';
import type { Voluntario, Ocorrencia } from '../types';
import { ChartBarIcon, UserGroupIcon, ExclamationTriangleIcon, ShieldExclamationIcon } from './icons';

interface DashboardPanelProps {
  voluntarios: Voluntario[];
  ocorrencias: Ocorrencia[];
  criticalAlertsCount: number;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
        <div className="flex items-center mb-2">
            {icon}
            <h4 className="font-bold text-sm text-gray-300 ml-2">{title}</h4>
        </div>
        <div className="space-y-1 text-xs">
            {children}
        </div>
    </div>
);

const StatItem: React.FC<{ label: string; value: number; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-400">{label}:</span>
        <span className={`font-bold text-base ${colorClass}`}>{value}</span>
    </div>
);

const DashboardPanel: React.FC<DashboardPanelProps> = ({ voluntarios, ocorrencias, criticalAlertsCount }) => {

    const volunteerStats = useMemo(() => {
        return voluntarios.reduce((acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [voluntarios]);

    const ocorrenciaStats = useMemo(() => {
        return ocorrencias.reduce((acc, o) => {
            acc[o.status] = (acc[o.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [ocorrencias]);

  return (
    <div className="bg-gray-800/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg flex-col animate-fade-in-up border border-gray-700">
        <div className="flex items-center mb-3">
            <ChartBarIcon className="h-6 w-6 mr-2 text-cyan-400" />
            <h3 className="font-bold text-base">Dashboard Operacional</h3>
        </div>
        <div className="space-y-3">
            <StatCard title="Status Geral" icon={<ShieldExclamationIcon className="h-5 w-5 text-red-400" />}>
                 <StatItem label="Alertas Críticos" value={criticalAlertsCount} colorClass="text-red-400" />
            </StatCard>
            <StatCard title="Voluntários" icon={<UserGroupIcon className="h-5 w-5 text-green-400" />}>
                <StatItem label="Disponível" value={volunteerStats['Disponível'] || 0} colorClass="text-green-400" />
                <StatItem label="Em Missão" value={volunteerStats['Em Missão'] || 0} colorClass="text-blue-400" />
                <StatItem label="Retornando" value={volunteerStats['Retornando'] || 0} colorClass="text-yellow-400" />
                <StatItem label="Inativo" value={volunteerStats['Inativo'] || 0} colorClass="text-gray-500" />
                <StatItem label="Em Perigo" value={volunteerStats['Em Perigo'] || 0} colorClass="text-red-500 animate-pulse" />
                 <div className="border-t border-gray-700 my-1"></div>
                <StatItem label="Total" value={voluntarios.length} colorClass="text-white" />
            </StatCard>
            <StatCard title="Ocorrências" icon={<ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />}>
                <StatItem label="Aberta" value={ocorrenciaStats['Aberta'] || 0} colorClass="text-orange-400" />
                <StatItem label="Em Atendimento" value={ocorrenciaStats['Em Atendimento'] || 0} colorClass="text-yellow-400" />
                <StatItem label="Fechada" value={ocorrenciaStats['Fechada'] || 0} colorClass="text-gray-500" />
                <div className="border-t border-gray-700 my-1"></div>
                <StatItem label="Total" value={ocorrencias.length} colorClass="text-white" />
            </StatCard>
        </div>
    </div>
  );
};

export default DashboardPanel;
