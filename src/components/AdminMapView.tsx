import React, { useMemo } from 'react';
import type { AdminMapViewProps } from '../types';
import LeafletMap from './LeafletMap';
import DashboardPanel from './DashboardPanel';
import { AlertsPanel } from './AlertsPanel';
import { ShieldExclamationIcon, PlusIcon } from './icons';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode; count: number; }> = ({ checked, onChange, children, count }) => (
    <label className="flex items-center justify-between cursor-pointer w-full p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
        <span className="flex items-center text-sm font-medium text-gray-200">{children}</span>
        <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">{count}</span>
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
            </div>
        </div>
    </label>
);

const AdminMapView: React.FC<AdminMapViewProps> = ({
  voluntarios,
  ocorrencias,
  riskZones,
  activation,
  geofenceAlerts,
  climateAlerts,
  sosAlerts,
  dismissGeofenceAlert,
  dismissClimateAlert,
  dismissSosAlert,
  onEditRiskZone,
  onDeleteRiskZone,
  onAddNewRiskZone,
  isRiskZonesVisible,
  onToggleRiskZones,
}) => {
  const criticalAlertsCount = useMemo(() => {
    return (
      sosAlerts.length +
      climateAlerts.filter((a) => a.severity === 'extreme').length
    );
  }, [sosAlerts, climateAlerts]);

  return (
    <div className="relative h-full w-full">
      <LeafletMap
        voluntarios={voluntarios}
        ocorrencias={ocorrencias}
        riskZones={isRiskZonesVisible ? riskZones : []}
        activation={activation}
        showHeatmap={false}
        climateAlerts={climateAlerts}
        showRoutes={true}
        onOcorrenciaSelect={() => {}}
        onClearSelection={() => {}}
        onViewVolunteerPath={() => {}}
        onViewAssignedRoute={() => {}}
        onEditRiskZone={onEditRiskZone || (() => {})}
        onDeleteRiskZone={onDeleteRiskZone || (() => {})}
        onLocationError={(message: string) => alert(`Erro de localização: ${message}`)}
      />
      
      <AlertsPanel
        sosAlerts={sosAlerts}
        geofenceAlerts={geofenceAlerts}
        climateAlerts={climateAlerts}
        activation={activation}
        onDismissSos={dismissSosAlert}
        onDismissGeofence={dismissGeofenceAlert}
        onDismissClimate={dismissClimateAlert}
      />
      
      <div className="absolute top-4 left-4 z-[1000] w-72 space-y-3">
        <DashboardPanel voluntarios={voluntarios} ocorrencias={ocorrencias} criticalAlertsCount={criticalAlertsCount} />

        <div className="bg-gray-800/80 backdrop-blur-md p-2 rounded-lg border border-gray-700 space-y-2">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-1 px-2">Gerenciar Mapa</h3>
            {onToggleRiskZones && (
                <ToggleSwitch checked={isRiskZonesVisible ?? true} onChange={() => onToggleRiskZones()} count={riskZones.length}>
                    <ShieldExclamationIcon className="h-5 w-5 mr-2 text-red-400" />Zonas de Risco
                </ToggleSwitch>
            )}
            {onAddNewRiskZone && (
                 <button onClick={onAddNewRiskZone} className="w-full flex items-center justify-center py-2 px-4 bg-cyan-600/80 hover:bg-cyan-700 rounded-md font-bold text-sm">
                    <PlusIcon className="h-5 w-5 mr-2" />Adicionar Zona de Risco
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminMapView;