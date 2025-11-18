import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoadingSpinner, MapPinIcon, PlusIcon, MinusIcon, CheckCircleIcon, ClockIcon } from './icons';
import type { HelpRequestData, OcorrenciaGravidade, Vitimas } from '../types';

declare const L: any;

interface HelpRequestFormProps {
  onSubmit: (data: HelpRequestData) => void;
  onQueueForSync: (data: HelpRequestData) => void;
  onClose: () => void;
  initialData?: Partial<HelpRequestData> | null;
  initialIsForOther?: boolean;
  autoLocate?: boolean;
}

const LocationPickerModal: React.FC<{
    initialCenter: [number, number];
    onConfirm: (coords: { lat: number, lng: number }) => void;
    onClose: () => void;
}> = ({ initialCenter, onConfirm, onClose }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any | null>(null);
    const markerRef = useRef<any | null>(null);
    const [markerPosition, setMarkerPosition] = useState<{ lat: number, lng: number }>({ lat: initialCenter[0], lng: initialCenter[1] });

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = L.map(mapContainerRef.current, {
            center: initialCenter,
            zoom: 16,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
        }).addTo(mapRef.current);

        markerRef.current = L.marker(initialCenter, { draggable: true }).addTo(mapRef.current);

        markerRef.current.on('dragend', (event: any) => {
            setMarkerPosition(event.target.getLatLng());
        });
        
        // Invalidate map size after modal animation
        setTimeout(() => mapRef.current?.invalidateSize(), 400);

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, [initialCenter]);

    return (
        <div className="fixed inset-0 bg-black/70 z-[5000] flex items-center justify-center p-4" onClick={() => onClose()}>
            <div className="bg-white rounded-lg w-full max-w-2xl h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">Ajuste a Localização no Mapa</h3>
                    <p className="text-sm text-gray-600">Arraste o marcador para a localização exata da emergência.</p>
                </div>
                <div ref={mapContainerRef} className="flex-grow w-full h-full" />
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={() => onClose()} className="bg-gray-300 text-gray-800 font-bold px-4 py-2 rounded-lg hover:bg-gray-400">Cancelar</button>
                    <button onClick={() => onConfirm(markerPosition)} className="bg-blue-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-600">Confirmar Localização</button>
                </div>
            </div>
        </div>
    );
};


