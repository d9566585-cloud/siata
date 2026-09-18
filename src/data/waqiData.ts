import { WaqiCityData, WaqiTileType, ApiMasterItem } from '../types';

export const WAQI_TILE_TYPES: Array<{
  id: WaqiTileType;
  label: string;
  description: string;
  pollutant: string;
}> = [
  {
    id: 'usepa-aqi',
    label: 'AQI Compuesto (EPA EE.UU.)',
    description: 'Índice de Calidad del Aire general compuesto según estándar EPA',
    pollutant: 'Compuesto (PM2.5, PM10, O3, NO2, SO2, CO)',
  },
  {
    id: 'usepa-pm25',
    label: 'PM2.5 (Partículas Finas)',
    description: 'Índice basado exclusivamente en partículas menores a 2.5 micras',
    pollutant: 'PM2.5',
  },
  {
    id: 'usepa-pm10',
    label: 'PM10 (Partículas Respirables)',
    description: 'Índice basado en partículas menores a 10 micras',
    pollutant: 'PM10',
  },
  {
    id: 'usepa-o3',
    label: 'Ozono Troposférico (O3)',
    description: 'Concentración de ozono superficial por fotometría',
    pollutant: 'O3',
  },
  {
    id: 'usepa-no2',
    label: 'Dióxido de Nitrógeno (NO2)',
    description: 'Contaminante vehicular y de combustión fósil',
    pollutant: 'NO2',
  },
  {
    id: 'usepa-so2',
    label: 'Dióxido de Azufre (SO2)',
    description: 'Emisiones de industrias térmicas y refinerías',
    pollutant: 'SO2',
  },
  {
    id: 'usepa-co',
    label: 'Monóxido de Carbono (CO)',
    description: 'Gas asfixiante producto de combustión incompleta',
    pollutant: 'CO',
  },
  {
    id: 'asean-pm10',
    label: 'PM10 Estándar ASEAN',
    description: 'Concentración cruda de PM10 según estándar del sudeste asiático',
    pollutant: 'PM10 (ASEAN)',
  },
];

/**
 * Función oficial de clasificación según el Notebook Calidad Aire_Est.ipynb:
 * 
 * def clasificar_aqi(valor):
 *     if valor <= 50:
 *         return "Buena"
 *     elif valor <= 100:
 *         return "Moderada"
 *     elif valor <= 150:
 *         return "Dañina grupos sensibles"
 *     elif valor <= 200:
 *         return "Dañina"
 *     else:
 *         return "Muy Dañina"
 */
export function clasificar_aqi(
  valor: number
): 'Buena' | 'Moderada' | 'Dañina grupos sensibles' | 'Dañina' | 'Muy Dañina' {
  if (valor <= 50) {
    return 'Buena';
  } else if (valor <= 100) {
    return 'Moderada';
  } else if (valor <= 150) {
    return 'Dañina grupos sensibles';
  } else if (valor <= 200) {
    return 'Dañina';
  } else {
    return 'Muy Dañina';
  }
}

/**
 * Modelo Prescriptivo según el Notebook Calidad Aire_Est.ipynb:
 * 
 * def recomendacion(categoria):
 *     if categoria == "Buena":
 *         return "Actividades normales al aire libre"
 *     elif categoria == "Moderada":
 *         return "Reducir actividad prolongada al aire libre"
 *     elif categoria == "Dañina grupos sensibles":
 *         return "Evitar ejercicio intenso"
 *     elif categoria == "Dañina":
 *         return "Usar mascarilla y limitar exposición"
 *     else:
 *         return "Activar alerta sanitaria"
 */
export function recomendacion(categoria: string): string {
  if (categoria === 'Buena') {
    return 'Actividades normales al aire libre';
  } else if (categoria === 'Moderada') {
    return 'Reducir actividad prolongada al aire libre';
  } else if (categoria === 'Dañina grupos sensibles') {
    return 'Evitar ejercicio intenso';
  } else if (categoria === 'Dañina') {
    return 'Usar mascarilla y limitar exposición';
  } else {
    return 'Activar alerta sanitaria';
  }
}

export function getAqiColor(categoria: string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  hex: string;
} {
  switch (categoria) {
    case 'Buena':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        hex: '#10b981',
      };
    case 'Moderada':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        badge: 'bg-yellow-500 text-slate-900',
        hex: '#eab308',
      };
    case 'Dañina grupos sensibles':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200',
        badge: 'bg-orange-500 text-white',
        hex: '#f97316',
      };
    case 'Dañina':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        badge: 'bg-rose-500 text-white',
        hex: '#ef4444',
      };
    default:
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        badge: 'bg-purple-600 text-white',
        hex: '#9333ea',
      };
  }
}

/**
 * Ciudades oficiales analizadas en el cuaderno:
 * ciudades = ["caldas","medellin", "bogota", "cali", "mexico", "shanghai"]
 */
