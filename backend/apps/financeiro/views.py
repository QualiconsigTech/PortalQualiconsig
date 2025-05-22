from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.financeiro.services import importar_repasses_cessao, importar_faturas_comissao, importar_seguro_cartao, gerar_relatorio_final, download_relatorio_final



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
