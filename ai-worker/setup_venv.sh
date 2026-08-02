#!/usr/bin/env bash
set -e

echo "Setting up Python Virtual Environment..."
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
playwright install chromium
echo "Python Virtual Environment ready."
