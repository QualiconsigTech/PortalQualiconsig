from django.urls import path
from apps.financeiro.views import UploadRepasseCessaoView, UploadFaturaComissaoView, UploadSeguroCartaoView, UploadRelatorioFinalView, DownloadRelatorioFinalView, CategoriaCreateView, UploadRelatorioOmieView, CategoriasListView

urlpatterns = [
    path("upload-repasse-cessao/", UploadRepasseCessaoView.as_view(), name="upload-repasse-cessao"),
    path("upload-fatura-comissao/", UploadFaturaComissaoView.as_view(), name="upload-fatura-comissao"),
    path("upload-seguro-cartao/", UploadSeguroCartaoView.as_view(), name="upload-seguro-cartao"),
    path("gerar-relatorio-final/", UploadRelatorioFinalView.as_view(), name="gerar-relatorio-final"),
    path("download-relatorio-final/", DownloadRelatorioFinalView.as_view(), name="download_relatorio_final"),
    path('categorias/criar/', CategoriaCreateView.as_view(), name='criar_categorias'),
    path("categorias/", CategoriasListView.as_view(), name="categorias-list"),
    path('relatorio-omie/upload/', UploadRelatorioOmieView.as_view(), name='upload_relatorio_omie'),

]