const VictimCounter: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <label className="text-gray-700 font-medium">{label}</label>
        <div className="flex items-center gap-2">
            <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="p-2 rounded-full bg-red-200 text-red-700 hover:bg-red-300"><MinusIcon className="h-4 w-4" /></button>
            <span className="w-8 text-center font-bold text-lg">{value}</span>
            <button type="button" onClick={() => onChange(value + 1)} className="p-2 rounded-full bg-green-200 text-green-700 hover:bg-green-300"><PlusIcon className="h-4 w-4" /></button>
        </div>
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }> = ({ label, error, name, ...props }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={name}
      name={name}
      {...props}
      className={`mt-1 w-full p-3 border rounded-md ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const SuccessView: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="text-center p-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Pedido Enviado!</h2>
        <p className="mt-2 text-gray-600">Sua solicitação de ajuda foi recebida. Acompanhe o status e aguarde o contato da nossa equipe.</p>
        <button onClick={() => onClose()} className="mt-6 w-full bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600">
            Fechar
        </button>
    </div>
);

const QueuedView: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="text-center p-8">
        <ClockIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Pedido na Fila!</h2>
        <p className="mt-2 text-gray-600">Você parece estar offline. Sua solicitação foi salva e será enviada automaticamente assim que a conexão for restabelecida.</p>
        <button onClick={() => onClose()} className="mt-6 w-full bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600">
            Entendido
        </button>
    </div>
);


const HelpRequestForm: React.FC<HelpRequestFormProps> = ({ onSubmit, onQueueForSync, onClose, initialData, initialIsForOther }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Omit<HelpRequestData, 'endereco'>>>({
    solicitante: { nome: '', telefone: '', isTerceiro: false, nomeVitima: '' },
    vitimas: { adultos: 1, criancas: 0, idosos: 0, pcd: 0, animais: 0 },
    gravidade: 'Moderado',
    descricao: ''
  });
  const [endereco, setEndereco] = useState({
    cep: '', logradouro: '', numero: '', bairro: '', cidade: 'Rio Grande', estado: 'RS', referencia: ''
  });

  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'queued' | 'error'>('idle');
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [cepLoading, setCepLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  
  const [isMapPickerVisible, setMapPickerVisible] = useState(false);
  const [mapPickerInitialCenter, setMapPickerInitialCenter] = useState<[number, number]>([-32.035, -52.0986]);
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const verifiedCoordsRef = useRef<{lat: number, lng: number} | null>(null);

  const handleUseCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setErrorMessage('');
    setInfoMessage('Obtendo sua localização...');
    setIsAddressVerified(false);
    verifiedCoordsRef.current = null;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude, longitude } = position.coords;
      
      verifiedCoordsRef.current = { lat: latitude, lng: longitude };

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      
      if (data && data.address) {
        setEndereco(prev => ({
          ...prev,
          cep: data.address.postcode || '',
          logradouro: data.address.road || '',
          bairro: data.address.suburb || data.address.city_district || '',
          cidade: data.address.city || data.address.town || 'Rio Grande',
          estado: data.address.state || 'RS',
        }));
        setInfoMessage("Localização preenchida via GPS. Verifique os dados e preencha o número da casa.");
        setIsAddressVerified(true); // Auto-verify GPS location
      } else {
        setErrorMessage("Não foi possível encontrar o endereço para sua localização. Preencha manualmente.");
      }
    } catch (err: any) {
      let message = 'Não foi possível obter sua localização. Verifique as permissões.';
      if (err.code === 1) message = 'Permissão de localização negada.';
      setErrorMessage(message);
    } finally {
      setIsLocating(false);
      if (!errorMessage) setTimeout(() => setInfoMessage(''), 5000);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (initialData) {
        setFormData(prev => ({
            ...prev,
            ...initialData,
            solicitante: { ...prev.solicitante!, ...(initialData.solicitante || {}) },
            vitimas: { ...prev.vitimas!, ...(initialData.vitimas || {}) },
        }));
        if (initialData.endereco) {
            setEndereco(prev => ({...prev, ...(initialData.endereco || {})}));
        }
        if (initialData.descricao) {
            setStep(2);
        }
    }
    if (initialIsForOther) {
        setFormData(prev => ({
            ...prev,
            solicitante: { ...prev.solicitante!, isTerceiro: true }
        }));
    }
  }, [initialData, initialIsForOther]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const [section, field] = name.split('.');
    
    setIsAddressVerified(false);
    setInfoMessage('');

    if (section === 'solicitante') {
      const isCheckbox = type === 'checkbox' && e.target instanceof HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        solicitante: { ...prev.solicitante!, [field]: isCheckbox ? (e.target as HTMLInputElement).checked : value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
     setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIsAddressVerified(false);
    setInfoMessage('');
    setEndereco(prev => ({...prev, [name]: value}));
    setValidationErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVictimChange = (field: keyof Vitimas, value: number) => {
    setFormData(prev => ({...prev, vitimas: { ...prev.vitimas!, [field]: value } }));
  };

  const handleCepSearch = async (cep: string) => {
    if (cep.replace(/\D/g, '').length !== 8) return;
    setCepLoading(true);
    setErrorMessage('');
    setIsAddressVerified(false);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      if (data.erro) {
         setValidationErrors(prev => ({ ...prev, cep: "CEP não encontrado." }));
      } else {
        setEndereco(prev => ({
          ...prev,
          cep: data.cep,
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
        }));
      }
    } catch {
      setErrorMessage("Erro ao buscar CEP. Verifique sua conexão.");
    } finally {
      setCepLoading(false);
    }
  };


  const handleSubmit = async () => {
    setErrorMessage('');
    setValidationErrors({});
    if (!formData.descricao?.trim()) {
        setValidationErrors({ descricao: "A descrição da situação é obrigatória para entendermos como ajudar." });
        return;
    }
    if (!isAddressVerified || !verifiedCoordsRef.current) {
        setErrorMessage("A localização da emergência precisa ser confirmada. Use o GPS, digite o endereço ou ajuste no mapa.");
        return;
    }
    
    setSubmissionStatus('submitting');
    
    const finalData = { 
        ...formData, 
        endereco, 
        latitude: verifiedCoordsRef.current.lat, 
        longitude: verifiedCoordsRef.current.lng 
    } as HelpRequestData;

    if (navigator.onLine) {
        onSubmit(finalData);
        setSubmissionStatus('success');
    } else {
        onQueueForSync(finalData);
        setSubmissionStatus('queued');
    }
  };
  
   const handleOpenMapPicker = async () => {
        setErrorMessage('');
        setInfoMessage('Preparando mapa...');
        
        const { logradouro, numero, cidade, estado, cep } = endereco;
        if (!logradouro || !cidade || !estado) {
            setInfoMessage("Ajuste o mapa manualmente. Para uma melhor precisão inicial, preencha o endereço primeiro.");
            setMapPickerInitialCenter([-32.035, -52.0986]);
            setMapPickerVisible(true);
            return;
        }

        const addressQuery = `street=${encodeURIComponent(`${numero} ${logradouro}`)}&city=${encodeURIComponent(cidade)}&state=${encodeURIComponent(estado)}&postalcode=${encodeURIComponent(cep)}`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?${addressQuery}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setMapPickerInitialCenter([parseFloat(lat), parseFloat(lon)]);
            } else {
                setErrorMessage("Endereço não encontrado para centrar o mapa. Posicione manualmente.");
                setMapPickerInitialCenter([-32.035, -52.0986]); // Default center
            }
        } catch (err) {
            setErrorMessage("Falha ao buscar endereço. Posicione manualmente no mapa.");
            setMapPickerInitialCenter([-32.035, -52.0986]);
        } finally {
            setInfoMessage('');
            setMapPickerVisible(true);
        }
    };
    
    const handleMapConfirm = async (coords: { lat: number, lng: number }) => {
        verifiedCoordsRef.current = coords;
        setIsAddressVerified(true);
        setMapPickerVisible(false);
        setInfoMessage('Localização ajustada no mapa. Atualizando endereço...');

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`);
            const data = await response.json();
            if (data && data.address) {
                setEndereco(prev => ({
                    ...prev,
                    cep: data.address.postcode || prev.cep,
                    logradouro: data.address.road || prev.logradouro,
                    bairro: data.address.suburb || data.address.city_district || prev.bairro,
                    cidade: data.address.city || data.address.town || prev.cidade,
                    estado: data.address.state || prev.estado,
                }));
            }
            setInfoMessage('Endereço atualizado com a localização do mapa.');
        } catch {
            setErrorMessage('Não foi possível buscar o endereço para as coordenadas selecionadas.');
        } finally {
             setTimeout(() => setInfoMessage(''), 5000);
        }
    };


  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    
    if (!formData.solicitante?.nome?.trim()) errors['solicitante.nome'] = "Nome é obrigatório.";
    if (!formData.solicitante?.telefone?.trim()) errors['solicitante.telefone'] = "Telefone é obrigatório.";
    else if (!phoneRegex.test(formData.solicitante.telefone)) errors['solicitante.telefone'] = "Telefone inválido (Ex: 53 91234-5678).";
    
    if (formData.solicitante?.isTerceiro) {
        if (!formData.solicitante.nomeVitima?.trim()) errors['solicitante.nomeVitima'] = "Nome da vítima é obrigatório.";
    }
    
    if (!endereco.logradouro?.trim()) errors.logradouro = "Logradouro é obrigatório.";
    if (!isAddressVerified) {
        setErrorMessage("É necessário confirmar a localização da emergência antes de prosseguir.");
        return false;
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return false;
    
    setStep(2);
    return true;
  };

  return (
    <>
      {isMapPickerVisible && <LocationPickerModal initialCenter={mapPickerInitialCenter} onClose={() => setMapPickerVisible(false)} onConfirm={handleMapConfirm} />}
      <div className="fixed inset-0 bg-black/60 z-[4000] flex items-center justify-center p-4" onClick={submissionStatus === 'idle' ? () => onClose() : undefined} role="dialog" aria-modal="true">
        <div className="bg-gray-50 text-gray-900 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
           {submissionStatus === 'success' ? (
            <SuccessView onClose={onClose} />
          ) : submissionStatus === 'queued' ? (
            <QueuedView onClose={onClose} />
          ) : (
            <>
              {/* Header */}
              <div className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
                  <div className="flex justify-between items-start">
                      <div>
                          <h2 className="text-2xl font-bold text-gray-800">Solicitação de Ajuda</h2>
                          <p className="text-sm text-gray-500">Etapa {step} de 2</p>
                      </div>
                      <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none" aria-label="Fechar">&times;</button>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-grow overflow-y-auto p-6">
                {errorMessage && <p className="text-red-600 text-sm mb-4 bg-red-100 p-3 rounded-md">{errorMessage}</p>}
                {infoMessage && <p className="text-blue-600 text-sm mb-4 bg-blue-100 p-3 rounded-md">{infoMessage}</p>}
                
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">1. Identificação</h3>
                        <InputField label="Seu nome completo" type="text" name="solicitante.nome" value={formData.solicitante?.nome || ''} onChange={handleInputChange} error={validationErrors['solicitante.nome']} required />
                        <InputField label="Seu telefone (com DDD)" type="tel" name="solicitante.telefone" value={formData.solicitante?.telefone || ''} onChange={handleInputChange} error={validationErrors['solicitante.telefone']} required />
                        <label className="flex items-center gap-2"><input type="checkbox" name="solicitante.isTerceiro" checked={formData.solicitante?.isTerceiro || false} onChange={handleInputChange} /> Estou pedindo ajuda para outra pessoa.</label>
                        
                        {formData.solicitante?.isTerceiro && (
                            <div className="animate-fade-in-up">
                                <InputField label="Nome da pessoa que precisa de ajuda" type="text" name="solicitante.nomeVitima" value={formData.solicitante?.nomeVitima || ''} onChange={handleInputChange} error={validationErrors['solicitante.nomeVitima']} />
                            </div>
                        )}

                        <div className="space-y-4 pt-4">
                            <h3 className="font-semibold text-lg border-b pb-2">2. Local da Emergência</h3>
                            {!formData.solicitante?.isTerceiro && (
                                <button type="button" onClick={() => handleUseCurrentLocation()} disabled={isLocating} className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-600 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50">
                                    {isLocating ? <LoadingSpinner className="h-5 w-5 mr-2" /> : <MapPinIcon className="h-5 w-5 mr-2" />}
                                    {isLocating ? 'Obtendo localização...' : 'Usar minha localização atual (GPS)'}
                                </button>
                            )}
                            <div className="text-center text-sm text-gray-500">ou preencha o endereço abaixo:</div>
                            
                             <div className="space-y-4 p-4 bg-gray-100 rounded-lg border">
                                <div>
                                  <label htmlFor="cep" className="block text-sm font-medium text-gray-700">CEP</label>
                                  <div className="relative mt-1">
                                      <input type="text" id="cep" name="cep" placeholder="Apenas números" maxLength={9} value={endereco.cep} onChange={e => { handleEnderecoChange(e); handleCepSearch(e.target.value); }} className={`w-full p-3 border rounded-md pr-10 ${validationErrors.cep ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} />
                                      {cepLoading && <LoadingSpinner className="h-5 w-5 absolute right-3 top-3.5 text-gray-400" />}
                                  </div>
                                  {validationErrors.cep && <p className="mt-1 text-xs text-red-600">{validationErrors.cep}</p>}
                                </div>
                                <InputField label="Rua / Logradouro" type="text" name="logradouro" value={endereco.logradouro} onChange={handleEnderecoChange} error={validationErrors.logradouro} />
                                <InputField label="Nº" type="text" name="numero" value={endereco.numero} onChange={handleEnderecoChange} />
                                <InputField label="Bairro" type="text" name="bairro" value={endereco.bairro} onChange={handleEnderecoChange} />
                                <InputField label="Ponto de Referência" type="text" name="referencia" value={endereco.referencia} onChange={handleEnderecoChange} />
                             </div>

                            <button type="button" onClick={() => handleOpenMapPicker()} className="w-full flex items-center justify-center p-3 border-2 border-dashed rounded-md text-gray-600 hover:bg-gray-100 hover:border-gray-400">
                                <MapPinIcon className="h-5 w-5 mr-2" />
                                Ajustar Localização no Mapa
                            </button>
                            {isAddressVerified && <p className="text-green-600 text-sm flex items-center"><CheckCircleIcon className="h-5 w-5 mr-2"/>Localização confirmada!</p>}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">3. Detalhes da Emergência</h3>
                        <div>
                            <label className="font-medium">Nível de Gravidade</label>
                            <select name="gravidade" value={formData.gravidade} onChange={handleInputChange} className="w-full p-3 border rounded-md mt-1">
                                <option value="Crítico">Crítico (Risco de vida imediato)</option>
                                <option value="Moderado">Moderado (Precisa de ajuda, mas estável)</option>
                                <option value="Controle">Controle (Situação sob controle, precisa de apoio)</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <VictimCounter label="Adultos" value={formData.vitimas!.adultos} onChange={(v) => handleVictimChange('adultos', v)} />
                            <VictimCounter label="Crianças" value={formData.vitimas!.criancas} onChange={(v) => handleVictimChange('criancas', v)} />
                            <VictimCounter label="Idosos" value={formData.vitimas!.idosos} onChange={(v) => handleVictimChange('idosos', v)} />
                            <VictimCounter label="Pessoas com Deficiência" value={formData.vitimas!.pcd} onChange={(v) => handleVictimChange('pcd', v)} />
                            <VictimCounter label="Animais" value={formData.vitimas!.animais} onChange={(v) => handleVictimChange('animais', v)} />
                        </div>
                        
                        <div>
                            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">Descreva a situação</label>
                            <textarea id="descricao" name="descricao" rows={4} placeholder="Descreva a situação com mais detalhes..." value={formData.descricao || ''} onChange={handleInputChange} className={`mt-1 w-full p-3 border rounded-md ${validationErrors.descricao ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'}`} required />
                            {validationErrors.descricao && <p className="mt-1 text-xs text-red-600">{validationErrors.descricao}</p>}
                        </div>
                    </div>
                )}
              </div>

              {/* Footer with Actions */}
              <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0 bg-gray-100 rounded-b-lg">
                  {step === 1 && (
                      <button onClick={() => validateStep1()} className="w-full bg-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-600">Próximo</button>
                  )}
                  {step === 2 && (
                      <div className="flex gap-2">
                          <button onClick={() => setStep(1)} className="w-full bg-gray-300 text-gray-800 font-bold px-6 py-3 rounded-lg hover:bg-gray-400">Voltar</button>
                          <button onClick={() => handleSubmit()} disabled={submissionStatus === 'submitting'} className="w-full bg-red-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-600 flex items-center justify-center disabled:bg-red-300">
                              {submissionStatus === 'submitting' ? <LoadingSpinner className="h-6 w-6" /> : <><MapPinIcon className="h-5 w-5 mr-2" /> Enviar Pedido</>}
                          </button>
                      </div>
                  )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpRequestForm;