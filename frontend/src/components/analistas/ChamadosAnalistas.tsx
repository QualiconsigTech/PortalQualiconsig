import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ChamadoModal } from "@/components/ChamadoModal";
import { Chamado, getStatus, toBase64 } from "@/utils/chamadoUtils";
import { TableOfContents } from "lucide-react";


export default function ChamadosAnalistas() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [isAtendendo, setIsAtendendo] = useState(false);
  const [isEncerrando, setIsEncerrando] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState<string>("Usuário");
  const [nomeDoSetor, setNomeDoSetor] = useState<string>("Setor");
  const [activeView, setActiveView] = useState("meus");
  const [perfilUsuario, setPerfilUsuario] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedChamados = chamados.slice(indexOfFirstItem, indexOfLastItem);
  const [showToast, setShowToast] = useState(false);
  const [toastMensagem, setToastMensagem] = useState(""); 
  const [produtos, setProdutos] = useState([]);
  const [usarProduto, setUsarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [quantidadeUsada, setQuantidadeUsada] = useState(1);
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  

const fetchUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token ausente");

    const response = await api.get("/api/usuarios/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setNomeUsuario(response.data.nome);
    setNomeDoSetor(response.data.setor);
    setPerfilUsuario(response.data.tipo);
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};


  const fetchChamados = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token ausente");
      setLoading(true);
      let url = "/api/usuarios/chamados/";
      if (perfilUsuario === "analista" || perfilUsuario === "analista_admin") {
        url = activeView === "meus"
          ? "/api/usuarios/chamados/atribuidos/"
          : "/api/usuarios/chamados/";
      }
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
           const ordenado = [...response.data].sort((a, b) => {
        const statusOrder = { "Aberto": 1, "Em Atendimento": 2, "Encerrado": 3 };
        return statusOrder[getStatus(a).texto] - statusOrder[getStatus(b).texto];
      });

      setChamados(ordenado);
    } catch (err) {
      setErro("Erro ao carregar chamados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  useEffect(() => {
    if (perfilUsuario) {
      fetchChamados();
    }
  }, [perfilUsuario, activeView]);

  console.log("perfil aqui:",perfilUsuario)
  

  const atenderChamado = async () => {
    if (!chamadoSelecionado) return;
    setIsAtendendo(true);
    
    try {
      const token = localStorage.getItem("token");
      await api.post(`/api/usuarios/chamados/${chamadoSelecionado.id}/atender/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setToastMensagem("Chamado atribuído com sucesso.");
      setShowToast(true); 
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
      fetchChamados();
      setModalAberto(false);
    } catch (err) {
      setToastMensagem("Erro ao atender o chamado.");
      setShowToast(true);
    } finally {
      setIsAtendendo(false);
    }
  };

  const encerrarChamado = async () => {
    if (!chamadoSelecionado || !solucao.trim()) return;
    setIsEncerrando(true);
  
    const token = localStorage.getItem("token");
  
    const payload = {
      solucao,
      comentarios,
      arquivos: anexos ? JSON.stringify(await Promise.all(
        Array.from(anexos).map(async (file) => ({
          nome: file.name,
          conteudo: await toBase64(file)
        }))
      )) : "[]"
    };
  
    try {
      await api.post(`/api/usuarios/chamados/${chamadoSelecionado.id}/encerrar/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Chamado encerrado com sucesso.");
      setModalAberto(false);
    } catch (err) {
      console.error("Erro ao encerrar chamado:", err);
      alert("Erro ao encerrar chamado.");
    } finally {
      setIsEncerrando(false);
    }
  };
  

    const changePage = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <DashboardLayout
      nomeUsuario={nomeUsuario}
      nomeDoSetor={nomeDoSetor}
      activeView={activeView}
      setActiveView={setActiveView}
      totalItems={chamados.length} 
      itemsPerPage={itemsPerPage}             
      onPageChange={(page) => setCurrentPage(page)}
      setChamadoSelecionado={setChamadoSelecionado}  
      setModalAberto={setModalAberto}                 
    >
      <section className="bg-white p-6 rounded-xl shadow mt-4">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="py-2">Nome Chamado</th>
              <th className="py-2">Categoria</th>
              <th className="py-2">Status</th>
              <th className="py-2">Prioridade</th>
              <th className="py-2">Setor</th>
              <th className="py-2">Data</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6">Carregando chamados...</td></tr>
            ) : erro ? (
              <tr><td colSpan={7} className="text-center text-red-500 py-6">{erro}</td></tr>
            ) : paginatedChamados.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-6">Nenhum chamado encontrado.</td></tr>
            ) : (
              paginatedChamados.map((chamado) => {
                const status = getStatus(chamado);
                return (
                  <tr
                    key={chamado.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onDoubleClick={() => {
                      setChamadoSelecionado(chamado);
                      setSolucao(chamado.solucao || "");
                      setComentarios(chamado.comentarios || "");
                      setModalAberto(true);
                    }}
                  >
                    <td className="py-2">{chamado.titulo}</td>
                    <td className="py-2">{chamado.categoria_nome}</td>
                    <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                    <td className="py-2 text-orange-500">{chamado.prioridade_nome}</td>
                    <td className="py-2">{chamado.usuario?.setor_nome }</td>
                    <td className="py-2">{format(new Date(chamado.criado_em), "dd/MM/yy")}</td>
                    <td className="py-2">
                      <button
                        onClick={() => {
                          setChamadoSelecionado(chamado);
                          setSolucao(chamado.solucao || "");
                          setComentarios(chamado.comentarios || "");
                          setModalAberto(true);
                        }}
                        className="text-gray-700 hover:text-blue-900 transition-colors"
                        title="Visualizar detalhes"
                      >
                        <TableOfContents size={20} />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
      {showToast && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg cursor-pointer z-50 animate-slide-up"
          onClick={() => setShowToast(false)}
        >
          {toastMensagem}
        </div>
      )}



      {modalAberto && chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={atenderChamado}
          onEncerrar={encerrarChamado}
          podeAtender={getStatus(chamadoSelecionado).texto === "Aberto"}
          podeEncerrar={["Aberto", "Em Atendimento"].includes(getStatus(chamadoSelecionado).texto)}
          solucao={solucao}
          setSolucao={setSolucao}
          comentarios={comentarios}
          setComentarios={setComentarios}
          anexos={anexos}
          setAnexos={setAnexos}
          isEncerrando={isEncerrando}
          isAtendendo={isAtendendo}
          usarProduto={usarProduto}
          setUsarProduto={setUsarProduto}
          produtoSelecionado={produtoSelecionado}
          setProdutoSelecionado={setProdutoSelecionado}
          quantidadeUsada={quantidadeUsada}
          setQuantidadeUsada={setQuantidadeUsada}
          atualizarListaChamados={fetchChamados}
        />
      )}
    </DashboardLayout>
  );
}
