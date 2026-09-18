import React from 'react';
import {
  ShieldAlert,
  Wind,
  GraduationCap,
  Activity,
  HeartPulse,
  Cpu,
  MapPin,
  CheckCircle2,
  FileText,
  ArrowRight,
  TrendingDown,
  Building,
  AlertTriangle,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { RubricChecklist } from './RubricChecklist';
import { AppTab } from './Header';

interface LandingPageProps {
  onNavigateToApp: () => void;
  onNavigateToMap: () => void;
  onNavigateToNotebooks: () => void;
  onNavigateToPrescriptive?: () => void;
  onNavigateToTab?: (tab: AppTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToApp,
  onNavigateToMap,
  onNavigateToNotebooks,
  onNavigateToPrescriptive,
  onNavigateToTab,
}) => {
  const handleNav = (tab: AppTab) => {
    if (onNavigateToTab) {
      onNavigateToTab(tab);
    } else {
      if (tab === 'map') onNavigateToMap();
      else if (tab === 'notebooks') onNavigateToNotebooks();
      else if (tab === 'prescriptive' && onNavigateToPrescriptive) onNavigateToPrescriptive();
      else onNavigateToApp();
    }
  };

  return (
    <div className="space-y-12 py-2">
      {/* Sección Hero Contextual: Planteamiento de la Situación Real */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 md:p-12 shadow-xl border border-slate-700/60">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>SITUACIÓN REAL • PARCIAL PRÁCTICO PREGUNTA 11</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Escudo Escolar y Deportivo: <br />
            <span className="text-emerald-400">Monitoreo Inteligente del ICA (SIATA)</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Sistema de vigilancia ambiental y apoyo a la toma de decisiones para la{' '}
            <strong className="text-white">Secretaría de Educación de Medellín</strong> y el{' '}
            <strong className="text-white">INDER</strong>, protegiendo a más de 480,000 niños,
            jóvenes y deportistas del Valle de Aburrá frente a episodios críticos de material
            particulado fino (PM2.5).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNavigateToApp}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Acceder al Monitor de Estaciones</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateToMap}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition border border-white/15 cursor-pointer backdrop-blur-xs"
            >
              Ver Mapa Geoespacial
            </button>

            <button
              onClick={onNavigateToNotebooks}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition border border-slate-600 cursor-pointer"
            >
              Notebooks y Código (.ipynb)
            </button>
          </div>
        </div>

        {/* Patrón de cuadrícula decorativo sutil en el fondo */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
      </section>

      {/* Rúbrica Oficial de Evaluación: 9 Puntos Desarrollados */}
      <RubricChecklist onNavigateToTab={handleNav} />

      {/* Cuaderno Oficial Google Colab (Material Integral del Estudiante) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Material Oficial del Estudiante &bull; Cuaderno Unificado
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Cuaderno Oficial de Google Colab (SIATA)
            </h2>
          </div>
          <button
            onClick={onNavigateToNotebooks}
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Visor Interactivo y Celdas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tarjeta Unificada */}
        <div className="p-6 sm:p-7 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/60 via-white to-sky-50/50 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-mono text-xs font-bold">
                  Calidad_Aire_SIATA_Completo.ipynb
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Folium + WAQI Tiles + Pandas + Res. 2254/2017 + Seaborn
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Cuaderno Integral de Calidad del Aire (Parcial Práctico Completo)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Contiene la totalidad de los requisitos en un solo entorno reproducible: consumo del dataset oficial
                (<code>Datos_SIATA_Aire_AQ_pm25_Last.json</code>), filtrado del centinela <code>-9999</code>,
                mapa geoespacial con Folium y mosaicos EPA, pipeline ETL en Pandas, modelo prescriptivo para la Secretaría
                de Educación e INDER, y gráficos de barras comparativos con Seaborn.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <a
                href="https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Abrir en Google Colab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onNavigateToNotebooks}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explorar Celdas y Código</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-200/60 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntos 1-3 y 7</span>
              <span className="font-bold text-slate-800">Mapa Folium &amp; Mosaicos</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Teselas WAQI, buffers 1km y semáforos</p>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntos 4 y 5</span>
              <span className="font-bold text-slate-800">Exploración &amp; Limpieza</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Tipos de datos, nulos y filtro -9999</p>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Punto 6</span>
              <span className="font-bold text-slate-800">ICA Res. 2254/2017</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Ecuación EPA/MADS y rangos de riesgo</p>
            </div>
            <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Puntos 8 y 9</span>
              <span className="font-bold text-slate-800">Modelo Prescriptivo &amp; Seaborn</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Decisiones para colegios e INDER</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Justificación y Contexto de la Situación Problema */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Sección 1 • Justificación y Contexto
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            La Realidad Atmosférica del Valle de Aburrá
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Topografía de Cuenca Cerrada</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El Valle de Aburrá es un cañón estrecho rodeado por montañas de hasta 2,800 msnm.
              Esta geografía semi-cerrada limita la ventilación horizontal de contaminantes
              generados por más de 1.8 millones de vehículos y 10 municipios conurbados.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Fenómeno de Inversión Térmica</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              En los meses de marzo y octubre (temporada de lluvias y baja radiación solar), una
              capa de aire caliente en altura atrapa el aire frío del fondo del valle entre las 6:00
              y las 9:30 AM, impidiendo que el material particulado fino ascienda y se disperse.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Población Escolar Vulnerable</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las partículas PM2.5 (de diámetro menor a 2.5 micras) penetran los alvéolos
              pulmonares y el torrente sanguíneo. Los niños en clases de educación física respiran
              hasta 3 veces más volumen de aire por minuto, sufriendo crisis asmáticas y ausentismo.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Datos Utilizados: Sensores, Variables y Marco Normativo */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Sección 2 • Datos y Marco Normativo
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Variables del SIATA y Resolución 2254 de 2017
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono font-medium">
            <Scale className="w-3.5 h-3.5" />
            MinAmbiente Colombia
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla de variables técnicas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Variables Obtenidas mediante la API del SIATA</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Variable</th>
                    <th className="p-2.5">Sensor / Método</th>
                    <th className="p-2.5">Unidad</th>
                    <th className="p-2.5">Límite Normativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">PM2.5</td>
                    <td className="p-2.5">Atenuación Beta (BAM-1020)</td>
                    <td className="p-2.5 font-mono">µg/m³</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">37 µg/m³ (24h)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">PM10</td>
                    <td className="p-2.5">Gravimétrico / Óptico</td>
                    <td className="p-2.5 font-mono">µg/m³</td>
                    <td className="p-2.5 text-slate-700">75 µg/m³ (24h)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Ozono (O3)</td>
                    <td className="p-2.5">Fotometría Ultravioleta</td>
                    <td className="p-2.5 font-mono">µg/m³</td>
                    <td className="p-2.5 text-slate-700">100 µg/m³ (8h)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">NO2 / SO2</td>
                    <td className="p-2.5">Quimioluminiscencia / UV</td>
                    <td className="p-2.5 font-mono">µg/m³</td>
                    <td className="p-2.5 text-slate-700">200 / 50 µg/m³ (1h)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Meteorología</td>
                    <td className="p-2.5">Anemómetro, Termohigrómetro</td>
                    <td className="p-2.5 font-mono">°C, %, km/h</td>
                    <td className="p-2.5 text-slate-500">Variables de dispersión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Escala de colores oficiales y puntos de quiebre */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Escala Oficial del ICA y Niveles de Riesgo</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-emerald-900">Buena (0 - 50)</strong>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  PM2.5: 0 a 12.0 µg/m³. Sin riesgo sanitario para actividades al aire libre.
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-yellow-200 bg-yellow-50">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-yellow-900">Moderada (51 - 100)</strong>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                </div>
                <p className="text-[11px] text-yellow-800 leading-tight">
                  PM2.5: 12.1 a 37.0 µg/m³. Calidad aceptable; vigilancia de alumnos hipersensibles.
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-orange-200 bg-orange-50">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-orange-900">Grupos Sensibles (101 - 150)</strong>
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>
                <p className="text-[11px] text-orange-800 leading-tight">
                  PM2.5: 37.1 a 55.4 µg/m³. Suspensión de educación física intensa al aire libre.
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-red-900">Dañina a la Salud (151 - 200)</strong>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                </div>
                <p className="text-[11px] text-red-800 leading-tight">
                  PM2.5: 55.5 a 150.4 µg/m³. Cancelación de recreos abiertos y ciclovías.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Funcionamiento de la Solución: Pipeline ETL */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Sección 3 • Arquitectura Técnica
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Funcionamiento del Flujo de Adquisición y Procesamiento
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Paso 01
            </span>
            <h4 className="font-bold text-sm text-slate-900">Adquisición API REST</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Peticiones HTTP GET a los endpoints del SIATA con cabeceras de autorización y
              manejo de timeout para obtener telemetría en tiempo real.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Paso 02
            </span>
            <h4 className="font-bold text-sm text-slate-900">Validación y EDA</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estructuración tabular en Pandas, verificación de nulos, descarte de anomalías
              físicas y cálculo de estadísticas descriptivas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Paso 03
            </span>
            <h4 className="font-bold text-sm text-slate-900">Cálculo del ICA</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Algoritmo de interpolación lineal según los puntos de quiebre oficiales de la
              Resolución 2254/2017 para clasificar la criticidad.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 relative">
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Paso 04
            </span>
            <h4 className="font-bold text-sm text-slate-900">Mapeo y Alertas POECA</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Renderizado interactivo en Leaflet con buffers de dispersión de 1.2 km y emisión de
              recomendaciones operativas para colegios y deporte.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Utilidad para la Toma de Decisiones (Protocolos POECA) */}
      <section className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Sección 4 • Utilidad para la Toma de Decisiones
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Matriz de Decisiones Operativas en Territorio
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
            Cómo las autoridades y directivos utilizan este tablero para transformar datos en
            acciones de protección en tiempo real:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <GraduationCap className="w-4 h-4" />
              <span>Directores de Colegios</span>
            </div>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ICA Amarillo (51-100):</strong> Permitir clases normales; identificar
                  alumnos con asma o rinitis para supervisión.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ICA Naranja (101-150):</strong> Trasladar clases de educación física a
                  salones y auditorios entre 6:00 y 9:30 AM.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>ICA Rojo (151-200):</strong> Suspensión de recreos en patios abiertos y
                  uso preventivo de mascarilla en transporte escolar.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>INDER y Escenarios Deportivos</span>
            </div>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Ciclovías del Valle de Aburrá:</strong> Notificación preventiva a ciclistas
                  recreativos en tramos de alta contaminación (Autopista Sur).
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Atletas de Alto Rendimiento:</strong> Reprogramar entrenamientos aeróbicos
                  prolongados hacia el mediodía cuando sube la capa de mezcla.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Cierre de Escenarios Abiertos:</strong> Restricción temporal de torneos
                  intercolegiales y ligas deportivas al aire libre.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Building className="w-4 h-4" />
              <span>Secretaría de Salud y Movilidad</span>
            </div>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Alerta Temprana en E.S.E. y Hospitales:</strong> Alistamiento de camas
                  pediátricas ante el aumento proyectado de consultas respiratorias.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Pico y Placa Ambiental:</strong> Justificación técnica con datos empíricos
                  para extender restricciones de transporte de carga y volquetas.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Activación Formal del POECA:</strong> Declaratoria de Estados de
                  Prevención, Alerta o Emergencia por el Área Metropolitana.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
