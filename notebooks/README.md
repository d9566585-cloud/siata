# 📓 Cuaderno Oficial de Google Colab (Parcial Práctico Completo)

Enlace oficial del cuaderno unificado entregable:
👉 **[Abrir Cuaderno Completo en Google Colab](https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing)**

---

## 🌟 `Calidad_Aire_SIATA_Completo.ipynb` (Cuaderno Unificado)
- **Objetivo:** Integra en un solo entorno reproducible los 9 requerimientos evaluativos del parcial práctico.
- **Enlace Google Colab:** [https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing](https://colab.research.google.com/drive/1lMyqVw3qxpa4vTuOn5eoCsLS9MqBFbkn?usp=sharing)
- **Librerías principales:** `folium`, `requests`, `pandas`, `matplotlib`, `seaborn`, `json`.
- **Estructura Modular Integrada:**
  - **Parte 1 (Puntos 1-3 y 7):** Ingesta del JSON oficial del SIATA (525 registros), clave API, geoprocesamiento y mapa interactivo con **Folium** y mosaicos WAQI.
  - **Parte 2 (Puntos 4 y 5):** Exploración profunda (variables, dtypes, nulos, centinela `-9999`) y aplanamiento con `pd.json_normalize`.
  - **Parte 3 (Punto 6):** Motor normativo de cálculo del ICA según la **Resolución 2254 de 2017**.
  - **Parte 4 (Puntos 8 y 9):** Modelo prescriptivo para colegios (Secretaría de Educación) e INDER, y visualización gráfica comparativa con **Seaborn**.
  - **Parte 5 (Sustentación):** Respuestas analíticas a las preguntas de la situación problema e inversión térmica.

---

## 💡 Nota de Compatibilidad de Red (Firewall SIATA)
El cuaderno incluye una **arquitectura de 3 capas** en su celda de adquisición:
1. **Capa 1:** Lee automáticamente el archivo local `Datos_SIATA_Aire_AQ_pm25_Last.json` si se arrastra a la pestaña de Archivos de Colab.
2. **Capa 2:** Si no existe archivo local, intenta conectar directamente al servidor oficial del SIATA con cabeceras de navegador.
3. **Capa 3:** Si la IP de Google Colab es filtrada por el firewall del SIATA, conmuta de inmediato al **Mirror Proxy oficial**:
   `https://ais-pre-2hgt6jukoxznk6wemranho-285158718320.us-east1.run.app/api/siata/pm25_last`
