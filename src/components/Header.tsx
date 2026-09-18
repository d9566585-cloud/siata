import React from 'react';
import {
  Wind,
  MapPin,
  LayoutDashboard,
  Layers,
  BookOpen,
  Terminal,
  RefreshCw,
  BarChart3,
  Info,
} from 'lucide-react';
import { PoecaAlertSummary } from '../types';

export type AppTab = 'landing' | 'map' | 'prescriptive' | 'dashboard' | 'notebooks' | 'api';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  poecaSummary: PoecaAlertSummary;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  poecaSummary,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-[1100] bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Marca / Identidad Institucional */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black text-slate-900 tracking-tight leading-none">
                  SIATA <span className="text-emerald-600">ICA</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded font-bold">
                  WAQI + Folium
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Monitoreo &bull; Mapa de Mosaicos &bull; Análisis Prescriptivo
              </p>
            </div>
          </div>

          {/* Navegación Principal por Pestañas */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Mapa Interactivo (Folium)</span>
            </button>

            <button
              onClick={() => setActiveTab('prescriptive')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'prescriptive'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Análisis Prescriptivo (Pandas)</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-600" />
              <span>Red SIATA (Aburrá)</span>
            </button>

            <button
              onClick={() => setActiveTab('notebooks')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'notebooks'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Cuadernos (.ipynb)</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'api'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-purple-600" />
              <span>Consola API</span>
            </button>

            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'landing'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Situación &amp; Rúbrica</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                9/9 ✓
              </span>
            </button>
          </nav>

          {/* Estado de Alerta POECA y Recarga */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500 text-[11px]">
                POECA: <strong className="text-slate-800 font-semibold">{poecaSummary.activeProtocol}</strong>
              </span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Actualizar datos"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navegación móvil/tablet horizontal */}
        <div className="flex xl:hidden overflow-x-auto py-2 border-t border-slate-100 gap-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'map' ? 'bg-sky-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            1. Mapa (Folium)
          </button>
          <button
            onClick={() => setActiveTab('prescriptive')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'prescriptive' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            2. Análisis Prescriptivo
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Red SIATA
          </button>
          <button
            onClick={() => setActiveTab('notebooks')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'notebooks' ? 'bg-amber-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Cuadernos (.ipynb)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'api' ? 'bg-purple-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Consola API
          </button>
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'landing' ? 'bg-slate-700 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Situación Problema
          </button>
        </div>
      </div>
    </header>
  );
};
