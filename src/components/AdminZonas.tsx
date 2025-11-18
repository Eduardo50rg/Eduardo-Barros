import React, { useEffect, useRef, useState } from 'react';
import type { AdminZonasProps, RiskZone } from '../types';
import { SaveIcon, XMarkIcon, CogIcon, LoadingSpinner } from './icons';

declare const L: any; // Using Leaflet and Leaflet Draw from global scope
declare const turf: any; // Using Turf.js for validation

const AdminZonas: React.FC<AdminZonasProps> = ({ onClose, onSave, initialCenter, zoneToEdit }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const drawnItemsRef = useRef<any | null>(null);
  const drawControlRef = useRef<any | null>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [polygonCoords, setPolygonCoords] = useState<number[][][] | null>(null);
  const [error, setError] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!zoneToEdit;

  const validatePolygon = (coords: number[][][] | null): boolean => {
    if (!coords) return true; 
    if (typeof turf !== 'undefined') {
        try {
            const polygonFeature = turf.polygon(coords);
            const kinks = turf.kinks(polygonFeature);
            if (kinks.features.length > 0) {
                setError('O polígono desenhado é inválido (possui auto-interseções). Por favor, corrija o desenho.');
                return false;
            }
        } catch (e) {
             console.error("Error during polygon validation:", e);
             setError("Ocorreu um erro ao validar o polígono. Tente desenhar novamente.");
             return false;
        }
    }
    setError('');
    return true;
  };

  useEffect(() => {
    if (typeof L === 'undefined' || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapRef.current);

    drawnItemsRef.current = new L.FeatureGroup();
    mapRef.current.addLayer(drawnItemsRef.current);

    if (zoneToEdit) {
        setNome(zoneToEdit.nome);
        setDescricao(zoneToEdit.descricao || '');
        setIsActive(zoneToEdit.active);
        
        const existingGeoJson = L.geoJSON(zoneToEdit.coordenadas, {
            style: { color: '#EF4444' }
        });

        existingGeoJson.eachLayer((layer: any) => {
            layer.addTo(drawnItemsRef.current);
            if (layer.editing) {
                layer.editing.enable();
            }
        });

        setPolygonCoords(zoneToEdit.coordenadas.coordinates);
        mapRef.current.fitBounds(existingGeoJson.getBounds());
    }
    // No 'else' block: For new zones, the map starts empty, prompting the user to draw.

    drawControlRef.current = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          shapeOptions: { color: '#EF4444' },
          allowIntersection: false,
        },
        polyline: false, marker: false, circle: false, rectangle: false, circlemarker: false,
      },
      edit: {
        featureGroup: drawnItemsRef.current,
        remove: true,
      },
    });
    mapRef.current.addControl(drawControlRef.current);

    mapRef.current.on(L.Draw.Event.DRAWSTART, () => {
        setIsDrawing(true);
    });
    mapRef.current.on(L.Draw.Event.DRAWSTOP, () => {
        setIsDrawing(false);
    });

    mapRef.current.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItemsRef.current.clearLayers();
      drawnItemsRef.current.addLayer(layer);
      
      const geojson = layer.toGeoJSON();
      if (layer.editing) {
          layer.editing.enable();
      }
      
      if(validatePolygon(geojson.geometry.coordinates)) {
        setPolygonCoords(geojson.geometry.coordinates);
      }
    });
    
    mapRef.current.on(L.Draw.Event.EDITED, (event: any) => {
      event.layers.eachLayer((layer: any) => {
        const geojson = layer.toGeoJSON();
        if(validatePolygon(geojson.geometry.coordinates)) {
            setPolygonCoords(geojson.geometry.coordinates);
        }
      });
    });

    mapRef.current.on(L.Draw.Event.DELETED, () => {
      setPolygonCoords(null);
    });
    
    setTimeout(() => {
        mapRef.current?.invalidateSize();
    }, 400);

    return () => {
      if (mapRef.current) {
        if (drawControlRef.current) {
            mapRef.current.removeControl(drawControlRef.current);
            drawControlRef.current = null;
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, zoneToEdit]);

  const handleSave = async () => {
    if (!nome.trim()) {
      setError('O nome da zona é obrigatório.');
      return;
    }
    if (!polygonCoords) {
      setError('É necessário desenhar a zona no mapa.');
      return;
    }

    if (!validatePolygon(polygonCoords)) {
        return;
    }
    
    setIsSaving(true);
    setError('');

    const saveData: RiskZone | Omit<RiskZone, 'id'> = {
        ...(zoneToEdit && { id: zoneToEdit.id }),
        nome,
        descricao,
        active: isActive,
        coordenadas: {
            type: 'Polygon',
            coordinates: polygonCoords,
        },
    };
    
    try {
        await onSave(saveData);
    } catch(err) {
        setError("Falha ao salvar a zona. Tente novamente.");
    } finally {
        setIsSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-[4000] flex justify-center items-center p-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col text-white animate-fade-in-up border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <CogIcon className="h-6 w-6 mr-3 text-cyan-400" />
            <h2 className="text-xl font-bold">{isEditing ? 'Editar Zona de Risco' : 'Criar Nova Zona de Risco'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700" aria-label="Fechar">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          <div className="w-1/3 bg-gray-900/50 p-6 flex flex-col space-y-6 overflow-y-auto">
            <div>
              <label htmlFor="zone-name" className="block text-sm font-medium text-gray-300 mb-1">Nome da Zona</label>
              <input
                type="text"
                id="zone-name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Ex: Encosta do Morro Azul"
              />
            </div>

            <div>
              <label htmlFor="zone-description" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
              <textarea
                id="zone-description"
                rows={4}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                placeholder="Detalhes sobre o risco, área de abrangência, etc."
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Status da Zona</span>
              <label className="flex items-center cursor-pointer">
                <span className={`mr-2 text-sm ${isActive ? 'text-green-400' : 'text-gray-400'}`}>{isActive ? 'Ativa' : 'Inativa'}</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isActive} onChange={() => setIsActive(!isActive)} />
                  <div className={`block w-10 h-6 rounded-full ${isActive ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isActive ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400">
                {isEditing
                  ? 'Ajuste a área da zona de risco usando os pontos de controle no mapa.'
                  : 'Use a ferramenta de desenho de polígono no mapa para criar a nova zona de risco.'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-md animate-tremor">
                {error}
              </div>
            )}
          </div>

          <div className="w-2/3 h-full relative">
            <div className="absolute top-2 left-2 z-[1000] bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg text-xs text-white shadow-lg border border-gray-700">
              <p>
                {isDrawing
                  ? 'Clique no mapa para adicionar pontos. Clique no primeiro ponto para fechar o polígono.'
                  : isEditing
                  ? 'Arraste os pontos para editar a forma da zona.'
                  : 'Use o controle de polígono (canto superior direito) para desenhar a nova zona.'}
              </p>
            </div>
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-700 flex-shrink-0 bg-gray-900/50">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 mr-2">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-md flex items-center w-36 justify-center disabled:bg-cyan-800"
          >
            {isSaving ? <LoadingSpinner className="h-5 w-5"/> : <><SaveIcon className="h-5 w-5 mr-2" /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminZonas;
