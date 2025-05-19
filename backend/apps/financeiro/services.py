import uuid
import pandas as pd
import json
from apps.financeiro.models import RepasseCessao, FaturaComissao, SeguroCartao, RelatorioRepasseQualibankingFinal
from django.db import transaction
from datetime import datetime
from django.http import HttpResponse
import io
from django.utils.timezone import now

def safe_decimal(value):
    try:
        if pd.isna(value) or str(value).strip().lower() == "nan":
            return 0
        return float(value)
    except Exception:
        return 0




def importar_repasses_cessao(files):
    processamento = uuid.uuid4()
    registros = []

    for file in files:
        df = pd.read_excel(file)

        for _, row in df.iterrows():
            registros.append(RepasseCessao(
                processamento=processamento,
                integracao=row['Integração'],
                operation=row['operation'],
                numero_contrato=row['Número de Contrato'],
                data_cessao=pd.to_datetime(row['Data da Cessão']),
                valor_emissao=row['Valor de Emissão'],
                valor_desembolso=row['Valor do Desembolso'],
                valor_cessao=row['Valor da Cessão'],
                spread_bancarizacao_refin=row['Spread Bancarização Refin'],
                spread_ted_portability=row['Spread TED Portability'],
                spread_ted_refinancing=row['Spread TED Refinancing'],
                spread_bancarizacao_portability=row['Spread Bancarização Portability'],
                spread_rco_refinancing=row['Spread RCO Refinancing'],
                spread_rco_portability=row['Spread RCO Portability'],
                valor_rebate_bruto_total=row['Valor do Rebate Bruto Total'],
                impostos=row['Impostos'],
                valor_qualiconsig=row['Qualiconsig Promotora De Vendas Ltda'],
                valor_qualibanking=row['Qualibanking Promotora de Vendas LTDA']
            ))

    with transaction.atomic():
        RepasseCessao.objects.bulk_create(registros)

    return str(processamento)


def importar_faturas_comissao(files):
    processamento = uuid.uuid4()
    registros = []

    for file in files:
        df = pd.read_excel(file)

        for _, row in df.iterrows():
            numero_contrato = ""
            try:
                metadados = row.get("METADADOS")
                if pd.notna(metadados):
                    meta_dict = json.loads(metadados)
                    numero_contrato = meta_dict.get("numero-ccb", "")
            except Exception as e:
                print(f"[ERRO] ao extrair numero-ccb: {e}")

            registros.append(FaturaComissao(
                processamento=processamento,
                id_venda=row['ID_VENDA'],
                movimento=row['MOVIMENTO'],
                apolice=row['APOLICE'],
                segurado=row['SEGURADO'],
                data_emissao=row['DATA_EMISSAO'],
                inicio_vigencia=row['INICIO_VIGENCIA'],
                fim_vigencia=row['FIM_VIGENCIA'],
                data_movimento=row['DATA_MOVIMENTO'],
                parcela=row['PARCELA'],
                total_parcelas=row['TOTAL_PARCELAS'],
                valor_comissao=row['VALOR_COMISSAO'],
                cod_externo=row.get('COD_EXTERNO'),
                metadados=row.get('METADADOS'),
                id_fatura=row['ID_FATURA'],
                data_fatura=row['DATA_FATURA'],
                data_fechamento_fatura=row['DATA_FECHAMENTO_FATURA'],
                id_intermediario=row['ID_INTERMEDIARIO'],
                nome_intermediario=row['NOME_INTERMEDIARIO'],
                insurance_id=row['INSURANCE_ID'],
                cod_externo2=row['COD_EXTERNO2'],
                iof=row.get("IOF", 0),
                premio_tarifa=row.get("PREMIO_TARIFA", 0),
                premio_bruto=row.get("PREMIO_BRUTO", 0),
                numero_contrato=numero_contrato,
            ))

    with transaction.atomic():
        FaturaComissao.objects.bulk_create(registros)

    return str(processamento)



def importar_seguro_cartao(file):
    df = pd.read_excel(file)
    processamento = uuid.uuid4()

    registros = []

    for index, row in df.iterrows():
        data_inicio_vigencia = None
        data_valor = row.get("DT INICIO DE VIGENCIA")

        try:
            if pd.notna(data_valor):
                if isinstance(data_valor, str):
                    try:
                        data_inicio_vigencia = datetime.strptime(data_valor.strip(), "%Y-%m-%d").date()
                    except ValueError:
                        data_inicio_vigencia = datetime.strptime(data_valor.strip(), "%d/%m/%Y").date()
                else:
                    data_inicio_vigencia = pd.to_datetime(data_valor).date()
        except Exception as e:
            print(f"[ERRO] Linha {index + 2}: Erro ao converter data '{data_valor}': {e}")
            continue  

        if not data_inicio_vigencia:
            print(f"[ERRO] Linha {index + 2}: data_inicio_vigencia ausente ou inválida. Linha ignorada.")
            continue

        registros.append(SeguroCartao(
            processamento=processamento,
            nome=row.get("NOME", "") or "",
            cpf=row.get("CPF", "") or "",
            data_inicio_vigencia=data_inicio_vigencia,
            plano_seguro=row.get("Planos Seguros / Nomenclatura", "") or "",
            cedente=row.get("CEDENTE", "") or "",
            vendedor=row.get("VENDEDOR", "") or "",
            valor_seguro=row.get("Valor do seguro", 0) or 0,
            contrato=row.get("Contrato", "") or "",
            lote=row.get("LOTE", "") or "",
            observacao=row.get("OBS", "") or "",
        ))

    with transaction.atomic():
        SeguroCartao.objects.bulk_create(registros)

    return processamento

