import React, { useState, useRef, useEffect } from 'react';
import { UserGroupIcon, ExclamationTriangleIcon, MapPinIcon, ShieldExclamationIcon, CogIcon, ChartBarIcon, FireIcon, ClockIcon, TableCellsIcon, ListBulletIcon, ArrowRightOnRectangleIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon, ShareIcon, CrosshairIcon } from './icons';
import type { Voluntario, Ocorrencia, OcorrenciaGravidade, OcorrenciaPrioridade } from '../types';

interface MapControlsProps {
  operatorName: string;
  onLogout: () => void;
  showVoluntarios: boolean;
  setShowVoluntarios: React.Dispatch<React.SetStateAction<boolean>>;
  showOcorrencias: boolean;
  setShowOcorrencias: React.Dispatch<React.SetStateAction<boolean>>;
  showRiskZones: boolean;
  setShowRiskZones: React.Dispatch<React.SetStateAction<boolean>>;
  showRoutes: boolean;
  setShowRoutes: React.Dispatch<React.SetStateAction<boolean>>;
  showHeatmap: boolean;
  setShowHeatmap: React.Dispatch<React.SetStateAction<boolean>>;
  heatmapRadius: number;
  setHeatmapRadius: React.Dispatch<React.SetStateAction<number>>;
  heatmapIntensity: number;
  setHeatmapIntensity: React.Dispatch<React.SetStateAction<number>>;
  onLocateUser: () => void;
  onResetView: () => void;
  onOpenHistoryPanel: () => void;
  onOpenRiskZoneAdmin: () => void;
  onOpenSettingsPanel: () => void;
  onToggleDashboard: () => void;
  isDashboardOpen: boolean;
  onToggleEventLog: () => void;
  isEventLogOpen: boolean;
  onOpenDataManagementPanel: () => void;
  ocorrenciaCount: number;
  riskZoneCount: number;
  volunteerCount: number;
  filterTipo: string[];
  onToggleTipoFilter: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterGravidade: OcorrenciaGravidade[];
  onToggleGravidadeFilter: (value: OcorrenciaGravidade) => void;
  ocorrenciaTipos: string[];
  selectedOcorrencia: Ocorrencia | null;
  onClearSelection: () => void;
  viewingHistoryFor: Voluntario | null;
  dateFilter: { start: string, end: string } | null;
  setDateFilter: (filter: { start: string, end: string }) => void;
  clearDateFilter: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; title: string; isActive?: boolean }> = ({ onClick, children, title, isActive }) => (
    // FIX: Changed from a direct pass of `onClick` to a lambda to prevent passing an event argument to a function that expects none.
    <button onClick={() => onClick()} title={title} className={`p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-cyan-500 text-gray-300 hover:text-white'}`}>
        {children}
    </button>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode; count: number; }> = ({ checked, onChange, children, count }) => (
    <label className="flex items-center justify-between cursor-pointer w-full p-3 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
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

const FilterSelect: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, value, onChange, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
    <select 
      value={value}
      onChange={onChange}
      className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
    >
      {children}
    </select>
  </div>
);

