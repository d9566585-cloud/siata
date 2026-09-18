import { ICALevel, ICAClassification, SiataStation, PoecaAlertSummary } from '../types';

export const ICA_LEVELS: Record<ICALevel, ICAClassification> = {
  Buena: {
    level: 'Buena',
    minVal: 0,
    maxVal: 50,
    color: '#22c55e',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    borderColor: 'border-emerald-400',
    healthEffects: 'La calidad del aire se considera satisfactoria y la contaminación no representa riesgo significativo.',
    recommendationsSchool: 'Actividades deportivas y recreativas al aire libre totalmente permitidas sin restricción.',
    recommendationsGeneral: 'Disfruta de tus actividades habituales al aire libre y ventila espacios interiores.',
    recommendationsSports: 'Condiciones óptimas para entrenamiento deportivo de alta y moderada intensidad al aire libre.',
    alertLevel: 'Normal',
  },
  Moderada: {
    level: 'Moderada',
    minVal: 51,
    maxVal: 100,
    color: '#eab308',
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    badgeText: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    healthEffects: 'Calidad aceptable. Personas con hipersensibilidad respiratoria pueden experimentar síntomas leves.',
    recommendationsSchool: 'Permitir actividades al aire libre; vigilar alumnos con asma, rinitis o antecedentes alérgicos.',
    recommendationsGeneral: 'Población general puede continuar actividades cotidianas. Reducir exposición prolongada en corredores de alto tráfico.',
    recommendationsSports: 'Entrenamientos normales; personas con asma deben tener inhalador de rescate a mano.',
    alertLevel: 'Normal',
  },
  'Dañina a Grupos Sensibles': {
    level: 'Dañina a Grupos Sensibles',
    minVal: 101,
    maxVal: 150,
    color: '#f97316',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    badgeText: 'text-orange-700',
    borderColor: 'border-orange-400',
    healthEffects: 'Aumento en la probabilidad de efectos adversos en niños, adultos mayores, gestantes y personas con afecciones cardiorrespiratorias.',
    recommendationsSchool: 'Suspender clases de educación física de alta exigencia al aire libre para preescolar y primaria. Reubicar en aulas ventiladas.',
    recommendationsGeneral: 'Grupos vulnerables deben limitar el esfuerzo prolongado al aire libre. Evitar senderismo en horas pico.',
    recommendationsSports: 'Reducir la duración e intensidad del entrenamiento al aire libre; realizar sesiones de fuerza en interiores.',
    alertLevel: 'Prevención (POECA)',
  },
  Dañina: {
    level: 'Dañina',
    minVal: 151,
    maxVal: 200,
    color: '#ef4444',
    badgeBg: 'bg-red-50 text-red-800 border-red-200',
    badgeText: 'text-red-700',
    borderColor: 'border-red-400',
    healthEffects: 'Todos los ciudadanos pueden comenzar a experimentar efectos en la salud; agravamiento severo en grupos sensibles.',
    recommendationsSchool: 'Suspensión total de recreos abiertos y eventos deportivos escolares. Uso obligatorio de tapabocas en traslados.',
    recommendationsGeneral: 'Evitar actividades extenuantes al aire libre. Población sensible debe permanecer en recintos cerrados.',
    recommendationsSports: 'Prohibir entrenamientos competitivos al aire libre; activar protocolos de ciclovías y cierre de escenarios abiertos.',
    alertLevel: 'Alerta',
  },
  'Muy Dañina': {
    level: 'Muy Dañina',
    minVal: 201,
    maxVal: 300,
    color: '#a855f7',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
    badgeText: 'text-purple-700',
    borderColor: 'border-purple-400',
    healthEffects: 'Alerta general de salud pública. Impacto agudo generalizado con aumento en consultas de urgencia respiratoria.',
    recommendationsSchool: 'Transición a modalidad remota o cese de actividades escolares presenciales no esenciales.',
    recommendationsGeneral: 'Permanecer en interiores con ventanas cerradas. Empleo de purificadores de aire si están disponibles.',
    recommendationsSports: 'Cancelación obligatoria de todo evento deportivo metropolitano.',
    alertLevel: 'Alerta',
  },
  Peligrosa: {
    level: 'Peligrosa',
    minVal: 301,
    maxVal: 500,
    color: '#881337',
    badgeBg: 'bg-rose-950 text-rose-100 border-rose-800',
    badgeText: 'text-rose-900 font-bold',
    borderColor: 'border-rose-900',
    healthEffects: 'Condición de emergencia sanitaria extrema. Toda la población experimenta serios riesgos de salud inmediata.',
    recommendationsSchool: 'Suspensión total e indefinida de jornadas académicas presenciales.',
    recommendationsGeneral: 'Emergencia metropolitana. Confinamiento preventivo y uso estricto de mascarillas de alta eficiencia (N95/FFP2).',
    recommendationsSports: 'Cierre total de todos los escenarios deportivos del Valle de Aburrá.',
    alertLevel: 'Emergencia',
  },
};

