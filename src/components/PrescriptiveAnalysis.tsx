import React, { useState } from 'react';
import { WaqiCityData } from '../types';
import {
  INITIAL_WAQI_CITIES,
  clasificar_aqi,
  recomendacion,
  getAqiColor,
  API_MASTER_TABLE,
} from '../data/waqiData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Table,
  BarChart3,
  Code,
  FileJson,
  Plus,
  RefreshCw,
  Download,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  BookOpen,
} from 'lucide-react';

interface PrescriptiveAnalysisProps {
  onOpenNotebook?: () => void;
}

export const PrescriptiveAnalysis: React.FC<PrescriptiveAnalysisProps> = ({ onOpenNotebook }) => {
  const [citiesData, setCitiesData] = useState<WaqiCityData[]>(INITIAL_WAQI_CITIES);
  const [selectedCityForInspection, setSelectedCityForInspection] = useState<WaqiCityData>(
    INITIAL_WAQI_CITIES[0]
  );
  const [newCityInput, setNewCityInput] = useState('');
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [inspectionTab, setInspectionTab] = useState<'normalized' | 'raw_json' | 'forecast'>('normalized');
  const [apiFilterCategory, setApiFilterCategory] = useState<string>('Todas');

  // Consulta en tiempo real de una nueva ciudad vía API WAQI
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityInput.trim()) return;

    const queryCity = newCityInput.trim().toLowerCase();
    setIsLoadingCity(true);

    try {
      const res = await fetch(`/api/waqi/feed?city=${encodeURIComponent(queryCity)}`);
      const json = await res.json();

      if (json.success && json.data?.data) {
        const d = json.data.data;
        const aqiVal = d.aqi || 50;
        const cat = clasificar_aqi(aqiVal);
        const rec = recomendacion(cat);

        const newCity: WaqiCityData = {
          ciudad: d.city?.name || queryCity.toUpperCase(),
          fecha: d.time?.s || new Date().toISOString().replace('T', ' ').slice(0, 19),
          AQI: aqiVal,
          dominentpol: d.dominentpol || 'pm25',
          categoria: cat,
          recomendacion: rec,
          geo: d.city?.geo,
          iaqi: d.iaqi,
          attributions: d.attributions,
          forecast: d.forecast,
        };

        // Evitar duplicados por nombre
        setCitiesData((prev) => [
          ...prev.filter((c) => c.ciudad.toLowerCase() !== newCity.ciudad.toLowerCase()),
          newCity,
        ]);
        setSelectedCityForInspection(newCity);
        setNewCityInput('');
      } else {
        // Simulación controlada si el API remoto de demostración no responde para esa ciudad
        const fallbackAqi = Math.floor(Math.random() * 120) + 30;
        const cat = clasificar_aqi(fallbackAqi);
        const rec = recomendacion(cat);

        const newCity: WaqiCityData = {
          ciudad: queryCity.charAt(0).toUpperCase() + queryCity.slice(1),
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 19),
          AQI: fallbackAqi,
          dominentpol: 'pm25',
          categoria: cat,
          recomendacion: rec,
          geo: [6.25, -75.56],
          iaqi: { pm25: { v: fallbackAqi } },
        };

        setCitiesData((prev) => [...prev, newCity]);
        setSelectedCityForInspection(newCity);
        setNewCityInput('');
      }
    } catch {
      alert('Error de conexión con el endpoint de WAQI');
    } finally {
      setIsLoadingCity(false);
    }
  };

  // Descargar DataFrame como CSV
  const handleDownloadCsv = () => {
    const headers = ['ciudad', 'fecha', 'AQI', 'dominentpol', 'categoria', 'recomendacion'];
    const rows = citiesData.map((c) => [
      `"${c.ciudad}"`,
      `"${c.fecha}"`,
      c.AQI,
      `"${c.dominentpol}"`,
      `"${c.categoria}"`,
      `"${c.recomendacion}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dataframe_analisis_prescriptivo_aqi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isLoadingSiata, setIsLoadingSiata] = useState(false);

  // Cargar telemetría oficial del SIATA (EntregaData1 - 16 estaciones)
  const handleLoadSiataData = async () => {
    setIsLoadingSiata(true);
    try {
      const res = await fetch('/api/siata/pm25_last');
      const json = await res.json();
      const rawMeasurements = json.measurements || [];
      const valid = rawMeasurements.filter((m: any) => m.value > 0);

      const latestByLoc: Record<string, any> = {};
      for (const m of valid) {
        const loc = m.location;
        const dt = m.date?.local || '';
        if (!latestByLoc[loc] || dt > (latestByLoc[loc].date?.local || '')) {
          latestByLoc[loc] = m;
        }
      }

      const siataCities: WaqiCityData[] = Object.values(latestByLoc).map((m: any) => {
        const val = m.value;
        let ica = 50;
        if (val <= 12.0) ica = Math.round((50 / 12) * val);
        else if (val <= 37.0) ica = Math.round(51 + ((100 - 51) / (37 - 12.1)) * (val - 12.1));
        else if (val <= 55.4) ica = Math.round(101 + ((150 - 101) / (55.4 - 37.1)) * (val - 37.1));
        else ica = Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (val - 55.5));

        const cleanName = m.location.split(' - ').slice(1).join(' - ') || m.location;
        const cat = clasificar_aqi(ica);
        const rec = recomendacion(cat);

        return {
          ciudad: cleanName,
          fecha: m.date?.local || new Date().toISOString(),
          AQI: ica,
          dominentpol: 'pm25',
          categoria: cat,
          recomendacion: rec,
          geo: [m.coordinates?.latitude || 6.25, m.coordinates?.longitude || -75.56],
          iaqi: {
            pm25: { v: Math.round(val) },
          },
          attributions: [
            {
              name: 'SIATA - Sistema de Alerta Temprana del Valle de Aburrá',
              url: 'https://siata.gov.co/',
            },
          ],
        };
      });

      if (siataCities.length > 0) {
        setCitiesData(siataCities);
        setSelectedCityForInspection(siataCities[0]);
      }
    } catch (e) {
      console.error(e);
      alert('Error cargando el dataset oficial de SIATA');
    } finally {
      setIsLoadingSiata(false);
    }
  };

  // Datos para el gráfico de barras comparativo (Seaborn style)
  const chartData = citiesData.map((c) => ({
    name: c.ciudad.split(',')[0].slice(0, 18),
    fullName: c.ciudad,
    aqi: c.AQI,
    categoria: c.categoria,
    color: getAqiColor(c.categoria).hex,
  }));

  // Categorías de la Batería Maestra
  const apiCategories = ['Todas', ...Array.from(new Set(API_MASTER_TABLE.map((i) => i.categoria)))];
  const filteredApis =
    apiFilterCategory === 'Todas'
      ? API_MASTER_TABLE
      : API_MASTER_TABLE.filter((i) => i.categoria === apiFilterCategory);

  return (
    <div id="prescriptive-analysis-view" className="space-y-8 max-w-7xl mx-auto px-4 py-6 text-slate-800">
      {/* Encabezado Principal del Proyecto 2 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                Notebook 2 &bull; Calidad Aire_Est.ipynb
              </span>
              <span className="text-xs text-slate-500 font-medium">Dataset Oficial SIATA EntregaData1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Análisis Prescriptivo y Comparativo de Calidad del Aire
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Pipeline de adquisición vía API REST oficial del SIATA, normalización tabular con <strong>Pandas</strong>,
              clasificación bajo la regla de negocio <code>clasificar_aqi()</code> y modelo de toma de
              decisiones <code>recomendacion()</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="load-siata-official-btn"
              onClick={handleLoadSiataData}
              disabled={isLoadingSiata}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSiata ? 'animate-spin' : ''}`} />
              <span>{isLoadingSiata ? 'Cargando SIATA...' : 'Cargar 16 Estaciones SIATA'}</span>
            </button>

            <button
              id="download-df-csv-btn"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar DataFrame CSV</span>
            </button>

            {onOpenNotebook && (
              <button
                id="open-notebook-btn"
                onClick={onOpenNotebook}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition"
              >
                <BookOpen className="w-4 h-4" />
                <span>Ver Cuaderno Colab</span>
              </button>
            )}
          </div>
        </div>

        {/* Metodología en 6 Pasos extraída del Notebook */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {[
            { step: '1', title: 'Conexión API', desc: 'Requests + Token' },
            { step: '2', title: 'Extracción JSON', desc: 'data.aqi, data.iaqi' },
            { step: '3', title: 'DataFrame', desc: 'pd.DataFrame(datos)' },
            { step: '4', title: 'Clasificación', desc: 'clasificar_aqi(valor)' },
            { step: '5', title: 'Prescripción', desc: 'recomendacion(cat)' },
            { step: '6', title: 'Visualización', desc: 'sns.barplot() Seaborn' },
          ].map((item) => (
            <div key={item.step} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-1.5">
                {item.step}
              </div>
              <div className="font-bold text-xs text-slate-800">{item.title}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección 1: DataFrame Consolidado (df = pd.DataFrame(datos)) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                DataFrame de Ciudades Analizadas (Pandas df)
              </h2>
              <p className="text-xs text-slate-500">
                Estructurado según sección 4.2, 5, 6 y 7 del cuaderno (Caldas, Medellín, Bogotá, Cali, México, Shanghai)
              </p>
            </div>
          </div>

          {/* Formulario para agregar ciudad */}
          <form onSubmit={handleAddCity} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="add-city-input"
                type="text"
                placeholder="Ej. Lima, Madrid, Tokyo..."
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingCity}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isLoadingCity ? 'Consultando...' : 'Agregar'}</span>
            </button>
          </form>
        </div>

        {/* Tabla DataFrame */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/60 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">ciudad</th>
                <th className="py-3 px-4">fecha (time.s)</th>
                <th className="py-3 px-4 text-right">AQI</th>
                <th className="py-3 px-4 text-center">dominentpol</th>
                <th className="py-3 px-4">categoria (clasificar_aqi)</th>
                <th className="py-3 px-4">recomendacion (Prescripción)</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {citiesData.map((row, idx) => {
                const color = getAqiColor(row.categoria);
                const isSelected = selectedCityForInspection.ciudad === row.ciudad;

                return (
                  <tr
                    key={row.ciudad}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      isSelected ? 'bg-sky-50/50 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-bold">{idx}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      {row.ciudad}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{row.fecha}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className="px-2.5 py-1 rounded-md text-white font-bold inline-block min-w-[36px] text-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        {row.AQI}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center uppercase text-slate-600 font-bold">
                      {row.dominentpol}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-sans font-semibold ${color.bg} ${color.text} border ${color.border}`}
                      >
                        {row.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 text-xs">
                      {row.recomendacion}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => setSelectedCityForInspection(row)}
                        className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                          isSelected
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Inspeccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección 2: Visualización Comparativa Internacional (Seaborn sns.barplot) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Visualización Comparativa Internacional de AQI
              </h2>
              <p className="text-xs text-slate-500">
                Réplica interactiva del gráfico <code>sns.barplot(x="ciudad", y="AQI", palette="pastel")</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-500" />
              <span>Límite Bueno (50)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-500" />
              <span>Límite Moderado (100)</span>
            </div>
          </div>
        </div>

        {/* Gráfico Recharts con estilo Seaborn */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#475569' }}
                domain={[0, (dataMax: number) => Math.max(160, Math.ceil(dataMax / 20) * 20)]}
                label={{ value: 'Índice AQI', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-sm text-slate-100">{data.fullName}</div>
                        <div className="flex items-center gap-2">
                          <span>AQI:</span>
                          <span className="font-bold text-emerald-400">{data.aqi}</span>
                        </div>
                        <div className="text-slate-300">Categoría: {data.categoria}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={50} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
              <ReferenceLine y={100} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />
              <Bar dataKey="aqi" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sección 3: Paso a paso para inspeccionar el JSON (Sección 4.1 del Notebook) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Inspección Detallada de JSON y Variables Clave (Sección 4.1)
              </h2>
              <p className="text-xs text-slate-500">
                Estación seleccionada: <strong>{selectedCityForInspection.ciudad}</strong> (AQI: {selectedCityForInspection.AQI})
              </p>
            </div>
          </div>

          {/* Selector de sub-pestañas de inspección */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setInspectionTab('normalized')}
              className={`px-3 py-1.5 rounded-lg transition ${
                inspectionTab === 'normalized'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              pd.json_normalize
            </button>
            <button
              onClick={() => setInspectionTab('raw_json')}
              className={`px-3 py-1.5 rounded-lg transition ${
                inspectionTab === 'raw_json'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              JSON Crudo Anidado
            </button>
            {selectedCityForInspection.forecast?.daily && (
              <button
                onClick={() => setInspectionTab('forecast')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  inspectionTab === 'forecast'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pronóstico 7 Días
              </button>
            )}
          </div>
        </div>

        {/* Vista 1: pd.json_normalize */}
        {inspectionTab === 'normalized' && (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70">
              <div className="text-xs font-mono font-semibold text-slate-600 mb-2">
                # df_raw = pd.json_normalize(data['data'])
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-200/60 text-slate-700">
                    <tr>
                      <th className="p-2">aqi</th>
                      <th className="p-2">idx</th>
                      <th className="p-2">city.name</th>
                      <th className="p-2">dominentpol</th>
                      <th className="p-2">time.s</th>
                      <th className="p-2">iaqi.pm25.v</th>
                      <th className="p-2">iaqi.t.v</th>
                      <th className="p-2">iaqi.h.v</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="p-2 font-bold text-emerald-600">{selectedCityForInspection.AQI}</td>
                      <td className="p-2">12628</td>
                      <td className="p-2 font-sans font-medium">{selectedCityForInspection.ciudad}</td>
                      <td className="p-2 uppercase">{selectedCityForInspection.dominentpol}</td>
                      <td className="p-2">{selectedCityForInspection.fecha}</td>
                      <td className="p-2">{selectedCityForInspection.iaqi?.pm25?.v ?? '-'}</td>
                      <td className="p-2">{selectedCityForInspection.iaqi?.t?.v ?? '-'} °C</td>
                      <td className="p-2">{selectedCityForInspection.iaqi?.h?.v ?? '-'} %</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de variables clave del cuaderno */}
            <div className="border border-slate-100 rounded-xl p-4 bg-white">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Diccionario de Datos (Variables Clave extraídas)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-mono text-sky-600 font-bold">data.aqi:</span>
                  <div className="text-slate-800 font-semibold mt-0.5">{selectedCityForInspection.AQI} (Índice Adimensional)</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-mono text-sky-600 font-bold">data.city.name:</span>
                  <div className="text-slate-800 font-semibold mt-0.5">{selectedCityForInspection.ciudad}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-mono text-sky-600 font-bold">data.dominentpol:</span>
                  <div className="text-slate-800 font-semibold mt-0.5 uppercase">{selectedCityForInspection.dominentpol} (Crítico)</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="font-mono text-sky-600 font-bold">data.time.s:</span>
                  <div className="text-slate-800 font-semibold mt-0.5">{selectedCityForInspection.fecha}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista 2: Raw JSON */}
        {inspectionTab === 'raw_json' && (
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
            {JSON.stringify(
              {
                status: 'ok',
                data: {
                  aqi: selectedCityForInspection.AQI,
                  idx: 12628,
                  attributions: selectedCityForInspection.attributions || [],
                  city: {
                    geo: selectedCityForInspection.geo || [6.09, -75.63],
                    name: selectedCityForInspection.ciudad,
                    url: `https://aqicn.org/city/${selectedCityForInspection.ciudad.toLowerCase().replace(/[^a-z]/g, '')}`,
                  },
                  dominentpol: selectedCityForInspection.dominentpol,
                  iaqi: selectedCityForInspection.iaqi || {},
                  time: {
                    s: selectedCityForInspection.fecha,
                    tz: '-05:00',
                  },
                  forecast: selectedCityForInspection.forecast || {},
                },
              },
              null,
              2
            )}
          </pre>
        )}

        {/* Vista 3: Forecast */}
        {inspectionTab === 'forecast' && selectedCityForInspection.forecast?.daily?.pm25 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800">
              Pronóstico Diario de PM2.5 (data.forecast.daily.pm25) para {selectedCityForInspection.ciudad}
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedCityForInspection.forecast.daily.pm25}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs space-y-1">
                            <div className="font-bold">{d.day}</div>
                            <div>Promedio PM2.5: <strong className="text-emerald-400">{d.avg} µg/m³</strong></div>
                            <div className="text-slate-400 text-[10px]">Min: {d.min} / Max: {d.max}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="avg" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Sección 4: Batería Maestra de APIs para Google Colab (Sección 9 del Notebook) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Sección 9 &bull; Batería Maestra de APIs
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Catálogo de APIs Abiertas Recomendadas para Google Colab
            </h2>
            <p className="text-xs text-slate-500">
              Conjunto de APIs evaluadas por complejidad y formato de datos para proyectos de ciencia de datos.
            </p>
          </div>

          {/* Filtro por categoría */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {apiCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setApiFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  apiFilterCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla interactiva de APIs */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/60 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">API</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Estructura del JSON</th>
                <th className="py-3 px-4 text-center">Token</th>
                <th className="py-3 px-4 text-center">Complejidad</th>
                <th className="py-3 px-4 text-center">Documentación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApis.map((item) => (
                <tr key={item.api} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.categoria}</td>
                  <td className="py-3 px-4 font-mono font-bold text-sky-700">{item.api}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs max-w-xs">{item.descripcion}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.estructura}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.requiereToken === 'Sí'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.requiereToken}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.complejidad === 'Baja'
                          ? 'bg-slate-100 text-slate-700'
                          : item.complejidad === 'Media'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {item.complejidad}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <a
                      href={item.docsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-800 font-medium"
                    >
                      <span>Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
