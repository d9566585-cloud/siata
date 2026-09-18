#!/bin/bash
# Script para crear y activar el entorno virtual de Python para Streamlit
echo "========================================================"
echo "Configurando Entorno Virtual para Streamlit (SIATA Air)"
echo "========================================================"

# 1. Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "-> Creando entorno virtual 'venv'..."
    python3 -m venv venv
fi

# 2. Activar entorno virtual
echo "-> Activando entorno virtual..."
source venv/bin/activate

# 3. Instalar dependencias
echo "-> Instalando librerías requeridas desde requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

# 4. Iniciar Streamlit
echo "-> Iniciando aplicación en Streamlit..."
streamlit run app.py
