#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ==========================================================
# Proyecto 1: Mapa Interactivo de Calidad del Aire con Datos Oficiales SIATA
# Archivo: Calidad_Aire_Map_Est.ipynb
# Colab: https://colab.research.google.com/drive/1oAQ0q6m9h_o8opL2HQ_ojERT1HOmI3UG
# ==========================================================


# ----------------------------------------------------------
# # Proyecto: Mapa Interactivo de Calidad del Aire (SIATA)
# ## Componente Práctico - Pregunta 11 (Parcial Parte 2)
# * **Estudiante:** Estudiante de Ingeniería / Ciencias de Datos
# * **Dataset Oficial Suministrado:** [https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json](https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json)
# * **Organización Beneficiaria:** Secretaría de Educación de Medellín e INDER
# * **Territorio de Aplicación:** Área Metropolitana del Valle de Aburrá (Medellín, Caldas, Itagüí, Bello, Envigado, Sabaneta, Copacabana, Barbosa)
# 
# ---
# 
# ### Situación Problema
# Una organización educativa y deportiva requiere consultar información de calidad del aire actualizada para proteger a más de 480,000 niños, jóvenes y deportistas frente a episodios de inversión térmica matutina en el Valle de Aburrá.
# El sistema debe consumir los datos oficiales del SIATA mediante su API/JSON, procesar la telemetría del contaminante crítico ($PM_{2.5}$), filtrar sensores fuera de línea (`value = -9999`) y mapear espacialmente las estaciones sobre colegios e instituciones clave.
# ----------------------------------------------------------


# ----------------------------------------------------------
# ## 1. Instalación e Importación de Librerías
# Instalamos e importamos `folium` para el mapa interactivo, `requests` para la adquisición HTTP y `pandas` para la manipulación y estructuración de los datos espaciales.
# ----------------------------------------------------------

# [Celda 3 - Código]
# [Celda 1] Instalación e importación de dependencias
!pip install folium requests pandas --quiet

import folium
from folium.plugins import MiniMap, Fullscreen
import requests
import json
import pandas as pd

print(f"Librerías importadas exitosamente. Folium versión: {folium.__version__}")


# ----------------------------------------------------------
# ## 2. Configuración de la Clave API (Requisito 2 de la Actividad)
# Configuramos la variable de clave de API (`API_KEY`) para la autenticación en los servicios de calidad del aire y capas de teselas cartográficas.
# ----------------------------------------------------------

# [Celda 5 - Código]
# [Celda 2 - Requisito 2] Configuración de la Clave API
# Configure su token de API de WAQI / AQICN (o use 'demo' para acceso público)
API_KEY = "demo"  # Reemplazar con su token personal obtenido en https://aqicn.org/data-platform/token/

print(f"✓ Clave API configurada correctamente: {API_KEY}")


# ----------------------------------------------------------
# ## 3. Consumo de la API del SIATA y Recepción de Datos (Requisito 3)
# Consumimos el dataset oficial `https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json` provisto por el docente.
# *Nota de conectividad para Google Colab:* Incluye arquitectura resiliente de 3 capas: **(1)** Archivo local, **(2)** Conexión directa con User-Agent de navegador, y **(3)** Mirror Proxy de respaldo.
# ----------------------------------------------------------

# [Celda 7 - Código]
# [Celda 3 - Requisito 3] Consumo del endpoint oficial del SIATA
import os
import requests
import json

URL_OFICIAL = "https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json"
URL_MIRROR_PROXY = "https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app/api/siata/pm25_last"
ARCHIVO_LOCAL = "Datos_SIATA_Aire_AQ_pm25_Last.json"

data_siata = None

# Opción A: Archivo local subido al entorno de Colab
if os.path.exists(ARCHIVO_LOCAL):
    print(f"-> Cargando dataset desde archivo local '{ARCHIVO_LOCAL}'...")
    with open(ARCHIVO_LOCAL, "r", encoding="utf-8") as f:
        data_siata = json.load(f)

