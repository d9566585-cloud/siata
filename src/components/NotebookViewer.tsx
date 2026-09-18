import React, { useState } from 'react';
import {
  NOTEBOOK_UNIFIED,
  UNIFIED_COLAB_URL,
  generateJupyterNotebookJson,
  generatePythonScript,
  JupyterNotebookData,
} from '../data/notebookContent';
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Layers,
  BarChart3,
  FileCode,
  Terminal,
  Sparkles,
  FileJson,
  HelpCircle,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';

export const NotebookViewer: React.FC = () => {
  const [sectionFilter, setSectionFilter] = useState<'all' | 'map' | 'etl' | 'answers'>('all');
  const [copiedCellIdx, setCopiedCellIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isDownloadingJson, setIsDownloadingJson] = useState(false);
  const [showColabHelp, setShowColabHelp] = useState(true);

  const currentNotebook: JupyterNotebookData = NOTEBOOK_UNIFIED;

  const handleDownloadIpynb = () => {
    const jsonContent = generateJupyterNotebookJson(currentNotebook);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentNotebook.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPython = () => {
    const scriptContent = generatePythonScript(currentNotebook);
    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentNotebook.filename.replace('.ipynb', '.py');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSiataJson = async () => {
    setIsDownloadingJson(true);
    try {
      const res = await fetch('/api/siata/pm25_last');
      const data = await res.json();
      const cleanData = {
        measurements: data.measurements || [],
      };
      const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Datos_SIATA_Aire_AQ_pm25_Last.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error descargando el JSON del SIATA');
    } finally {
      setIsDownloadingJson(false);
    }
  };

  const handleCopyCell = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCellIdx(idx);
    setTimeout(() => setCopiedCellIdx(null), 2000);
  };

  const handleCopyAllCode = () => {
    const allCode = currentNotebook.cells
      .filter((c) => c.type === 'code')
      .map((c) => c.content)
      .join('\n\n# ' + '='.repeat(50) + '\n\n');

    navigator.clipboard.writeText(allCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div id="notebook-viewer-container" className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header del Visor de Cuadernos */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Entregable Académico Google Colab
              </span>
              <span className="text-xs text-slate-500 font-medium">Formato Oficial Jupyter v4 (.ipynb)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cuadernos de Laboratorio Reproducibles (SIATA)
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Desarrollados en base al dataset oficial suministrado:{' '}
              <a
                href="https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json"
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:text-sky-700 font-mono text-xs underline underline-offset-2 break-all"
              >
                Datos_SIATA_Aire_AQ_pm25_Last.json
              </a>
              . Incluyen el pipeline ETL, tratamiento del código centinela <code>-9999</code>, cálculo de ICA (Res. 2254/2017), modelo prescriptivo para colegios y mapa con Folium.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="download-ipynb-btn"
              onClick={handleDownloadIpynb}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Descargar .ipynb</span>
            </button>

            <button
              id="download-siata-json-btn"
              onClick={handleDownloadSiataJson}
              disabled={isDownloadingJson}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold transition"
              title="Descargar el dataset JSON para subirlo a los archivos de Google Colab"
            >
              <FileJson className="w-4 h-4 text-emerald-700" />
              <span>{isDownloadingJson ? 'Descargando...' : 'Descargar JSON SIATA'}</span>
            </button>

            <button
              id="download-py-btn"
              onClick={handleDownloadPython}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <FileCode className="w-4 h-4 text-slate-500" />
              <span>Descargar .py</span>
            </button>

            <a
              id="open-colab-link"
              href={currentNotebook.colabUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-semibold transition"
            >
              <span>Abrir en Google Colab</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            </a>
          </div>
        </div>

        {/* Banner Explicativo: Por qué falla en Colab vs VS Code y cómo montarlo */}
        {showColabHelp && (
          <div className="mt-5 p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl text-xs text-amber-950 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>¿Por qué en Visual Studio Code sí carga pero en Google Colab fallaba la conexión directa?</span>
              </div>
              <button
                onClick={() => setShowColabHelp(false)}
                className="text-amber-700 hover:text-amber-900 text-xs px-2 py-0.5 rounded hover:bg-amber-100 transition"
              >
                Ocultar
              </button>
            </div>

            <p className="text-amber-900/90 leading-relaxed">
              El servidor de la Alcaldía / SIATA (<code>siata.gov.co</code>) cuenta con un firewall gubernamental que <strong>bloquea o limita el tráfico proveniente de rangos de IP de servidores en la nube de EE.UU.</strong> (como los contenedores de Google Colab y AWS) o peticiones sin cabecera de navegador. Por eso, desde <strong>Visual Studio Code</strong> (con tu IP residencial en Colombia) sí conecta de inmediato, mientras que en Google Colab arrojaba error de conexión o tiempo de espera agotado.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Solución 1: Proxy Automático (Ya Integrado)</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  Los cuadernos actualizados ya incluyen un <strong>Mirror Proxy de respaldo</strong>. Si Colab es bloqueado por SIATA, el script cambia automáticamente al proxy alojado en esta web y carga los datos sin que debas hacer nada manual.
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200">
                <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                  <UploadCloud className="w-4 h-4 text-sky-600" />
                  <span>Solución 2: Montar el JSON en Colab</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  Haz clic en <strong>"Descargar JSON SIATA"</strong> arriba. En Google Colab, haz clic en el ícono de carpeta 📁 a la izquierda (Archivos) y arrastra <code>Datos_SIATA_Aire_AQ_pm25_Last.json</code> allí. El cuaderno lo leerá localmente al instante.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Banner Dataset Oficial */}
        <div className="mt-4 p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-sky-900">
            <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Dataset Oficial Suministrado por el Docente:</strong> Contiene 16 estaciones activas del Valle de Aburrá en instituciones educativas y de salud (I.E. Pedro Octavio Amado, I.E. Ciro Mendía, Tráfico Centro, etc.).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSiataJson}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1.5 rounded-lg transition"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Bajar .json</span>
            </button>
            <a
              href="https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-sky-700 hover:text-sky-900 bg-white px-3 py-1.5 rounded-lg border border-sky-200 shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <span>Ver JSON en vivo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tarjeta Única del Cuaderno Oficial Google Colab */}
        <div className="mt-6 p-6 sm:p-7 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/80 via-white to-sky-50/70 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-200/80 text-amber-900 font-mono">
                    Calidad_Aire_SIATA_Completo.ipynb
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Cuaderno Oficial Unificado
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  Cuaderno Integral Google Colab: Telemetría SIATA, Folium, ETL Pandas y Modelo Escolar
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Reúne en un solo archivo reproducible la totalidad de los 9 puntos evaluativos del parcial práctico.
                </p>
              </div>
            </div>

            <a
              id="open-unified-colab-hero-btn"
              href={UNIFIED_COLAB_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0 cursor-pointer"
            >
              <span>Abrir Cuaderno en Google Colab</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-amber-200/60 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Cartografía</span>
              <span className="font-bold text-slate-800 text-[11px]">Folium + WAQI Tiles</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Procesamiento</span>
              <span className="font-bold text-slate-800 text-[11px]">Pandas (525 Obs.)</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Depuración</span>
              <span className="font-bold text-slate-800 text-[11px]">Centinela -9999</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Normativa</span>
              <span className="font-bold text-slate-800 text-[11px]">Res. 2254 / 2017</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Modelo Prescriptivo</span>
              <span className="font-bold text-slate-800 text-[11px]">Colegios e INDER</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Visualización</span>
              <span className="font-bold text-slate-800 text-[11px]">Seaborn Barplot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de utilidades y navegación rápida por secciones del cuaderno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Ver secciones:</span>
          </span>
          <button
            onClick={() => setSectionFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
              sectionFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({currentNotebook.cells.length} celdas)
          </button>
          <button
            onClick={() => setSectionFilter('map')}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
              sectionFilter === 'map'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            Parte 1: Mapa Folium
          </button>
          <button
            onClick={() => setSectionFilter('etl')}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
              sectionFilter === 'etl'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Parte 2: ETL y Seaborn
          </button>
          <button
            onClick={() => setSectionFilter('answers')}
            className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
              sectionFilter === 'answers'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Respuestas Parcial
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={UNIFIED_COLAB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 transition"
          >
            <span>Abrir en Colab</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
          </a>

          <button
            onClick={handleCopyAllCode}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? '¡Código Copiado!' : 'Copiar Código'}</span>
          </button>
        </div>
      </div>

      {/* Renderizado de Celdas del Cuaderno */}
      <div className="space-y-4">
        {currentNotebook.cells
          .map((cell, idx) => ({ cell, idx }))
          .filter(({ idx }) => {
            if (sectionFilter === 'all') return true;
            if (sectionFilter === 'map') return idx < 17;
            if (sectionFilter === 'etl') return idx >= 17 && idx < 30;
            if (sectionFilter === 'answers') return idx >= 30;
            return true;
          })
          .map(({ cell, idx }) => (
          <div
            key={idx}
            className={`rounded-2xl border transition shadow-sm overflow-hidden ${
              cell.type === 'code'
                ? 'bg-slate-900 text-slate-100 border-slate-800'
                : 'bg-white text-slate-800 border-slate-200/90'
            }`}
          >
            {/* Header de celda */}
            <div
              className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                cell.type === 'code'
                  ? 'bg-slate-950 border-slate-800 text-slate-400 font-mono'
                  : 'bg-slate-50 border-slate-100 text-slate-500 font-sans'
              }`}
            >
              <div className="flex items-center gap-2">
                {cell.type === 'code' ? (
                  <>
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In [{idx + 1}]:</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sección Explicativa (Markdown)</span>
                  </>
                )}
              </div>

              {cell.type === 'code' && (
                <button
                  onClick={() => handleCopyCell(cell.content, idx)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px]"
                  title="Copiar celda de código"
                >
                  {copiedCellIdx === idx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Contenido de la celda */}
            <div className="p-4 sm:p-5">
              {cell.type === 'code' ? (
                <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {cell.content}
                </pre>
              ) : (
                <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed space-y-2 text-xs sm:text-sm">
                  {cell.content.split('\n\n').map((paragraph, pIdx) => {
                    if (paragraph.startsWith('# ')) {
                      return (
                        <h2 key={pIdx} className="text-lg sm:text-xl font-bold text-slate-900 mt-2 mb-1">
                          {paragraph.replace('# ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h3 key={pIdx} className="text-base font-bold text-slate-900 mt-2 mb-1">
                          {paragraph.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="text-sm font-semibold text-slate-800 mt-2 mb-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-slate-600 whitespace-pre-line">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Salida de ejecución si existe */}
            {cell.output && (
              <div className="border-t border-slate-800 bg-slate-950/80 p-4">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Salida de Ejecución [Out]:</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {cell.output}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