export const INITIAL_WAQI_CITIES: WaqiCityData[] = [
  {
    ciudad: 'Caldas, Medellín, Colombia',
    fecha: '2026-09-04 04:00:00',
    AQI: 59,
    dominentpol: 'pm25',
    categoria: clasificar_aqi(59),
    recomendacion: recomendacion(clasificar_aqi(59)),
    geo: [6.0930777, -75.637764],
    iaqi: {
      dew: { v: 17 },
      h: { v: 82 },
      p: { v: 1020 },
      pm25: { v: 59 },
      t: { v: 20 },
      w: { v: 1 },
      wg: { v: 9.2 },
    },
    attributions: [
      {
        name: 'Área Metropolitana del Valle de Aburrá (SIATA)',
        url: 'https://www.metropol.gov.co/ambiental',
      },
      {
        name: 'World Air Quality Index Project (WAQI)',
        url: 'https://waqi.info/',
      },
    ],
    forecast: {
      daily: {
        pm10: [
          { day: '2026-09-02', avg: 7, min: 3, max: 9 },
          { day: '2026-09-03', avg: 7, min: 4, max: 12 },
          { day: '2026-09-04', avg: 7, min: 4, max: 11 },
          { day: '2026-09-05', avg: 7, min: 3, max: 10 },
          { day: '2026-09-06', avg: 7, min: 4, max: 10 },
          { day: '2026-09-07', avg: 10, min: 5, max: 17 },
          { day: '2026-09-08', avg: 10, min: 5, max: 17 },
        ],
        pm25: [
          { day: '2026-09-02', avg: 19, min: 7, max: 28 },
          { day: '2026-09-03', avg: 21, min: 10, max: 33 },
          { day: '2026-09-04', avg: 20, min: 10, max: 33 },
          { day: '2026-09-05', avg: 16, min: 6, max: 24 },
          { day: '2026-09-06', avg: 22, min: 11, max: 30 },
          { day: '2026-09-07', avg: 28, min: 17, max: 53 },
          { day: '2026-09-08', avg: 29, min: 14, max: 51 },
        ],
        uvi: [
          { day: '2026-09-02', avg: 2, min: 0, max: 11 },
          { day: '2026-09-03', avg: 2, min: 0, max: 12 },
          { day: '2026-09-04', avg: 2, min: 0, max: 10 },
          { day: '2026-09-05', avg: 2, min: 0, max: 10 },
          { day: '2026-09-06', avg: 2, min: 0, max: 11 },
          { day: '2026-09-07', avg: 2, min: 0, max: 11 },
          { day: '2026-09-08', avg: 3, min: 0, max: 11 },
        ],
      },
    },
  },
  {
    ciudad: 'Aranjuez, Medellín, Colombia',
    fecha: '2026-09-04 05:00:00',
    AQI: 57,
    dominentpol: 'pm25',
    categoria: clasificar_aqi(57),
    recomendacion: recomendacion(clasificar_aqi(57)),
    geo: [6.2904806, -75.5555191],
    iaqi: {
      dew: { v: 15 },
      h: { v: 88 },
      p: { v: 1023 },
      pm25: { v: 57 },
      t: { v: 17 },
      w: { v: 1 },
    },
    attributions: [
      {
        name: 'Área Metropolitana del Valle de Aburrá',
        url: 'https://www.metropol.gov.co/ambiental',
      },
      {
        name: 'World Air Quality Index Project',
        url: 'https://waqi.info/',
      },
    ],
    forecast: {
      daily: {
        pm25: [
          { day: '2026-09-02', avg: 27, min: 23, max: 32 },
          { day: '2026-09-03', avg: 34, min: 16, max: 61 },
          { day: '2026-09-04', avg: 22, min: 10, max: 35 },
          { day: '2026-09-05', avg: 26, min: 12, max: 36 },
          { day: '2026-09-06', avg: 33, min: 11, max: 50 },
          { day: '2026-09-07', avg: 21, min: 10, max: 29 },
          { day: '2026-09-08', avg: 29, min: 12, max: 43 },
        ],
      },
    },
  },
  {
    ciudad: 'Bogotá, Colombia',
    fecha: '2026-09-04 05:00:00',
    AQI: 65,
    dominentpol: 'pm25',
    categoria: clasificar_aqi(65),
    recomendacion: recomendacion(clasificar_aqi(65)),
    geo: [4.7110, -74.0721],
    iaqi: {
      pm25: { v: 65 },
      pm10: { v: 24 },
      o3: { v: 18 },
      no2: { v: 22 },
      t: { v: 14 },
      h: { v: 75 },
    },
    attributions: [
      {
        name: 'Red de Monitoreo de Calidad del Aire de Bogotá (RMCAB)',
        url: 'http://saludcapital.gov.co',
      },
    ],
  },
  {
    ciudad: 'Cali, Colombia',
    fecha: '2026-09-04 04:00:00',
    AQI: 42,
    dominentpol: 'pm10',
    categoria: clasificar_aqi(42),
    recomendacion: recomendacion(clasificar_aqi(42)),
    geo: [3.4516, -76.5320],
    iaqi: {
      pm10: { v: 42 },
      pm25: { v: 38 },
      o3: { v: 12 },
      t: { v: 24 },
      h: { v: 80 },
    },
    attributions: [
      {
        name: 'DAGMA - Alcaldía de Santiago de Cali',
        url: 'http://www.cali.gov.co/dagma',
      },
    ],
  },
  {
    ciudad: 'Ciudad de México, México',
    fecha: '2026-09-04 04:00:00',
    AQI: 115,
    dominentpol: 'pm25',
    categoria: clasificar_aqi(115),
    recomendacion: recomendacion(clasificar_aqi(115)),
    geo: [19.4326, -99.1332],
    iaqi: {
      pm25: { v: 115 },
      pm10: { v: 78 },
      o3: { v: 45 },
      no2: { v: 34 },
      t: { v: 18 },
      h: { v: 62 },
    },
    attributions: [
      {
        name: 'Sistema de Monitoreo Atmosférico de la CDMX (SIMAT)',
        url: 'http://www.aire.cdmx.gob.mx/',
      },
    ],
  },
  {
    ciudad: 'Shanghai, China',
    fecha: '2026-09-04 18:00:00',
    AQI: 148,
    dominentpol: 'pm25',
    categoria: clasificar_aqi(148),
    recomendacion: recomendacion(clasificar_aqi(148)),
    geo: [31.2304, 121.4737],
    iaqi: {
      pm25: { v: 148 },
      pm10: { v: 92 },
      no2: { v: 48 },
      so2: { v: 12 },
      t: { v: 28 },
      h: { v: 71 },
    },
    attributions: [
      {
        name: 'Shanghai Environmental Monitoring Center (SEMC)',
        url: 'http://www.semc.gov.cn/',
      },
    ],
  },
];

