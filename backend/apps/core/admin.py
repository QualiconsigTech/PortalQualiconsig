from django.contrib import admin
from .models import Setor, Cargo

@admin.register(Setor)
class SetorAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'grupo', 'criado_em')
    search_fields = ('nome', 'grupo__name')

@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'criado_em')
    search_fields = ('nome',)
