import React, { useState, useEffect, useMemo } from 'react';
import type { DataManagementPanelProps as OriginalDataManagementPanelProps, Voluntario, Ocorrencia, VolunteerStatus, OcorrenciaStatus, OcorrenciaPrioridade } from '../types';
import { TableCellsIcon, XMarkIcon, PencilIcon, TrashIcon, UserGroupIcon, ExclamationTriangleIcon, PlusIcon, MagnifyingGlassIcon, LoadingSpinner } from './icons';

interface DataManagementPanelProps extends OriginalDataManagementPanelProps {
  operatorName: string;
}

const DataManagementPanel: React.FC<DataManagementPanelProps> = ({
  onClose,
  operatorName,
  voluntarios,
  ocorrencias,
  onAddVolunteer,
  onUpdateVolunteer,
  onDeleteVolunteer,
  onAddOcorrencia,
  onUpdateOcorrencia,
  onDeleteOcorrencia,
}) => {
  const [activeTab, setActiveTab] = useState<'voluntarios' | 'ocorrencias'>('voluntarios');
  const [editingVolunteer, setEditingVolunteer] = useState<Voluntario | null>(null);
  const [editingOcorrencia, setEditingOcorrencia] = useState<Ocorrencia | null>(null);
  const [isFormVisible, setFormVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [ocorrenciaSearchTerm, setOcorrenciaSearchTerm] = useState('');

  const filteredOcorrencias = useMemo(() => {
    if (!ocorrenciaSearchTerm) return ocorrencias;
    const searchLower = ocorrenciaSearchTerm.toLowerCase();
    return ocorrencias.filter(o =>
        o.code.toLowerCase().includes(searchLower) ||
        o.tipo.toLowerCase().includes(searchLower) ||
        (o.solicitante && o.solicitante.nome.toLowerCase().includes(searchLower))
    );
  }, [ocorrencias, ocorrenciaSearchTerm]);

  const handleEditVolunteer = (v: Voluntario) => {
    setEditingVolunteer(v);
    setFormVisible(true);
    setFormError(null);
  };

  const handleEditOcorrencia = (o: Ocorrencia) => {
    setEditingOcorrencia(o);
    setFormVisible(true);
    setFormError(null);
  };
  
  const handleAddNew = () => {
    setEditingVolunteer(null);
    setEditingOcorrencia(null);
    setFormVisible(true);
    setFormError(null);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setEditingVolunteer(null);
    setEditingOcorrencia(null);
    setFormError(null);
  };
  
  const handleSubmitVolunteer = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormError(null);
      setIsSaving(true);
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      
      const lat = parseFloat(data.latitude as string);
      const lon = parseFloat(data.longitude as string);

      if (!data.nome || !data.telefone) {
          setFormError("Nome e telefone são obrigatórios.");
          setIsSaving(false);
          return;
      }
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          setFormError("Latitude (-90 a 90) e Longitude (-180 a 180) devem ser números válidos.");
          setIsSaving(false);
          return;
      }

      const volunteerData = {
          nome: data.nome as string,
          telefone: data.telefone as string,
          latitude: lat,
          longitude: lon,
      };
      
      try {
        if(editingVolunteer) {
            await onUpdateVolunteer({...editingVolunteer, ...volunteerData}, operatorName);
        } else {
            await onAddVolunteer(volunteerData as any, operatorName);
        }
        handleCloseForm();
      } catch (err) {
        setFormError("Falha ao salvar. Tente novamente.");
      } finally {
        setIsSaving(false);
      }
  };

  const handleSubmitOcorrencia = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormError(null);
      setIsSaving(true);
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      const lat = parseFloat(data.latitude as string);
      const lon = parseFloat(data.longitude as string);
      
      if (!data.tipo || !data.descricao || !data.code) {
        setFormError("Código, Tipo e Descrição são obrigatórios.");
        setIsSaving(false);
        return;
      }
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setFormError("Latitude (-90 a 90) e Longitude (-180 a 180) devem ser números válidos.");
        setIsSaving(false);
        return;
      }

      const ocorrenciaData = {
          code: data.code as string,
          tipo: data.tipo as string,
          descricao: data.descricao as string,
          status: data.status as OcorrenciaStatus,
          latitude: lat,
          longitude: lon,
          prioridade: data.prioridade as OcorrenciaPrioridade,
      };
      
      try {
        if (editingOcorrencia) {
            await onUpdateOcorrencia({ ...editingOcorrencia, ...ocorrenciaData }, operatorName);
        } else {
            await onAddOcorrencia(ocorrenciaData as Omit<Ocorrencia, 'id' | 'timestamp'>, operatorName);
        }
        handleCloseForm();
      } catch(err) {
         setFormError("Falha ao salvar. Tente novamente.");
      } finally {
        setIsSaving(false);
      }
  };


  const renderForm = () => {
    if (!isFormVisible) return null;
    
    const formContent = activeTab === 'voluntarios' ? (
      <>
        <h3 className="text-lg font-bold mb-4">{editingVolunteer ? 'Editar Voluntário' : 'Novo Voluntário'}</h3>
        <form onSubmit={handleSubmitVolunteer} className="space-y-4 flex-grow flex flex-col">
            <InputField label="Nome" name="nome" defaultValue={editingVolunteer?.nome} required />
            <InputField label="Telefone" name="telefone" defaultValue={editingVolunteer?.telefone} required />
            <InputField label="Latitude" name="latitude" type="number" step="any" defaultValue={editingVolunteer?.latitude} required />
            <InputField label="Longitude" name="longitude" type="number" step="any" defaultValue={editingVolunteer?.longitude} required />
            <div className="flex-grow"></div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold w-24 flex justify-center">
                    {isSaving ? <LoadingSpinner className="h-5 w-5"/> : 'Salvar'}
                </button>
            </div>
        </form>
      </>
    ) : (
      <>
        <h3 className="text-lg font-bold mb-4">{editingOcorrencia ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h3>
        <form onSubmit={handleSubmitOcorrencia} className="space-y-4 flex-grow flex flex-col">
            <InputField label="Código da Ocorrência" name="code" defaultValue={editingOcorrencia?.code || `OC-${String(Date.now()).slice(-5)}`} required />
            <InputField label="Tipo" name="tipo" defaultValue={editingOcorrencia?.tipo} required />
            <TextAreaField label="Descrição" name="descricao" defaultValue={editingOcorrencia?.descricao} required />
            <SelectField label="Prioridade" name="prioridade" defaultValue={editingOcorrencia?.prioridade || 'Normal'} options={['Baixa', 'Normal', 'Alta', 'Urgente']} required />
            <SelectField label="Status" name="status" defaultValue={editingOcorrencia?.status || 'Aberta'} options={['Aberta', 'Em Atendimento', 'Fechada']} required />
            <InputField label="Latitude" name="latitude" type="number" step="any" defaultValue={editingOcorrencia?.latitude} required />
            <InputField label="Longitude" name="longitude" type="number" step="any" defaultValue={editingOcorrencia?.longitude} required />
             <div className="flex-grow"></div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white font-bold w-24 flex justify-center">
                    {isSaving ? <LoadingSpinner className="h-5 w-5"/> : 'Salvar'}
                </button>
            </div>
        </form>
      </>
    );

    return (
        <div className="absolute inset-0 bg-gray-800 p-6 flex flex-col">
            {formError && <p className="text-red-400 text-sm mb-4 bg-red-900/50 p-3 rounded-md">{formError}</p>}
            {formContent}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[4000] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col text-white animate-fade-in-up border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <TableCellsIcon className="h-6 w-6 mr-3 text-cyan-400" />
            <h2 className="text-xl font-bold">Gerenciamento de Dados</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700" aria-label="Fechar"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex flex-grow overflow-hidden relative">
          <div className="w-1/3 bg-gray-900/50 p-4 border-r border-gray-700 flex flex-col">
            <div className="flex space-x-2 mb-4">
              <TabButton isActive={activeTab === 'voluntarios'} onClick={() => { setActiveTab('voluntarios'); handleCloseForm(); setOcorrenciaSearchTerm(''); }}><UserGroupIcon className="h-5 w-5 mr-2" />Voluntários</TabButton>
              <TabButton isActive={activeTab === 'ocorrencias'} onClick={() => { setActiveTab('ocorrencias'); handleCloseForm(); }}><ExclamationTriangleIcon className="h-5 w-5 mr-2" />Ocorrências</TabButton>
            </div>
            <div className="flex-grow overflow-y-auto">
              {activeTab === 'ocorrencias' && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Buscar por código, tipo, solicitante..."
                    value={ocorrenciaSearchTerm}
                    onChange={(e) => setOcorrenciaSearchTerm(e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded-md pl-9 pr-4 py-2 text-sm text-white"
                  />
                  <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              )}
              <ul className="space-y-2">
                {activeTab === 'voluntarios' && voluntarios.map(v => <ListItem key={v.id} title={v.nome} subtitle={v.status} onEdit={() => handleEditVolunteer(v)} onDelete={() => onDeleteVolunteer(v.id, operatorName)} />)}
                {activeTab === 'ocorrencias' && filteredOcorrencias.map(o => <ListItem key={o.id} title={`${o.tipo} (${o.code})`} subtitle={o.status} onEdit={() => handleEditOcorrencia(o)} onDelete={() => onDeleteOcorrencia(o.id, operatorName)} />)}
              </ul>
            </div>
            <div className="pt-4 mt-auto">
                <button onClick={handleAddNew} className="w-full flex items-center justify-center py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md font-bold">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Adicionar Novo
                </button>
            </div>
          </div>
          <div className="w-2/3 relative">{renderForm()}</div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center p-2 rounded-md text-sm font-bold transition-colors ${isActive ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
        {children}
    </button>
);

const ListItem: React.FC<{ title: string, subtitle: string, onEdit: () => void, onDelete: () => void }> = ({ title, subtitle, onEdit, onDelete }) => (
    <li className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md">
        <div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className="space-x-2">
            <button onClick={onEdit} className="p-2 text-gray-400 hover:text-yellow-400"><PencilIcon className="h-4 w-4" /></button>
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
        </div>
    </li>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
    </div>
);
const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea {...props} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500" />
    </div>
);
const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[] }> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select {...props} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export default DataManagementPanel;