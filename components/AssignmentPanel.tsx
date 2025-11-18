import React, { useState, useMemo } from 'react';
import type { Ocorrencia, Voluntario } from '../types';
import { XMarkIcon, UserGroupIcon, MagnifyingGlassIcon, CheckCircleIcon } from './icons';

interface AssignmentPanelProps {
  ocorrencia: Ocorrencia;
  availableVolunteers: Voluntario[];
  onAssign: (volunteerIds: string[]) => void;
  onCancel: () => void;
}

const AssignmentPanel: React.FC<AssignmentPanelProps> = ({ ocorrencia, availableVolunteers, onAssign, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
    );
  };
  
  const filteredVolunteers = useMemo(() => {
      return availableVolunteers.filter(v =>
        v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.qualifications?.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [availableVolunteers, searchTerm]);
  
  const handleSubmit = () => {
    if (selectedIds.length > 0) {
      onAssign(selectedIds);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex justify-center items-center p-4" onClick={onCancel}>
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md flex flex-col text-white animate-fade-in-up border border-gray-700 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold">Designar Equipe</h2>
            <p className="text-sm text-gray-400">Ocorrência: {ocorrencia.code} - {ocorrencia.tipo}</p>
          </div>
          <button onClick={onCancel} className="p-1 rounded-full hover:bg-gray-700" aria-label="Fechar">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 flex-shrink-0">
            <div className="relative">
                <input 
                    type="text"
                    placeholder="Buscar voluntário por nome ou qualificação..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                />
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
        </div>

        <div className="flex-grow overflow-y-auto px-4">
            <ul className="space-y-2">
                {filteredVolunteers.map(v => (
                    <li key={v.id}>
                       <label className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedIds.includes(v.id) ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}>
                           <input
                                type="checkbox"
                                checked={selectedIds.includes(v.id)}
                                onChange={() => handleToggleSelection(v.id)}
                                className="hidden"
                           />
                           <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center mr-3 flex-shrink-0 ${selectedIds.includes(v.id) ? 'bg-cyan-500 border-cyan-400' : 'border-gray-500 bg-gray-800'}`}>
                                {selectedIds.includes(v.id) && <CheckCircleIcon className="h-4 w-4 text-white" />}
                           </div>
                           <div className="flex-grow">
                                <p className="font-semibold text-white">{v.nome}</p>
                                {v.qualifications && v.qualifications.length > 0 && (
                                     <p className="text-xs text-gray-400">{v.qualifications.join(', ')}</p>
                                )}
                           </div>
                       </label>
                    </li>
                ))}
            </ul>
        </div>
        
        <div className="p-4 border-t border-gray-700 bg-gray-900/50 rounded-b-lg flex justify-between items-center flex-shrink-0">
            <span className="text-sm text-gray-400">{selectedIds.length} selecionado(s)</span>
            <div>
                <button onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 mr-2">
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md flex items-center disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    <UserGroupIcon className="h-5 w-5 mr-2" />
                    Designar Equipe
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AssignmentPanel;