import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactDOMServer from 'react-dom/server';
import type { Voluntario, Ocorrencia, RiskZone, Activation, MapControlHandles, ClimateAlert } from '../types';
import { VolunteerIcon, OnMissionVolunteerIcon, ReturningVolunteerIcon, InactiveVolunteerIcon, DistressVolunteerIcon, IncidentIcon, InProgressIncidentIcon, ClosedIncidentIcon, UserLocationIcon, FlagIcon, ShareIcon, SearchMarkerIcon, ChatBubbleLeftRightIcon, TeammateIcon } from './icons';

declare const L: any; // Using Leaflet from global scope

const ROUTE_COLORS = ['#3b82f6', '#ef4444', '#f97316', '#84cc16', '#a855f7', '#ec4899'];

const getColorForOcorrencia = (ocorrenciaId: string) => {
    let hash = 0;
    for (let i = 0; i < ocorrenciaId.length; i++) {
        hash = ocorrenciaId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % ROUTE_COLORS.length);
    return ROUTE_COLORS[index];
};


interface LeafletMapProps {
  voluntarios: Voluntario[];
  ocorrencias: Ocorrencia[];
  riskZones: RiskZone[];
  climateAlerts: ClimateAlert[];
  activation: Activation;
  showHeatmap: boolean;
  heatmapRadius?: number;
  heatmapIntensity?: number;
  showRoutes: boolean;
  newestIncidentId?: string | null;
  updatedVolunteerIds?: string[];
  suggestedVolunteerIds?: string[];
  associatedVolunteerIds?: string[];
  initialCenter?: [number, number];
  initialZoom?: number;
  onViewChange?: (center: { lat: number; lng: number; }) => void;
  selectedOcorrenciaId?: string | null;
  onOcorrenciaSelect: (ocorrencia: Ocorrencia) => void;
  onClearSelection: () => void;
  onViewVolunteerPath: (volunteerId: string) => void;
  onViewAssignedRoute?: (volunteerId: string) => void;
  onEditRiskZone: (zone: RiskZone) => void;
  onDeleteRiskZone: (zoneId: string) => void;
  teammates?: Voluntario[];
  volunteerHistoryPath?: Array<[number, number]> | null;
  assignedRoute?: any | null;
  highlightedRoutes?: any[];
  highlightedAlert?: { id: string; lat: number; lng: number; } | null;
  onLocationError: (message: string) => void;
}

