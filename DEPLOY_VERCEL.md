# Deploy no Vercel - Dashboard LME

## ⚠️ Problema Identificado

O erro `404 NOT_FOUND` ocorre porque:
1. Vercel é otimizada para aplicações serverless
2. Flask precisa de configuração especial para rodar no Vercel
3. Arquivos de configuração necessários estavam faltando

## ✅ Solução Implementada

### Arquivos Criados

#### 1. `vercel.json` (Raiz do projeto)
Configuração principal do Vercel:
- Define builds para Python e arquivos estáticos
- Configura rotas para API e assets

#### 2. `api/index.py`
Handler serverless que importa a aplicação Flask:
- Adiciona web_dashboard ao path
- Exporta app para Vercel

#### 3. `requirements_vercel.txt`
Dependências Python para o Vercel

## 🚀 Como Fazer Deploy

### Opção 1: Via Vercel CLI (Recomendado)

1. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login no Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd c:/Users/pcp/Desktop/framework-lme-master
vercel
```

4. **Seguir prompts:**
- Set up and deploy? **Y**
- Which scope? **Selecione sua conta**
- Link to existing project? **N**
- Project name? **lme-dashboard** (ou outro nome)
- In which directory is your code located? **./**
- Want to override settings? **N**

5. **Deploy para produção:**
```bash
vercel --prod
```

### Opção 2: Via GitHub + Vercel Dashboard

1. **Commit e push para GitHub:**
```bash
git add .
git commit -m "Adicionar configuração Vercel"
git push origin main
```

2. **No Vercel Dashboard:**
- Acesse https://vercel.com
- Clique em "Add New Project"
- Importe o repositório do GitHub
- Configure:
  - **Framework Preset:** Other
  - **Root Directory:** ./
  - **Build Command:** (deixe vazio)
  - **Output Directory:** (deixe vazio)

3. **Deploy automático:**
- Vercel detectará `vercel.json` automaticamente
- Deploy será iniciado

## 📋 Estrutura de Arquivos Necessária

```
framework-lme-master/
├── api/
│   └── index.py              # Handler serverless
├── web_dashboard/
│   ├── app.py               # Aplicação Flask
│   ├── static/
│   │   └── app.js
│   ├── templates/
│   │   └── index.html
│   └── requirements.txt
├── vercel.json              # Configuração Vercel
└── requirements_vercel.txt  # Dependências para Vercel
```

## ⚙️ Configurações Importantes

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.py"
    }
  ]
}
```

### api/index.py
```python
import sys
import os

# Adicionar web_dashboard ao path
current_dir = os.path.dirname(os.path.abspath(__file__))
web_dashboard_dir = os.path.join(current_dir, '..', 'web_dashboard')
sys.path.insert(0, web_dashboard_dir)

from app import app
```

## 🔧 Troubleshooting

### Erro: Module not found
**Solução:** Verificar se `requirements_vercel.txt` tem todas as dependências

### Erro: Template not found
**Solução:** Verificar paths no `vercel.json` para templates

### Erro: Static files 404
**Solução:** Adicionar rota específica para `/static/` no `vercel.json`

### Erro: CORS
**Solução:** Já configurado com `flask-cors` no app.py

## 📊 Variáveis de Ambiente (Se necessário)

No Vercel Dashboard:
1. Vá em **Settings** > **Environment Variables**
2. Adicione variáveis se necessário:
   - `FLASK_ENV=production`
   - `API_KEY=...` (se usar)

## ✅ Checklist Pré-Deploy

- [x] `vercel.json` criado na raiz
- [x] `api/index.py` criado
- [x] `requirements_vercel.txt` criado
- [x] Código commitado no Git
- [x] Repositório no GitHub
- [ ] Vercel CLI instalado (se usar Opção 1)
- [ ] Conta Vercel criada

## 🌐 Após Deploy

### URLs Geradas
Vercel fornecerá:
- **Preview URL:** `https://lme-dashboard-xxx.vercel.app`
- **Production URL:** `https://lme-dashboard.vercel.app`

### Testar
1. Acessar URL fornecida
2. Verificar se dashboard carrega
3. Testar filtros de metais
4. Verificar gráficos
5. Testar aba "Dados do Período"

## 🔄 Deploys Futuros

### Automático (GitHub)
- Cada push para `main` = deploy automático

### Manual (CLI)
```bash
vercel --prod
```

## 📝 Notas Importantes

### Limitações Vercel (Plano Free)
- **Tempo de execução:** 10 segundos por request
- **Memória:** 1024 MB
- **Tamanho do deploy:** 100 MB

### Otimizações Aplicadas
- ✅ Sistema de cache no frontend
- ✅ Requisições otimizadas
- ✅ Arquivos estáticos servidos diretamente

## 🆘 Suporte

Se continuar com erro 404:

1. **Verificar logs:**
```bash
vercel logs [deployment-url]
```

2. **Verificar build:**
- Acessar Vercel Dashboard
- Ver logs de build
- Identificar erros

3. **Testar localmente:**
```bash
vercel dev
```

## 🎯 Alternativas ao Vercel

Se Vercel não funcionar bem:

### 1. **Heroku** (Recomendado para Flask)
- Melhor suporte para Python
- Mais simples para Flask
- Plano free disponível

### 2. **Railway**
- Excelente para Python
- Deploy simples
- Plano free generoso

### 3. **Render**
- Bom suporte Flask
- Deploy automático GitHub
- Plano free disponível

### 4. **PythonAnywhere**
- Especializado em Python
- Configuração simples
- Plano free disponível

## 📚 Recursos

- [Vercel Python Docs](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [Flask on Vercel](https://vercel.com/guides/using-flask-with-vercel)
- [Vercel CLI Docs](https://vercel.com/docs/cli)

---

**Criado em:** 16/10/2025 20:36
**Status:** Pronto para deploy
