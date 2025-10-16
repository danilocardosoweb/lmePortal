# Alterações - Ordem da Tabela e Período de Dados

## Data: 16/10/2025 20:05

### 1. Ordem da Tabela Invertida

**Antes:** Dados do mais antigo para o mais recente
**Agora:** Dados do mais recente para o mais antigo (ordem decrescente)

#### Arquivos modificados:
- `web_dashboard/static/app.js`
  - Linha 287-290: Invertida ordenação de `a - b` para `b - a`
  - Linha 306: Invertida ordenação das semanas de `a - b` para `b - a`

### 2. Período de Dados Ampliado

**Antes:** Apenas 1 mês de dados
**Agora:** 2 meses de dados (mês selecionado + mês anterior)

#### Arquivos modificados:

**Backend (`web_dashboard/app.py`):**
- Função `processar_dados_mensal()`:
  - Adicionado parâmetro `meses_anteriores=1` (padrão)
  - Implementada lógica para incluir meses anteriores
  - Calcula data inicial subtraindo meses
  - Filtra dados entre data_inicial e fim do mês alvo

- Endpoint `/api/dados/<mes>/<ano>`:
  - Atualizado para chamar `processar_dados_mensal(dados, mes, ano, meses_anteriores=1)`
  - Busca PTAX para todo o período de 2 meses

- Endpoint `/api/dados-semanais/<mes>/<ano>`:
  - Atualizado para incluir 2 meses de dados semanais

**Frontend (`web_dashboard/templates/index.html`):**
- Título da tabela alterado de "Tabela de Informações Diárias" para "Tabela de Informações Diárias (Últimos 2 Meses)"

### 3. Comportamento Esperado

Ao selecionar **Outubro/2025**, a tabela agora mostra:
- Dados de **Setembro/2025** (mês anterior)
- Dados de **Outubro/2025** (mês selecionado)
- **Ordem:** Do mais recente (16/Out) para o mais antigo (01/Set)
- **Semanas:** Também em ordem decrescente (Semana 42, 41, 40, etc.)

### 4. Exemplo de Visualização

```
Data         | Cobre  | Zinco  | ...
16/10/2025   | 10.495 | 3.100  | ...
15/10/2025   | 10.702 | 3.151  | ...
14/10/2025   | 10.600 | 3.049  | ...
─────────────────────────────────────
Média Semana 42 | 10.599 | 3.100 | ...
─────────────────────────────────────
13/10/2025   | 10.617 | 3.119  | ...
...
─────────────────────────────────────
Média Semana 41 | 10.720 | 3.104 | ...
─────────────────────────────────────
...
01/09/2025   | 10.233 | 2.974  | ...
```

### 5. Vantagens

- ✅ **Dados mais recentes aparecem primeiro** - Mais fácil de visualizar informações atuais
- ✅ **Contexto ampliado** - 2 meses permitem melhor análise de tendências
- ✅ **Médias semanais corretas** - Incluem semanas que cruzam entre os meses
- ✅ **Indicadores precisos** - Variações semanais e mensais com mais contexto

### 6. Impacto nos Gráficos

- **Gráfico Diário**: Mostra 2 meses de evolução
- **Gráfico Semanal**: Inclui todas as semanas dos 2 meses
- **Gráfico Mensal**: Não afetado (continua mostrando últimos 12 meses)

### 7. Performance

- Busca de PTAX ampliada para 2 meses
- Cálculo de médias semanais para período maior
- Impacto mínimo no tempo de resposta (dados já estão em cache da API LME)
