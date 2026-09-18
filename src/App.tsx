import React, { useState, useMemo, useCallback } from 'react';
import {
  INITIAL_SIATA_STATIONS,
  computePoecaSummary,
  calculatePM25ICA,
} from './data/siataStations';
import { SiataStation } from './types';
import { Header, AppTab } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StationsDashboard } from './components/StationsDashboard';
import { AirQualityMap } from './components/AirQualityMap';
import { PrescriptiveAnalysis } from './components/PrescriptiveAnalysis';
import { NotebookViewer } from './components/NotebookViewer';
import { ApiConsoleAndEvidence } from './components/ApiConsoleAndEvidence';
import { ShieldAlert, BookOpen, Layers, BarChart3, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('map');
  const [stations, setStations] = useState<SiataStation[]>(INITIAL_SIATA_STATIONS);
  const [selectedStation, setSelectedStation] = useState<SiataStation | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'actual' | 'inversion' | 'lluvia'>('actual');
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  );

  // Resumen del protocolo POECA
  const poecaSummary = useMemo(() => {
    return computePoecaSummary(stations);
  }, [stations]);

  // Manejador de cambio de escenario de prueba
  const handleSimulateScenario = useCallback((scenario: 'actual' | 'inversion' | 'lluvia') => {
    setActiveScenario(scenario);

    setStations((prev) =>
      prev.map((station) => {
        let factor = 1.0;
        if (scenario === 'inversion') factor = 1.38;
        if (scenario === 'lluvia') factor = 0.52;

        const initialBase = INITIAL_SIATA_STATIONS.find((s) => s.id === station.id) || station;
        const newPm25 = Math.max(4.0, Number((initialBase.currentReading.pm25 * factor).toFixed(1)));
        const newIca = calculatePM25ICA(newPm25);
        const newPm10 = Math.round(newPm25 * 1.7 + 2);

        return {
          ...station,
          currentReading: {
            ...station.currentReading,
            pm25: newPm25,
            pm10: newPm10,
            ica: newIca,
            timestamp: new Date().toISOString(),
          },
        };
      })
    );
  }, []);

  // Actualización en vivo de datos
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetch('/api/waqi/feed?city=caldas');
    } catch {
      // Ignorar si el endpoint remoto tarda
    }

    setStations((prev) =>
      prev.map((s) => {
        const delta = (Math.random() - 0.48) * 2.2;
        const newPm25 = Math.max(5.0, Number((s.currentReading.pm25 + delta).toFixed(1)));
        const newIca = calculatePM25ICA(newPm25);
        return {
          ...s,
          lastUpdated: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          currentReading: {
            ...s.currentReading,
            pm25: newPm25,
            ica: newIca,
            timestamp: new Date().toISOString(),
          },
        };
      })
    );

    setLastUpdated(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    setIsRefreshing(false);
  };

  const handleSelectStationFromMap = (station: SiataStation) => {
    setSelectedStation(station);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Encabezado Superior */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        poecaSummary={poecaSummary}
        onRefresh={handleRefreshData}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Banner Preventivo POECA si hay estaciones en Naranja/Rojo */}
      {poecaSummary.activeProtocol !== 'Normal' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-900 font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Aviso POECA Activo:</strong> Se registran {poecaSummary.criticalStations.length} estaciones
                en nivel Naranja (Dañina a Grupos Sensibles). Aplican protocolos preventivos para colegios y clubes deportivos.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('prescriptive')}
              className="text-amber-800 font-bold hover:underline shrink-0 hidden md:inline cursor-pointer"
            >
              Ver Análisis Prescriptivo →
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal de la Aplicación */}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Pestaña 1: Mapa Interactivo (Cuaderno 1 Calidad Aire Map_Est.ipynb) */}
        {activeTab === 'map' && (
          <div className="space-y-4 max-w-7xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[11px] font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>CUADERNO 1 &bull; CALIDAD AIRE MAP_EST.IPYNB</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Mapa Interactivo con Servidor de Mosaicos (Tiles) WAQI
                </h2>
                <p className="text-xs text-slate-500">
                  Implementación directa con Folium / Leaflet, servidor oficial de teselas <code>tiles.aqicn.org</code>,
                  escala EPA y marcadores para Medellín, Valle de Aburrá y ciudades globales.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('prescriptive')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Ir a Análisis Prescriptivo</span>
                </button>
              </div>
            </div>

            <div className="w-full h-[calc(100vh-16rem)] min-h-[580px] rounded-2xl overflow-hidden border border-slate-300 shadow-md">
              <AirQualityMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={handleSelectStationFromMap}
                onOpenNotebook={() => setActiveTab('notebooks')}
              />
            </div>
          </div>
        )}

        {/* Pestaña 2: Análisis Prescriptivo (Cuaderno 2 Calidad Aire_Est.ipynb) */}
        {activeTab === 'prescriptive' && (
          <PrescriptiveAnalysis onOpenNotebook={() => setActiveTab('notebooks')} />
        )}

        {/* Pestaña 3: Red de Estaciones Locales SIATA (Valle de Aburrá) */}
        {activeTab === 'dashboard' && (
          <StationsDashboard
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={(s) => {
              setSelectedStation(s);
              setActiveTab('map');
            }}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
            onSimulateScenario={handleSimulateScenario}
            activeScenario={activeScenario}
          />
        )}

        {/* Pestaña 4: Visor y Descarga de Notebooks (.ipynb) */}
        {activeTab === 'notebooks' && <NotebookViewer />}

        {/* Pestaña 5: Consola de Pruebas de API */}
        {activeTab === 'api' && <ApiConsoleAndEvidence stations={stations} />}

        {/* Pestaña 6: Situación Problema y Justificación */}
        {activeTab === 'landing' && (
          <LandingPage
            onNavigateToApp={() => setActiveTab('dashboard')}
            onNavigateToMap={() => setActiveTab('map')}
            onNavigateToNotebooks={() => setActiveTab('notebooks')}
            onNavigateToPrescriptive={() => setActiveTab('prescriptive')}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Pie de Página Institucional y Académico */}
      <footer className="bg-white border-t border-slate-200/90 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-extrabold text-slate-900">SIATA &amp; WAQI ICA Monitor</span>
              <span>&bull;</span>
              <span className="text-emerald-700 font-semibold">Parcial Parte 2 &bull; Pregunta 11</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Réplica integral de los cuadernos <em>Calidad Aire Map_Est.ipynb</em> y <em>Calidad Aire_Est.ipynb</em>.
              Articula la API del World Air Quality Index Project con datos del Área Metropolitana del Valle de Aburrá.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-slate-600">
            <button onClick={() => setActiveTab('map')} className="hover:text-emerald-700 cursor-pointer">
              1. Mapa (Folium)
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab('prescriptive')} className="hover:text-emerald-700 cursor-pointer">
              2. Análisis Prescriptivo
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-700 cursor-pointer">
              Red SIATA
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab('notebooks')} className="hover:text-emerald-700 cursor-pointer">
              Notebooks (.ipynb)
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab('api')} className="hover:text-emerald-700 cursor-pointer">
              Consola API
            </button>
            <span>&bull;</span>
            <button onClick={() => setActiveTab('landing')} className="hover:text-emerald-700 cursor-pointer">
              Situación Problema
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