const LeafletMap = forwardRef<MapControlHandles, LeafletMapProps>(({
  voluntarios = [],
  ocorrencias = [],
  riskZones = [],
  climateAlerts = [],
  activation,
  showHeatmap,
  heatmapRadius = 30,
  heatmapIntensity = 0.5,
  showRoutes,
  newestIncidentId = null,
  updatedVolunteerIds = [],
  suggestedVolunteerIds = [],
  associatedVolunteerIds = [],
  initialCenter = [-32.035, -52.0986], // Rio Grande, RS
  initialZoom = 13,
  onViewChange,
  selectedOcorrenciaId,
  onOcorrenciaSelect,
  onClearSelection,
  onViewVolunteerPath,
  onViewAssignedRoute,
  onEditRiskZone,
  onDeleteRiskZone,
  teammates = [],
  volunteerHistoryPath = null,
  assignedRoute = null,
  highlightedRoutes = [],
  highlightedAlert = null,
  onLocationError,
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any | null>(null);
  const volunteersLayerRef = useRef<any | null>(null);
  const ocorrenciasLayerRef = useRef<any | null>(null);
  const riskZonesLayerRef = useRef<any | null>(null);
  const climateAlertsLayerRef = useRef<any | null>(null);
  const heatmapLayerRef = useRef<any | null>(null);
  const userLocationMarkerRef = useRef<any | null>(null);
  const searchMarkerRef = useRef<any | null>(null);
  const routesLayerRef = useRef<any | null>(null);
  const volunteerHistoryLayerRef = useRef<any | null>(null);
  const assignedRouteLayerRef = useRef<any | null>(null);
  const highlightedRoutesLayerRef = useRef<any | null>(null);
  const activationMarkerRef = useRef<any | null>(null);
  const highlightLayerRef = useRef<any | null>(null);
  const isProgrammaticMove = useRef(false);

  // Expose map control functions to parent component
  useImperativeHandle(ref, () => ({
    locateUser: () => {
        isProgrammaticMove.current = true;
        mapRef.current.locate({ setView: true, maxZoom: 16 });
    },
    resetView: () => {
        isProgrammaticMove.current = true;
        if (searchMarkerRef.current) {
            mapRef.current.removeLayer(searchMarkerRef.current);
            searchMarkerRef.current = null;
        }
        mapRef.current.setView(initialCenter, initialZoom);
    },
    searchLocation: (lat, lng, label) => {
        isProgrammaticMove.current = true;
        if (searchMarkerRef.current) mapRef.current.removeLayer(searchMarkerRef.current);
        
        const iconHtml = ReactDOMServer.renderToString(<SearchMarkerIcon className="w-10 h-10" />);
        const searchIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 40] });
        
        searchMarkerRef.current = L.marker([lat, lng], { icon: searchIcon }).addTo(mapRef.current).bindPopup(label);
        mapRef.current.setView([lat, lng], 15);
    },
    panToLocation: (lat, lng) => {
        isProgrammaticMove.current = true;
        mapRef.current.panTo([lat, lng]);
    },
    fitToBounds: (bounds) => {
      if (mapRef.current && bounds) {
        isProgrammaticMove.current = true;
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    },
  }));

  // Map Initialization
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);

    volunteersLayerRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        disableClusteringAtZoom: 17,
        spiderfyOnMaxZoom: true,
    }).addTo(mapRef.current);
    ocorrenciasLayerRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
        disableClusteringAtZoom: 16,
        spiderfyOnMaxZoom: true,
    }).addTo(mapRef.current);
    riskZonesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    climateAlertsLayerRef.current = L.layerGroup().addTo(mapRef.current);
    routesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    volunteerHistoryLayerRef.current = L.layerGroup().addTo(mapRef.current);
    assignedRouteLayerRef.current = L.layerGroup().addTo(mapRef.current);
    highlightedRoutesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    highlightLayerRef.current = L.layerGroup().addTo(mapRef.current);

    mapRef.current.on('locationfound', (e: any) => {
        if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng(e.latlng);
        } else {
            const iconHtml = ReactDOMServer.renderToString(<UserLocationIcon className="w-6 h-6" />);
            const userIcon = L.divIcon({ html: iconHtml, className: '', iconSize: [24, 24] });
            userLocationMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(mapRef.current);
        }
        isProgrammaticMove.current = false;
    });
    
    mapRef.current.on('locationerror', (e: any) => {
        onLocationError(e.message);
        isProgrammaticMove.current = false;
    });

    mapRef.current.on('moveend', () => {
        if (onViewChange && !isProgrammaticMove.current) {
            const center = mapRef.current.getCenter();
            onViewChange({ lat: center.lat, lng: center.lng });
        }
        isProgrammaticMove.current = false; // Reset after any move
    });
    
    mapRef.current.on('click', () => onClearSelection());

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, [initialCenter, initialZoom, onClearSelection, onViewChange, onLocationError]);

  // Update Volunteers
  useEffect(() => {
    if (!volunteersLayerRef.current) return;
    volunteersLayerRef.current.clearLayers();
    
    voluntarios.forEach(v => {
      let iconHtml;
      const isUpdated = updatedVolunteerIds?.includes(v.id);
      const isSuggested = suggestedVolunteerIds?.includes(v.id);
      const isAssociated = associatedVolunteerIds?.includes(v.id);
      let baseClassName = "w-8 h-8 transition-transform transform hover:scale-110";
      let iconClassName = baseClassName;
      let iconSize: [number, number] = [32, 32];
      
      if (isUpdated) iconClassName += " animate-status-update";
      if (isSuggested) iconClassName += " animate-pulse-suggest";
      if (isAssociated) iconClassName += " animate-pulse-assigned";

      switch (v.status) {
        case 'Em Missão': 
            iconClassName += " animate-pulse-mission";
            iconHtml = ReactDOMServer.renderToString(<OnMissionVolunteerIcon className={iconClassName}/>); 
            break;
        case 'Retornando': 
            iconHtml = ReactDOMServer.renderToString(<ReturningVolunteerIcon className={iconClassName}/>); 
            break;
        case 'Inativo': 
            iconHtml = ReactDOMServer.renderToString(<InactiveVolunteerIcon className={iconClassName}/>); 
            break;
        case 'Em Perigo': 
            const distressClassName = "w-10 h-10 transition-transform transform hover:scale-110 animate-pulse-strong";
            iconHtml = ReactDOMServer.renderToString(<DistressVolunteerIcon className={distressClassName}/>); 
            iconSize = [40, 40];
            break;
        default: // 'Disponível'
            iconHtml = ReactDOMServer.renderToString(<VolunteerIcon className={iconClassName}/>); 
            break;
      }

      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: iconSize, iconAnchor: [iconSize[0]/2, iconSize[1]] });
      const marker = L.marker([v.latitude, v.longitude], { icon });

      const hasAssignedRoute = v.status === 'Em Missão' && v.routeGeometry;
      const popupContent = `
        <div class="p-1">
            <h3 class="font-bold text-base mb-1">${v.nome}</h3>
            <p class="text-sm"><strong>Status:</strong> ${v.status}</p>
            ${v.eta ? `<p class="text-sm"><strong>ETA:</strong> ${v.eta}</p>`: ''}
            <p class="text-sm"><strong>Tel:</strong> ${v.telefone}</p>
            <div class="mt-2 flex flex-col gap-1">
                <button id="route-btn-${v.id}" class="w-full text-xs bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700 ${!hasAssignedRoute ? 'opacity-50 cursor-not-allowed' : ''}" ${!hasAssignedRoute ? 'disabled' : ''}>Ver Rota da Missão</button>
                <button id="path-btn-${v.id}" class="w-full text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700">Ver Trajeto Recente</button>
            </div>
        </div>`;
      
      marker.bindPopup(popupContent);

      const handleRouteClick = () => { if (onViewAssignedRoute) { onViewAssignedRoute(v.id); } };
      const handlePathClick = () => onViewVolunteerPath(v.id);

      marker.on('popupopen', () => {
         document.getElementById(`route-btn-${v.id}`)?.addEventListener('click', handleRouteClick);
         document.getElementById(`path-btn-${v.id}`)?.addEventListener('click', handlePathClick);
      });
      marker.on('popupclose', () => {
         document.getElementById(`route-btn-${v.id}`)?.removeEventListener('click', handleRouteClick);
         document.getElementById(`path-btn-${v.id}`)?.removeEventListener('click', handlePathClick);
      });

      volunteersLayerRef.current.addLayer(marker);
    });

    // Teammates
    teammates.forEach(v => {
      const iconHtml = ReactDOMServer.renderToString(<TeammateIcon className="w-8 h-8" />);
      const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 32] });
      const marker = L.marker([v.latitude, v.longitude], { icon, zIndexOffset: -100 }); // Render teammates below main volunteer if overlapping
      
      const popupContent = `
        <div class="p-1">
            <h3 class="font-bold text-base mb-1">${v.nome} <span class="text-xs font-normal text-teal-300">(Equipe)</span></h3>
            <p class="text-sm"><strong>Status:</strong> ${v.status}</p>
            ${v.eta ? `<p class="text-sm"><strong>ETA:</strong> ${v.eta}</p>`: ''}
        </div>`;
      
      marker.bindPopup(popupContent);
      volunteersLayerRef.current.addLayer(marker);
    });
  }, [voluntarios, teammates, updatedVolunteerIds, suggestedVolunteerIds, associatedVolunteerIds, onViewVolunteerPath, onViewAssignedRoute]);
  
  // Update Ocorrencias
  useEffect(() => {
    if (!ocorrenciasLayerRef.current) return;
    ocorrenciasLayerRef.current.clearLayers();
    
    ocorrencias.forEach(o => {
        let iconHtml;
        const isNew = newestIncidentId === o.id;
        const isSelected = selectedOcorrenciaId === o.id;
        let className = "w-10 h-10 transition-transform transform hover:scale-110";
        if (isSelected) {
            className += " animate-pulse-selected"; // Replaced static ring with a pulse animation for better visibility
        }
        
        switch (o.status) {
            case 'Em Atendimento': iconHtml = ReactDOMServer.renderToString(<InProgressIncidentIcon className={className} priority={o.prioridade} />); break;
            case 'Fechada': iconHtml = ReactDOMServer.renderToString(<ClosedIncidentIcon className={className} />); break;
            default: iconHtml = ReactDOMServer.renderToString(<IncidentIcon className={className} isNew={isNew} priority={o.prioridade}/>); break;
        }

        const icon = L.divIcon({ html: iconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 40] });
        const marker = L.marker([o.latitude, o.longitude], { icon, zIndexOffset: o.status === 'Aberta' ? 1000 : 0 });
        marker.on('click', (e: any) => { L.DomEvent.stopPropagation(e); onOcorrenciaSelect(o); });
        ocorrenciasLayerRef.current.addLayer(marker);
    });
  }, [ocorrencias, newestIncidentId, selectedOcorrenciaId, onOcorrenciaSelect]);
  
  // Update Risk Zones
  useEffect(() => {
    if (!riskZonesLayerRef.current) return;
    riskZonesLayerRef.current.clearLayers();
    riskZones.forEach(zone => {
      const defaultStyle = { color: '#EF4444', weight: 2, opacity: 0.8, fillOpacity: zone.active ? 0.3 : 0.1 };
      const highlightStyle = { weight: 4, color: '#F87171', fillOpacity: zone.active ? 0.5 : 0.2 };
      const polygon = L.geoJSON(zone.coordenadas, { style: defaultStyle });
      polygon.on('mouseover', (e: any) => e.target.setStyle(highlightStyle));
      polygon.on('mouseout', (e: any) => e.target.setStyle(defaultStyle));
      const popupContent = `<div class="p-1"><h3 class="font-bold text-base mb-1">${zone.nome}</h3>${zone.descricao ? `<p class="text-sm">${zone.descricao}</p>` : ''}<p class="text-sm mt-2"><strong>Status:</strong> ${zone.active ? 'Ativa' : 'Inativa'}</p><div class="mt-2 flex gap-2"><button id="edit-zone-${zone.id}" class="text-xs bg-blue-600 text-white px-2 py-1 rounded">Editar</button><button id="delete-zone-${zone.id}" class="text-xs bg-red-600 text-white px-2 py-1 rounded">Excluir</button></div></div>`;
      polygon.bindPopup(popupContent);
      const handleEditClick = () => onEditRiskZone(zone);
      const handleDeleteClick = () => onDeleteRiskZone(zone.id);
      polygon.on('popupopen', () => {
         document.getElementById(`edit-zone-${zone.id}`)?.addEventListener('click', handleEditClick);
         document.getElementById(`delete-zone-${zone.id}`)?.addEventListener('click', handleDeleteClick);
      });
      polygon.on('popupclose', () => {
         document.getElementById(`edit-zone-${zone.id}`)?.removeEventListener('click', handleEditClick);
         document.getElementById(`delete-zone-${zone.id}`)?.removeEventListener('click', handleDeleteClick);
      });
      riskZonesLayerRef.current.addLayer(polygon);
    });
  }, [riskZones, onEditRiskZone, onDeleteRiskZone]);

  // Update Climate Alerts Zones
  useEffect(() => {
    if (!climateAlertsLayerRef.current) return;
    climateAlertsLayerRef.current.clearLayers();
    climateAlerts.forEach(alert => {
      if (alert.areaCoordinates) {
        const baseStyle: any = { weight: 2, opacity: 0.8 };
        if (alert.severity === 'extreme') { baseStyle.color = '#4F46E5'; baseStyle.fillOpacity = 0.4; }
        else if (alert.severity === 'severe') { baseStyle.color = '#7C3AED'; baseStyle.fillOpacity = 0.3; }
        else { baseStyle.color = '#06B6D4'; baseStyle.fillOpacity = 0.2; }
        const polygon = L.geoJSON(alert.areaCoordinates, { style: baseStyle });
        polygon.bindPopup(`<h3 class="font-bold">${alert.title}</h3><p>${alert.description}</p>`);
        climateAlertsLayerRef.current.addLayer(polygon);
      }
    });
  }, [climateAlerts]);


  // Update Heatmap
  useEffect(() => {
    if (!mapRef.current) return;
    if (showHeatmap && !heatmapLayerRef.current) {
      heatmapLayerRef.current = (L as any).heatLayer([], { radius: heatmapRadius, max: heatmapIntensity }).addTo(mapRef.current);
    }
    if (showHeatmap) {
      const points = ocorrencias.map(o => [o.latitude, o.longitude, 1]); // Intensity per point is 1
      heatmapLayerRef.current.setLatLngs(points);
      heatmapLayerRef.current.setOptions({ radius: heatmapRadius, max: heatmapIntensity });
    }
    if (!showHeatmap && heatmapLayerRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }
  }, [showHeatmap, ocorrencias, heatmapRadius, heatmapIntensity]);

  // Update Activation Meeting Point
  useEffect(() => {
    if (!mapRef.current) return;
    // Remove previous marker if it exists
    if (activationMarkerRef.current) {
      mapRef.current.removeLayer(activationMarkerRef.current);
      activationMarkerRef.current = null;
    }
    if (activation.active && activation.meetingPoint) {
      const iconHtml = ReactDOMServer.renderToString(<FlagIcon className="w-8 h-8 text-blue-500" />);
      const icon = L.divIcon({ html: iconHtml, className: 'animate-pulse-strong', iconSize: [32, 32], iconAnchor: [0, 32] });
      activationMarkerRef.current = L.marker([activation.meetingPoint.lat, activation.meetingPoint.lng], { icon }).addTo(mapRef.current).bindPopup("Ponto de Encontro Ativado");
    }
  }, [activation]);

  // Update Assigned Routes from Volunteer Geometry
  useEffect(() => {
    if (!routesLayerRef.current) return;
    routesLayerRef.current.clearLayers();
    if (!showRoutes) return;
    voluntarios.forEach(v => {
        if (v.status === 'Em Missão' && v.routeGeometry && v.assignedOcorrenciaId) {
            const latLngs = v.routeGeometry.coordinates.map(coord => [coord[1], coord[0]]);
            const color = getColorForOcorrencia(v.assignedOcorrenciaId);
            const polyline = L.polyline(latLngs, { color: color, weight: 5, opacity: 0.7, className: 'route-preview-line' });
            routesLayerRef.current.addLayer(polyline);
        }
    });
  }, [voluntarios, showRoutes]);
  
  // Update Volunteer History Path
  useEffect(() => {
    if (!volunteerHistoryLayerRef.current) return;
    volunteerHistoryLayerRef.current.clearLayers();
    if (volunteerHistoryPath) {
        const polyline = L.polyline(volunteerHistoryPath, { color: '#A855F7', weight: 3, opacity: 0.7, className: 'route-preview-line' });
        volunteerHistoryLayerRef.current.addLayer(polyline);
    }
  }, [volunteerHistoryPath]);

  // Update Assigned Route display
  useEffect(() => {
    if (!assignedRouteLayerRef.current) return;
    assignedRouteLayerRef.current.clearLayers();
    if (assignedRoute) {
        const routeLine = L.geoJSON(assignedRoute, { style: { color: '#ec4899', weight: 6, opacity: 0.8, className: 'route-preview-line' } });
        assignedRouteLayerRef.current.addLayer(routeLine);
    }
  }, [assignedRoute]);
  
  // Update Highlighted Routes for selected occurrence
  useEffect(() => {
    if (!highlightedRoutesLayerRef.current) return;
    highlightedRoutesLayerRef.current.clearLayers();
    if (highlightedRoutes && highlightedRoutes.length > 0) {
      highlightedRoutes.forEach(routeGeoJSON => {
        const routeLine = L.geoJSON(routeGeoJSON, {
            style: {
                color: '#14B8A6', // Teal
                weight: 8,
                opacity: 0.9,
            }
        });
        routeLine.setStyle({ className: 'route-preview-line assigned-route-line' });
        highlightedRoutesLayerRef.current.addLayer(routeLine);
      });
    }
  }, [highlightedRoutes]);

  // Update highlighted alert
  useEffect(() => {
    if (!highlightLayerRef.current) return;
    highlightLayerRef.current.clearLayers();

    if (highlightedAlert) {
        const pulseIcon = L.divIcon({
            className: 'alert-pulse-icon',
            iconSize: [30, 30],
        });
        const marker = L.marker([highlightedAlert.lat, highlightedAlert.lng], { icon: pulseIcon, interactive: false, zIndexOffset: 2000 });
        highlightLayerRef.current.addLayer(marker);
    }
  }, [highlightedAlert]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
});

export default LeafletMap;