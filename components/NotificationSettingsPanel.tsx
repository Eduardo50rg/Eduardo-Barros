import React from 'react';
import type { NotificationSettings, NotificationType } from '../types';
import { CogIcon, XMarkIcon, ExclamationTriangleIcon, ShieldExclamationIcon, CloudBoltIcon, BellIcon } from './icons';

interface NotificationSettingsPanelProps {
  settings: NotificationSettings;
  onUpdate: (newSettings: NotificationSettings) => void;
  onClose: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode; }> = ({ checked, onChange, children }) => (
    <label className="flex items-center justify-between cursor-pointer w-full p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200">
        <span className="flex items-center text-sm font-medium text-gray-200">{children}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
    </label>
);

const SettingRow: React.FC<{
  type: NotificationType;
  label: string;
  icon: React.ReactNode;
  settings: NotificationSettings;
  onUpdate: (newSettings: NotificationSettings) => void;
}> = ({ type, label, icon, settings, onUpdate }) => {
  const isSoundEnabled = settings.sounds[type];
  const volume = settings.volumes[type] * 100; // Display as 0-100

  const handleSoundToggle = (enabled: boolean) => {
    onUpdate({
      ...settings,
      sounds: { ...settings.sounds, [type]: enabled },
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...settings,
      volumes: { ...settings.volumes, [type]: parseInt(e.target.value, 10) / 100 },
    });
  };

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
      <ToggleSwitch checked={isSoundEnabled} onChange={handleSoundToggle}>
        {icon} {label}
      </ToggleSwitch>
      <div className={`mt-2 space-y-1 transition-opacity duration-300 ${isSoundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <label className="text-xs text-gray-400">Volume</label>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            disabled={!isSoundEnabled}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-mono w-10 text-center">{Math.round(volume)}%</span>
        </div>
      </div>
    </div>
  );
};


const NotificationSettingsPanel: React.FC<NotificationSettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  
  const handleBrowserNotifToggle = (enabled: boolean) => {
    if (enabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    onUpdate({ ...settings, browser: enabled });
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[4000] flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col text-white animate-fade-in-up border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <CogIcon className="h-6 w-6 mr-3 text-cyan-400" />
            <h2 className="text-xl font-bold">Configurar Alertas</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700" aria-label="Fechar">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <ToggleSwitch checked={settings.browser} onChange={handleBrowserNotifToggle}>
                    <BellIcon className="h-5 w-5 mr-2 text-purple-400" /> Notificações do Navegador
                </ToggleSwitch>
                {settings.browser && Notification.permission !== 'granted' &&
                    <p className="text-xs text-yellow-400 mt-2 p-2 bg-yellow-900/50 rounded">
                        As notificações do navegador estão {Notification.permission === 'denied' ? 'bloqueadas' : 'pendentes'}. Verifique as configurações do seu navegador.
                    </p>
                }
            </div>
            
            <h3 className="text-sm font-bold uppercase text-gray-400 pt-2">Alertas Sonoros</h3>
            <SettingRow 
                type="sos"
                label="Alerta de SOS"
                icon={<ShieldExclamationIcon className="h-5 w-5 mr-2 text-red-400" />}
                settings={settings}
                onUpdate={onUpdate}
            />
            <SettingRow 
                type="occurrence"
                label="Novas Ocorrências"
                icon={<ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />}
                settings={settings}
                onUpdate={onUpdate}
            />
            <SettingRow 
                type="geofence"
                label="Entrada em Zona de Risco"
                icon={<ShieldExclamationIcon className="h-5 w-5 mr-2 text-yellow-500" />}
                settings={settings}
                onUpdate={onUpdate}
            />
            <SettingRow 
                type="climate_extreme"
                label="Alerta Climático Extremo"
                icon={<CloudBoltIcon className="h-5 w-5 mr-2 text-indigo-400" />}
                settings={settings}
                onUpdate={onUpdate}
            />
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-lg flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md">
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPanel;