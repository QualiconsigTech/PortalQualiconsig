from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chamados', '0003_remove_produtoinventario_gerente_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='produtoinventario',
            name='cargo',
        ),
        migrations.AddField(
            model_name='produtoinventario',
            name='celular_marca',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='produtoinventario',
            name='celular_modelo',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='produtoinventario',
            name='celular_numero',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
<<<<<<< HEAD
    ]
=======
    ]
>>>>>>> d5d1af462ed363eb4e800bd6acb8133927fef243
