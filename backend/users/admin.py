from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.usuarios import Usuario
from .models.analista import Analista

class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('id', 'email', 'nome', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_active', 'deletado')
    search_fields = ('email', 'nome')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'nome', 'password', 'cargo', 'setor')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nome', 'cargo', 'setor', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

admin.site.register(Usuario, UsuarioAdmin)


class AnalistaAdmin(UserAdmin):
    model = Analista
    list_display = ('id', 'email', 'nome', 'is_active', 'is_staff', 'deletado')
    list_filter = ('is_staff', 'is_active', 'deletado')
    search_fields = ('email', 'nome')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'nome', 'password' 'setor')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nome', 'setor', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )

admin.site.register(Analista, AnalistaAdmin)
