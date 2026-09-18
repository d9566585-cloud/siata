/**
 * Tipos de datos para el Sistema de Monitoreo del ICA (SIATA)
 * Valle de Aburrá - Resolución 2254 de 2017 (MinAmbiente Colombia)
 */

export type ICALevel =
  | 'Buena'
  | 'Moderada'
  | 'Dañina a Grupos Sensibles'
  | 'Dañina'
  | 'Muy Dañina'
  | 'Peligrosa';

export interface ICAClassification {
  level: ICALevel;
  minVal: number;
  maxVal: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  healthEffects: string;
  recommendationsSchool: string;
  recommendationsGeneral: string;
  recommendationsSports: string;
  alertLevel: 'Normal' | 'Prevención (POECA)' | 'Alerta' | 'Emergencia';
}

export type PollutantKey = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';

export interface StationReading {
  timestamp: string;
  pm25: number;       // µg/m³ (promedio móvil 24h)
  pm10: number;       // µg/m³
  o3: number;         // µg/m³ (promedio 8h)
  no2: number;        // µg/m³ (promedio 1h)
  so2: number;        // µg/m³ (promedio 1h)
  co: number;         // mg/m³
  temperature: number;// °C
  humidity: number;   // %
  windSpeed: number;  // km/h
  ica: number;        // Valor adimensional ICA (0-500)
  primaryPollutant: PollutantKey;
}

export interface SiataStation {
  id: string;
  code: string;
  name: string;
  municipality: string;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  altitude: number; // msnm
  stationType: 'Poblacional' | 'Tráfico' | 'Industrial' | 'Fondo / Rural';
  currentReading: StationReading;
  history24h: Array<{
    hour: string;
    pm25: number;
    pm10: number;
    ica: number;
    temperature: number;
  }>;
  isActive: boolean;
  lastUpdated: string;
}

export interface PoecaAlertSummary {
  totalStations: number;
  goodCount: number;
  moderateCount: number;
  sensitiveHarmCount: number;
  harmfulCount: number;
  veryHarmfulCount: number;
  hazardousCount: number;
  activeProtocol: 'Normal' | 'Estado de Prevención' | 'Estado de Alerta' | 'Estado de Emergencia';
  criticalStations: SiataStation[];
  averageIca: number;
  peakStation: SiataStation;
}

export interface ApiTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  endpoint: string;
  statusCode?: number;
  latencyMs?: number;
  message?: string;
  rawResponse?: any;
  headers?: Record<string, string>;
}

export type WaqiTileType =
  | 'usepa-aqi'
  | 'usepa-pm25'
  | 'usepa-pm10'
  | 'usepa-o3'
  | 'usepa-no2'
  | 'usepa-so2'
  | 'usepa-co'
  | 'asean-pm10';

export interface WaqiCityData {
  ciudad: string;
  fecha: string;
  AQI: number;
  dominentpol: string;
  categoria: 'Buena' | 'Moderada' | 'Dañina grupos sensibles' | 'Dañina' | 'Muy Dañina' | 'Peligrosa';
  recomendacion: string;
  geo?: [number, number];
  iaqi?: Record<string, { v: number }>;
  attributions?: Array<{ name: string; url: string }>;
  forecast?: {
    daily?: {
      pm25?: Array<{ avg: number; day: string; max: number; min: number }>;
      pm10?: Array<{ avg: number; day: string; max: number; min: number }>;
      uvi?: Array<{ avg: number; day: string; max: number; min: number }>;
    };
  };
}

export interface ApiMasterItem {
  categoria: string;
  api: string;
  docsUrl: string;
  descripcion: string;
  estructura: string;
  requiereToken: 'Sí' | 'No';
  complejidad: 'Baja' | 'Media' | 'Alta';
}
