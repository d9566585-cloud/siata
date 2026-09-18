# 🌿 SIATA & WAQI - Sistema Inteligente de Monitoreo del ICA y Calidad del Aire
> **Componente Práctico - Parcial Parte 2 (Pregunta 11)**  
> **Proyecto:** Análisis y Mapeo Geoespacial de Calidad del Aire en el Valle de Aburrá  
> **Datos Oficiales:** SIATA (*Sistema de Alerta Temprana de Medellín y el Valle de Aburrá*) & WAQI (*World Air Quality Index*)  
> **Caso de Aplicación:** Apoyo a la Toma de Decisiones para la Secretaría de Educación de Medellín y el INDER

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://siatagit-3jxfnsmf79nfo6u7geon3v.streamlit.app)
[![Colab Notebook Oficial](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing)
[![Aplicación Web en Vivo](https://img.shields.io/badge/Web_App-En_Vivo_Online-success)](https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app)
[![Normativa](https://img.shields.io/badge/Normativa-Res._2254_de_2017-amber)](docs/Resolucion_2254_2017_ICA.md)
[![Rúbrica](https://img.shields.io/badge/Rúbrica-9%20de%209%20Puntos%20Cumplidos-emerald)](docs/Rubrica_9_Puntos.md)

---

## 📌 Enlaces Principales para Evaluación

| Recurso | Enlace Directo | Descripción |
|---|---|---|
| 🎈 **Aplicación Streamlit en Vivo ("strinli")** | [https://siatagit-3jxfnsmf79nfo6u7geon3v.streamlit.app](https://siatagit-3jxfnsmf79nfo6u7geon3v.streamlit.app) | **Despliegue oficial en Streamlit Cloud:** Mapa interactivo Folium, gráficos Seaborn y modelo prescriptivo. |
| 🌐 **Plataforma Web Integral** | [https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app](https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app) | Plataforma interactiva con mapa, dashboard, simulación de inversión térmica y visor del notebook. |
| 📓 **Cuaderno Oficial Google Colab** | [Calidad_Aire_SIATA_Completo.ipynb en Colab](https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing) | Cuaderno integral reproducible: Mapeo Folium, ETL Pandas, depuración -9999, Res. 2254/2017 y Seaborn. |
| 🐍 **Código Fuente Streamlit** | [app.py](./app.py) • [streamlit_app.py](./streamlit_app.py) • [requirements.txt](./requirements.txt) | Archivos listos para ejecutar localmente con entorno virtual (`venv`) o en Streamlit Cloud. |
| 📁 **Datasets y Cuadernos Locales** | [notebooks/](./notebooks) • [data/](./data) • [Calidad_Aire_SIATA_Completo.ipynb](./Calidad_Aire_SIATA_Completo.ipynb) | Copias descargables para evaluación offline. |

---

## 🚀 Montaje en Streamlit ("strinli") y Entorno Virtual (Python)

Para cumplir con la solicitud del profesor de montar la aplicación en **Streamlit** (pronunciado coloquialmente *"strinli"*):

### Opción A: Montar en la Nube con Streamlit Cloud (Recomendado)
1. Publicar este repositorio en tu cuenta de GitHub desde Google AI Studio (Export to GitHub).
2. Entrar a [share.streamlit.io](https://share.streamlit.io/) e iniciar sesión con tu cuenta de GitHub.
3. Hacer clic en **"New app"**.
4. Seleccionar el repositorio (`d9566585-cloud/...`), rama `main`, y en *Main file path* escribir `app.py` (o `streamlit_app.py`).
5. ¡Listo! Streamlit creará automáticamente el contenedor/entorno virtual, instalará `requirements.txt` y desplegará la app con mapa interactivo, gráficos Seaborn y modelo prescriptivo.

### Opción B: Ejecución Local en Entorno Virtual (`venv`)
En la terminal de tu equipo (Windows, Mac o Linux):

```bash
# 1. Crear el entorno virtual
python -m venv venv

# 2. Activar el entorno virtual
# En Windows:
venv\Scripts\activate
# En Mac/Linux:
source venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar la aplicación en Streamlit
streamlit run app.py
```
*(También puedes hacer doble clic en `setup_venv.bat` en Windows o ejecutar `./setup_venv.sh` en Linux/Mac).*

---

## 🗂️ Estructura del Repositorio (Organización por Carpetas)

```text
├── Calidad_Aire_SIATA_Completo.ipynb   # Cuaderno oficial de Colab entregable en la raíz
├── app.py                              # Aplicación interactiva de Streamlit ("strinli")
├── streamlit_app.py                    # Punto de entrada para Streamlit Community Cloud
├── requirements.txt                    # Dependencias Python para entorno virtual y Streamlit
├── setup_venv.sh / setup_venv.bat      # Scripts de 1-clic para crear y activar el venv
│
├── public/assets/aistudio              # Recursos estáticos de AI Studio
├── src/                                # Código fuente de la Aplicación Web React / TypeScript
├── data/                               # Dataset oficial SIATA (Datos_SIATA_Aire_AQ_pm25_Last.json)
├── notebooks/                          # Copias y scripts Python de los cuadernos
├── docs/                               # Documentación de soporte y rúbrica
├── server.ts                           # Servidor Express y Mirror Proxy para bypass de firewall
├── index.html                          # Entry point HTML de la aplicación web
├── metadata.json                       # Metadatos del proyecto
├── package.json                        # Dependencias de Node.js
└── README.md                           # Documentación general del repositorio
```

---

## ✅ Cumplimiento de los 9 Requisitos de la Actividad

| # | Requisito de la Guía | Estado | Evidencia en el Repositorio |
|---|---|:---:|---|
| **1** | Revisar los dos notebooks suministrados y comprender el flujo de adquisición, transformación y visualización. | **100%** | [`notebooks/Calidad_Aire_Map_Est.ipynb`](notebooks/Calidad_Aire_Map_Est.ipynb) y [`notebooks/Calidad_Aire_Est.ipynb`](notebooks/Calidad_Aire_Est.ipynb) |
| **2** | Agregar/configurar la clave API en el lugar indicado en el notebook. | **100%** | Celda 2 en ambos notebooks: variable `API_KEY = "demo"` configurada para servicios WAQI/AQICN. |
| **3** | Consumir la API del SIATA y verificar la recepción de datos. | **100%** | Celda 3 en ambos notebooks: Petición HTTP a `Datos_SIATA_Aire_AQ_pm25_Last.json` (525 registros verificados). |
| **4** | Explorar los datos: variables, tipos, valores faltantes, rangos y posibles inconsistencias. | **100%** | Celda 4: Análisis `dtypes`, `isna()`, aislamiento del centinela `-9999` (33% del dataset) y estadísticas descriptivas. |
| **5** | Crear una réplica funcional del flujo mostrado en los notebooks. | **100%** | Cuadernos reproducibles en Jupyter/Colab y visor interactivo en la app web. |
| **6** | Desarrollar una aplicación que consuma los datos del SIATA y permita consultar la información del ICA. | **100%** | Tablero web reactivo con cálculo dinámico del ICA según Resolución 2254/2017. |
| **7** | Incorporar el componente de mapeo para visualizar los datos según su ubicación. | **100%** | Mapa interactivo con Folium/Leaflet, 16 estaciones georreferenciadas, círculos de 1 km y capa de mosaicos EPA. |
| **8** | Incorporar interacción en la aplicación (filtros, consulta o visualización). | **100%** | Buscador en tiempo real, filtro por municipio, filtro por riesgo y simulador de escenarios (*Inversión Térmica* y *Lluvia*). |
| **9** | Construir una landing page que plantee una situación real de toma de decisiones. | **100%** | Landing Page "Escudo Escolar y Deportivo" para Secretaría de Educación e INDER con protocolos POECA. |

*Para ver el desglose técnico y matemático completo de cada punto, consulta [`docs/Rubrica_9_Puntos.md`](docs/Rubrica_9_Puntos.md).*

---

## 🚀 Cómo Ejecutar los Cuadernos

### Opción A: En Google Colab (Recomendado - 1 Clic)
1. Haz clic en las insignias de Colab en la parte superior o abre los siguientes enlaces:
   - [Abrir Proyecto 1 (Mapa Folium) en Colab](https://colab.research.google.com/drive/1oAQ0q6m9h_o8opL2HQ_ojERT1HOmI3UG)
   - [Abrir Proyecto 2 (Análisis Prescriptivo) en Colab](https://colab.research.google.com/drive/14ulbhGZ5AlQ3C4-LPnHJIsWomQ7ZQlnh)
2. Ejecuta las celdas en orden (`Shift + Enter`).
   > *Nota de Conectividad:* Los notebooks incorporan una **estrategia de 3 capas** (Archivo local → Conexión directa → Mirror Proxy) para garantizar que los datos carguen aun si el firewall del SIATA bloquea la IP de la máquina virtual de Google.

### Opción B: En Local con Jupyter Lab o VS Code
```bash
# 1. Clonar el repositorio
git clone <URL_DE_TU_REPOSITORIO>
cd <CARPETA_DEL_REPOSITORIO>

# 2. Instalar librerías de Python requeridas
pip install requests pandas folium matplotlib seaborn

# 3. Abrir Jupyter Notebook
jupyter notebook notebooks/
```

---

## 🌐 Cómo Ejecutar la Aplicación Web en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo (Express + Vite)
npm run dev
```
La aplicación quedará disponible en `http://localhost:3000`.

---

## 🏛️ Contexto y Planteamiento de la Situación Real

El **Área Metropolitana del Valle de Aburrá** presenta una topografía cerrada en forma de cañón que favorece episodios de **inversión térmica matutina** en los meses de transición seca-lluviosa (febrero-marzo y octubre-noviembre). 

Este proyecto articula la telemetría oficial del **SIATA** con el protocolo de alertas **POECA** para proporcionar a directores de colegios e instructores deportivos del **INDER**:
1. Semáforo de riesgo respiratorio en tiempo real en un radio de 1 km alrededor de cada institución.
2. Directrices prescriptivas automáticas (suspensión de actividad física intensa al aire libre en niveles Naranja/Rojo).
3. Simulación de escenarios de contingencia para entrenar la respuesta institucional preventiva.

---

## 🎓 Plantilla de Entrega Oficial para el Docente

Para entregar esta actividad en la plataforma de la universidad (Moodle, Teams o correo), puedes copiar y pegar este texto:

```text
Estimado Profesor,

Comparto los enlaces y entregables correspondientes al Componente Práctico (Parcial Parte 2 - Pregunta 11): Análisis y Mapeo Geoespacial de Calidad del Aire (SIATA y WAQI):

1. Aplicación Desplegada en Streamlit ("strinli"):
   👉 https://siatagit-3jxfnsmf79nfo6u7geon3v.streamlit.app

2. Plataforma Web Interactiva:
   👉 https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app

3. Cuaderno Oficial en Google Colab:
   👉 https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing

4. Repositorio de GitHub:
   👉 https://github.com/d9566585-cloud/siata

Resumen Analítico:
- Estación con mayor criticidad: Medellín, Altavista - I.E. Pedro Octavio Amado (33.1 µg/m³, ICA 92, Moderado en el límite). Factores: Emisiones de tráfico pesado en ladera, industria ladrillera y fenómeno de inversión térmica matutina.
- Estación con aire más limpio: San Cristóbal (3.6 µg/m³, ICA 15, Calidad Buena). Factores: Alta cobertura vegetal, dispersión de vientos de ladera y baja densidad automotriz.
- Modelo Prescriptivo: Define el protocolo POECA para colegios e INDER (suspensión de educación física matutina al aire libre y traslados a áreas cubiertas).
```