/**
 * Calcula el ICA correspondiente para el contaminante PM2.5 según la Resolución 2254 de 2017
 */
export function calculatePM25ICA(pm25: number): number {
  if (pm25 <= 0) return 0;
  if (pm25 <= 12.0) {
    return Math.round((50 / 12.0) * pm25);
  } else if (pm25 <= 37.0) {
    return Math.round(51 + ((100 - 51) / (37.0 - 12.1)) * (pm25 - 12.1));
  } else if (pm25 <= 55.4) {
    return Math.round(101 + ((150 - 101) / (55.4 - 37.1)) * (pm25 - 37.1));
  } else if (pm25 <= 150.4) {
    return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
  } else if (pm25 <= 250.4) {
    return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
  } else {
    return Math.min(500, Math.round(301 + ((500 - 301) / (500.0 - 250.5)) * (pm25 - 250.5)));
  }
}

/**
 * Obtiene la clasificación y metadatos de un valor numérico de ICA
 */
export function getICAClassification(ica: number): ICAClassification {
  if (ica <= 50) return ICA_LEVELS['Buena'];
  if (ica <= 100) return ICA_LEVELS['Moderada'];
  if (ica <= 150) return ICA_LEVELS['Dañina a Grupos Sensibles'];
  if (ica <= 200) return ICA_LEVELS['Dañina'];
  if (ica <= 300) return ICA_LEVELS['Muy Dañina'];
  return ICA_LEVELS['Peligrosa'];
}

function generate24hHistory(basePM25: number, baseICA: number, peakFactor: number = 1.35) {
  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  return hours.map((hour, idx) => {
    // Inversión térmica matutina típica de Medellín entre las 6:00 y 9:30 AM
    let diurnalCurve = 1.0;
    if (idx >= 6 && idx <= 9) {
      diurnalCurve = peakFactor;
    } else if (idx >= 17 && idx <= 20) {
      diurnalCurve = peakFactor * 0.88; // Hora pico de la tarde
    } else if (idx >= 12 && idx <= 15) {
      diurnalCurve = 0.78; // Radiación solar y dispersión vertical
    } else if (idx < 5) {
      diurnalCurve = 0.85;
    }

    const variance = (Math.sin(idx * 0.8) * 0.12);
    const pm25 = Math.max(4.0, Number((basePM25 * diurnalCurve * (1 + variance)).toFixed(1)));
    const ica = calculatePM25ICA(pm25);
    const pm10 = Math.round(pm25 * 1.75 + Math.random() * 4);
    const temperature = Number((19.5 + Math.sin((idx - 8) / 4) * 5.2).toFixed(1));

    return {
      hour,
      pm25,
      pm10,
      ica,
      temperature,
    };
  });
}