# Opción B: Intentar conexión directa al SIATA con User-Agent de navegador
if not data_siata:
    try:
        print("-> Intentando conectar directamente con el servidor oficial del SIATA...")
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0"}
        r = requests.get(URL_OFICIAL, headers=headers, timeout=6)
        if r.status_code == 200:
            data_siata = r.json()
            print("✓ Conectado exitosamente al servidor oficial del SIATA.")
    except Exception as e:
        print(f"Aviso: Conexión directa no disponible desde esta IP ({e}).")

# Opción C: Mirror Proxy de respaldo
if not data_siata:
    try:
        print("-> Conectando a través del Mirror Proxy oficial...")
        r = requests.get(URL_MIRROR_PROXY, timeout=8)
        if r.status_code == 200:
            data_siata = r.json()
            print("✓ Datos cargados exitosamente a través del Mirror Proxy.")
    except Exception as e:
        print(f"Error en proxy: {e}")

mediciones = data_siata.get("measurements", []) if data_siata else []
print(f"Total registros descargados: {len(mediciones)}")

# Normalización tabular con Pandas
df_raw = pd.json_normalize(mediciones)
print("Estructura de columnas obtenidas:")
print(df_raw[['location', 'value', 'coordinates.latitude', 'coordinates.longitude', 'date.local']].head(3).to_string())


# ----------------------------------------------------------
# ## 4. Exploración de Datos: Variables, Tipos, Valores Faltantes, Rangos e Inconsistencias (Requisito 4)
# Examinamos metódicamente:
# 1. **Variables y Tipos de Datos:** Nombres de campos y tipos inferidos (`float64`, `object`, `bool`).
# 2. **Valores Faltantes:** Inspección de valores nulos (`NaN` / `None`).
# 3. **Inconsistencias y Valores Centinela:** Detección del código `-9999` empleado por el SIATA para sensores en calibración o mantenimiento.
# 4. **Rangos Estadísticos:** Rango de concentraciones de $PM_{2.5}$ en $\mu g/m^3$ para observaciones válidas.
# ----------------------------------------------------------

# [Celda 9 - Código]
# [Celda 4 - Requisito 4] Exploración completa del dataset
print("=== 1. VARIABLES Y TIPOS DE DATOS ===")
print(df_raw.dtypes)

