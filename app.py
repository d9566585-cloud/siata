import os
import json
import requests
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns
import folium
from folium.plugins import MiniMap, Fullscreen

# Configuración de la página de Streamlit
st.set_page_config(
    page_title="SIATA - Calidad del Aire (Valle de Aburrá)",
    page_icon="🍃",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ---------------------------------------------------------
# 1. Configuración de API Key y Parámetros
# ---------------------------------------------------------
st.sidebar.title("🍃 SIATA - Monitoreo ICA")
st.sidebar.markdown(
    """
    **Componente Práctico - Parcial**
    * **Territorio:** Valle de Aburrá, Antioquia
    * **Dataset:** Red Oficial SIATA (`EntregaData1`)
    * **Norma:** Resolución 2254 de 2017 (MinAmbiente)
    """
)

api_key = st.sidebar.text_input("Clave API (WAQI / AQICN)", value="demo", help="Token para consumir mosaicos y servicios WAQI")
colab_url = "https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing"

st.sidebar.markdown(f"👉 **[Abrir Cuaderno Oficial en Google Colab]({colab_url})**")

# ---------------------------------------------------------
# 2. Ingesta de Datos Resiliente (3 Capas)
# ---------------------------------------------------------
URL_OFICIAL = "https://siata.gov.co/EntregaData1/Datos_SIATA_Aire_AQ_pm25_Last.json"
URL_MIRROR_PROXY = "https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app/api/siata/pm25_last"
ARCHIVOS_LOCALES = [
    "data/Datos_SIATA_Aire_AQ_pm25_Last.json",
    "Datos_SIATA_Aire_AQ_pm25_Last.json"
]

@st.cache_data(ttl=300)
def cargar_datos_siata():
    data = None
    # Capa 1: Local
    for ruta in ARCHIVOS_LOCALES:
        if os.path.exists(ruta):
            try:
                with open(ruta, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data and "measurements" in data:
                        return data, "Archivo Local"
            except Exception:
                pass
    
    # Capa 2: Conexión Directa al SIATA
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get(URL_OFICIAL, headers=headers, timeout=5)
        if r.status_code == 200:
            return r.json(), "Servidor Oficial SIATA"
    except Exception:
        pass
        
    # Capa 3: Mirror Proxy
    try:
        r = requests.get(URL_MIRROR_PROXY, timeout=8)
        if r.status_code == 200:
            return r.json(), "Mirror Proxy Resiliente"
    except Exception:
        pass
        
    return None, "Error de Conexión"

data_raw, fuente_datos = cargar_datos_siata()

if not data_raw or "measurements" not in data_raw:
    st.error("No fue posible cargar las mediciones del SIATA. Verifique la conexión a internet.")
    st.stop()

# ---------------------------------------------------------
# 3. Pipeline ETL en Pandas y Filtrado de Centinelas (-9999)
# ---------------------------------------------------------
mediciones = data_raw.get("measurements", [])
df_raw = pd.json_normalize(mediciones)

total_obs = len(df_raw)
invalidos = (df_raw["value"] <= 0).sum()
validos = (df_raw["value"] > 0).sum()

df_clean = df_raw[df_raw["value"] > 0].copy()

def limpiar_nombre(loc):
    if not loc:
        return "Estación Desconocida"
    partes = str(loc).split(" - ")
    nombre = partes[1] if len(partes) > 1 else partes[0]
    return nombre.replace("_OFF-", "").replace("_CAL-", "").strip()

df_clean["estacion_corta"] = df_clean["location"].apply(limpiar_nombre)
df_clean["latitud"] = df_clean["coordinates.latitude"]
df_clean["longitud"] = df_clean["coordinates.longitude"]
df_clean["fecha_dt"] = pd.to_datetime(df_clean["date.local"])

# Obtener última observación por estación
df_ultimas = df_clean.sort_values("fecha_dt").groupby("location").last().reset_index()

# ---------------------------------------------------------
# 4. Cálculo Normativo de ICA (Resolución 2254 de 2017)
# ---------------------------------------------------------
def calcular_ica_y_protocolo(c, estacion):
    if c <= 12.0:
        ica = round(((50 - 0) / (12.0 - 0)) * c)
        cat = "Buena"
        color = "#10b981"
        accion = "Condiciones óptimas: actividades al aire libre, recreos y educación física normales."
    elif c <= 37.0:
        ica = round(((100 - 51) / (37.0 - 12.1)) * (c - 12.1) + 51)
        cat = "Moderada"
        color = "#eab308"
        if "I.E." in estacion or "Colegio" in estacion:
            accion = "Atención escolar: supervisar alumnos con asma/rinitis; permitir actividad física de intensidad moderada."
        else:
            accion = "Recomendación general: grupos sensibles deben reducir esfuerzo físico prolongado."
    elif c <= 55.4:
        ica = round(((150 - 101) / (55.4 - 37.1)) * (c - 37.1) + 101)
        cat = "Dañina grupos sensibles"
        color = "#f97316"
        accion = "ACCIÓN INMEDIATA: Trasladar clases de educación física a espacios cubiertos; suspender trote matutino."
    elif c <= 150.4:
        ica = round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151)
        cat = "Dañina a la salud"
        color = "#ef4444"
        accion = "ALERTA ROJA: Cancelar actividades físicas al aire libre; uso preventivo de mascarilla."
    else:
        ica = 301
        cat = "Peligrosa"
        color = "#78350f"
        accion = "EMERGENCIA SANITARIA: Cese preventivo de actividades presenciales escolares y deportivas."
    return ica, cat, color, accion

analisis = [calcular_ica_y_protocolo(r["value"], r["estacion_corta"]) for _, r in df_ultimas.iterrows()]
df_ultimas["ICA"] = [a[0] for a in analisis]
df_ultimas["categoria"] = [a[1] for a in analisis]
df_ultimas["color"] = [a[2] for a in analisis]
df_ultimas["accion_prescriptiva"] = [a[3] for a in analisis]

# ---------------------------------------------------------
# 5. Encabezado y Métricas de Alto Nivel
# ---------------------------------------------------------
st.title("Sistema de Gestión de Calidad del Aire SIATA • Valle de Aburrá")
st.markdown(
    f"Fuente de datos activa: **{fuente_datos}** | Total observaciones: **{total_obs}** | "
    f"Sensores en calibración/apagados (`-9999`): **{invalidos}** | Estaciones activas: **{len(df_ultimas)}**"
)

estacion_max = df_ultimas.loc[df_ultimas["value"].idxmax()]
estacion_min = df_ultimas.loc[df_ultimas["value"].idxmin()]
prom_pm25 = df_ultimas["value"].mean()

col1, col2, col3, col4 = st.columns(4)
col1.metric("Estaciones Activas", f"{len(df_ultimas)}", "100% de la red filtrada")
col2.metric("Promedio PM2.5 Red", f"{prom_pm25:.1f} µg/m³", "Resolución 2254/2017")
col3.metric("Punto Más Crítico", f"{estacion_max['value']:.1f} µg/m³", f"{estacion_max['estacion_corta'][:22]} (ICA {estacion_max['ICA']})", delta_color="inverse")
col4.metric("Aire Más Limpio", f"{estacion_min['value']:.1f} µg/m³", f"{estacion_min['estacion_corta'][:22]} (ICA {estacion_min['ICA']})")

st.markdown("---")

# ---------------------------------------------------------
# 6. Pestañas de Visualización (Mapa, Gráfico, Acciones Prescriptivas, Datos)
# ---------------------------------------------------------
tab_mapa, tab_grafico, tab_prescriptivo, tab_datos = st.tabs([
    "🗺️ Mapa Geoespacial (Folium + WAQI)",
    "📊 Comparativa Gráfica (Seaborn)",
    "🏫 Modelo Prescriptivo (Colegios e INDER)",
    "📋 Datos Crudos & Exportación"
])

# TAB 1: MAPA FOLIUM
with tab_mapa:
    st.subheader("Mapa Interactivo con Mosaicos WAQI y Estaciones SIATA")
    st.caption("Capa continua de contaminación de WAQI con marcadores semaforizados y buffers de 1,000 metros.")
    
    centro_valle = [6.25184, -75.56359]
    mapa = folium.Map(location=centro_valle, zoom_start=12, tiles="OpenStreetMap")
    
    # Capa de teselas WAQI
    folium.TileLayer(
        tiles=f"https://tiles.aqicn.org/tiles/usepa-aqi/{{z}}/{{x}}/{{y}}.png?token={api_key}",
        attr="Air Quality Tiles © WAQI / AQICN / SIATA",
        name="Mosaico Calidad del Aire (WAQI)",
        opacity=0.55,
        overlay=True
    ).add_to(mapa)
    
    # Marcadores de estaciones SIATA
    for _, row in df_ultimas.iterrows():
        coords = [row["latitud"], row["longitud"]]
        popup_html = f"""
        <div style='font-family: sans-serif; min-width: 170px;'>
            <h4 style='margin:0 0 5px 0;'>{row['estacion_corta']}</h4>
            <p style='margin:2px 0;'><b>PM2.5:</b> {row['value']:.1f} µg/m³</p>
            <p style='margin:2px 0;'><b>ICA:</b> <span style='color:{row['color']}; font-weight:bold;'>{row['ICA']} ({row['categoria']})</span></p>
            <p style='margin:4px 0 0 0; font-size:11px; color:#666;'>Red Oficial SIATA</p>
        </div>
        """
        folium.CircleMarker(
            location=coords,
            radius=8,
            color="#ffffff",
            weight=2,
            fill=True,
            fill_color=row["color"],
            fill_opacity=0.9,
            popup=folium.Popup(popup_html, max_width=250)
        ).add_to(mapa)
        
        folium.Circle(
            location=coords,
            radius=1000,
            color=row["color"],
            weight=1,
            fill=True,
            fill_opacity=0.12
        ).add_to(mapa)
        
    folium.LayerControl().add_to(mapa)
    Fullscreen().add_to(mapa)
    
    # Renderizar mapa en Streamlit de forma 100% nativa y confiable
    mapa_html = mapa._repr_html_()
    import streamlit.components.v1 as components
    components.html(mapa_html, height=580)

# TAB 2: GRÁFICO SEABORN
with tab_grafico:
    st.subheader("Concentración de PM2.5 por Estación Oficial del SIATA")
    st.caption("Gráfico de barras ordenado descendente con umbrales de la Resolución 2254 de 2017.")
    
    df_ord = df_ultimas.sort_values("value", ascending=False).reset_index(drop=True)
    colores_ord = df_ord["color"].tolist()
    
    fig, ax = plt.subplots(figsize=(12, 6))
    sns.set_theme(style="whitegrid")
    
    sns.barplot(
        x="estacion_corta",
        y="value",
        data=df_ord,
        hue="estacion_corta",
        palette=colores_ord,
        legend=False,
        ax=ax
    )
    
    ax.axhline(12.0, color="#10b981", linestyle="--", linewidth=1.5, label="Límite Calidad Buena (12.0 µg/m³)")
    ax.axhline(37.0, color="#f97316", linestyle="--", linewidth=1.5, label="Límite Calidad Moderada (37.0 µg/m³)")
    
    ax.set_xticks(range(len(df_ord)))
    ax.set_xticklabels(df_ord["estacion_corta"], rotation=45, ha="right", fontsize=9.5)
    ax.set_title("Concentración de PM2.5 por Estación Oficial del SIATA • Valle de Aburrá", fontsize=12, fontweight="bold", pad=12)
    ax.set_ylabel("PM2.5 (µg/m³)", fontsize=10.5)
    ax.set_xlabel("Estación de Monitoreo", fontsize=10.5)
    ax.legend(loc="upper right", frameon=True)
    
    for p in ax.patches:
        h = p.get_height()
        if h > 0:
            ax.annotate(f"{h:.1f}", (p.get_x() + p.get_width() / 2., h),
                        ha="center", va="bottom", fontsize=8.5, fontweight="bold",
                        xytext=(0, 3), textcoords="offset points")
                        
    plt.tight_layout()
    st.pyplot(fig)

# TAB 3: MODELO PRESCRIPTIVO
with tab_prescriptivo:
    st.subheader("Matriz Prescriptiva de Decisiones para Rectores de Colegios e INDER")
    st.markdown(
        """
        El modelo prescriptivo traduce el dato cuantitativo de telemetría en una **decisión operativa inmediata**
        para evitar afecciones respiratorias agudas por inversión térmica matutina.
        """
    )
    
    df_prescriptivo = df_ultimas[["estacion_corta", "value", "ICA", "categoria", "accion_prescriptiva"]].sort_values("value", ascending=False)
    st.dataframe(
        df_prescriptivo,
        column_config={
            "estacion_corta": "Estación de Monitoreo",
            "value": st.column_config.NumberColumn("PM2.5 (µg/m³)", format="%.1f"),
            "ICA": "Índice ICA",
            "categoria": "Calidad del Aire",
            "accion_prescriptiva": "Acción Prescriptiva Inmediata"
        },
        hide_index=True,
        width="stretch"
    )
    
    st.markdown("---")
    st.markdown("### Respuestas Analíticas al Parcial")
    st.info(
        """
        **1. ¿Cuáles estaciones registran los mayores índices y a qué factores se atribuye?**  
        * **Medellín, Altavista - I.E. Pedro Octavio Amado (33.1 µg/m³, ICA 92):** Máxima concentración de la red. Ubicada en ladera occidental, atrapa emisiones de camiones de carga, volquetas de canteras y ladrilleras de la cuenca de Altavista bajo inversión térmica.
        * **Estación Tráfico Centro (28.0 µg/m³, ICA 82):** Corredor vial densamente congestionado con tráfico diésel.  
        * **La Estrella (23.0 µg/m³) e Itagüí (21.0 µg/m³):** Confluencia de vientos norte-sur con transporte pesado de la Autopista Sur.

        **2. ¿Cuáles presentan condiciones favorables?**  
        * **San Cristóbal (3.6 µg/m³, ICA 15):** Corredor rural oxigenado de ladera.  
        * **El Poblado - I.E. INEM (9.5 µg/m³), Copacabana (10.5 µg/m³) y Bello (10.5 µg/m³):** Zonas con mayor masa vegetal y menor retención de material particulado.
        """
    )

# TAB 4: DATOS CRUDOS
with tab_datos:
    st.subheader("Datos Procesados de Estaciones Activas")
    st.dataframe(df_ultimas[["location", "estacion_corta", "latitud", "longitud", "value", "ICA", "categoria"]], width="stretch")
    
    csv_data = df_ultimas.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Descargar Dataset Limpio (CSV)",
        data=csv_data,
        file_name="estaciones_siata_pm25_ica.csv",
        mime="text/csv"
    )
