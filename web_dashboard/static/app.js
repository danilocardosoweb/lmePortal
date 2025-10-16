// Variáveis globais para os gráficos
let chartDiario = null;
let chartSemanal = null;
let chartMensal = null;
let selectedMetal = 'cobre';

// Cache de dados para evitar requisições repetidas
let dadosCache = {
    diarios: null,
    semanais: null,
    mensais: null,
    indicadores: null,
    timestamp: null
};

// Configuração de cores
const cores = {
    cobre: 'rgba(255, 99, 132, 0.8)',
    cobreBorda: 'rgba(255, 99, 132, 1)',
    cobreArea: 'rgba(255, 99, 132, 0.2)',
    zinco: 'rgba(153, 102, 255, 0.8)',
    aluminio: 'rgba(54, 162, 235, 0.8)',
    chumbo: 'rgba(75, 192, 192, 0.8)',
    estanho: 'rgba(255, 206, 86, 0.8)',
    niquel: 'rgba(255, 159, 64, 0.8)',
    dolar: 'rgba(34, 197, 94, 0.8)'
};

// Função para formatar números no padrão brasileiro
function formatarNumero(numero, casasDecimais = 2) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: casasDecimais,
        maximumFractionDigits: casasDecimais
    }).format(numero);
}

// Converte 'YYYY-MM-DD' -> 'DD/MM/YYYY'
function formatarData(iso) {
    try {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    } catch (e) {
        return iso;
    }
}

// Indicadores de variação (Diária, Semanal, Mensal) para o metal selecionado
function criarIndicadores(indicadores_variacao) {
    const container = document.getElementById('indicadores');
    container.innerHTML = '';

    const metal = selectedMetal;
    const unidade = metal === 'dolar' ? 'R$' : 'US$/t';
    const cor = {
        cobre: '#ef4444', zinco: '#8b5cf6', aluminio: '#3b82f6', chumbo: '#64748b', estanho: '#eab308', niquel: '#2563eb', dolar: '#10b981'
    }[metal] || '#ef4444';

    const blocos = [
        { chave: 'diario', titulo: `Variação Diária de ${metal.toUpperCase()}` },
        { chave: 'semanal', titulo: `Variação Semanal de ${metal.toUpperCase()}` },
        { chave: 'mensal', titulo: `Variação Mensal de ${metal.toUpperCase()}` }
    ];

    blocos.forEach(b => {
        const info = indicadores_variacao[b.chave] && indicadores_variacao[b.chave][metal];
        if (!info) return;

        const isPositivo = info.variacao >= 0;
        const arrow = isPositivo ? '↑' : '↓';
        const changeClass = isPositivo ? 'positive' : 'negative';

        let topoEsquerda = '', topoDireita = '';
        if (b.chave === 'diario') {
            topoEsquerda = `Em ${formatarData(info.data_atual)}<br><strong>${formatarNumero(info.valor_atual)}</strong>`;
            topoDireita = `Em ${formatarData(info.data_anterior)}<br><strong>${formatarNumero(info.valor_anterior)}</strong>`;
        } else if (b.chave === 'semanal') {
            topoEsquerda = `Semana ${info.semana_atual}<br><strong>${formatarNumero(info.valor_atual)}</strong>`;
            topoDireita = `Semana ${info.semana_anterior}<br><strong>${formatarNumero(info.valor_anterior)}</strong>`;
        } else if (b.chave === 'mensal') {
            topoEsquerda = `Em ${info.mes_atual}<br><strong>${formatarNumero(info.valor_atual)}</strong>`;
            topoDireita = `Em ${info.mes_anterior}<br><strong>${formatarNumero(info.valor_anterior)}</strong>`;
        }

        const card = document.createElement('div');
        card.className = 'indicator-card';
        card.style.padding = '0';

        card.innerHTML = `
            <div style="background:${cor};color:#fff;padding:8px 12px;border-top-left-radius:10px;border-top-right-radius:10px;font-weight:700;font-size:.9rem">${b.titulo}</div>
            <div style="display:flex;justify-content:space-between;gap:10px;background:#f7ebe6;padding:8px 12px;border-bottom-left-radius:10px;border-bottom-right-radius:10px">
                <div style="font-size:.8rem;line-height:1.2">${topoEsquerda}</div>
                <div style="font-size:.8rem;line-height:1.2;text-align:right">${topoDireita}</div>
            </div>
            <div style="padding:10px 12px;text-align:center">
                <span class="indicator-change ${changeClass}" style="font-size:1rem"><span class="arrow">${arrow}</span> ${Math.abs(info.variacao).toFixed(2)} %</span>
            </div>
        `;

        container.appendChild(card);
    });
}

