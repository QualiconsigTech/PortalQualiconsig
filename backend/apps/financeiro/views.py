from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RelatorioOmieSerializer, CategoriaSerializer
from apps.financeiro.services import importar_repasses_cessao, importar_faturas_comissao, importar_seguro_cartao, gerar_relatorio_final, download_relatorio_final, processar_relatorio_omie, criar_categorias, listar_categorias, gerar_arquivos_filtrados
import traceback
import pandas as pd


class UploadRepasseCessaoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        arquivos = request.FILES.getlist("files")
        if not arquivos:
            return Response({"erro": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            processamento = importar_repasses_cessao(arquivos)
            return Response({"mensagem": "Cessões importadas com sucesso", "processamento": processamento})
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UploadFaturaComissaoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        arquivos = request.FILES.getlist("files")
        if not arquivos:
            return Response({"erro": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            processamento = importar_faturas_comissao(arquivos)
            return Response({"mensagem": "Faturas importadas com sucesso", "processamento": processamento})
        except Exception as e:
            traceback.print_exc() 
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UploadSeguroCartaoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get("files")
        if not file:
            return Response({"erro": "Arquivo não enviado."}, status=400)

        try:
            processamento = importar_seguro_cartao(file)
            return Response({"mensagem": "Arquivo processado com sucesso.", "processamento": str(processamento)})
        except Exception as e:
            return Response({"erro": str(e)}, status=500)




class UploadRelatorioFinalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            processamento_id = gerar_relatorio_final()
            return Response({"mensagem": "Arquivo gerado com sucesso.", "processamento": str(processamento_id)}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class DownloadRelatorioFinalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return download_relatorio_final()



class UploadRelatorioOmieView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        arquivos = request.FILES.getlist('arquivos')

        if not arquivos:
            return Response({"erro": "Nenhum arquivo enviado."}, status=status.HTTP_400_BAD_REQUEST)

        relatorios_criados = []
        todos_arquivos_base64 = []

        for arquivo in arquivos:
            try:
                df = pd.read_excel(arquivo, header=1).fillna("")

                # Geração dos arquivos filtrados (base64)
                arquivos_filtrados = gerar_arquivos_filtrados(df)
                todos_arquivos_base64.append(arquivos_filtrados)

                # Resetar o ponteiro do arquivo original
                arquivo.seek(0)

                # Processar e salvar no banco
                relatorio = processar_relatorio_omie(arquivo, request.user)
                serializer = RelatorioOmieSerializer(relatorio)
                relatorios_criados.append(serializer.data)

            except Exception as e:
                print("Erro ao processar upload:\n", traceback.format_exc())
                return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "relatorios": relatorios_criados,
            "arquivos_base64": todos_arquivos_base64
        }, status=status.HTTP_201_CREATED)



class CategoriaCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        categorias_data = request.data.get('categorias', [])

        if not categorias_data:
            return Response({"erro": "Nenhuma categoria enviada."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            categorias_criadas = criar_categorias(categorias_data)
            serializer = CategoriaSerializer(categorias_criadas, many=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CategoriasListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        categorias = listar_categorias()
        data = [{"id": cat.id, "nome": cat.nome, "tipo": cat.tipo} for cat in categorias]
        return Response(data)


