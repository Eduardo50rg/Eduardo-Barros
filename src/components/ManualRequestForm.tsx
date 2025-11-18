import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner, CheckCircleIcon, MapPinIcon, PlusIcon, MinusIcon } from './icons';
import type { Ocorrencia, OcorrenciaGravidade, OcorrenciaPrioridade, Vitimas, OcorrenciaStatus } from '../types';

interface ManualRequestFormProps {
  onSubmit: (data: Omit<Ocorrencia, 'id' | 'timestamp' | 'citizenId' > | Ocorrencia) => void;
  onClose: () => void;
  initialData?: Ocorrencia | null;
}


const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={name}
      name={name}
      {...props}
      className={`mt-1 w-full p-3 border rounded-md text-gray-800 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }> = ({ label, error, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      id={name}
      name={name}
      {...props}
      className={`mt-1 w-full p-3 border rounded-md text-gray-800 ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const VictimCounter: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
        <label className="text-gray-700 font-medium text-sm">{label}</label>
        <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="p-2 rounded-full bg-red-200 text-red-700 hover:bg-red-300"><MinusIcon className="h-4 w-4" /></button>
            <span className="w-8 text-center font-bold text-lg text-gray-800">{value}</span>
            <button type="button" onClick={() => onChange(value + 1)} className="p-2 rounded-full bg-green-200 text-green-700 hover:bg-green-300"><PlusIcon className="h-4 w-4" /></button>
        </div>
    </div>
);