/**
 * Batería Maestra de APIs para Google Colab extraída del cuaderno:
 */
export const API_MASTER_TABLE: ApiMasterItem[] = [
  {
    categoria: 'Ambiental',
    api: 'WAQI',
    docsUrl: 'https://aqicn.org/api/',
    descripcion: 'Calidad del aire (PM10, PM2.5, AQI) y sensores meteorológicos globales.',
    estructura: 'JSON con objetos anidados (data.iaqi, data.forecast)',
    requiereToken: 'Sí',
    complejidad: 'Alta',
  },
  {
    categoria: 'Economía',
    api: 'Frankfurter',
    docsUrl: 'https://www.frankfurter.app/docs/',
    descripcion: 'Datos del Banco Central Europeo sobre tipos de cambio de divisas.',
    estructura: 'JSON con diccionario plano',
    requiereToken: 'No',
    complejidad: 'Baja',
  },
  {
    categoria: 'Medicina',
    api: 'Disease.sh',
    docsUrl: 'https://disease.sh/docs/',
    descripcion: 'Estadísticas en tiempo real de COVID-19, vacunas y salud global.',
    estructura: 'JSON directo (Llave-Valor)',
    requiereToken: 'No',
    complejidad: 'Baja',
  },
  {
    categoria: 'Deportes',
    api: 'API-Football',
    docsUrl: 'https://www.api-sports.io/documentation/football',
    descripcion: 'Estadísticas de +1000 ligas, resultados y eventos en vivo.',
    estructura: 'JSON basado en listas (response[])',
    requiereToken: 'Sí',
    complejidad: 'Media',
  },
  {
    categoria: 'Espacio',
    api: 'NASA APOD',
    docsUrl: 'https://api.nasa.gov/',
    descripcion: 'Metadatos científicos e imágenes astronómicas del día.',
    estructura: 'JSON con URLs de multimedia',
    requiereToken: 'Sí',
    complejidad: 'Media',
  },
  {
    categoria: 'Geografía',
    api: 'REST Countries',
    docsUrl: 'https://restcountries.com/',
    descripcion: 'Información demográfica, fronteras y banderas del mundo.',
    estructura: 'JSON con arrays de objetos extensos',
    requiereToken: 'No',
    complejidad: 'Media',
  },
  {
    categoria: 'Nutrición',
    api: 'Fruityvice',
    docsUrl: 'https://www.fruityvice.com/',
    descripcion: 'Composición nutricional detallada (azúcar, vitaminas) de frutas.',
    estructura: 'JSON estructurado por familias',
    requiereToken: 'No',
    complejidad: 'Baja',
  },
  {
    categoria: 'Finanzas',
    api: 'Alpha Vantage',
    docsUrl: 'https://www.alphavantage.co/documentation/',
    descripcion: 'Datos de acciones, criptomonedas e indicadores técnicos.',
    estructura: 'JSON con series de tiempo',
    requiereToken: 'Sí',
    complejidad: 'Alta',
  },
  {
    categoria: 'Sociedad',
    api: 'RandomUser',
    docsUrl: 'https://randomuser.me/documentation',
    descripcion: 'Generador de perfiles ficticios para pruebas de bases de datos.',
    estructura: 'JSON con múltiples sub-objetos',
    requiereToken: 'No',
    complejidad: 'Baja',
  },
];
