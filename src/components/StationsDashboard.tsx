import React, { useState, useMemo } from 'react';
import { SiataStation, ICALevel, PollutantKey } from '../types';
import { getICAClassification, calculatePM25ICA, ICA_LEVELS } from '../data/siataStations';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Building2,
  TrendingUp,
  GraduationCap,
  Activity,
  Heart,
  Info,
  X,
  Sliders,
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface StationsDashboardProps {
  stations: SiataStation[];
  selectedStation: SiataStation | null;
  onSelectStation: (station: SiataStation) => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  onSimulateScenario: (scenario: 'actual' | 'inversion' | 'lluvia') => void;
  activeScenario: 'actual' | 'inversion' | 'lluvia';
}

export const StationsDashboard: React.FC<StationsDashboardProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onRefreshData,
  isRefreshing,
  onSimulateScenario,
  activeScenario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Todos');
  const [selectedIcaLevel, setSelectedIcaLevel] = useState<string>('Todos');
  const [selectedStationType, setSelectedStationType] = useState('Todos');
  const [sortBy, setSortBy] = useState<'ica_desc' | 'ica_asc' | 'pm25_desc' | 'name'>('ica_desc');
  const [modalStation, setModalStation] = useState<SiataStation | null>(null);

  const municipalities = useMemo(() => {
    return ['Todos', ...Array.from(new Set(stations.map((s) => s.municipality)))];
  }, [stations]);

  // Filtrado y ordenamiento de estaciones
  const filteredStations = useMemo(() => {
    return stations
      .filter((station) => {
        const matchesSearch =
          station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          station.municipality.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMuni =
          selectedMunicipality === 'Todos' || station.municipality === selectedMunicipality;

        const matchesIca =
          selectedIcaLevel === 'Todos' ||
          getICAClassification(station.currentReading.ica).level === selectedIcaLevel;

        const matchesType =
          selectedStationType === 'Todos' || station.stationType === selectedStationType;

        return matchesSearch && matchesMuni && matchesIca && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'ica_desc') return b.currentReading.ica - a.currentReading.ica;
        if (sortBy === 'ica_asc') return a.currentReading.ica - b.currentReading.ica;
        if (sortBy === 'pm25_desc') return b.currentReading.pm25 - a.currentReading.pm25;
        return a.name.localeCompare(b.name);
      });
  }, [stations, searchTerm, selectedMunicipality, selectedIcaLevel, selectedStationType, sortBy]);

  // Cálculos estadísticos para los KPI cards
  const stats = useMemo(() => {
    const total = stations.length;
    if (total === 0) return { avgIca: 0, criticalCount: 0, peakStation: null, avgPm25: 0 };

    const sumIca = stations.reduce((acc, s) => acc + s.currentReading.ica, 0);
    const sumPm25 = stations.reduce((acc, s) => acc + s.currentReading.pm25, 0);
    const critical = stations.filter((s) => s.currentReading.ica > 100);
    const peak = [...stations].sort((a, b) => b.currentReading.ica - a.currentReading.ica)[0];

    return {
      avgIca: Math.round(sumIca / total),
      avgPm25: Number((sumPm25 / total).toFixed(1)),
      criticalCount: critical.length,
      criticalPercent: Math.round((critical.length / total) * 100),
      peakStation: peak,
    };
  }, [stations]);

  const avgClassif = getICAClassification(stats.avgIca);

  return (
    <div className="space-y-6">
      {/* Barra de Estadísticas Clave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Promedio Metropolitano */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Promedio Valle de Aburrá</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.avgIca}</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: avgClassif.color }}
            >
              {avgClassif.level}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            PM2.5 prom: <strong className="text-slate-800">{stats.avgPm25} µg/m³</strong> (Norma Res. 2254)
          </p>
        </div>

        {/* Estaciones en Alerta Naranja+ */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Estaciones en Riesgo</span>
            <ShieldAlert className={`w-4 h-4 ${stats.criticalCount > 0 ? 'text-orange-500' : 'text-emerald-500'}`} />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.criticalCount}</span>
            <span className="text-xs text-slate-500 font-medium">de {stations.length} ({stats.criticalPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-500 ${stats.criticalCount > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${stats.criticalPercent}%` }}
            />
          </div>
        </div>

        {/* Estación Pico Más Crítica */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Estación Más Crítica</span>
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          {stats.peakStation ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stats.peakStation.currentReading.ica}
                </span>
                <span className="text-xs text-slate-600 font-semibold truncate">
                  {stats.peakStation.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {stats.peakStation.municipality} • PM2.5: {stats.peakStation.currentReading.pm25} µg/m³
              </p>
            </div>
          ) : null}
        </div>

        {/* Protocolo POECA Activo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Protocolo POECA</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1">
            <span
              className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md ${
                stats.criticalCount >= 3
                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {stats.criticalCount >= 3 ? 'Estado de Prevención' : 'Estado Normal'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {stats.criticalCount >= 3
              ? 'Restricción escolar en zonas naranjas'
              : 'Condiciones aptas para actividad al aire libre'}
          </p>
        </div>
      </div>

      {/* Simulador de Episodios Críticos (Herramienta de Evaluación para el Docente) */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Simulador de Escenarios Atmosféricos del Valle de Aburrá</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                Pregunta 11
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              Permite evaluar cómo el sistema y los protocolos POECA responden ante cambios de concentración de PM2.5.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSimulateScenario('actual')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeScenario === 'actual'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tiempo Real Actual
          </button>
          <button
            onClick={() => onSimulateScenario('inversion')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
              activeScenario === 'inversion'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Inversión Térmica (+35% PM2.5)</span>
          </button>
          <button
            onClick={() => onSimulateScenario('lluvia')}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
              activeScenario === 'lluvia'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Lavado Pluvial (Día Limpio)</span>
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda, Filtros y Actualización */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Barra de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar estación por nombre, código (MED-TRAF) o barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Municipio */}
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {municipalities.map((m) => (
              <option key={m} value={m}>
                Municipio: {m}
              </option>
            ))}
          </select>

          {/* Categoría ICA */}
          <select
            value={selectedIcaLevel}
            onChange={(e) => setSelectedIcaLevel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Todos">Nivel ICA: Todos</option>
            <option value="Buena">Buena (Verde)</option>
            <option value="Moderada">Moderada (Amarillo)</option>
            <option value="Dañina a Grupos Sensibles">Dañina Grupos Sensibles (Naranja)</option>
            <option value="Dañina">Dañina a la Salud (Rojo)</option>
          </select>

          {/* Tipo de Estación */}
          <select
            value={selectedStationType}
            onChange={(e) => setSelectedStationType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="Todos">Tipo: Todos</option>
            <option value="Poblacional">Poblacional</option>
            <option value="Tráfico">Tráfico</option>
            <option value="Industrial">Industrial</option>
            <option value="Fondo / Rural">Fondo / Rural</option>
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ica_desc">Mayor ICA (Crítico)</option>
            <option value="ica_asc">Menor ICA (Limpio)</option>
            <option value="pm25_desc">Mayor PM2.5</option>
            <option value="name">Alfabético</option>
          </select>

          {/* Botón de recarga en vivo */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar SIATA</span>
          </button>
        </div>
      </div>

      {/* Grid de Tarjetas de Estaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map((station) => {
          const ica = station.currentReading.ica;
          const classif = getICAClassification(ica);
          const pm25Ratio = Math.min(100, Math.round((station.currentReading.pm25 / 37.0) * 100));

          return (
            <div
              key={station.id}
              className={`bg-white rounded-xl border p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                selectedStation?.id === station.id
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Cabecera de la tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {station.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {station.municipality}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {station.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">{station.neighborhood}</p>
                  </div>

                  {/* Insignia de ICA */}
                  <div
                    className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: classif.color }}
                  >
                    <span className="text-xl font-extrabold leading-none">{ica}</span>
                    <span className="text-[9px] font-bold uppercase mt-0.5 tracking-tight">ICA</span>
                  </div>
                </div>

                {/* Clasificación y Barra de Concentración PM2.5 */}
                <div className="my-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{classif.level}</span>
                    <span className="text-[11px] text-slate-500">
                      PM2.5: <strong className="text-slate-800">{station.currentReading.pm25}</strong> µg/m³
                    </span>
                  </div>

                  {/* Barra de progreso frente a la norma colombiana (37 µg/m³) */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pm25Ratio}%`,
                          backgroundColor: classif.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>0 µg/m³</span>
                      <span>Límite Res. 2254 (37 µg/m³)</span>
                    </div>
                  </div>
                </div>

                {/* Métricas Secundarias */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-slate-400" />
                    <span>{station.currentReading.temperature} °C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-slate-400" />
                    <span>{station.currentReading.humidity} %</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-400" />
                    <span>{station.currentReading.windSpeed} km/h</span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectStation(station)}
                  className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 transition cursor-pointer"
                >
                  Ubicar en Mapa
                </button>
                <button
                  onClick={() => setModalStation(station)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Análisis 24h</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No se encontraron estaciones con los filtros aplicados</p>
          <p className="text-xs text-slate-500 mt-1">Intenta restablecer la búsqueda o los filtros de municipio/ICA.</p>
        </div>
      )}

      {/* Modal de Detalle de Estación con Gráficas 24 Horas y Protocolos */}
      {modalStation && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera del modal */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {modalStation.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {modalStation.municipality} • {modalStation.stationType}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{modalStation.name}</h3>
                <p className="text-xs text-slate-500">{modalStation.address}</p>
              </div>

              <button
                onClick={() => setModalStation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lectura actual destacada */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Índice ICA Actual</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-slate-900">{modalStation.currentReading.ica}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                    style={{ backgroundColor: getICAClassification(modalStation.currentReading.ica).color }}
                  >
                    {getICAClassification(modalStation.currentReading.ica).level}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">PM2.5 (Promedio 24h)</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {modalStation.currentReading.pm25} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">PM10</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {modalStation.currentReading.pm10} <span className="text-xs font-normal text-slate-500">µg/m³</span>
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Condición Térmica</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {modalStation.currentReading.temperature} °C
                </span>
              </div>
            </div>

            {/* Gráfica Recharts: Serie de Tiempo 24h (PM2.5 e ICA) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Comportamiento Diurno de las Últimas 24 Horas
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Nótese el pico matutino de inversión térmica entre las 06:00 y las 09:30 AM
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    PM2.5 (µg/m³)
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                    Índice ICA
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={modalStation.history24h} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorIca" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                      }}
                      formatter={(val: any, name: any) => [
                        name === 'pm25' ? `${val} µg/m³` : val,
                        name === 'pm25' ? 'Concentración PM2.5' : 'Índice ICA',
                      ]}
                    />
                    <ReferenceLine y={37} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Límite Res. 2254 (37)', fill: '#ef4444', fontSize: 10 }} />
                    <ReferenceLine y={15} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Guía OMS (15)', fill: '#3b82f6', fontSize: 10 }} />
                    <Area type="monotone" dataKey="pm25" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPm25)" />
                    <Area type="monotone" dataKey="ica" stroke="#f97316" strokeWidth={1.5} fillOpacity={1} fill="url(#colorIca)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Protocolos para la Toma de Decisiones en Esta Ubicación */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Protocolo de Salud y Decisiones en {modalStation.municipality}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> Colegios y Escuelas
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {getICAClassification(modalStation.currentReading.ica).recommendationsSchool}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-600" /> Deporte y Ciclovías
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {getICAClassification(modalStation.currentReading.ica).recommendationsSports}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-600" /> Población Sensible
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {getICAClassification(modalStation.currentReading.ica).healthEffects}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setModalStation(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
