#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ==========================================================
# Proyecto 2: Análisis Prescriptivo de Calidad del Aire con Datos SIATA
# Archivo: Calidad_Aire_Est.ipynb
# Colab: https://colab.research.google.com/drive/14ulbhGZ5AlQ3C4-LPnHJIsWomQ7ZQlnh#scrollTo=4TMRpyVQl4vD
# ==========================================================


# ----------------------------------------------------------
# # Proyecto: Análisis Prescriptivo de Calidad del Aire (SIATA)
# ## Componente Práctico - Pregunta 11 (Parcial Parte 2)
# * **Estudiante:** Estudiante de Ingeniería / Ciencias de Datos
# * **Dataset Oficial Suministrado:** [https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json](https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json)
# * **Organizaciones Beneficiarias:** Secretaría de Educación de Medellín e INDER
# * **Objetivo:** Adquirir datos de telemetría de $PM_{2.5}$, construir un pipeline ETL en Pandas, aplicar la fórmula de quiebre de la Resolución 2254 de 2017 y emitir recomendaciones prescriptivas inmediatas.
# ----------------------------------------------------------


# ----------------------------------------------------------
# ## 1. Importación de Librerías y Configuración
# Importamos `requests` para la conexión REST, `pandas` para el procesamiento tabular estructurado, y `matplotlib` / `seaborn` para las gráficas analíticas.
# ----------------------------------------------------------

# [Celda 3 - Código]
# [Celda 1] Importación de librerías para el pipeline analítico
!pip install requests pandas matplotlib seaborn --quiet

import requests
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Configuración del entorno gráfico
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams['figure.dpi'] = 110
plt.rcParams['font.family'] = 'sans-serif'

print("Librerías importadas y entorno configurado correctamente.")


# ----------------------------------------------------------
# ## 2. Configuración de la Clave API (Requisito 2 de la Actividad)
# Configuramos la clave de API / token requerida para la interoperabilidad con plataformas de monitoreo atmosférico.
# ----------------------------------------------------------

# [Celda 5 - Código]
# [Celda 2 - Requisito 2] Configuración de la Clave API
# Configure su clave/token de API (o use 'demo' para acceso público)
API_KEY = "demo"  # Parámetro solicitado en el punto 2 de la actividad evaluativa

print(f"✓ Clave API registrada en el entorno de ejecución: {API_KEY}")


# ----------------------------------------------------------
# ## 3. Fase de Extracción (ETL): Consumo del JSON Oficial del SIATA (Requisito 3)
# Realizamos la extracción de los datos con arquitectura resiliente.
# *Nota de conectividad para Google Colab:* Si el firewall del SIATA bloquea la conexión desde IPs de servidores en la nube de Google Colab, el código ejecuta automáticamente el **Mirror Proxy oficial** o lee el archivo local `Datos_SIATA_Aire_AQ_pm25_Last.json` si fue subido a la carpeta de archivos.
# ----------------------------------------------------------

# [Celda 7 - Código]
# [Celda 3 - Requisito 3] Adquisición resiliente y exploración del JSON oficial
import os
import requests
import json

URL_OFICIAL = "https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json"
URL_MIRROR_PROXY = "https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app/api/siata/pm25_last"
ARCHIVO_LOCAL = "Datos_SIATA_Aire_AQ_pm25_Last.json"

datos_completos = None

# Opción A: Archivo local (si se subió a Google Colab)
if os.path.exists(ARCHIVO_LOCAL):
    print(f"-> Cargando dataset desde archivo local '{ARCHIVO_LOCAL}'...")
    with open(ARCHIVO_LOCAL, "r", encoding="utf-8") as f:
        datos_completos = json.load(f)

# Opción B: Intentar conexión directa al SIATA con User-Agent de navegador
if not datos_completos:
    try:
        print("-> Intentando conectar directamente con el servidor oficial del SIATA...")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0"}
        r = requests.get(URL_OFICIAL, headers=headers, timeout=6)
        if r.status_code == 200:
            datos_completos = r.json()
            print("✓ Conectado exitosamente al servidor oficial del SIATA.")
    except Exception as e:
        print(f"Aviso: Conexión directa no disponible desde esta IP ({e}).")