def gerar_relatorio_final():
    ultimo_repasse = RepasseCessao.objects.order_by("-processamento").first()
    ultimo_fatura = FaturaComissao.objects.order_by("-processamento").first()

    if not ultimo_repasse or not ultimo_fatura:
        raise ValueError("Dados de repasse ou fatura não encontrados.")

    repasses = RepasseCessao.objects.filter(processamento=ultimo_repasse.processamento)
    faturas = FaturaComissao.objects.filter(processamento=ultimo_fatura.processamento)

    df_repasse = pd.DataFrame.from_records(repasses.values())
    df_fatura = pd.DataFrame.from_records(faturas.values())

    df_fatura = df_fatura[[
        "numero_contrato", "premio_tarifa", "iof", "premio_bruto", "movimento", "data_fatura"
    ]].rename(columns={
        "numero_contrato": "contrato",
        "data_fatura": "data_movimento"
    })


    df_fatura["data_movimento"] = pd.to_datetime(df_fatura["data_movimento"], errors="coerce").dt.date
    df_fatura["credito"] = df_fatura["movimento"].apply(lambda x: 1 if str(x).lower() == "pagamento" else 0)
    df_fatura["debito"] = df_fatura["movimento"].apply(lambda x: 1 if str(x).lower() == "restituição" else 0)

    df_merge = pd.merge(df_repasse, df_fatura, how="left", left_on="numero_contrato", right_on="contrato")

    processamento = uuid.uuid4()
    registros = []

    for _, row in df_merge.iterrows():
        registros.append(RelatorioRepasseQualibankingFinal(
            processamento=processamento,
            numero_contrato=row.get("numero_contrato", ""),
            valor_emissao=safe_decimal(row.get("valor_emissao")),
            valor_desembolso=safe_decimal(row.get("valor_desembolso")),
            valor_cessao=safe_decimal(row.get("valor_cessao")),
            spread_bancarizacao_refin=safe_decimal(row.get("spread_bancarizacao_refin")),
            spread_ted_portability=safe_decimal(row.get("spread_ted_portability")),
            spread_ted_refinancing=safe_decimal(row.get("spread_ted_refinancing")),
            spread_bancarizacao_portability=safe_decimal(row.get("spread_bancarizacao_portability")),
            spread_rco_refinancing=safe_decimal(row.get("spread_rco_refinancing")),
            spread_rco_portability=safe_decimal(row.get("spread_rco_portability")),
            valor_rebate_bruto_total=safe_decimal(row.get("valor_rebate_bruto_total")),
            impostos=safe_decimal(row.get("impostos")),
            valor_qualiconsig=safe_decimal(row.get("valor_qualiconsig")),
            valor_qualibanking=safe_decimal(row.get("valor_qualibanking")),
            premio_tarifa=safe_decimal(row.get("premio_tarifa")),
            iof=safe_decimal(row.get("iof")),
            premio_bruto=safe_decimal(row.get("premio_bruto")),
            movimento=row.get("movimento", ""),
            data_movimento=str(row.get("data_movimento")) if pd.notna(row.get("data_movimento")) else None,
            credito=safe_decimal(row.get("credito")),
            debito=safe_decimal(row.get("debito")),
        ))

    with transaction.atomic():
        RelatorioRepasseQualibankingFinal.objects.bulk_create(registros)

    return processamento

def download_relatorio_final():
    ultimo = RelatorioRepasseQualibankingFinal.objects.order_by("-processamento").first()
    if not ultimo:
        raise ValueError("Nenhum relatório encontrado para download.")
    dados = RelatorioRepasseQualibankingFinal.objects.filter(processamento=ultimo.processamento)
    df = pd.DataFrame.from_records(dados.values())
    for col in df.select_dtypes(include=['datetimetz']).columns:
        df[col] = df[col].dt.tz_localize(None)
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='RelatorioFinal')

    buffer.seek(0)
    response = HttpResponse(buffer.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="relatorio_qualibanking_final_{now().date()}.xlsx"'
    return response
