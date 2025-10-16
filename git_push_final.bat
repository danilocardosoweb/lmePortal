@echo off
git config user.email "dashboard@lme.com"
git config user.name "Dashboard LME"
git commit -m "Adicionar configuracoes de deploy e correcoes finais - Titulo dinamico, filtros otimizados, suporte Vercel/Railway"
git push origin main
pause