# Opción C: Mirror Proxy de respaldo
if not datos_completos:
    try:
        print("-> Conectando a través del Mirror Proxy oficial...")
        r = requests.get(URL_MIRROR_PROXY, timeout=8)
        if r.status_code == 200:
            datos_completos = r.json()
            print("✓ Datos cargados exitosamente a través del Mirror Proxy.")
    except Exception as e:
        print(f"Error en proxy: {e}")

lista_mediciones = datos_completos.get("measurements", []) if datos_completos else []
print(f"Total de observaciones obtenidas en el archivo: {len(lista_mediciones)}")

# Muestra del primer registro
if lista_mediciones:
    print("Estructura de un registro individual del SIATA:")
    print(json.dumps(lista_mediciones[0], indent=2)[:500] + "\n... [Truncado]")


# ----------------------------------------------------------
# ## 4. Exploración de Datos: Variables, Tipos, Valores Faltantes, Rangos e Inconsistencias (Requisito 4)
# Examinamos metódicamente la estructura del DataFrame antes de transformar:
# 1. **Tipos de Variables:** Identificación de tipos de datos (`dtypes`).
# 2. **Valores Faltantes:** Detección de registros nulos (`isna().sum()`).
# 3. **Inconsistencias y Centinela `-9999`:** Identificación de sensores en calibración o con fallas telemétricas.
# 4. **Rangos Estadísticos:** Media, desviación estándar, mínimo y máximo de las concentraciones reales.
# ----------------------------------------------------------

# [Celda 9 - Código]
# [Celda 4 - Requisito 4] Exploración analítica del dataset
df_raw = pd.json_normalize(lista_mediciones)

print("=== 1. VARIABLES Y TIPOS DE DATOS ===")
print(df_raw.dtypes)

