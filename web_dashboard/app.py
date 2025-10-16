from flask import Flask, render_template, jsonify
from datetime import datetime, timedelta
from decimal import Decimal
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def get_lme_data():
    """Busca dados da API LME"""
    url_base = "https://lme.gorilaxpress.com/cotacao"
    data_link = "2cf4ff0e-8a30-48a5-8add-f4a1a63fee10/json"
    
    try:
        response = requests.get(f"{url_base}/{data_link}/", timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get("results", [])
    except Exception as e:
        print(f"Erro ao buscar dados: {e}")
        return []


def get_ptax_periodo(data_inicial: datetime, data_final: datetime):
    """Busca PTAX (BACEN) no período e retorna dict por data (YYYY-MM-DD) com cotacaoVenda.
    Documentação: https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/documentacao
    """
    try:
        base = (
            "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/"
            "CotacaoDolarPeriodo(dataInicial=@ini,dataFinalCotacao=@fim)?"
            "@ini='{ini}'&@fim='{fim}'&$format=json"
        )
        ini = data_inicial.strftime("%m-%d-%Y")
        fim = data_final.strftime("%m-%d-%Y")
        url = base.format(ini=ini, fim=fim)
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        values = r.json().get("value", [])
        # Pegar última cotação do dia (por data)
        por_dia = {}
        for v in values:
            # Ex: '2025-10-16 13:05:00.000'
            dt = v.get("dataHoraCotacao")
            if not dt:
                continue
            data_str = dt.split(" ")[0]
            venda = float(v.get("cotacaoVenda", 0))
            por_dia[data_str] = venda
        return por_dia
    except Exception as e:
        print(f"Erro ao buscar PTAX: {e}")
        return {}


def calcular_variacao_percentual(valor_atual, valor_anterior):
    """Calcula variação percentual entre dois valores"""
    if valor_anterior == 0:
        return 0
    variacao = ((valor_atual - valor_anterior) / valor_anterior) * 100
    return round(variacao, 2)


def processar_dados_mensal(dados, mes, ano, meses_anteriores=1):
    """Processa dados para visualização mensal incluindo meses anteriores.
    
    Args:
        dados: Lista de dados
        mes: Mês alvo
        ano: Ano alvo
        meses_anteriores: Quantos meses anteriores incluir (padrão: 1 = 2 meses no total)
    """
    dados_mes = []
    
    # Calcular data inicial (meses_anteriores meses atrás)
    data_final = datetime(ano, mes, 1)
    
    # Calcular primeiro dia do mês inicial
    mes_inicial = mes - meses_anteriores
    ano_inicial = ano
    while mes_inicial <= 0:
        mes_inicial += 12
        ano_inicial -= 1
    
    data_inicial = datetime(ano_inicial, mes_inicial, 1)
    
    for item in dados:
        data_item = datetime.strptime(item["data"], "%Y-%m-%d")
        # Incluir se está entre data_inicial e fim do mês alvo
        if data_inicial <= data_item <= datetime(ano, mes, 31):
            dados_mes.append({
                "data": item["data"],
                "data_formatada": data_item.strftime("%d/%m/%Y"),
                "cobre": float(item["cobre"]),
                "zinco": float(item["zinco"]),
                "aluminio": float(item["aluminio"]),
                "chumbo": float(item["chumbo"]),
                "estanho": float(item["estanho"]),
                "niquel": float(item["niquel"]),
                "dolar": float(item["dolar"])
            })
    
    return sorted(dados_mes, key=lambda x: x["data"])


def calcular_medias_semanais(dados):
    """Calcula médias semanais (ISO) dos dados.
    - Usa ano ISO e número da semana.
    - Início = segunda-feira; fim = domingo daquela semana (para exibição correta).
    """
    semanas = {}

    for item in dados:
        data_item = datetime.strptime(item["data"], "%Y-%m-%d")
        iso_year, iso_week, iso_weekday = data_item.isocalendar()
        key = (iso_year, iso_week)

        if key not in semanas:
            # Segunda-feira da semana ISO
            monday = data_item - timedelta(days=iso_weekday - 1)
            sunday = monday + timedelta(days=6)
            semanas[key] = {
                "dados": [],
                "inicio_semana": monday,
                "fim_semana": sunday,
            }

        semanas[key]["dados"].append(item)

    medias_semanais = []
    for (iso_year, iso_week) in sorted(semanas.keys()):
        info = semanas[(iso_year, iso_week)]
        dados_semana = info["dados"]
        n = len(dados_semana)

        if n > 0:
            media = {
                "ano": int(iso_year),
                "semana": int(iso_week),
                "inicio": info["inicio_semana"].strftime("%d/%m/%Y"),
                "fim": info["fim_semana"].strftime("%d/%m/%Y"),
                "cobre": round(sum(float(d["cobre"]) for d in dados_semana) / n, 2),
                "zinco": round(sum(float(d["zinco"]) for d in dados_semana) / n, 2),
                "aluminio": round(sum(float(d["aluminio"]) for d in dados_semana) / n, 2),
                "chumbo": round(sum(float(d["chumbo"]) for d in dados_semana) / n, 2),
                "estanho": round(sum(float(d["estanho"]) for d in dados_semana) / n, 2),
                "niquel": round(sum(float(d["niquel"]) for d in dados_semana) / n, 2),
                "dolar": round(sum(float(d["dolar"]) for d in dados_semana) / n, 2),
            }
            medias_semanais.append(media)

    return medias_semanais


def calcular_medias_mensais(dados):
    """Calcula médias mensais dos dados"""
    meses = {}
    
    for item in dados:
        data_item = datetime.strptime(item["data"], "%Y-%m-%d")
        mes_ano = data_item.strftime("%m/%Y")
        
        if mes_ano not in meses:
            meses[mes_ano] = []
        
        meses[mes_ano].append(item)
    
    medias_mensais = []
    for mes_ano, dados_mes in sorted(meses.items()):
        n = len(dados_mes)
        
        if n > 0:
            media = {
                "mes": mes_ano,
                "cobre": round(sum(float(d["cobre"]) for d in dados_mes) / n, 2),
                "zinco": round(sum(float(d["zinco"]) for d in dados_mes) / n, 2),
                "aluminio": round(sum(float(d["aluminio"]) for d in dados_mes) / n, 2),
                "chumbo": round(sum(float(d["chumbo"]) for d in dados_mes) / n, 2),
                "estanho": round(sum(float(d["estanho"]) for d in dados_mes) / n, 2),
                "niquel": round(sum(float(d["niquel"]) for d in dados_mes) / n, 2),
                "dolar": round(sum(float(d["dolar"]) for d in dados_mes) / n, 2)
            }
            medias_mensais.append(media)
    
    return medias_mensais


def get_prev_month(year: int, month: int):
    if month == 1:
        return year - 1, 12
    return year, month - 1


def montar_indicadores_variacao(dados_todos, dados_mes, mes, ano):
    """Monta estrutura com variação diária, semanal e mensal para todos os metais."""
    metais = ["cobre", "zinco", "aluminio", "chumbo", "estanho", "niquel", "dolar"]

    # Diário: último vs penúltimo dentro do mês
    diario = {}
    if len(dados_mes) >= 2:
        ultimo = dados_mes[-1]
        penultimo = dados_mes[-2]
        for m in metais:
            v_atual = float(ultimo[m])
            v_ant = float(penultimo[m])
            diario[m] = {
                "data_atual": ultimo["data"],
                "data_anterior": penultimo["data"],
                "valor_atual": v_atual,
                "valor_anterior": v_ant,
                "variacao": calcular_variacao_percentual(v_atual, v_ant)
            }
    
    # Semanal: média da última semana do mês vs semana anterior (apenas dados do mês)
    seman = calcular_medias_semanais(dados_mes)
    semanal = {}
    if len(seman) >= 2:
        atual = seman[-1]
        anterior = seman[-2]
        for m in metais:
            v_atual = float(atual[m])
            v_ant = float(anterior[m])
            semanal[m] = {
                "semana_atual": atual["semana"],
                "semana_anterior": anterior["semana"],
                "valor_atual": v_atual,
                "valor_anterior": v_ant,
                "variacao": calcular_variacao_percentual(v_atual, v_ant)
            }

    # Mensal: média do mês pedido vs mês anterior (em todo o dataset)
    mens = calcular_medias_mensais(dados_todos)
    alvo = f"{mes:02d}/{ano}"
    a_ano, a_mes = get_prev_month(ano, mes)
    prev = f"{a_mes:02d}/{a_ano}"
    atual_m = next((x for x in mens if x["mes"] == alvo), None)
    prev_m = next((x for x in mens if x["mes"] == prev), None)
    mensal = {}
    if atual_m and prev_m:
        for m in metais:
            v_atual = float(atual_m[m])
            v_ant = float(prev_m[m])
            mensal[m] = {
                "mes_atual": alvo,
                "mes_anterior": prev,
                "valor_atual": v_atual,
                "valor_anterior": v_ant,
                "variacao": calcular_variacao_percentual(v_atual, v_ant)
            }

    return {
        "diario": diario,
        "semanal": semanal,
        "mensal": mensal,
    }


@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')


@app.route('/api/dados/<int:mes>/<int:ano>')
def api_dados_mes(mes, ano):
    """API para obter dados de um mês específico (incluindo mês anterior)"""
    dados = get_lme_data()
    dados_processados = processar_dados_mensal(dados, mes, ano, meses_anteriores=1)  # 2 meses
    # PTAX para o período
    if dados_processados:
        di = datetime.strptime(dados_processados[0]["data"], "%Y-%m-%d")
        df = datetime.strptime(dados_processados[-1]["data"], "%Y-%m-%d")
        ptax = get_ptax_periodo(di, df)
        for item in dados_processados:
            item["dolar_ptax"] = float(ptax.get(item["data"], 0))
    
    indicadores_variacao = montar_indicadores_variacao(dados, dados_processados, mes, ano)
    
    return jsonify({
        "dados_diarios": dados_processados,
        "indicadores_variacao": indicadores_variacao
    })


@app.route('/api/dados-semanais/<int:mes>/<int:ano>')
def api_dados_semanais(mes, ano):
    """API para obter médias semanais de um mês (incluindo mês anterior)"""
    dados = get_lme_data()
    dados_mes = processar_dados_mensal(dados, mes, ano, meses_anteriores=1)  # 2 meses
    medias = calcular_medias_semanais(dados_mes)
    
    return jsonify(medias)


@app.route('/api/dados-mensais')
def api_dados_mensais():
    """API para obter médias mensais"""
    dados = get_lme_data()
    medias = calcular_medias_mensais(dados)
    
    return jsonify(medias)


@app.route('/api/dados-completos')
def api_dados_completos():
    """API para obter todos os dados disponíveis"""
    dados = get_lme_data()

    dados_formatados = []
    if dados:
        di = datetime.strptime(dados[-1]["data"], "%Y-%m-%d")
        df = datetime.strptime(dados[0]["data"], "%Y-%m-%d")
        ptax = get_ptax_periodo(di, df)
    else:
        ptax = {}

    for item in dados:
        data_item = datetime.strptime(item["data"], "%Y-%m-%d")
        data_iso = item["data"]
        dados_formatados.append({
            "data": data_iso,
            "data_formatada": data_item.strftime("%d/%m/%Y"),
            "cobre": float(item["cobre"]),
            "zinco": float(item["zinco"]),
            "aluminio": float(item["aluminio"]),
            "chumbo": float(item["chumbo"]),
            "estanho": float(item["estanho"]),
            "niquel": float(item["niquel"]),
            "dolar": float(item["dolar"]),
            "dolar_ptax": float(ptax.get(data_iso, 0))
        })

    return jsonify(sorted(dados_formatados, key=lambda x: x["data"], reverse=True))


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
