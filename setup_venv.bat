@echo off
echo ========================================================
echo Configurando Entorno Virtual para Streamlit (SIATA Air)
echo ========================================================

REM 1. Crear entorno virtual
if not exist venv (
    echo Creando entorno virtual 'venv'...
    python -m venv venv
)

REM 2. Activar entorno virtual
echo Activando entorno virtual...
call venv\Scripts\activate.bat

REM 3. Instalar dependencias
echo Instalando dependencias de requirements.txt...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM 4. Ejecutar aplicación Streamlit
echo Ejecutando aplicación con Streamlit...
streamlit run app.py
pause
