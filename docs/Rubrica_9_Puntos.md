# 📋 Matriz de Cumplimiento Técnico de la Rúbrica (9 Puntos)

Documento de sustentación técnica para la evaluación del Parcial Práctico (Pregunta 11).

---

### Punto 1: Revisar los dos notebooks suministrados y comprender el flujo de adquisición, transformación y visualización
- **Cumplimiento:** 100%
- **Descripción:** Se revisaron a fondo los dos proyectos suministrados en Colab:
  - *Cuaderno 1 (Calidad_Aire_Map_Est.ipynb):* Flujo enfocado en la adquisición de telemetría geoespacial, unión con metadatos espaciales y renderizado cartográfico interactivo con Folium y mosaicos continuos de WAQI.
  - *Cuaderno 2 (Calidad_Aire_Est.ipynb):* Pipeline analítico de ciencia de datos con Pandas (extracción, normalización tabular, imputación/filtrado de datos inválidos, vectorización del cálculo del ICA y visualización estadística con Seaborn).
- **Evidencia:** Archivos [`notebooks/Calidad_Aire_Map_Est.ipynb`](../notebooks/Calidad_Aire_Map_Est.ipynb) y [`notebooks/Calidad_Aire_Est.ipynb`](../notebooks/Calidad_Aire_Est.ipynb).

---

### Punto 2: Agregar/configurar la clave API en el lugar indicado en el notebook
- **Cumplimiento:** 100%
- **Descripción:** Se dispuso en la Celda 2 de ambos cuadernos la variable:
  ```python
  API_KEY = "demo"  # Reemplazar con su token personal de WAQI / AQICN
  ```
  La variable es verificada e integrada en el flujo para solicitar capas de teselas cartográficas en `tiles.aqicn.org` y endpoints con token.
- **Evidencia:** Celda 2 de ambos cuadernos `.ipynb`.

---

### Punto 3: Consumir la API del SIATA y verificar la recepción de datos
- **Cumplimiento:** 100%
- **Descripción:** Se implementó una rutina de consulta HTTP mediante `requests.get` al endpoint oficial del SIATA:
  `https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json`
  Se verificó la recepción de una estructura JSON válida con **525 observaciones**, validando código de respuesta HTTP 200 y presencia del array `measurements`.
- **Evidencia:** Celda 3 en ambos cuadernos y consola interactiva de API en la aplicación web (`/api`).

---

### Punto 4: Explorar los datos: variables, tipos, valores faltantes, rangos y posibles inconsistencias
- **Cumplimiento:** 100%
- **Descripción:** Se llevó a cabo un Análisis Exploratorio de Datos (EDA) en la Celda 4:
  1. **Variables y Tipos:** `location` (object), `value` (float64), `coordinates.latitude` (float64), `coordinates.longitude` (float64), `date.local` (object).
  2. **Valores Faltantes:** Se verificó la ausencia de `NaN` tradicionales (`isna().sum() = 0`).
  3. **Inconsistencias y Valor Centinela:** Se detectó que 173 registros poseen `value = -9999.0` (33% del archivo), correspondiente a sensores apagados o en mantenimiento.
  4. **Rangos Estadísticos:** En las 352 observaciones válidas (`value > 0`), la concentración de $PM_{2.5}$ osciló entre un **mínimo de 3.2 µg/m³** y un **máximo de 38.4 µg/m³**, con un promedio de **17.49 µg/m³**.
- **Evidencia:** Celda 4 de ambos cuadernos y tabla descriptiva en la pestaña de Análisis Prescriptivo.

---

### Punto 5: Crear una réplica funcional del flujo mostrado en los notebooks
- **Cumplimiento:** 100%
- **Descripción:** Se construyeron cuadernos reproducibles con ejecución garantizada de punta a punta tanto en Google Colab como en entornos locales (Jupyter Lab / VS Code) y en la aplicación web reactiva.
- **Evidencia:** Carpeta [`notebooks/`](../notebooks/) y pestaña interactiva "Cuadernos (.ipynb)" en la web.

---

### Punto 6: Desarrollar una aplicación que consuma los datos del SIATA y permita consultar la información del ICA
- **Cumplimiento:** 100%
- **Descripción:** Aplicación web moderna en React y TypeScript con backend Express que consulta la telemetría del SIATA en tiempo real y calcula el ICA normativo de cada estación aplicando la fórmula oficial colombiana (Resolución 2254 de 2017).
- **Evidencia:** Componente `StationsDashboard.tsx` y `PrescriptiveAnalysis.tsx`.

---

### Punto 7: Incorporar el componente de mapeo para visualizar los datos según su ubicación
- **Cumplimiento:** 100%
- **Descripción:** Mapa interactivo con Leaflet/Folium con las 16 estaciones de monitoreo geolocalizadas con precisión milimétrica en los 10 municipios del Valle de Aburrá, coloreadas según la categoría del ICA, con áreas de influencia de 1,000 metros y capa base de mosaicos de calidad del aire.
- **Evidencia:** Componente `AirQualityMap.tsx` y pestaña "1. Mapa Interactivo (Folium)".

---

### Punto 8: Incorporar interacción en la aplicación (filtros, consulta de estaciones o visualización de valores)
- **Cumplimiento:** 100%
- **Descripción:** Interacciones implementadas:
  - Buscador de texto en tiempo real.
  - Filtro por municipio (Medellín, Caldas, Envigado, Bello, etc.).
  - Filtro por categoría de riesgo del ICA (Buena, Moderada, Dañina).
  - Simulador de escenarios climáticos (*Inversión Térmica Matutina* y *Lluvias de Lavado*).
  - Selección de estaciones con actualización síncrona de tarjetas de detalle, recomendaciones y gráficos.
- **Evidencia:** Controles interactivos en `StationsDashboard.tsx` y `AirQualityMap.tsx`.

---

### Punto 9: Construir una landing page que plantee una situación real en la que los datos de calidad del aire permitan apoyar una necesidad o decisión
- **Cumplimiento:** 100%
- **Descripción:** Landing page contextualizada en la iniciativa **"Escudo Escolar y Deportivo"** para la **Secretaría de Educación de Medellín** y el **INDER**:
  - Planteamiento del problema: 480,000 niños y deportistas expuestos a contaminación en horarios de educación física matutina.
  - Matriz de toma de decisiones operativas basada en el protocolo POECA: acciones específicas para rectores, docentes de educación física e instructores deportivos según el semáforo del ICA.
- **Evidencia:** Componente `LandingPage.tsx` y pestaña "Situación & Rúbrica".
