# Nova Aba: Dados do Período

## Data: 16/10/2025 20:17

### Funcionalidade Implementada

Adicionada nova aba "Dados do Período" com tabela detalhada mostrando:
- Dados diários do metal selecionado
- Médias semanais
- Médias mensais
- Cálculo de Preço por Tonelada (LME USD$ × Dólar)

### 1. Botão de Alternância

**Localização:** Lado direito da barra de filtros de metais

**Comportamento:**
- Texto inicial: "📊 Dados do Período"
- Ao clicar: Alterna para aba de dados e muda para "📈 Voltar aos Gráficos"
- Ao clicar novamente: Volta para aba principal

### 2. Estrutura da Tabela

#### Colunas:
1. **Data** - Data no formato DD/MM/AAAA
2. **SEG** - Dia da semana (SEG, TER, QUA, etc.)
3. **Dólar** - Cotação do dólar do dia
4. **LME USD$** - Valor do metal selecionado em USD
5. **Preço Ton.** - Preço por tonelada (LME × Dólar)

#### Grupo: Média Semanal
6. **Dólar** - Média semanal do dólar
7. **LME USD$** - Média semanal do metal
8. **Preço Ton.** - Preço médio semanal

#### Grupo: Média Mês
9. **Dólar** - Média mensal do dólar
10. **LME USD$** - Média mensal do metal
11. **Preço Ton.** - Preço médio mensal

### 3. Características Visuais

**Tema Escuro (similar à imagem fornecida):**
- Fundo: Tons de azul escuro (#2c3e50, #34495e)
- Texto: Branco/cinza claro (#ecf0f1)
- Headers: Azul mais escuro (#1a252f)
- Hover: Destaque em azul (#3d5a73)

**Formatação:**
- Números no padrão brasileiro (1.000,50)
- Dólar com 4 casas decimais
- LME e Preços com 2 casas decimais
- Linhas alternadas para melhor leitura

### 4. Cálculos Realizados

#### Preço por Tonelada:
```javascript
precoTon = valorLME × valorDolar
```

#### Médias Semanais:
- Busca da API: `/api/dados-semanais/<mes>/<ano>`
- Calcula preço médio: `mediaSemanalLME × mediaSemanDolar`

#### Médias Mensais:
- Busca da API: `/api/dados-mensais`
- Calcula preço médio: `mediaMensalLME × mediaMensalDolar`

### 5. Integração com Filtros

**Metal Selecionado:**
- A tabela mostra dados do metal atualmente selecionado nos chips
- Ao trocar o metal e voltar para a aba de período, os dados são atualizados

**Exemplo:**
1. Selecione "ZINCO" nos filtros
2. Clique em "📊 Dados do Período"
3. Tabela mostra dados de Zinco com médias semanais e mensais

### 6. Arquivos Modificados

#### `web_dashboard/templates/index.html`
- Adicionados estilos CSS para:
  - `.tab-button` - Botão de alternância
  - `.tab-content` - Container das abas
  - `.periodo-table` - Tabela com tema escuro
- Estrutura HTML:
  - Aba principal (`#tabPrincipal`) com gráficos e indicadores
  - Aba período (`#tabPeriodo`) com tabela de dados
  - Função `toggleTab()` para alternar entre abas

#### `web_dashboard/static/app.js`
- Nova função `carregarDadosPeriodo()`:
  - Busca dados diários, semanais e mensais
  - Calcula preços por tonelada
  - Formata e preenche a tabela
  - Ordena por data decrescente (mais recente primeiro)

### 7. Exemplo de Dados Exibidos

```
Data         SEG   Dólar   LME USD$  Preço Ton.  | Média Semanal          | Média Mês
                                                  | Dólar  LME    Preço    | Dólar  LME    Preço
15/10/2025   TER   5,4500  10.702,00  58.345,90  | 5,4625 10.603 57.923   | 5,3827 10.636 57.251
14/10/2025   SEG   5,5000  10.600,00  58.300,00  | 5,4625 10.603 57.923   | 5,3827 10.636 57.251
```

### 8. Responsividade

- Tabela com scroll horizontal em telas pequenas
- Mantém formatação e legibilidade
- Cores ajustadas para tema escuro

### 9. Performance

- Dados carregados apenas ao abrir a aba
- Cache dos dados já buscados
- Cálculos realizados no frontend (rápido)

### 10. Melhorias Futuras (Opcional)

- [ ] Exportar tabela para Excel/CSV
- [ ] Filtro de período específico
- [ ] Gráfico de preço por tonelada
- [ ] Comparação entre metais
- [ ] Destaque de máximas e mínimas