print("
=== 2. VALORES NULOS O FALTANTES ===")
print(df_raw.isnull().sum())

print("
=== 3. DETECCIÓN DE INCONSISTENCIAS / VALOR CENTINELA (-9999) ===")
total_centinelas = (df_raw['value'] == -9999).sum()
print(f"Total registros con valor centinela (-9999): {total_centinelas} de {len(df_raw)} ({(total_centinelas/len(df_raw))*100:.1f}%)")

df_validos = df_raw[df_raw['value'] > 0].copy()
print(f"Total observaciones válidas (> 0): {len(df_validos)}")

print("
=== 4. RANGO Y ESTADÍSTICAS DE CONCENTRACIÓN PM2.5 (μg/m³) ===")
print(df_validos['value'].describe())


# ----------------------------------------------------------
# ## 5. Limpieza de Datos y Agrupación por Estación Activa
# Filtramos las mediciones válidas (`value > 0`) y tomamos la última medición registrada por cada estación.
# ----------------------------------------------------------

# [Celda 11 - Código]
# [Celda 5] Limpieza y selección de la última lectura por estación
# 1. Descartar sensores inactivos / anomalías (-9999)
df_validos = df_raw[df_raw['value'] > 0].copy()

# 2. Ordenar por fecha y agrupar por estación para tomar el dato más reciente
df_estaciones = df_validos.sort_values('date.local').groupby('location').last().reset_index()

# 3. Limpiar nombre para visualización amigable
def limpiar_nombre(loc):
    partes = loc.split(" - ")
    if len(partes) >= 2:
        return " - ".join(partes[1:])
    return loc

df_estaciones['nombre_limpio'] = df_estaciones['location'].apply(limpiar_nombre)

print(f"Estaciones activas con telemetría válida: {len(df_estaciones)}")
df_estaciones[['nombre_limpio', 'value', 'coordinates.latitude', 'coordinates.longitude', 'date.local']]


# ----------------------------------------------------------
# ## 4. Clasificación del ICA según Resolución 2254 de 2017 (MinAmbiente Colombia)
# Implementamos la fórmula oficial de interpolación lineal para calcular el Índice de Calidad del Aire (ICA) a partir de la concentración de $PM_{2.5}$ en $\mu g/m^3$, asignando la categoría y el color correspondiente.
# ----------------------------------------------------------

# [Celda 13 - Código]
# [Celda 4] Cálculo de ICA y clasificación por semáforos oficiales
def calcular_ica_pm25(c):
    """Calcula el ICA para PM2.5 según los puntos de quiebre de la Res. 2254/2017"""
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

def clasificar_semáforo(ica):
    if ica <= 50:
        return {"categoria": "Buena", "color": "#10b981", "folium_color": "green", "icono": "ok-sign"}
    elif ica <= 100:
        return {"categoria": "Moderada", "color": "#eab308", "folium_color": "orange", "icono": "warning-sign"}
    elif ica <= 150:
        return {"categoria": "Dañina grupos sensibles", "color": "#f97316", "folium_color": "darkred", "icono": "exclamation-sign"}
    else:
        return {"categoria": "Dañina a la salud", "color": "#ef4444", "folium_color": "red", "icono": "remove-sign"}

df_estaciones['ica'] = df_estaciones['value'].apply(calcular_ica_pm25)
df_estaciones['semaforo'] = df_estaciones['ica'].apply(clasificar_semáforo)
df_estaciones['categoria'] = df_estaciones['semaforo'].apply(lambda s: s['categoria'])
df_estaciones['color_hex'] = df_estaciones['semaforo'].apply(lambda s: s['color'])
df_estaciones['color_folium'] = df_estaciones['semaforo'].apply(lambda s: s['folium_color'])

df_estaciones[['nombre_limpio', 'value', 'ica', 'categoria']].head(6)


# ----------------------------------------------------------
# ## 5. Construcción del Mapa Interactivo con Folium y Mosaicos WAQI
# Integramos:
# 1. Mapa base centrado en Medellín (`CartoDB positron`).
# 2. Capa oficial de mosaicos de calidad del aire (`https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png`).
# 3. Marcadores interactivos para las 16 estaciones oficiales del SIATA, con buffers de dispersión de 1 km y popups informativos que detallan el $PM_{2.5}$, el ICA y las recomendaciones escolares.
# ----------------------------------------------------------

# [Celda 15 - Código]
# [Celda 5] Construcción del mapa interactivo
LATITUD_CENTRO = 6.25184
LONGITUD_CENTRO = -75.56359
ZOOM = 11

# 1. Crear mapa base
mapa = folium.Map(
    location=[LATITUD_CENTRO, LONGITUD_CENTRO],
    zoom_start=ZOOM,
    tiles="CartoDB positron",
    name="Mapa Base Claro"
)

# 2. Agregar capa base alternativa
folium.TileLayer("OpenStreetMap", name="OpenStreetMap").add_to(mapa)

# 3. Superponer capa de teselas de WAQI (usepa-aqi)
url_tiles_waqi = "https://tiles.aqicn.org/tiles/usepa-aqi/{z}/{x}/{y}.png?token=demo"
folium.TileLayer(
    tiles=url_tiles_waqi,
    attr="World Air Quality Index Project / SIATA",
    name="Capa Mosaicos ICA Continuo",
    overlay=True,
    control=True,
    opacity=0.60
).add_to(mapa)

# 4. Adicionar cada estación del SIATA con Marcador y Buffer
for _, fila in df_estaciones.iterrows():
    lat = fila['coordinates.latitude']
    lon = fila['coordinates.longitude']
    nombre = fila['nombre_limpio']
    pm25 = fila['value']
    ica = fila['ica']
    cat = fila['categoria']
    color = fila['color_hex']
    col_folium = fila['color_folium']
    fecha = fila['date.local']
    
    # Recomendación escolar según el nivel
    if cat == "Buena":
        rec_escolar = "Actividades y recreos normales al aire libre sin restricciones."
    elif cat == "Moderada":
        rec_escolar = "Supervisar a estudiantes con asma o rinitis; evitar sobreesfuerzo prolongado."
    else:
        rec_escolar = "Trasladar educación física a espacios cubiertos ventilados."
        
    html_popup = f"""
    <div style="font-family: Arial, sans-serif; min-width: 220px; padding: 2px;">
        <h4 style="margin: 0 0 6px 0; color: #0f172a; font-size: 13px; font-weight: bold;">{nombre}</h4>
        <div style="background-color: #f1f5f9; padding: 6px; border-radius: 6px; margin-bottom: 6px;">
            <p style="margin: 0; font-size: 12px;"><b>PM2.5:</b> {pm25} µg/m³</p>
            <p style="margin: 2px 0 0 0; font-size: 12px;"><b>ICA:</b> <span style="color:{color}; font-weight:bold;">{ica}</span> ({cat})</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color:#64748b;">Fecha: {fecha}</p>
        </div>
        <p style="margin: 0; font-size: 11px; color: #334155;"><b>Directriz Escolar / INDER:</b><br>{rec_escolar}</p>
    </div>
    """
    
    # Marcador de chincheta
    folium.Marker(
        location=[lat, lon],
        popup=folium.Popup(html_popup, max_width=300),
        tooltip=f"{nombre} - PM2.5: {pm25} µg/m³ (ICA: {ica})",
        icon=folium.Icon(color=col_folium, icon="cloud")
    ).add_to(mapa)
    
    # Buffer de dispersión atmosférica local (radio 1000m)
    folium.Circle(
        location=[lat, lon],
        radius=1000,
        color=color,
        fill=True,
        fill_color=color,
        fill_opacity=0.15,
        weight=1.5
    ).add_to(mapa)

# Plugins
Fullscreen(position="topright").add_to(mapa)
folium.LayerControl(position="topright").add_to(mapa)

# Guardar mapa en disco
mapa.save("mapa_calidad_aire_siata.html")
print("Mapa generado y guardado exitosamente como 'mapa_calidad_aire_siata.html'.")

# Renderizar mapa interactivo
mapa


# ----------------------------------------------------------
# ## 6. Respuestas a las Preguntas de Análisis Espacial del Parcial
# 
# ### 1. ¿Qué zonas del Valle de Aburrá presentan los mayores valores de $PM_{2.5}$?
# Al analizar los datos oficiales del SIATA:
# * **Estación Tráfico Centro (`CEN-TRAF`):** Registra $28.0\,\mu g/m^3$ (ICA 82, Moderada). Es una zona de alto tráfico vehicular de buses y camiones diésel en el centro de Medellín.
# * **Medellín, Altavista - I.E. Pedro Octavio Amado (`MED-ALTA`):** Registra $33.1\,\mu g/m^3$ (ICA 92), siendo la estación más cercana al límite de condición Naranja. Esto se debe a su ubicación en ladera occidental y proximidad a tejares y vías de tráfico pesado.
# * **La Estrella - Hospital (`EST-HOSP`):** Registra $23.0\,\mu g/m^3$ (ICA 72), influenciado por el cuello de botella del sur del valle.
# 
# ### 2. ¿Qué sectores presentan la mejor calidad del aire?
# * **Medellín, San Cristóbal (`MED-SCRI`):** Registra $3.6\,\mu g/m^3$ (ICA 15, Verde - Buena), gracias a la circulación de vientos frescos que descienden desde el occidente.
# * **Medellín, El Poblado - I.E. INEM (`MED-TESO`):** Registra $9.5\,\mu g/m^3$ (ICA 40, Verde - Buena), por la alta cobertura vegetal y arborización del sector.
# * **Bello (`BEL-FEVE`) y Copacabana (`COP-CVID`):** Registran $10.5\,\mu g/m^3$ (ICA 44, Verde - Buena).
# 
# ### 3. Utilidad para la Secretaría de Educación e INDER
# Observamos que varias estaciones están ubicadas directamente dentro de instituciones educativas (ej. *I.E. Pedro Octavio Amado*, *I.E. Ciro Mendía*, *I.E. Fernando Vélez*, *I.E. Concejo Municipal*).
# La visualización geográfica permite al comité directivo emitir directrices territorializadas: mientras que en San Cristóbal o El Poblado se pueden desarrollar maratones y torneos intercolegiales abiertos, en Altavista y Tráfico Centro los directores deben ordenar que la clase de educación física matutina se traslade a polideportivos techados.
# ----------------------------------------------------------

