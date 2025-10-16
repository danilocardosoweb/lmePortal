# 📊 Dashboard LME - London Metal Exchange

Dashboard web interativo e completo para visualização de cotações de metais da London Metal Exchange (LME) com dados reais obtidos via API.

![Dashboard LME](https://img.shields.io/badge/Status-Produção-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-orange)

## 🌟 Funcionalidades Principais

### 📈 Visualizações Interativas
- **Gráficos de Evolução Diária** - Visualização detalhada dos últimos 2 meses
- **Gráficos de Médias Semanais** - Tendências semanais por metal
- **Gráficos de Médias Mensais** - Histórico dos últimos 12 meses
- **Indicadores de Variação** - Diária, Semanal e Mensal com percentuais

### 🔍 Filtros e Navegação
- **Filtros por Metal** - COBRE, ZINCO, ALUMÍNIO, CHUMBO, ESTANHO, NÍQUEL, DÓLAR
- **Troca Instantânea** - Sistema de cache para performance otimizada
- **Duas Abas de Visualização**:
  - Aba Principal: Gráficos e Indicadores
  - Aba Dados do Período: Tabela detalhada com médias

### 📊 Tabelas Completas
- **Tabela de Informações Diárias** - Todos os metais com médias semanais
- **Tabela de Dados do Período** - Análise detalhada com médias semanais e mensais
- **Integração com PTAX** - Cotação oficial do Banco Central

## 🚀 Tecnologias Utilizadas

### Backend
- **Flask 3.0.0** - Framework web Python
- **Flask-CORS** - Suporte para CORS
- **Requests** - Requisições HTTP para APIs externas

### Frontend
- **HTML5/CSS3** - Estrutura e estilização moderna
- **JavaScript (ES6+)** - Lógica da aplicação
- **Chart.js 4.4.0** - Gráficos interativos e responsivos
- **Google Fonts (Inter)** - Tipografia profissional

### APIs Integradas
- **LME API** - Cotações de metais (https://lme.gorilaxpress.com)
- **PTAX API** - Cotação oficial do dólar (Banco Central do Brasil)

## 📦 Instalação

### Pré-requisitos
- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos de Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/danilocardosoweb/lmePortal.git
cd lmePortal/web_dashboard
```

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Execute o servidor:**
```bash
python app.py
```

4. **Acesse no navegador:**
```
http://localhost:5000
```

## 🎨 Características do Design

### Interface Moderna
- Gradiente roxo/azul no cabeçalho
- Cards compactos e informativos
- Gráficos de área com cores distintas por metal
- Tabelas com linhas alternadas para melhor leitura

### Responsividade
- Layout adaptável para desktop, tablet e mobile
- Gráficos responsivos que se ajustam ao tamanho da tela
- Tabelas com scroll horizontal em telas pequenas

### Formatação Brasileira
- Números: 1.000,50 (padrão BR)
- Datas: DD/MM/AAAA
- Primeiro dia da semana: Segunda-feira

## ⚡ Otimizações de Performance

### Sistema de Cache
- Cache de dados por 5 minutos
- Redução de 100% nas requisições HTTP após primeira carga
- Troca de metal instantânea (50-100ms vs 500-2000ms)

### Atualização Inteligente de Gráficos
- Não recria gráficos, apenas atualiza dados
- Sem animações desnecessárias
- Performance 10-20x mais rápida

### Comparação de Performance

| Ação | Antes | Depois | Melhoria |
|------|-------|--------|----------|
| Primeira carga | 1-2s | 1-2s | - |
| Troca de metal | 500ms-2s | 50-100ms | **20x mais rápido** |
| Requisições HTTP | 3 por troca | 0 (cache) | **100% redução** |

## 📡 Endpoints da API

### `GET /api/dados/<mes>/<ano>`
Retorna dados diários e indicadores de variação de um período (mês + mês anterior).

**Exemplo:** `/api/dados/10/2025`

**Resposta:**
```json
{
  "dados_diarios": [...],
  "indicadores_variacao": {
    "diario": {...},
    "semanal": {...},
    "mensal": {...}
  }
}
```

### `GET /api/dados-semanais/<mes>/<ano>`
Retorna médias semanais do período.

### `GET /api/dados-mensais`
Retorna médias mensais de todos os dados disponíveis.

### `GET /api/dados-completos`
Retorna todos os dados disponíveis na API.

## 📊 Estrutura do Projeto

```
web_dashboard/
├── app.py                          # Backend Flask
├── requirements.txt                # Dependências Python
├── README.md                       # Documentação
├── templates/
│   └── index.html                  # Interface principal
├── static/
│   └── app.js                      # Lógica JavaScript
└── docs/
    ├── ALTERACOES.md              # Log de alterações
    ├── CHANGELOG_*.md             # Changelogs específicos
    ├── OTIMIZACAO_PERFORMANCE.md  # Documentação de otimizações
    └── CORRECAO_FILTRO_PERIODO.md # Correções aplicadas
```

## 🎯 Funcionalidades Detalhadas

### Indicadores de Variação
Três cards mostrando:
- **Variação Diária** - Último dia vs dia anterior
- **Variação Semanal** - Última semana vs semana anterior
- **Variação Mensal** - Mês atual vs mês anterior

Cada indicador mostra:
- Valor atual e anterior
- Percentual de variação
- Seta indicativa (↑ positivo / ↓ negativo)
- Cor verde (positivo) ou vermelha (negativo)

### Tabela de Dados do Período
Colunas:
- **Data** e **Dia da Semana**
- **Dólar** - Cotação do dia
- **LME USD$** - Valor do metal em dólares
- **Preço Ton.** - Calculado (LME × Dólar)
- **Média Semanal** - Dólar, LME e Preço
- **Média Mês** - Dólar, LME e Preço

### Integração PTAX
- Busca automática da cotação oficial do Banco Central
- Exibida na tabela de informações diárias
- Atualização diária via API do BACEN

## 🔧 Configuração Avançada

### Alterar Porta do Servidor
Edite `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=8080)
```

### Personalizar Cores dos Gráficos
Edite `static/app.js`:
```javascript
const cores = {
    cobre: 'rgba(255, 99, 132, 0.8)',
    zinco: 'rgba(153, 102, 255, 0.8)',
    // ... outras cores
};
```

### Ajustar Tempo de Cache
Edite `static/app.js`:
```javascript
// Cache válido por 5 minutos (300000ms)
if (dadosCache.timestamp && (agora - dadosCache.timestamp) < 300000) {
```

## 🐛 Troubleshooting

### Erro ao conectar com a API LME
```bash
curl https://lme.gorilaxpress.com/cotacao/2cf4ff0e-8a30-48a5-8add-f4a1a63fee10/json/
```

### Porta 5000 já em uso
Altere a porta no `app.py` ou finalize o processo:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Erro de CORS
Verifique se `flask-cors` está instalado:
```bash
pip install flask-cors
```

## 📝 Changelog

### Versão 1.0.0 (16/10/2025)

#### ✨ Funcionalidades
- Dashboard completo com gráficos interativos
- Sistema de filtros por metal
- Duas abas de visualização
- Integração com PTAX do Banco Central
- Indicadores de variação (diária, semanal, mensal)
- Tabelas com médias semanais e mensais

#### ⚡ Performance
- Sistema de cache implementado
- Troca de metal 20x mais rápida
- Redução de 100% em requisições HTTP redundantes
- Atualização otimizada de gráficos

#### 🎨 Design
- Interface moderna e responsiva
- Tema claro e profissional
- Formatação brasileira de números e datas
- Gradientes e animações suaves

## 🤝 Contribuindo

Contribuições são bem-vindas! Para mudanças importantes:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 👥 Autores

- **Dashboard LME Team** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- London Metal Exchange pela API de cotações
- Banco Central do Brasil pela API PTAX
- Comunidade Flask e Chart.js

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do repositório.

---

**Desenvolvido com ❤️ para análise de metais LME**
