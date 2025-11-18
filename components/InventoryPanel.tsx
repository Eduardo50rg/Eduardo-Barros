import React, { useState, useMemo } from 'react';
import type { Recurso, Ocorrencia } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from './icons';

interface InventoryPanelProps {
    recursos: Recurso[];
    onAddNew: () => void;
    onEdit: (r: Recurso) => void;
    onDelete: (id: string) => void;
    assignedOcorrencias: Ocorrencia[];
};

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ recursos, onAddNew, onEdit, onDelete, assignedOcorrencias }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const ocorrenciaMap = useMemo(() => new Map(assignedOcorrencias.map(o => [o.id, o.code])), [assignedOcorrencias]);

    const filteredRecursos = useMemo(() => {
        return recursos.filter(r => {
            const matchesSearch = searchTerm === '' ||
                r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.tipo.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [recursos, searchTerm, filterStatus]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Inventário de Recursos</h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-9 pr-4 py-2 text-sm"
                        />
                        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-md py-2 text-sm"
                    >
                        <option value="all">Todos Status</option>
                        <option value="Disponível">Disponível</option>
                        <option value="Em Uso">Em Uso</option>
                        <option value="Manutenção">Manutenção</option>
                    </select>
                    <button onClick={onAddNew} className="flex items-center py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold text-sm flex-shrink-0">
                        <PlusIcon className="h-5 w-5 mr-2" />Adicionar
                    </button>
                </div>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Alocado em</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredRecursos.map(r => (
                                <tr key={r.id} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{r.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{r.tipo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            r.status === 'Disponível' ? 'bg-green-900/50 text-green-300' :
                                            r.status === 'Em Uso' ? 'bg-yellow-900/50 text-yellow-300' :
                                            'bg-red-900/50 text-red-300'
                                        }`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{r.assignedOcorrenciaId ? ocorrenciaMap.get(r.assignedOcorrenciaId) || r.assignedOcorrenciaId : '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                        <button onClick={() => onEdit(r)} title="Editar" className="p-2 text-gray-400 hover:text-yellow-400"><PencilIcon className="h-4 w-4" /></button>
                                        <button onClick={() => onDelete(r.id)} title="Excluir" className="p-2 text-gray-400 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                             {filteredRecursos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">Nenhum recurso encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
