# 🚂 Deploy Alternativo - Railway (Recomendado)

## Por que Railway é melhor para este projeto?

O **Railway** é mais adequado para aplicações Flask porque:
- ✅ Suporte nativo para Python/Flask
- ✅ Não precisa de adaptações serverless
- ✅ Deploy mais simples e direto
- ✅ Logs mais claros
- ✅ Plano free generoso

## 🚀 Deploy no Railway (Mais Fácil)

### 1. Criar conta
- Acesse: https://railway.app
- Faça login com GitHub

### 2. Criar novo projeto
- Clique em "New Project"
- Selecione "Deploy from GitHub repo"
- Escolha o repositório `lmePortal`

### 3. Configurar
Railway detectará automaticamente que é Python!

**Variáveis de ambiente (opcional):**
- `PORT=5000`
- `FLASK_ENV=production`

### 4. Deploy
- Railway fará deploy automaticamente
- Aguarde alguns minutos
- URL será gerada automaticamente

## 📝 Arquivo Necessário: Procfile

Crie na raiz do projeto:

```
web: cd web_dashboard && python app.py
```

Ou modifique `app.py` para usar a porta do Railway:

```python
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
```

## ⚡ Outras Alternativas Rápidas

### Render.com
1. Conecte GitHub
2. Selecione repositório
3. Configure:
   - **Build Command:** `pip install -r web_dashboard/requirements.txt`
   - **Start Command:** `cd web_dashboard && python app.py`

### Heroku
```bash
heroku create lme-dashboard
git push heroku main
```

## 🎯 Recomendação

Para este projeto Flask, recomendo **Railway** ou **Render** em vez de Vercel.

Vercel é ótimo para Next.js/React, mas Flask funciona melhor em plataformas com suporte nativo a servidores Python.
