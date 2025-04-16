import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface ProdutoFormProps {
  aberto: boolean;
  onClose: () => void;
}

export const Produtos  = ({ aberto, onClose }: ProdutoFormProps) => {
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [usuarioLogado, setUsuarioLogado] = useState<{ tipo: string; setor: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMensagem, setToastMensagem] = useState(""); 

  useEffect(() => {
    if (aberto) {
      setNome("");
      setQuantidade(1);
      buscarUsuario();
    }
  }, [aberto]);

  const buscarUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.get("/api/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarioLogado({
        tipo: response.data.tipo,
        setor: response.data.setor_nome || response.data.setor || "",
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  const salvarProduto = async () => {
    if (!nome.trim() || quantidade < 1) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.post(
        "/api/chamados/produtos/",
        { nome, quantidade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMensagem("Produto cadastrado com sucesso!");
      setShowToast(true); 
      setTimeout(() => {
        setShowToast(false);
        onClose(); 
      }, 1000);
    } catch (error) {
      setToastMensagem("Erro ao cadastrar o produto.");
      setShowToast(true); 
    }
  };

  if (!aberto) return null;

  if (usuarioLogado?.tipo !== "analista" || usuarioLogado.setor !== "Suporte") {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-lg font-bold mb-4">Acesso negado</h2>
          <p className="text-sm mb-4">Apenas analistas do setor de Suporte podem cadastrar produtos.</p>
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Cadastrar Produto</h2>
  
          <input
            type="text"
            placeholder="Nome do produto"
            className="w-full border rounded p-2 mb-3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
  
          <input
            type="number"
            min={1}
            placeholder="Quantidade"
            className="w-full border rounded p-2 mb-4"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />
  
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
              Cancelar
            </button>
            <button
              onClick={salvarProduto}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={!nome.trim() || quantidade < 1}
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
  
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-[9999] transition-all">
          {toastMensagem}
        </div>
      )}
    </>
  ); 
};