// Função para criar gráfico de área
function criarGraficoArea(ctx, labels, dados, titulo, cor, unidade = 'US$/t') {
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: dados,
                backgroundColor: cor.replace('0.8', '0.2'),
                borderColor: cor,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: cor,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${titulo}: ${formatarNumero(context.parsed.y)} ${unidade}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatarNumero(value, 0);
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Função para buscar dados da API (com cache)
async function buscarDados(mes, ano) {
    // Verificar se já tem cache válido (menos de 5 minutos)
    const agora = Date.now();
    if (dadosCache.timestamp && (agora - dadosCache.timestamp) < 300000) {
        return dadosCache;
    }

    try {
        const [responseDados, responseSemanais, responseMensais] = await Promise.all([
            fetch(`/api/dados/${mes}/${ano}`),
            fetch(`/api/dados-semanais/${mes}/${ano}`),
            fetch(`/api/dados-mensais`)
        ]);

        const dataDados = await responseDados.json();
        const dataSemanais = await responseSemanais.json();
        const dataMensais = await responseMensais.json();

        // Atualizar cache
        dadosCache = {
            diarios: dataDados.dados_diarios,
            semanais: dataSemanais,
            mensais: dataMensais,
            indicadores: dataDados.indicadores_variacao,
            timestamp: agora
        };

        return dadosCache;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
    }
}

// Função para atualizar visualização (sem buscar dados novamente)
function atualizarVisualizacao() {
    if (!dadosCache.diarios) return;

    // Criar indicadores de variação
    if (dadosCache.indicadores) {
        criarIndicadores(dadosCache.indicadores);
    }

    // Preparar dados para o gráfico diário
    const labels = dadosCache.diarios.map(d => {
        const [dia, mes] = d.data_formatada.split('/');
        return `${dia}/${mes}`;
    });
    const dadosSelecionados = dadosCache.diarios.map(d => d[selectedMetal]);

    // Atualizar títulos dos gráficos
    const nomeMetalFormatado = selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1);
    document.querySelectorAll('.chart-card h3')[0].textContent = `Evolução Diária de ${nomeMetalFormatado}`;
    document.querySelectorAll('.chart-card h3')[1].textContent = `Evolução Semanal de ${nomeMetalFormatado}`;
    document.querySelectorAll('.chart-card h3')[2].textContent = `Evolução Mensal de ${nomeMetalFormatado}`;

    // Atualizar gráfico diário
    const cor = cores[selectedMetal] || cores.cobre;
    const unidade = selectedMetal === 'dolar' ? 'R$' : 'US$/t';
    
    if (chartDiario) {
        // Atualizar dados do gráfico existente (mais rápido que recriar)
        chartDiario.data.datasets[0].data = dadosSelecionados;
        chartDiario.data.datasets[0].backgroundColor = cor.replace('0.8', '0.2');
        chartDiario.data.datasets[0].borderColor = cor;
        chartDiario.options.plugins.tooltip.callbacks.label = function(context) {
            return `${selectedMetal.toUpperCase()}: ${formatarNumero(context.parsed.y)} ${unidade}`;
        };
        chartDiario.update('none'); // 'none' = sem animação, mais rápido
    } else {
        const ctx = document.getElementById('chartDiario').getContext('2d');
        chartDiario = criarGraficoArea(ctx, labels, dadosSelecionados, selectedMetal.toUpperCase(), cor, unidade);
    }

    // Atualizar gráfico semanal
    atualizarGraficoSemanal();

    // Atualizar gráfico mensal
    atualizarGraficoMensal();
}

