@echo off
echo Setting up Python Virtual Environment...
python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
playwright install chromium
echo Python Virtual Environment ready.
