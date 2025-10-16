import sys
import os

# Adicionar o diretório web_dashboard ao path
current_dir = os.path.dirname(os.path.abspath(__file__))
web_dashboard_dir = os.path.join(current_dir, '..', 'web_dashboard')
sys.path.insert(0, web_dashboard_dir)

# Importar a aplicação Flask
from app import app

# Exportar app para Vercel
# Vercel espera uma variável chamada 'app' ou uma função handler
