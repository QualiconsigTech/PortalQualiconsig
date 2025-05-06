import { format } from "date-fns";
import { base64ToBlob, getStatus, Chamado } from "@/utils/chamadoUtils";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
interface Comentario {
  id: number;
  chamado: number;
  usuario: { id: number; nome: string; tipo: string };
  mensagem: string;
  criado_em: string;
}

interface ChamadoModalProps {
  chamado: Chamado;
  aberto: boolean;
  onClose: () => void;
  onAtender: () => void;
  onEncerrar: () => void;
  podeAtender: boolean;
  podeEncerrar: boolean;
  solucao: string;
  comentarios: string;
  setSolucao: (value: string) => void;
  setComentarios: (value: string) => void;
  anexos: FileList | null;
  setAnexos: (value: FileList | null) => void;
  isAtendendo: boolean;
  isEncerrando: boolean;
  modoAdmin?: boolean;
  usarProduto: boolean;
  setUsarProduto?: (value: boolean) => void;
  produtoSelecionado: number | null;
  setProdutoSelecionado?: (value: number | null) => void;
  quantidadeUsada: number;
  setQuantidadeUsada?: (value: number) => void;
}

export const ChamadoModal = ({
  chamado,
  aberto,
  onClose,
  onAtender,
  onEncerrar,
  podeAtender,
  podeEncerrar,
  solucao,
  comentarios,
  setSolucao,
  setComentarios,
  anexos,
  setAnexos,
  isAtendendo,
  isEncerrando,
  modoAdmin = false,
  usarProduto,
  setUsarProduto,
  produtoSelecionado,
  setProdutoSelecionado,
  quantidadeUsada,
  setQuantidadeUsada

}: ChamadoModalProps) => {
  const [chatMensagens, setChatMensagens] = useState<any[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const status = getStatus(chamado);
  const [usuarioLogado, setUsuarioLogado] = useState<{ id: number, tipo: string } | null>(null);
  const [produtos, setProdutos] = useState([]);
  const [erroSolucao, setErroSolucao] = useState(false);


  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const response = await api.get("/api/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsuarioLogado({ id: response.data.id, tipo: response.data.tipo });
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };
  
  useEffect(() => {
    if (chamado.id) {
      buscarComentarios();
      fetchUsuario();
      fetchProdutos();
    }
  }, [chamado.id]);
  const fetchProdutos = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/chamados/produtos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  useEffect(() => {
    if (aberto) {
      setErroSolucao(false);
      if (setUsarProduto) setUsarProduto(false);
      if (setProdutoSelecionado) setProdutoSelecionado(null);
      if (setQuantidadeUsada) setQuantidadeUsada(1);
    }
  }, [aberto]);
  
  
    const buscarComentarios = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await api.get(`/api/chamados/${chamado.id}/comentarios/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChatMensagens(response.data);
      } catch (error) {
        console.error("Erro ao buscar comentários", error);
      }
    };
  
    const enviarComentario = async () => {
      if (!novaMensagem.trim()) return;
      if (chamado.encerrado_em) return;
      if (!podeComentar(chamado)) return; 
    
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
    
        await api.post(`/api/chamados/${chamado.id}/comentarios/criar/`, { texto: novaMensagem }, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        setNovaMensagem("");
        await buscarComentarios();
      } catch (error) {
        console.error("Erro ao enviar comentário", error);
      }
    };
    

    const podeComentar = (chamado: Chamado) => {
      if (!usuarioLogado) return false;
  
      if (usuarioLogado.tipo === "usuario" && chamado.usuario?.id === usuarioLogado.id) {
        return true;
      }
  
      if (usuarioLogado.tipo === "analista" && chamado.analista?.id === usuarioLogado.id) {
        return true;
      }
  
      return false;
    };
    
  if (!aberto) return null;

  let arquivosAnexados: { nome: string; conteudo: string }[] = [];

  try {
    arquivosAnexados = chamado.arquivos
      ? typeof chamado.arquivos === "string"
        ? JSON.parse(chamado.arquivos)
        : chamado.arquivos
      : [];
  } catch (e) {
    console.error("Erro ao interpretar arquivos:", e);
  }
  
  return (
    <div
    className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do Chamado</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div><strong>Título:</strong> {chamado.titulo}</div>
          <div><strong>Nº Chamado:</strong> #{chamado.id}</div>
          <div><strong>Categoria:</strong> {chamado.categoria_nome}</div>
          <div><strong>Data de abertura:</strong> {format(new Date(chamado.criado_em), "dd/MM/yyyy")}</div>
          <div><strong>Status:</strong> {status.texto}</div>
          <div><strong>Usuário:</strong> {chamado.usuario.nome || "não informado"}</div>
          <div><strong>Prioridade:</strong> {chamado.prioridade_nome}</div>
          <div><strong>Analista Atribuído:</strong> {chamado.analista?.nome || "Não Atribuido"} </div>
          
          {modoAdmin && (
            <>
              <div><strong>Analista Atribuído:</strong> {chamado.analista?.nome || "Não informado"}</div>
              <div><strong>Usuário Atribuído:</strong> {chamado.usuario?.nome || "Não informado"}</div>
            </>
          )}
        </div>      

        <div className="mb-4">
          <label className="block font-semibold mb-1">Descrição:</label>
          <textarea value={chamado.descricao} readOnly className="w-full border rounded p-2 bg-gray-100" rows={3} />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Solução:</label>
          <textarea
            value={solucao}
            onChange={(e) => {
              setSolucao(e.target.value);
              setErroSolucao(false);
            }}
            readOnly={status.texto === "Encerrado"}
            className={`w-full border rounded p-2 ${erroSolucao ? "border-red-500 bg-red-50" : "bg-gray-100"}`}
          />
          {erroSolucao && (
            <p className="text-sm text-red-500 mt-1">Este campo é obrigatório para encerrar o chamado.</p>
          )}
        </div>


        {/* Uso de Produto */}
        {usuarioLogado?.tipo === "analista" && (
        <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={usarProduto}
                onChange={(e) => setUsarProduto?.(e.target.checked)}
              />
              Utilizei algum produto do estoque?
            </label>

            {usarProduto && (
              <>
                <select
                  className="w-full p-2 border rounded"
                  value={produtoSelecionado ?? ""}
                  onChange={(e) => setProdutoSelecionado?.(Number(e.target.value))}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto: any) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome} ({produto.quantidade} disponíveis)
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  className="w-full p-2 border rounded"
                  placeholder="Quantidade utilizada"
                  value={quantidadeUsada}
                  onChange={(e) => setQuantidadeUsada?.(Number(e.target.value))}
                />
              </>
            )}
          </div>
        )}


       {/* Chat de Comentários */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Histórico de Comentários:</label>
          <div className="border rounded p-3 h-60 overflow-y-auto bg-gray-50 space-y-3">
          {chatMensagens.length > 0 ? (
            chatMensagens.map((msg, idx) => (
              <div key={idx} className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm text-gray-800">
                  <strong>
                  {msg.autor?.nome || 'Desconhecido'}
                  </strong>
                </div>
                <div className="text-gray-600 text-xs mb-1">{format(new Date(msg.criado_em), "dd/MM/yyyy HH:mm")}</div>
                <div className="text-gray-700 text-sm break-words">{msg.texto}</div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">Nenhum comentário ainda.</p>
          )}
          </div>

          {/* Campo nova mensagem */}
            {podeComentar(chamado) && (
              <div className="flex mt-3 gap-2">
                <input
                  type="text"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  maxLength={1000}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 border rounded p-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      enviarComentario();
                    }
                  }}
                />
                <button
                  onClick={enviarComentario}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Enviar
                </button>
              </div>
            )}

        </div>


        <div className="mb-4">
          <label className="block font-semibold mb-1">Arquivos Anexados:</label>
          {arquivosAnexados.length > 0 ? (
            <div className="text-sm text-gray-600 mb-2">
              {arquivosAnexados.map((arquivo, idx) => (
                <a
                  key={idx}
                  href="#"
                  onClick={() => {
                    const [meta, base64Content] = arquivo.conteudo.split(",");
                    const mime = meta.split(":")[1].split(";")[0];
                    const blob = base64ToBlob(base64Content, mime);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = arquivo.nome;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-blue-600 hover:underline block"
                >
                  📎 Baixar {arquivo.nome}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum arquivo anexado.</p>
          )}

          <input
            type="file"
            multiple
            className="w-full mt-2"
            onChange={(e) => setAnexos(e.target.files)}
            disabled={status.texto === "Encerrado"}
          />
        </div>

        <div className="flex justify-end gap-2">
          {usuarioLogado?.tipo === "analista" && podeAtender && (
            <button
              onClick={onAtender}
              disabled={isAtendendo || isEncerrando}
              className={`px-6 py-2 rounded text-white ${isAtendendo ? "bg-blue-400" : "bg-blue-800 hover:bg-blue-900"}`}
            >
              {isAtendendo ? "Atendendo..." : "Atender"}
            </button>
          )}
         <button
          onClick={() => {
            if (!solucao.trim()) {
              setErroSolucao(true);
              return;
            }
            onEncerrar();
          }}
          disabled={isEncerrando || isAtendendo}
          className={`px-6 py-2 rounded text-white ${isEncerrando ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
        >
          {isEncerrando ? "Encerrando..." : "Encerrar"}
        </button>
        </div>
      </div>
    </div>
  );
};
