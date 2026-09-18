import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SiataStation, WaqiTileType } from '../types';
import { getICAClassification, ICA_LEVELS } from '../data/siataStations';
import { WAQI_TILE_TYPES, INITIAL_WAQI_CITIES, getAqiColor } from '../data/waqiData';
import {
  Layers,
  MapPin,
  Eye,
  Wind,
  ShieldAlert,
  Navigation,
  Code2,
  ExternalLink,
  Copy,
  Check,
  Globe2,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface AirQualityMapProps {
  stations: SiataStation[];
  selectedStation: SiataStation | null;
  onSelectStation: (station: SiataStation) => void;
  onOpenNotebook?: () => void;
}

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenNotebook,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const waqiTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Estados de configuración de mapa
  const [baseMapType, setBaseMapType] = useState<'carto' | 'osm' | 'topo'>('carto');
  const [showWaqiTiles, setShowWaqiTiles] = useState<boolean>(true);
  const [waqiTileType, setWaqiTileType] = useState<WaqiTileType>('usepa-aqi');
  const [waqiToken, setWaqiToken] = useState<string>('demo');
  const [waqiOpacity, setWaqiOpacity] = useState<number>(0.75);
  const [selectedCityView, setSelectedCityView] = useState<string>('medellin');
  const [showCodePanel, setShowCodePanel] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Coordenadas clave
  const VIEW_LOCATIONS: Record<string, { lat: number; lon: number; zoom: number; label: string }> = {
    medellin: { lat: 6.25184, lon: -75.56359, zoom: 11, label: 'Medellín / Valle de Aburrá' },
    caldas: { lat: 6.09308, lon: -75.63776, zoom: 13, label: 'Caldas (Sur del Valle)' },
    aranjuez: { lat: 6.29048, lon: -75.55552, zoom: 13, label: 'Aranjuez (Norte de Medellín)' },
    bogota: { lat: 4.7110, lon: -74.0721, zoom: 11, label: 'Bogotá, Colombia' },
    cali: { lat: 3.4516, lon: -76.5320, zoom: 11, label: 'Cali, Colombia' },
    mexico: { lat: 19.4326, lon: -99.1332, zoom: 10, label: 'Ciudad de México' },
    shanghai: { lat: 31.2304, lon: 121.4737, zoom: 10, label: 'Shanghai, China' },
  };

  // Inicialización del mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Coordenadas oficiales del notebook: lat, lon = 6.25184, -75.56359, zoom_start=8 o 11
      const map = L.map(mapContainerRef.current, {
        center: [6.25184, -75.56359],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualización de la capa base de mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    let maxZoom = 19;

    if (baseMapType === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else if (baseMapType === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      maxZoom = 17;
    }

    const baseLayer = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    baseTileLayerRef.current = baseLayer;
  }, [baseMapType]);

  // Actualización de la capa de mosaicos WAQI (Tiles Server oficial)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (waqiTileLayerRef.current) {
      map.removeLayer(waqiTileLayerRef.current);
      waqiTileLayerRef.current = null;
    }

    if (showWaqiTiles) {
      // Endpoint oficial de WAQI:
      // https://tiles.aqicn.org/tiles/{tipo}/{z}/{x}/{y}.png?token=TOKEN
      const waqiTileUrl = `https://tiles.aqicn.org/tiles/${waqiTileType}/{z}/{x}/{y}.png?token=${encodeURIComponent(
        waqiToken || 'demo'
      )}`;

      const waqiLayer = L.tileLayer(waqiTileUrl, {
        opacity: waqiOpacity,
        attribution: 'Tiles &copy; World Air Quality Index (WAQI / AQICN)',
        zIndex: 50,
      }).addTo(map);

      waqiTileLayerRef.current = waqiLayer;
    }
  }, [showWaqiTiles, waqiTileType, waqiToken, waqiOpacity]);

  // Marcadores de estaciones SIATA y ciudades del Notebook
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. Agregar estaciones locales de SIATA
    stations.forEach((station) => {
      const { ica, primaryPollutant, pm25 } = station.currentReading;
      const classification = getICAClassification(ica);
      const isSelected = selectedStation?.id === station.id;

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-md font-bold text-xs text-white transition-all transform hover:scale-125 ${
            isSelected ? 'ring-4 ring-slate-900 scale-125 shadow-xl' : ''
          }" style="background-color: ${classification.color}; border: 2px solid #ffffff;">
            ${Math.round(ica)}
          </div>
          <div class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center text-[8px] font-bold text-slate-800 shadow">
            ${primaryPollutant.slice(0, 2).toUpperCase()}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-station-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: customIcon });

      const popupHtml = `
        <div class="p-3 max-w-xs font-sans text-slate-800 text-left">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span class="font-bold text-sm text-slate-900">${station.name}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${classification.color}">
              ICA ${Math.round(ica)}
            </span>
          </div>
          <div class="text-xs text-slate-500 mb-2">${station.municipality} &bull; ${station.neighborhood}</div>
          <div class="bg-slate-50 rounded p-2 mb-2 space-y-1 text-xs">
            <div class="flex justify-between"><span class="text-slate-500">Categoría:</span> <span class="font-semibold">${classification.level}</span></div>
            <div class="flex justify-between"><span class="text-slate-500">PM2.5:</span> <span class="font-semibold">${pm25.toFixed(1)} µg/m³</span></div>
            <div class="flex justify-between"><span class="text-slate-500">Contaminante Crítico:</span> <span class="font-semibold uppercase">${primaryPollutant}</span></div>
          </div>
          <div class="text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200/60 p-2 rounded">
            <strong>Recomendación:</strong> ${classification.recommendationsGeneral}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectStation(station);
      });

      marker.addTo(markersLayer);
    });

    // 2. Agregar marcadores de las ciudades del Notebook Calidad Aire_Est.ipynb
    INITIAL_WAQI_CITIES.forEach((city) => {
      if (!city.geo) return;
      const color = getAqiColor(city.categoria);

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="px-2 py-1 rounded-md text-white text-[11px] font-bold shadow-md flex items-center gap-1 transition-transform hover:scale-110" style="background-color: ${color.hex}; border: 1.5px solid white;">
            <span>🌐</span>
            <span>${city.AQI}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'waqi-city-pin',
        iconSize: [44, 24],
        iconAnchor: [22, 12],
        popupAnchor: [0, -14],
      });

      const marker = L.marker(city.geo, { icon: customIcon });
      const popupHtml = `
        <div class="p-3 max-w-xs font-sans text-slate-800 text-left">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 mb-1">
            <span class="font-bold text-sm text-slate-900">${city.ciudad}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${color.hex}">
              AQI ${city.AQI}
            </span>
          </div>
          <div class="text-xs text-slate-500 mb-2">Fecha: ${city.fecha} &bull; Poll: ${city.dominentpol.toUpperCase()}</div>
          <div class="text-xs p-2 rounded bg-slate-50 mb-2">
            <div class="font-semibold text-slate-800 mb-0.5">${city.categoria}</div>
            <div class="text-slate-600 text-[11px]">${city.recomendacion}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(markersLayer);
    });
  }, [stations, selectedStation, onSelectStation]);

  // Manejo de cambio de localización
  const handleLocationChange = (key: string) => {
    setSelectedCityView(key);
    const loc = VIEW_LOCATIONS[key];
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lon], loc.zoom, { duration: 1.2 });
    }
  };

  // Código Python del cuaderno para copiar
  const pythonFoliumCode = `# Instalar folium
!pip install folium --quiet

# Importar folium
import folium

TOKEN = "${waqiToken || 'demo'}"
tipo_marcador = "${waqiTileType}"
lat, lon = 6.25184, -75.56359

# Crear mapa centrado en Medellín / Valle de Aburrá
m = folium.Map(location=[lat, lon], zoom_start=8)

# Agregar capa oficial de teselas WAQI
tile_url = f"https://tiles.aqicn.org/tiles/{tipo_marcador}/{{z}}/{{x}}/{{y}}.png?token={TOKEN}"
folium.TileLayer(
    tiles=tile_url,
    attr="AQICN",
    name="AQI",
    overlay=True,
    control=True
).add_to(m)

folium.LayerControl().add_to(m)
m`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonFoliumCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="air-quality-map-view" className="relative w-full h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Barra superior de controles */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-white">Servidor de Mosaicos WAQI (Tiles)</span>
            <span className="hidden sm:inline text-slate-400 ml-1.5 text-[11px]">
              &bull; Endpoint: tiles.aqicn.org/tiles/{'{tipo}'}/{'{z}'}/{'{x}'}/{'{y}'}.png
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Selector de tipo de mosaico */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
            <span className="text-slate-400 font-medium">Mosaico:</span>
            <select
              id="waqi-tile-select"
              value={waqiTileType}
              onChange={(e) => setWaqiTileType(e.target.value as WaqiTileType)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              {WAQI_TILE_TYPES.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Capa de Teselas */}
          <button
            id="toggle-tiles-btn"
            onClick={() => setShowWaqiTiles(!showWaqiTiles)}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 border ${
              showWaqiTiles
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showWaqiTiles ? 'Capa Activa' : 'Capa Oculta'}</span>
          </button>

          {/* Selector de vista rápida */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <select
              id="location-view-select"
              value={selectedCityView}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {Object.entries(VIEW_LOCATIONS).map(([key, item]) => (
                <option key={key} value={key} className="bg-slate-900 text-white">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Ver Código Python Folium */}
          <button
            id="open-folium-code-btn"
            onClick={() => setShowCodePanel(!showCodePanel)}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1.5 border ${
              showCodePanel
                ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Código Folium</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Panel lateral flotante de Código Folium (si está activo) */}
        {showCodePanel && (
          <div
            id="folium-code-floating-panel"
            className="absolute top-4 right-4 z-30 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl p-4 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white text-sm">Código Python (Folium)</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  id="copy-folium-code-btn"
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-300 transition"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  id="close-folium-code-btn"
                  onClick={() => setShowCodePanel(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-[11px] mb-2">
              Fragmento idéntico al cuaderno <span className="text-sky-300">Calidad Aire Map_Est.ipynb</span>:
            </p>

            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto text-[11px] font-mono text-emerald-300/90 leading-relaxed mb-3">
              {pythonFoliumCode}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <a
                href="https://colab.research.google.com/drive/1oAQ0q6m9h_o8opL2HQ_ojERT1HOmI3UG"
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px]"
              >
                <span>Abrir en Google Colab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {onOpenNotebook && (
                <button
                  onClick={onOpenNotebook}
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded font-medium text-[11px]"
                >
                  Ver Cuaderno 1
                </button>
              )}
            </div>
          </div>
        )}

        {/* Panel inferior flotante de Leyenda EPA */}
        <div
          id="map-legend-bar"
          className="absolute bottom-6 left-4 z-20 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-3 shadow-xl max-w-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Escala de Riesgo EPA (AQI)
            </span>
            <span className="text-[10px] text-slate-400">0 a 300+</span>
          </div>

          <div className="grid grid-cols-6 gap-1 mb-2">
            <div className="h-3 rounded bg-[#10b981]" title="Buena (0-50)" />
            <div className="h-3 rounded bg-[#eab308]" title="Moderada (51-100)" />
            <div className="h-3 rounded bg-[#f97316]" title="Dañina grupos sensibles (101-150)" />
            <div className="h-3 rounded bg-[#ef4444]" title="Dañina (151-200)" />
            <div className="h-3 rounded bg-[#9333ea]" title="Muy Dañina (201-300)" />
            <div className="h-3 rounded bg-[#7f1d1d]" title="Peligrosa (300+)" />
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
            <span>0 Buena</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300+ Peligrosa</span>
          </div>

          {/* Info del mosaico activo */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="truncate">
              Activo: <strong className="text-emerald-400">{waqiTileType}</strong>
            </span>
            <span className="text-slate-500">WAQI Tiles v2</span>
          </div>
        </div>

        {/* Controles de mapa rápidos en la esquina superior izquierda */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {/* Tipo de mapa base */}
          <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-1.5 shadow-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setBaseMapType('carto')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                baseMapType === 'carto' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Claro
            </button>
            <button
              onClick={() => setBaseMapType('osm')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                baseMapType === 'osm' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setBaseMapType('topo')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                baseMapType === 'topo' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Relieve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