// Função para carregar dados diários (primeira vez)
async function carregarDadosDiarios(mes, ano) {
    try {
        await buscarDados(mes, ano);
        atualizarVisualizacao();
        await preencherTabelaComMedias(dadosCache.diarios, mes, ano);
    } catch (error) {
        console.error('Erro ao carregar dados diários:', error);
        mostrarErro('Erro ao carregar dados diários');
    }
}

// Função para atualizar gráfico semanal (usando cache)
function atualizarGraficoSemanal() {
    if (!dadosCache.semanais || dadosCache.semanais.length === 0) return;

    const labels = dadosCache.semanais.map(d => `Sem ${d.semana}`);
    const dadosSelecionados = dadosCache.semanais.map(d => d[selectedMetal]);
    const cor = cores[selectedMetal] || cores.cobre;
    const unidade = selectedMetal === 'dolar' ? 'R$' : 'US$/t';

    if (chartSemanal) {
        // Atualizar dados do gráfico existente
        chartSemanal.data.datasets[0].data = dadosSelecionados;
        chartSemanal.data.datasets[0].backgroundColor = cor.replace('0.8', '0.2');
        chartSemanal.data.datasets[0].borderColor = cor;
        chartSemanal.options.plugins.tooltip.callbacks.label = function(context) {
            return `${selectedMetal.toUpperCase()}: ${formatarNumero(context.parsed.y)} ${unidade}`;
        };
        chartSemanal.update('none');
    } else {
        const ctx = document.getElementById('chartSemanal').getContext('2d');
        chartSemanal = criarGraficoArea(ctx, labels, dadosSelecionados, `${selectedMetal.toUpperCase()} (Média Semanal)`, cor, unidade);
    }
}

// Função para carregar dados semanais (primeira vez)
async function carregarDadosSemanais(mes, ano) {
    // Dados já estão no cache, apenas atualizar visualização
    if (dadosCache.semanais) {
        atualizarGraficoSemanal();
    }
}

// Função para atualizar gráfico mensal (usando cache)
function atualizarGraficoMensal() {
    if (!dadosCache.mensais || dadosCache.mensais.length === 0) return;

    const ultimos12Meses = dadosCache.mensais.slice(-12);
    const labels = ultimos12Meses.map(d => d.mes);
    const dadosSelecionados = ultimos12Meses.map(d => d[selectedMetal]);
    const cor = cores[selectedMetal] || cores.cobre;
    const unidade = selectedMetal === 'dolar' ? 'R$' : 'US$/t';

    if (chartMensal) {
        // Atualizar dados do gráfico existente
        chartMensal.data.datasets[0].data = dadosSelecionados;
        chartMensal.data.datasets[0].backgroundColor = cor.replace('0.8', '0.2');
        chartMensal.data.datasets[0].borderColor = cor;
        chartMensal.options.plugins.tooltip.callbacks.label = function(context) {
            return `${selectedMetal.toUpperCase()}: ${formatarNumero(context.parsed.y)} ${unidade}`;
        };
        chartMensal.update('none');
    } else {
        const ctx = document.getElementById('chartMensal').getContext('2d');
        chartMensal = criarGraficoArea(ctx, labels, dadosSelecionados, `${selectedMetal.toUpperCase()} (Média Mensal)`, cor, unidade);
    }
}

// Função para carregar dados mensais (primeira vez)
async function carregarDadosMensais() {
    // Dados já estão no cache, apenas atualizar visualização
    if (dadosCache.mensais) {
        atualizarGraficoMensal();
    }
}