export const INITIAL_SIATA_STATIONS: SiataStation[] = [
  {
    id: 'sta-01',
    code: 'MED-TRAF',
    name: 'Estación Tráfico Sur (Autopista Sur)',
    municipality: 'Medellín',
    neighborhood: 'Guayabal',
    address: 'Carrera 50 x Calle 10 Sur, Corredor Vial',
    latitude: 6.2087,
    longitude: -75.5847,
    altitude: 1495,
    stationType: 'Tráfico',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 42.4,
      pm10: 78.2,
      o3: 28.5,
      no2: 54.1,
      so2: 12.3,
      co: 2.1,
      temperature: 24.8,
      humidity: 68,
      windSpeed: 4.2,
      ica: calculatePM25ICA(42.4), // 116 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(38.0, 108, 1.42),
  },
  {
    id: 'sta-02',
    code: 'MED-AGUI',
    name: 'Estación Centro (Edif. Miguel de Aguinaga)',
    municipality: 'Medellín',
    neighborhood: 'La Candelaria / Centro',
    address: 'Calle 52 x Carrera 50',
    latitude: 6.2520,
    longitude: -75.5694,
    altitude: 1510,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 39.8,
      pm10: 69.4,
      o3: 31.0,
      no2: 48.6,
      so2: 9.8,
      co: 1.8,
      temperature: 26.2,
      humidity: 62,
      windSpeed: 3.5,
      ica: calculatePM25ICA(39.8), // 109 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(36.5, 103, 1.38),
  },
  {
    id: 'sta-03',
    code: 'MED-ARAN',
    name: 'Estación Aranjuez (I.E. Ciro Mendía)',
    municipality: 'Medellín',
    neighborhood: 'Aranjuez (Comuna 4)',
    address: 'Calle 89 x Carrera 48B',
    latitude: 6.2779,
    longitude: -75.5606,
    altitude: 1540,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 34.2,
      pm10: 58.1,
      o3: 24.3,
      no2: 36.5,
      so2: 7.2,
      co: 1.4,
      temperature: 25.1,
      humidity: 65,
      windSpeed: 5.1,
      ica: calculatePM25ICA(34.2), // 94 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(30.0, 86, 1.32),
  },
  {
    id: 'sta-04',
    code: 'MED-BELA',
    name: 'Estación Belén (Casa de Justicia)',
    municipality: 'Medellín',
    neighborhood: 'Belén (Comuna 16)',
    address: 'Calle 30A x Carrera 76',
    latitude: 6.2307,
    longitude: -75.6038,
    altitude: 1515,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 29.5,
      pm10: 49.3,
      o3: 38.2,
      no2: 31.0,
      so2: 5.9,
      co: 1.2,
      temperature: 24.0,
      humidity: 70,
      windSpeed: 4.8,
      ica: calculatePM25ICA(29.5), // 85 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(26.0, 78, 1.28),
  },
  {
    id: 'sta-05',
    code: 'MED-POLI',
    name: 'Estación El Poblado (Politécnico JIC)',
    municipality: 'Medellín',
    neighborhood: 'El Poblado (Comuna 14)',
    address: 'Carrera 48 # 7-151',
    latitude: 6.2045,
    longitude: -75.5786,
    altitude: 1520,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 38.1,
      pm10: 64.7,
      o3: 35.8,
      no2: 44.0,
      so2: 8.4,
      co: 1.6,
      temperature: 25.5,
      humidity: 64,
      windSpeed: 4.0,
      ica: calculatePM25ICA(38.1), // 104 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(33.0, 93, 1.34),
  },
  {
    id: 'sta-06',
    code: 'MED-FMIN',
    name: 'Estación Robledo (Facultad de Minas UNAL)',
    municipality: 'Medellín',
    neighborhood: 'Robledo (Comuna 7)',
    address: 'Carrera 80 x Calle 65',
    latitude: 6.2730,
    longitude: -75.5925,
    altitude: 1590,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 28.2,
      pm10: 46.8,
      o3: 29.1,
      no2: 28.3,
      so2: 5.1,
      co: 1.1,
      temperature: 23.4,
      humidity: 72,
      windSpeed: 6.0,
      ica: calculatePM25ICA(28.2), // 83 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(25.0, 76, 1.25),
  },
  {
    id: 'sta-07',
    code: 'BEL-FEVE',
    name: 'Estación Bello (I.E. Fernando Vélez)',
    municipality: 'Bello',
    neighborhood: 'Central Bello',
    address: 'Calle 50 # 47-32',
    latitude: 6.3375,
    longitude: -75.5583,
    altitude: 1470,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 41.2,
      pm10: 71.0,
      o3: 27.6,
      no2: 42.1,
      so2: 10.5,
      co: 1.9,
      temperature: 25.8,
      humidity: 63,
      windSpeed: 3.8,
      ica: calculatePM25ICA(41.2), // 112 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(35.0, 97, 1.4),
  },
  {
    id: 'sta-08',
    code: 'ITA-CJUS',
    name: 'Estación Itagüí (Casa de la Cultura)',
    municipality: 'Itagüí',
    neighborhood: 'Zona Centro Itagüí',
    address: 'Carrera 51 # 48-12',
    latitude: 6.1772,
    longitude: -75.6148,
    altitude: 1540,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 38.6,
      pm10: 67.5,
      o3: 26.0,
      no2: 39.5,
      so2: 11.2,
      co: 1.7,
      temperature: 24.6,
      humidity: 69,
      windSpeed: 4.1,
      ica: calculatePM25ICA(38.6), // 105 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(34.0, 95, 1.36),
  },
  {
    id: 'sta-09',
    code: 'ITA-DITA',
    name: 'Estación Itagüí (Complejo Ditaires)',
    municipality: 'Itagüí',
    neighborhood: 'Ditaires',
    address: 'Calle 36 x Carrera 58',
    latitude: 6.1685,
    longitude: -75.6273,
    altitude: 1560,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 26.8,
      pm10: 44.2,
      o3: 32.4,
      no2: 24.8,
      so2: 6.0,
      co: 1.0,
      temperature: 23.8,
      humidity: 73,
      windSpeed: 5.2,
      ica: calculatePM25ICA(26.8), // 80 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(24.0, 74, 1.26),
  },
  {
    id: 'sta-10',
    code: 'ENV-HOSP',
    name: 'Estación Envigado (E.S.E. Santa Gertrudis)',
    municipality: 'Envigado',
    neighborhood: 'Uribe Ángel',
    address: 'Diagonal 33 # 35C Sur - 31',
    latitude: 6.1687,
    longitude: -75.5816,
    altitude: 1575,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 31.0,
      pm10: 52.0,
      o3: 33.5,
      no2: 32.1,
      so2: 6.8,
      co: 1.3,
      temperature: 24.2,
      humidity: 67,
      windSpeed: 4.7,
      ica: calculatePM25ICA(31.0), // 88 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(28.0, 82, 1.3),
  },
  {
    id: 'sta-11',
    code: 'SAB-JOFE',
    name: 'Estación Sabaneta (I.E. José Félix de Restrepo)',
    municipality: 'Sabaneta',
    neighborhood: 'Calle Larga',
    address: 'Carrera 45 # 75 Sur - 25',
    latitude: 6.1517,
    longitude: -75.6171,
    altitude: 1565,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 35.5,
      pm10: 59.8,
      o3: 30.2,
      no2: 37.0,
      so2: 7.9,
      co: 1.5,
      temperature: 24.5,
      humidity: 68,
      windSpeed: 4.5,
      ica: calculatePM25ICA(35.5), // 97 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(31.0, 88, 1.33),
  },
  {
    id: 'sta-12',
    code: 'COP-CEMA',
    name: 'Estación Copacabana (I.E. San Antonio)',
    municipality: 'Copacabana',
    neighborhood: 'La Asunción',
    address: 'Carrera 48 # 52-10',
    latitude: 6.3463,
    longitude: -75.5090,
    altitude: 1450,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 36.8,
      pm10: 62.0,
      o3: 25.1,
      no2: 38.4,
      so2: 13.5,
      co: 1.6,
      temperature: 26.0,
      humidity: 61,
      windSpeed: 4.9,
      ica: calculatePM25ICA(36.8), // 100 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(32.0, 90, 1.35),
  },
  {
    id: 'sta-13',
    code: 'GIR-EPM',
    name: 'Estación Girardota (S.O.S. Girardota / EPM)',
    municipality: 'Girardota',
    neighborhood: 'Zona Industrial Girardota',
    address: 'Calle 7 # 14-20',
    latitude: 6.3758,
    longitude: -75.4526,
    altitude: 1430,
    stationType: 'Industrial',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 44.8,
      pm10: 84.3,
      o3: 29.8,
      no2: 49.5,
      so2: 24.1,
      co: 2.3,
      temperature: 27.1,
      humidity: 58,
      windSpeed: 3.9,
      ica: calculatePM25ICA(44.8), // 122 -> Dañina a Grupos Sensibles
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(40.0, 112, 1.45),
  },
  {
    id: 'sta-14',
    code: 'BAR-TORR',
    name: 'Estación Barbosa (Torre Social)',
    municipality: 'Barbosa',
    neighborhood: 'Centro Barbosa',
    address: 'Carrera 15 # 12-40',
    latitude: 6.4382,
    longitude: -75.3312,
    altitude: 1300,
    stationType: 'Fondo / Rural',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 18.5,
      pm10: 31.2,
      o3: 22.0,
      no2: 15.6,
      so2: 4.2,
      co: 0.7,
      temperature: 26.5,
      humidity: 66,
      windSpeed: 6.5,
      ica: calculatePM25ICA(18.5), // 64 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(17.0, 60, 1.2),
  },
  {
    id: 'sta-15',
    code: 'CAL-LASA',
    name: 'Estación Caldas (Corporación Lasallista)',
    municipality: 'Caldas',
    neighborhood: 'Lasso / Primavera',
    address: 'Carrera 51 # 118 Sur - 57',
    latitude: 6.0931,
    longitude: -75.6378,
    altitude: 1750,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 22.1,
      pm10: 38.0,
      o3: 31.5,
      no2: 19.8,
      so2: 5.4,
      co: 0.9,
      temperature: 20.8,
      humidity: 78,
      windSpeed: 5.8,
      ica: calculatePM25ICA(22.1), // 71 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(20.0, 67, 1.22),
  },
  {
    id: 'sta-16',
    code: 'EST-HOSP',
    name: 'Estación La Estrella (Hospital San Vicente)',
    municipality: 'La Estrella',
    neighborhood: 'San Cayetano',
    address: 'Calle 79 Sur # 60-15',
    latitude: 6.1578,
    longitude: -75.6433,
    altitude: 1620,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 32.5,
      pm10: 54.6,
      o3: 28.3,
      no2: 34.0,
      so2: 6.5,
      co: 1.4,
      temperature: 23.5,
      humidity: 71,
      windSpeed: 4.4,
      ica: calculatePM25ICA(32.5), // 91 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(29.0, 84, 1.3),
  },
  {
    id: 'sta-17',
    code: 'MED-SANC',
    name: 'Estación San Cristóbal (Parque Biblioteca)',
    municipality: 'Medellín',
    neighborhood: 'Corregimiento San Cristóbal',
    address: 'Calle 62 # 131-80',
    latitude: 6.2764,
    longitude: -75.6369,
    altitude: 1780,
    stationType: 'Fondo / Rural',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 11.2,
      pm10: 21.0,
      o3: 36.4,
      no2: 12.0,
      so2: 3.1,
      co: 0.5,
      temperature: 21.0,
      humidity: 80,
      windSpeed: 7.2,
      ica: calculatePM25ICA(11.2), // 47 -> Buena
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(10.5, 44, 1.15),
  },
  {
    id: 'sta-18',
    code: 'MED-SELE',
    name: 'Estación Santa Elena (Vereda El Placer)',
    municipality: 'Medellín',
    neighborhood: 'Corregimiento Santa Elena',
    address: 'Vereda El Placer km 12',
    latitude: 6.2075,
    longitude: -75.5009,
    altitude: 2200,
    stationType: 'Fondo / Rural',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 8.4,
      pm10: 16.5,
      o3: 42.0,
      no2: 8.1,
      so2: 2.0,
      co: 0.4,
      temperature: 17.5,
      humidity: 86,
      windSpeed: 8.5,
      ica: calculatePM25ICA(8.4), // 35 -> Buena
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(8.0, 33, 1.12),
  },
  {
    id: 'sta-19',
    code: 'MED-ALTA',
    name: 'Estación Altavista (I.E. Pedro Octavio Amado)',
    municipality: 'Medellín',
    neighborhood: 'Corregimiento Altavista',
    address: 'Calle 18 # 104-50',
    latitude: 6.2198,
    longitude: -75.6267,
    altitude: 1680,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 27.4,
      pm10: 45.0,
      o3: 31.0,
      no2: 26.5,
      so2: 5.7,
      co: 1.1,
      temperature: 23.1,
      humidity: 74,
      windSpeed: 5.0,
      ica: calculatePM25ICA(27.4), // 81 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(25.0, 76, 1.25),
  },
  {
    id: 'sta-20',
    code: 'MED-VILL',
    name: 'Estación Villa Hermosa (Comuna 8)',
    municipality: 'Medellín',
    neighborhood: 'Villa Hermosa',
    address: 'Calle 56 # 23-45',
    latitude: 6.2483,
    longitude: -75.5492,
    altitude: 1610,
    stationType: 'Poblacional',
    isActive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    currentReading: {
      timestamp: new Date().toISOString(),
      pm25: 33.1,
      pm10: 55.4,
      o3: 29.5,
      no2: 35.0,
      so2: 6.8,
      co: 1.3,
      temperature: 24.7,
      humidity: 67,
      windSpeed: 4.6,
      ica: calculatePM25ICA(33.1), // 92 -> Moderada
      primaryPollutant: 'pm25',
    },
    history24h: generate24hHistory(30.0, 86, 1.31),
  }
];

