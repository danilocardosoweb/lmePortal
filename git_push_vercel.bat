@echo off
git add .
git config user.email "dashboard@lme.com"
git config user.name "Dashboard LME"
git commit -m "Corrigir configuracao Vercel - api/index.py completo, vercel.json simplificado, requirements.txt atualizado"
git push origin main
pause