// Função para preencher tabela com médias semanais usando dados da API
async function preencherTabelaComMedias(dados, mes, ano) {
    const tbody = document.getElementById('tabelaBody');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Nenhum dado disponível</td></tr>';
        return;
    }

    try {
        // Buscar médias semanais da API
        const response = await fetch(`/api/dados-semanais/${mes}/${ano}`);
        const mediasSemanais = await response.json();
        
        // Criar mapa de semanas para fácil acesso
        const mapaMedias = {};
        mediasSemanais.forEach(m => {
            mapaMedias[m.semana] = m;
        });

        // Ordenar dados por data decrescente (mais recente primeiro)
        const dadosOrdenados = [...dados].sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
        });

        // Agrupar dados por semana ISO
        const semanas = {};
        dadosOrdenados.forEach(item => {
            const [ano, mes, dia] = item.data.split('-').map(Number);
            const data = new Date(ano, mes - 1, dia);
            const semana = getWeekNumber(data);
            
            if (!semanas[semana]) {
                semanas[semana] = [];
            }
            semanas[semana].push(item);
        });

        // Preencher tabela com dados e médias da API (ordem decrescente - mais recente primeiro)
        Object.keys(semanas).sort((a, b) => b - a).forEach(semana => {
            const dadosSemana = semanas[semana];
            
            // Adicionar dados da semana
            dadosSemana.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.data_formatada}</strong></td>
                    <td>${formatarNumero(item.cobre, 2)}</td>
                    <td>${formatarNumero(item.zinco, 2)}</td>
                    <td>${formatarNumero(item.aluminio, 2)}</td>
                    <td>${formatarNumero(item.chumbo, 2)}</td>
                    <td>${formatarNumero(item.estanho, 2)}</td>
                    <td>${formatarNumero(item.niquel, 2)}</td>
                    <td>${formatarNumero(item.dolar, 4)}</td>
                    <td>${item.dolar_ptax ? formatarNumero(item.dolar_ptax, 4) : '-'}</td>
                `;
                tbody.appendChild(tr);
            });

            // Adicionar média da API (se existir)
            const mediaAPI = mapaMedias[parseInt(semana)];
            if (mediaAPI) {
                const trMedia = document.createElement('tr');
                trMedia.className = 'semana-media';
                trMedia.innerHTML = `
                    <td><strong>Média Semana ${mediaAPI.semana}</strong></td>
                    <td>${formatarNumero(mediaAPI.cobre, 2)}</td>
                    <td>${formatarNumero(mediaAPI.zinco, 2)}</td>
                    <td>${formatarNumero(mediaAPI.aluminio, 2)}</td>
                    <td>${formatarNumero(mediaAPI.chumbo, 2)}</td>
                    <td>${formatarNumero(mediaAPI.estanho, 2)}</td>
                    <td>${formatarNumero(mediaAPI.niquel, 2)}</td>
                    <td>${formatarNumero(mediaAPI.dolar, 4)}</td>
                    <td>-</td>
                `;
                tbody.appendChild(trMedia);
            }
        });
    } catch (error) {
        console.error('Erro ao buscar médias semanais:', error);
        // Fallback: mostrar apenas os dados sem médias
        dadosOrdenados.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.data_formatada}</strong></td>
                <td>${formatarNumero(item.cobre, 2)}</td>
                <td>${formatarNumero(item.zinco, 2)}</td>
                <td>${formatarNumero(item.aluminio, 2)}</td>
                <td>${formatarNumero(item.chumbo, 2)}</td>
                <td>${formatarNumero(item.estanho, 2)}</td>
                <td>${formatarNumero(item.niquel, 2)}</td>
                <td>${formatarNumero(item.dolar, 4)}</td>
                <td>${item.dolar_ptax ? formatarNumero(item.dolar_ptax, 4) : '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// Função auxiliar para obter número da semana ISO (segunda-feira = dia 1)
function getWeekNumber(date) {
    // Criar cópia da data
    const d = new Date(date.getTime());
    
    // Ajustar para quinta-feira da mesma semana (ISO)
    const dayOfWeek = d.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
    const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek; // Converter domingo de 0 para 7
    
    // Quinta-feira da semana atual
    d.setDate(d.getDate() + 4 - dayNum);
    
    // Primeiro dia do ano
    const yearStart = new Date(d.getFullYear(), 0, 1);
    
    // Calcular número da semana
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    
    return weekNo;
}

// Função para mostrar erro
function mostrarErro(mensagem) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = mensagem;
    container.insertBefore(errorDiv, container.firstChild);
}

// Função para atualizar todos os dados
async function atualizarDados() {
    // Usar data atual
    const hoje = new Date();
    const mes = hoje.getMonth() + 1; // getMonth() retorna 0-11
    const ano = hoje.getFullYear();

    await Promise.all([
        carregarDadosDiarios(mes, ano),
        carregarDadosSemanais(mes, ano),
        carregarDadosMensais()
    ]);
}

// Filtros de metal
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedMetal = chip.getAttribute('data-metal');
        
        // Se já tem dados em cache, apenas atualizar visualização (instantâneo)
        if (dadosCache.diarios) {
            atualizarVisualizacao();
            
            // Se estiver na aba de período, atualizar também
            const tabPeriodo = document.getElementById('tabPeriodo');
            if (tabPeriodo && tabPeriodo.classList.contains('active')) {
                carregarDadosPeriodo();
            }
        } else {
            // Primeira vez, buscar dados
            atualizarDados();
        }
    });
});

// Função para carregar dados do período
async function carregarDadosPeriodo() {
    const tbody = document.getElementById('tabelaPeriodoBody');
    tbody.innerHTML = '<tr><td colspan="11" class="loading" style="color:#333">Carregando dados...</td></tr>';

    try {
        const hoje = new Date();
        const mes = hoje.getMonth() + 1;
        const ano = hoje.getFullYear();

        // Usar cache se disponível, senão buscar
        if (!dadosCache.diarios) {
            await buscarDados(mes, ano);
        }

        // Criar mapas para acesso rápido
        const mapaSemanais = {};
        dadosCache.semanais.forEach(s => {
            mapaSemanais[s.semana] = s;
        });

        const alvoMes = `${mes.toString().padStart(2, '0')}/${ano}`;
        const mediaMensal = dadosCache.mensais.find(m => m.mes === alvoMes);

        // Ordenar dados por data decrescente
        const dadosOrdenados = [...dadosCache.diarios].sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
        });

        tbody.innerHTML = '';

        dadosOrdenados.forEach(item => {
            // Calcular semana e dia da semana
            const [ano, mes, dia] = item.data.split('-').map(Number);
            const data = new Date(ano, mes - 1, dia);
            const semana = getWeekNumber(data);
            const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
            const diaSemana = diasSemana[data.getDay()];

            // Pegar metal selecionado
            const metalAtual = selectedMetal;
            const valorLME = item[metalAtual];
            const valorDolar = item.dolar;
            const precoTon = valorLME * valorDolar;

            // Médias semanais
            const mediaSemanal = mapaSemanais[semana];
            const mediaSemanDolar = mediaSemanal ? mediaSemanal.dolar : 0;
            const mediaSemanalLME = mediaSemanal ? mediaSemanal[metalAtual] : 0;
            const mediaSemanalPreco = mediaSemanDolar * mediaSemanalLME;

            // Médias mensais
            const mediaMensalDolar = mediaMensal ? mediaMensal.dolar : 0;
            const mediaMensalLME = mediaMensal ? mediaMensal[metalAtual] : 0;
            const mediaMensalPreco = mediaMensalDolar * mediaMensalLME;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.data_formatada}</td>
                <td><strong>${diaSemana}</strong></td>
                <td>${formatarNumero(valorDolar, 4)}</td>
                <td>${formatarNumero(valorLME, 2)}</td>
                <td>${formatarNumero(precoTon, 2)}</td>
                <td>${formatarNumero(mediaSemanDolar, 4)}</td>
                <td>${formatarNumero(mediaSemanalLME, 2)}</td>
                <td>${formatarNumero(mediaSemanalPreco, 2)}</td>
                <td>${formatarNumero(mediaMensalDolar, 4)}</td>
                <td>${formatarNumero(mediaMensalLME, 2)}</td>
                <td>${formatarNumero(mediaMensalPreco, 2)}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar dados do período:', error);
        tbody.innerHTML = '<tr><td colspan="11" style="color:#e74c3c;text-align:center">Erro ao carregar dados</td></tr>';
    }
}

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', () => {
    atualizarDados();
});