export const ManualRequestForm: React.FC<ManualRequestFormProps> = ({ onSubmit, onClose, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        code: `OC-${String(Date.now()).slice(-5)}`,
        tipo: 'Alagamento',
        descricao: '',
        gravidade: 'Moderado' as OcorrenciaGravidade,
        prioridade: 'Normal' as OcorrenciaPrioridade,
        solicitante: { nome: '', telefone: '', isTerceiro: false, nomeVitima: '' },
        vitimas: { adultos: 1, criancas: 0, idosos: 0, pcd: 0, animais: 0 },
        endereco: { logradouro: '', numero: '', bairro: '', cidade: 'Rio Grande', estado: 'RS', cep: '', referencia: '' },
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    const [isVerifying, setIsVerifying] = useState(false);
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [mapPreviewUrl, setMapPreviewUrl] = useState<string | null>(null);
    const verifiedCoordsRef = useRef<{lat: number, lng: number} | null>(null);
    
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                code: initialData.code || prev.code,
                tipo: initialData.tipo || prev.tipo,
                descricao: initialData.descricao || prev.descricao,
                gravidade: initialData.gravidade || prev.gravidade,
                prioridade: initialData.prioridade || prev.prioridade,
                solicitante: { ...prev.solicitante, ...(initialData.solicitante || {}) },
                vitimas: { ...prev.vitimas, ...(initialData.vitimas || {}) },
                endereco: { ...prev.endereco, ...(initialData.endereco || {}) },
            }));
            if (initialData.latitude && initialData.longitude) {
                verifiedCoordsRef.current = { lat: initialData.latitude, lng: initialData.longitude };
                setIsAddressVerified(true);
            }
        }
    }, [initialData]);


    const handleCepSearch = async (cep: string) => {
        if (cep.replace(/\D/g, '').length !== 8) return;
        setCepLoading(true);
        setError('');
        setIsAddressVerified(false);
        setMapPreviewUrl(null);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
            const data = await response.json();
            if (data.erro) {
                setValidationErrors(prev => ({ ...prev, "endereco.cep": "CEP não encontrado." }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    endereco: {
                        ...prev.endereco,
                        cep: data.cep || prev.endereco.cep,
                        logradouro: data.logradouro || prev.endereco.logradouro,
                        bairro: data.bairro || prev.endereco.bairro,
                        cidade: data.localidade || prev.endereco.cidade,
                        estado: data.uf || prev.endereco.estado,
                    }
                }));
            }
        } catch {
            setError("Erro ao buscar CEP. Verifique a conexão.");
        } finally {
            setCepLoading(false);
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const [section, field] = name.split('.');

        setIsAddressVerified(false);
        setMapPreviewUrl(null);
        verifiedCoordsRef.current = null;

        if (section === 'solicitante' || section === 'endereco' || section === 'vitimas') {
            const isCheckbox = type === 'checkbox' && e.target instanceof HTMLInputElement;
            const isNumeric = section === 'vitimas';
            setFormData(prev => ({
                ...prev,
                [section]: { ...(prev as any)[section], [field]: isCheckbox ? (e.target as HTMLInputElement).checked : isNumeric ? parseInt(value) || 0 : value }
            }));
            if(name === 'endereco.cep') {
                handleCepSearch(value);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setValidationErrors(prev => ({ ...prev, [name]: '' }));
    };

     const handleVictimChange = (field: keyof Vitimas, value: number) => {
        setFormData(prev => ({...prev, vitimas: { ...prev.vitimas!, [field]: value } }));
    };

    const handleVerifyAddress = async () => {
        setIsVerifying(true);
        setError('');
        setMapPreviewUrl(null);
        verifiedCoordsRef.current = null;
        
        const { logradouro, numero, cidade, estado, cep } = formData.endereco;
        if (!logradouro || !cidade || !estado) {
            setError("Preencha o endereço completo (Rua, Cidade, Estado) para verificar.");
            setIsVerifying(false);
            return;
        }

        const addressQuery = `street=${encodeURIComponent(`${numero} ${logradouro}`)}&city=${encodeURIComponent(cidade)}&state=${encodeURIComponent(estado)}&postalcode=${encodeURIComponent(cep)}`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${addressQuery}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                verifiedCoordsRef.current = coords;
                setMapPreviewUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng-0.005},${coords.lat-0.0025},${coords.lng+0.005},${coords.lat+0.0025}&layer=mapnik&marker=${coords.lat},${coords.lng}`);
                setIsAddressVerified(true);
            } else {
                setError("Endereço não encontrado. Verifique os dados e tente novamente.");
                setIsAddressVerified(false);
            }
        } catch (err) {
            console.error("Geocoding failed:", err);
            setError("Falha ao verificar o endereço. Verifique sua conexão.");
            setIsAddressVerified(false);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        if (!isAddressVerified || !verifiedCoordsRef.current) {
            setError("É necessário verificar o endereço no mapa antes de salvar.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        
        const baseData = {
            ...formData,
            latitude: verifiedCoordsRef.current!.lat,
            longitude: verifiedCoordsRef.current!.lng,
        };

        if (isEditing) {
            onSubmit({
                ...initialData!,
                ...baseData,
            });
        } else {
            onSubmit({
                ...baseData,
                status: 'Aberta' as OcorrenciaStatus,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[4000] flex justify-center items-center p-4" onClick={() => onClose()}>
            <div className="bg-gray-50 text-gray-900 rounded-lg shadow-xl w-full max-w-3xl animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Editar Solicitação' : 'Registrar Nova Solicitação de Ajuda'}</h2>
                </div>
                <form id="manual-request-form" onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
                    {error && <p className="text-red-600 text-sm mb-4 bg-red-100 p-3 rounded-md">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">1. Solicitante e Ocorrência</h3>
                            <InputField label="Nome do Solicitante" name="solicitante.nome" value={formData.solicitante.nome} onChange={handleChange} required />
                            <InputField label="Telefone de Contato" name="solicitante.telefone" value={formData.solicitante.telefone} onChange={handleChange} required />
                            <InputField label="Código da Ocorrência" name="code" value={formData.code} onChange={handleChange} required />
                            <InputField label="Tipo de Ocorrência" name="tipo" value={formData.tipo} onChange={handleChange} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gravidade</label>
                                    <select name="gravidade" value={formData.gravidade} onChange={handleChange} className="mt-1 w-full p-3 border rounded-md text-gray-800 border-gray-300">
                                        <option value="Moderado">Moderado</option>
                                        <option value="Crítico">Crítico</option>
                                        <option value="Controle">Controle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                                    <select name="prioridade" value={formData.prioridade} onChange={handleChange} className="mt-1 w-full p-3 border rounded-md text-gray-800 border-gray-300">
                                        <option value="Normal">Normal</option>
                                        <option value="Baixa">Baixa</option>
                                        <option value="Alta">Alta</option>
                                        <option value="Urgente">Urgente</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">2. Endereço</h3>
                            <div>
                              <label htmlFor="endereco.cep" className="block text-sm font-medium text-gray-700">CEP</label>
                              <div className="relative mt-1">
                                  <input type="text" id="endereco.cep" name="endereco.cep" placeholder="96200-000" maxLength={9} value={formData.endereco.cep} onChange={handleChange} className={`w-full p-3 border rounded-md pr-10 text-gray-800 ${validationErrors['endereco.cep'] ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} />
                                  {cepLoading && <LoadingSpinner className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />}
                              </div>
                              {validationErrors['endereco.cep'] && <p className="mt-1 text-xs text-red-600">{validationErrors['endereco.cep']}</p>}
                            </div>
                            <InputField label="Rua / Logradouro" name="endereco.logradouro" value={formData.endereco.logradouro} onChange={handleChange} required />
                             <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2"><InputField label="Bairro" name="endereco.bairro" value={formData.endereco.bairro} onChange={handleChange} required /></div>
                                <InputField label="Nº" name="endereco.numero" value={formData.endereco.numero} onChange={handleChange} required />
                            </div>
                             <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2"><InputField label="Cidade" name="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} required /></div>
                                <InputField label="UF" name="endereco.estado" value={formData.endereco.estado} onChange={handleChange} required />
                            </div>
                            <InputField label="Ponto de Referência" name="endereco.referencia" value={formData.endereco.referencia} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2 space-y-4 pt-2">
                            <h3 className="font-semibold text-lg border-b pb-2">3. Detalhes da Emergência</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <VictimCounter label="Adultos" value={formData.vitimas.adultos} onChange={(v) => handleVictimChange('adultos', v)} />
                                <VictimCounter label="Crianças" value={formData.vitimas.criancas} onChange={(v) => handleVictimChange('criancas', v)} />
                                <VictimCounter label="Idosos" value={formData.vitimas.idosos} onChange={(v) => handleVictimChange('idosos', v)} />
                                <VictimCounter label="PCD" value={formData.vitimas.pcd} onChange={(v) => handleVictimChange('pcd', v)} />
                                <VictimCounter label="Animais" value={formData.vitimas.animais} onChange={(v) => handleVictimChange('animais', v)} />
                            </div>
                             <TextAreaField label="Descrição da Situação" name="descricao" rows={3} placeholder="Descreva a situação com mais detalhes..." value={formData.descricao} onChange={handleChange} required />
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="font-semibold text-lg border-b pb-2">4. Verificação no Mapa</h3>
                             <button type="button" onClick={() => handleVerifyAddress()} disabled={isVerifying} className="w-full mt-2 flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-600 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50">
                                {isVerifying ? <LoadingSpinner className="h-5 w-5 mr-2" /> : <MapPinIcon className="h-5 w-5 mr-2" />}
                                {isVerifying ? 'Verificando...' : 'Verificar Endereço no Mapa'}
                            </button>
                            {mapPreviewUrl && (
                                <div className="mt-4 border rounded-lg overflow-hidden h-48 animate-fade-in-up">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={mapPreviewUrl}
                                    ></iframe>
                                </div>
                            )}
                            {isAddressVerified && <p className="text-green-600 text-sm mt-2 flex items-center"><CheckCircleIcon className="h-5 w-5 mr-2"/>Endereço verificado com sucesso!</p>}
                        </div>
                    </div>
                </form>
                <div className="p-4 border-t mt-auto flex-shrink-0 bg-gray-100 flex justify-end gap-2">
                     <button type="button" onClick={() => onClose()} className="bg-gray-300 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-400">Cancelar</button>
                     <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting || !isAddressVerified} className="bg-red-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-600 flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed">
                         {isSubmitting ? <LoadingSpinner className="h-6 w-6" /> : <> <MapPinIcon className="h-5 w-5 mr-2" /> {isEditing ? 'Salvar Alterações' : 'Registrar e Localizar'} </>}
                     </button>
                </div>
            </div>
        </div>
    );
};