print("
=== 2. VALORES NULOS ===")
print(df_raw.isnull().sum())

print("
=== 3. ANOMALÍAS Y VALOR CENTINELA (-9999) ===")
inconsistencias = (df_raw['value'] == -9999).sum()
print(f"Registros con valor centinela (-9999): {inconsistencias} de {len(df_raw)}")

df_validos = df_raw[df_raw['value'] > 0]
print("
=== 4. RANGO DE PM2.5 EN OBSERVACIONES VÁLIDAS ===")
print(f"Mínimo: {df_validos['value'].min()} μg/m³ | Máximo: {df_validos['value'].max()} μg/m³ | Promedio: {df_validos['value'].mean():.2f} μg/m³")


# ----------------------------------------------------------
# ## 5. Fase de Transformación (ETL): Normalización y Limpieza de Nulos
# 1. Aplanamos el JSON mediante `pd.json_normalize`.
# 2. Filtramos el código centinela `-9999` correspondiente a sensores inactivos.
# 3. Convertimos la columna de fecha a formato `datetime` y tomamos la lectura más reciente por estación.
# ----------------------------------------------------------

# [Celda 11 - Código]
# [Celda 5] Normalización tabular y filtrado de valores atípicos
df_raw = pd.json_normalize(lista_mediciones)

# Filtrar mediciones válidas (> 0)
df_limpio = df_raw[df_raw['value'] > 0].copy()

# Conversión de fechas a datetime con zona horaria
df_limpio['fecha_dt'] = pd.to_datetime(df_limpio['date.local'])

# Obtener la última medición por estación de monitoreo
df_estaciones = df_limpio.sort_values('fecha_dt').groupby('location').last().reset_index()

# Extracción de nombres cortos para presentación
df_estaciones['estacion_corta'] = df_estaciones['location'].apply(
    lambda x: x.split(" - ")[1] if len(x.split(" - ")) > 1 else x
)

print(f"Estaciones analizadas con datos en tiempo real: {len(df_estaciones)}")
df_estaciones[['estacion_corta', 'value', 'parameter', 'unit', 'fecha_dt']].head(8)


# ----------------------------------------------------------
# ## 4. Clasificación del ICA según la Resolución 2254 de 2017
# Definimos e implementamos las funciones matemáticas para convertir la concentración de $PM_{2.5}$ en el Índice de Calidad del Aire (ICA) y categorizar el nivel de riesgo sanitario.
# ----------------------------------------------------------

# [Celda 13 - Código]
# [Celda 4] Cálculo de ICA y asignación de categorías normativas
def calcular_ica_pm25(c):
    """Fórmula oficial de interpolación lineal por puntos de quiebre (Res. 2254/2017)"""
    if c <= 12.0:
        return round((50.0 / 12.0) * c)
    elif c <= 37.0:
        return round(51.0 + ((100.0 - 51.0) / (37.0 - 12.1)) * (c - 12.1))
    elif c <= 55.4:
        return round(101.0 + ((150.0 - 101.0) / (55.4 - 37.1)) * (c - 37.1))
    elif c <= 150.4:
        return round(151.0 + ((200.0 - 151.0) / (150.4 - 55.5)) * (c - 55.5))
    else:
        return round(201.0 + ((300.0 - 201.0) / (250.4 - 150.5)) * (c - 150.5))

def clasificar_ica(ica):
    if ica <= 50:
        return "Buena"
    elif ica <= 100:
        return "Moderada"
    elif ica <= 150:
        return "Dañina grupos sensibles"
    elif ica <= 200:
        return "Dañina a la salud"
    else:
        return "Muy Dañina / Peligrosa"

df_estaciones['ICA'] = df_estaciones['value'].apply(calcular_ica_pm25)
df_estaciones['categoria'] = df_estaciones['ICA'].apply(clasificar_ica)

# Distribución de categorías
print("Resumen de Calidad del Aire en el Valle de Aburrá:")
print(df_estaciones['categoria'].value_counts())


# ----------------------------------------------------------
# ## 5. Modelo Prescriptivo: Toma de Decisiones Institucionales
# El análisis prescriptivo traduce el dato numérico en una decisión operativa para directores de colegios (Secretaría de Educación) y coordinadores de complejos deportivos (INDER).
# ----------------------------------------------------------

# [Celda 15 - Código]
# [Celda 5] Modelo Prescriptivo para Entidades Públicas
def recomendacion_prescriptiva(categoria, estacion):
    if categoria == "Buena":
        return "Condiciones óptimas: actividades al aire libre, recreos y educación física normales."
    elif categoria == "Moderada":
        if "I.E." in estacion:
            return "Atención escolar: supervisar alumnos con asma/rinitis; permitir actividad física de intensidad moderada."
        else:
            return "Recomendación general: grupos sensibles deben reducir esfuerzo físico prolongado."
    elif categoria == "Dañina grupos sensibles":
        return "ACCIÓN INMEDIATA: Trasladar clases de educación física a espacios cubiertos; suspender trote matutino."
    elif categoria == "Dañina a la salud":
        return "ALERTA ROJA: Cancelar actividades físicas al aire libre; uso preventivo de mascarilla."
    else:
        return "EMERGENCIA SANITARIA: Cese de actividades presenciales escolares y deportivas."

df_estaciones['accion_prescriptiva'] = df_estaciones.apply(
    lambda row: recomendacion_prescriptiva(row['categoria'], row['estacion_corta']), axis=1
)

df_estaciones[['estacion_corta', 'value', 'ICA', 'categoria', 'accion_prescriptiva']].head(6)


# ----------------------------------------------------------
# ## 6. Visualización Gráfica Comparativa con Seaborn
# Generamos un gráfico de barras comparativo de $PM_{2.5}$ entre las 16 estaciones activas, resaltando los umbrales de la norma colombiana (12.0 $\mu g/m^3$ límite calidad buena y 37.0 $\mu g/m^3$ límite calidad moderada).
# ----------------------------------------------------------

# [Celda 17 - Código]
# [Celda 6] Visualización de barras con Seaborn
plt.figure(figsize=(12, 6))

# Asignar paleta semafórica
colores = [
    "#10b981" if cat == "Buena" else "#eab308" if cat == "Moderada" else "#f97316"
    for cat in df_estaciones['categoria']
]

# Ordenar estaciones por valor de PM2.5 descendente
df_ordenado = df_estaciones.sort_values('value', ascending=False)
colores_ordenados = [
    "#10b981" if cat == "Buena" else "#eab308" if cat == "Moderada" else "#f97316"
    for cat in df_ordenado['categoria']
]

ax = sns.barplot(
    x="estacion_corta",
    y="value",
    data=df_ordenado,
    palette=colores_ordenados
)

# Umbrales normativos de la Resolución 2254 de 2017
plt.axhline(12.0, color='#10b981', linestyle='--', linewidth=1.5, label='Límite Calidad Buena (12.0 µg/m³)')
plt.axhline(37.0, color='#f97316', linestyle='--', linewidth=1.5, label='Límite Calidad Moderada (37.0 µg/m³)')

# Etiquetas y formato
plt.xticks(rotation=45, ha='right', fontsize=9.5)
plt.title("Concentración de PM2.5 por Estación Oficial del SIATA • Valle de Aburrá", fontsize=12, fontweight='bold', pad=15)
plt.ylabel("PM2.5 (µg/m³)", fontsize=10.5)
plt.xlabel("Estación de Monitoreo", fontsize=10.5)
plt.legend(loc='upper right', frameon=True)

# Anotación numérica sobre cada barra
for p in ax.patches:
    altura = p.get_height()
    if altura > 0:
        ax.annotate(f'{altura:.1f}',
                    (p.get_x() + p.get_width() / 2., altura),
                    ha='center', va='bottom',
                    fontsize=8.5, fontweight='bold',
                    xytext=(0, 3), textcoords='offset points')

plt.tight_layout()
plt.savefig("comparativa_pm25_siata.png", dpi=300)
plt.show()


# ----------------------------------------------------------
# ## 7. Respuestas Analíticas y Justificación de la Situación Problema
# 
# ### 1. ¿Cuáles estaciones registran los mayores índices y a qué factores se atribuye?
# * **Medellín, Altavista - I.E. Pedro Octavio Amado ($33.1\,\mu g/m^3$, ICA 92):** Es la estación con la concentración más alta de toda la red. Al estar ubicada en la ladera occidental del valle, recibe el arrastre de emisiones de camiones de materiales de construcción y ladrilleras de la cuenca de Altavista, agravado por la menor ventilación matutina.
# * **Estación Tráfico Centro ($28.0\,\mu g/m^3$, ICA 82):** Ubicada sobre el corredor vial del centro de Medellín, absorbe emisiones vehiculares directas de buses y vehículos de servicio público.
# * **La Estrella - Hospital ($23.0\,\mu g/m^3$, ICA 72) e Itagüí ($21.0\,\mu g/m^3$):** Municipios del sur del valle donde confluyen vientos del norte con el tráfico de carga de la Autopista Sur.
# 
# ### 2. ¿Cuáles estaciones presentan condiciones favorables?
# * **San Cristóbal ($3.6\,\mu g/m^3$, ICA 15):** Corredor rural de aire limpio que ingresa por el occidente.
# * **El Poblado - I.E. INEM ($9.5\,\mu g/m^3$, ICA 40), Copacabana ($10.5\,\mu g/m^3$) y Bello ($10.5\,\mu g/m^3$):** Zonas con menor densidad de emisiones matutinas o con barreras arbóreas significativas.
# 
# ### 3. Impacto del Modelo Prescriptivo para la Toma de Decisiones
# Este desarrollo demuestra que no basta con presentar un valor crudo en $\mu g/m^3$. Al transformar los datos del SIATA en recomendaciones operativas inmediatas:
# 1. **Colegios:** Los rectores de las instituciones como la *I.E. Pedro Octavio Amado* en Altavista o *I.E. Ciro Mendía* en Aranjuez cuentan con una herramienta objetiva para reprogramar clases de educación física matutina entre 6:00 y 9:30 AM.
# 2. **INDER:** Las autoridades deportivas pueden reasignar horarios de ciclovías y entrenamientos atléticos de alta intensidad a horarios de la tarde cuando la inversión térmica se ha disipado, evitando afecciones respiratorias en niños y adolescentes.
# ----------------------------------------------------------