export function computePoecaSummary(stations: SiataStation[]): PoecaAlertSummary {
  let goodCount = 0;
  let moderateCount = 0;
  let sensitiveHarmCount = 0;
  let harmfulCount = 0;
  let veryHarmfulCount = 0;
  let hazardousCount = 0;
  let sumIca = 0;
  let peakStation = stations[0];

  stations.forEach((s) => {
    const ica = s.currentReading.ica;
    sumIca += ica;
    if (ica > peakStation.currentReading.ica) {
      peakStation = s;
    }

    if (ica <= 50) goodCount++;
    else if (ica <= 100) moderateCount++;
    else if (ica <= 150) sensitiveHarmCount++;
    else if (ica <= 200) harmfulCount++;
    else if (ica <= 300) veryHarmfulCount++;
    else hazardousCount++;
  });

  const criticalStations = stations.filter((s) => s.currentReading.ica > 100);
  const total = stations.length;
  const averageIca = Math.round(sumIca / (total || 1));

  // Protocolo POECA Valle de Aburrá:
  // Si más del 50% de las estaciones representativas poblacionales superan ICA 100 (Naranja) -> Estado de Prevención
  // Si superan ICA 150 (Rojo) -> Estado de Alerta
  // Si superan ICA 200 (Morado) -> Estado de Emergencia
  const highIcaCount = sensitiveHarmCount + harmfulCount + veryHarmfulCount + hazardousCount;
  let activeProtocol: 'Normal' | 'Estado de Prevención' | 'Estado de Alerta' | 'Estado de Emergencia' = 'Normal';

  if (hazardousCount > 0 || veryHarmfulCount >= 2) {
    activeProtocol = 'Estado de Emergencia';
  } else if (harmfulCount >= 2 || (highIcaCount / total) > 0.4) {
    activeProtocol = 'Estado de Alerta';
  } else if (highIcaCount >= 3) {
    activeProtocol = 'Estado de Prevención';
  }

  return {
    totalStations: total,
    goodCount,
    moderateCount,
    sensitiveHarmCount,
    harmfulCount,
    veryHarmfulCount,
    hazardousCount,
    activeProtocol,
    criticalStations,
    averageIca,
    peakStation,
  };
}
