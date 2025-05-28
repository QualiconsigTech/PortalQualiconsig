from apps.chamados.models import ProdutoInventario

def listar_produtos_inventario():
    return ProdutoInventario.objects.all()

def criar_produto_inventario(data):
    return ProdutoInventario.objects.create(**data)

def atualizar_produto_inventario(produto_id, data):
    produto = ProdutoInventario.objects.get(id=produto_id)
    for campo, valor in data.items():
        setattr(produto, campo, valor)
    produto.save()
    return produto