const MultiSelectDropdown: React.FC<{
  label: string;
  options: string[];
  selectedOptions: string[];
  onToggleOption: (option: string) => void;
}> = ({ label, options, selectedOptions, onToggleOption }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayText = selectedOptions.length === 0 ? `Todos os Tipos` : selectedOptions.length === 1 ? selectedOptions[0] : `${selectedOptions.length} tipos selecionados`;

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-2 flex justify-between items-center">
                <span className="truncate">{displayText}</span>
                {isOpen ? <ChevronUpIcon className="h-4 w-4"/> : <ChevronDownIcon className="h-4 w-4"/>}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-md z-10 max-h-48 overflow-y-auto">
                    {options.map(option => (
                        <label key={option} className="flex items-center px-3 py-2 text-sm hover:bg-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => onToggleOption(option)}
                                className="h-4 w-4 rounded bg-gray-800 border-gray-500 text-cyan-600 focus:ring-cyan-500 mr-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export const MapControls: React.FC<MapControlsProps> = (props) => {
  const { operatorName, onLogout, showVoluntarios, setShowVoluntarios, showOcorrencias, setShowOcorrencias, showRiskZones, setShowRiskZones, showRoutes, setShowRoutes, showHeatmap, setShowHeatmap, heatmapRadius, setHeatmapRadius, heatmapIntensity, setHeatmapIntensity, onLocateUser, onResetView, onOpenHistoryPanel, onOpenRiskZoneAdmin, onOpenSettingsPanel, onToggleDashboard, isDashboardOpen, onToggleEventLog, isEventLogOpen, onOpenDataManagementPanel, ocorrenciaCount, riskZoneCount, filterTipo, onToggleTipoFilter, filterStatus, onFilterStatusChange, filterGravidade, onToggleGravidadeFilter, ocorrenciaTipos, selectedOcorrencia, onClearSelection, viewingHistoryFor, dateFilter, setDateFilter, clearDateFilter } = props;
  
  const toLocalISOString = (date: Date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (dateFilter) {
      setStart(toLocalISOString(new Date(dateFilter.start)));
      setEnd(toLocalISOString(new Date(dateFilter.end)));
    } else {
      setStart('');
      setEnd('');
    }
  }, [dateFilter]);

  const handleApplyDateFilter = () => {
    if (start && end) {
      setDateFilter({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    }
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700 w-full">
        <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <div><h2 className="font-bold text-lg text-gray-100">Controle Operacional</h2><p className="text-xs text-gray-400">Operador: <span className="font-semibold text-cyan-400">{operatorName}</span></p></div>
              <button onClick={() => onLogout()} title="Sair" className="p-2 rounded-lg bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white"><ArrowRightOnRectangleIcon className="h-5 w-5"/></button>
            </div>
        </div>
      
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 px-3">Camadas do Mapa</h3>
        <ToggleSwitch checked={showVoluntarios} onChange={setShowVoluntarios} count={props.volunteerCount}><UserGroupIcon className="h-5 w-5 mr-2 text-green-400" />Voluntários</ToggleSwitch>
        <ToggleSwitch checked={showOcorrencias} onChange={setShowOcorrencias} count={ocorrenciaCount}><ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />Ocorrências</ToggleSwitch>
        <ToggleSwitch checked={showRiskZones} onChange={setShowRiskZones} count={riskZoneCount}><ShieldExclamationIcon className="h-5 w-5 mr-2 text-red-400" />Zonas de Risco</ToggleSwitch>
        <ToggleSwitch checked={showHeatmap} onChange={setShowHeatmap} count={0}><FireIcon className="h-5 w-5 mr-2 text-orange-400" />Mapa de Calor</ToggleSwitch>
        {showHeatmap && (
          <div className="p-3 space-y-3 border-t border-gray-700/50 mt-2">
            <div>
              <label className="text-xs font-medium text-gray-400">Raio ({heatmapRadius}px)</label>
              <input type="range" min="10" max="100" value={heatmapRadius} onChange={e => setHeatmapRadius(Number(e.target.value))} className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400">Intensidade ({heatmapIntensity})</label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={heatmapIntensity} onChange={e => setHeatmapIntensity(Number(e.target.value))} className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3 border-b border-gray-700">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Filtros</h3>
        <FilterSelect label="Status da Ocorrência" value={filterStatus} onChange={(e) => onFilterStatusChange(e.target.value)}>
          <option value="all">Todas</option><option value="Aberta">Aberta</option><option value="Em Atendimento">Em Atendimento</option><option value="Fechada">Fechada</option>
        </FilterSelect>
        <MultiSelectDropdown label="Tipo de Ocorrência" options={ocorrenciaTipos} selectedOptions={filterTipo} onToggleOption={onToggleTipoFilter} />
      </div>

      <div className="p-4 space-y-3 border-b border-gray-700">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Filtro por Data</h3>
        <div className="space-y-2">
            <div>
                <label className="text-xs text-gray-400">De</label>
                <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-1.5"/>
            </div>
             <div>
                <label className="text-xs text-gray-400">Até</label>
                <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-md p-1.5"/>
            </div>
            <div className="flex gap-2">
                <button type="button" onClick={() => clearDateFilter()} className="w-full text-center bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-2 rounded-md">Limpar</button>
                <button type="button" onClick={() => handleApplyDateFilter()} className="w-full text-center bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded-md">Aplicar</button>
            </div>
        </div>
      </div>
       
      {(selectedOcorrencia || viewingHistoryFor) && (
        <div className="p-3 border-t border-gray-700 animate-fade-in-down bg-gray-900/50">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-sm text-cyan-400">{selectedOcorrencia ? 'Visualizando Ocorrência' : 'Visualizando Histórico'}</h3>
                <button onClick={() => onClearSelection()} title="Limpar Seleção" className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"><XMarkIcon className="h-4 w-4" /></button>
            </div>
            <p className="text-xs text-gray-400 truncate">
                {selectedOcorrencia ? `${selectedOcorrencia.tipo} (${selectedOcorrencia.code})` : `Rota de ${viewingHistoryFor?.nome}`}
            </p>
        </div>
      )}

       <div className="p-3 border-t border-gray-700 grid grid-cols-3 gap-2">
            <ControlButton onClick={() => onToggleDashboard()} title="Dashboard" isActive={isDashboardOpen}><ChartBarIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onToggleEventLog()} title="Log de Eventos" isActive={isEventLogOpen}><ListBulletIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => setShowRoutes(!showRoutes)} title="Mostrar Rotas" isActive={showRoutes}><ShareIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onOpenHistoryPanel()} title="Relatórios"><ClockIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onOpenDataManagementPanel()} title="Gerenciar Dados"><TableCellsIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onOpenRiskZoneAdmin()} title="Gerenciar Zonas de Risco"><ShieldExclamationIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onLocateUser()} title="Minha Localização"><CrosshairIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onResetView()} title="Resetar Visualização"><MapPinIcon className="h-5 w-5" /></ControlButton>
            <ControlButton onClick={() => onOpenSettingsPanel()} title="Configurações"><CogIcon className="h-5 w-5" /></ControlButton>
        </div>
    </div>
  );
};