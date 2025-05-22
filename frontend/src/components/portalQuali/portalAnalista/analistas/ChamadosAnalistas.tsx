import { useEffect, useState} from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import { ChamadoModal } from "@/components/portalQuali/chamados/ChamadoModal";
import { Chamado, getStatus, toBase64 } from "@/utils/chamadoUtils";
import { TableOfContents } from "lucide-react";

interface ChamadosAnalistasProps {
  activeView: string;
}
export default function ChamadosAnalistas({ activeView }: ChamadosAnalistasProps) {
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
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [nomeDoSetor, setNomeDoSetor] = useState("Setor");
  const [perfilUsuario, setPerfilUsuario] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMensagem, setToastMensagem] = useState("");
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedChamados = chamados.slice(indexOfFirstItem, indexOfLastItem);
const fetchUsuario = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token ausente");

    const response = await api.get("/api/auth/me/", {
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
      
      const url = activeView === "meus"
        ? "/api/chamados/atribuidos/"
        : "/api/chamados/analista/";

      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

        const ordenado = [...response.data].sort((a, b) => {
        const statusOrder = {
          "Aberto": 0,
          "Em Atendimento": 1,
          "Aguardando Atendimento": 2,
          "Encerrado": 3,
        };

        return statusOrder[a.status] - statusOrder[b.status];
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
      await api.post(`/api/chamados/${chamadoSelecionado.id}/atender/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setToastMensagem("Chamado atribuído com sucesso.");
      setShowToast(true); 
      setTimeout(() => setShowToast(false), 1000);
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
  
    try {
      const token = localStorage.getItem("token");
      const base64Arquivos = anexos
        ? await Promise.all(
            Array.from(anexos).map(async (file) => {
              const conteudo = await toBase64(file);
              return { nome: file.name, conteudo };
            })
          )
        : [];
  
      const payload = {
        solucao,
        comentarios,
        arquivos: JSON.stringify(base64Arquivos),
      };
  
      await api.post(`/api/chamados/${chamadoSelecionado.id}/encerrar/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setToastMensagem("Chamado encerrado com sucesso.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1000);
      fetchChamados();
      setModalAberto(false);
  
    } catch (err) {
      setToastMensagem("Erro ao encerrar o chamado.");
      setShowToast(true);
    } finally {
      setIsEncerrando(false);
    }
  };
  
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold text-[#041161] mb-4">Chamados Atribuídos</h1>

      <section className="bg-white p-6 rounded-xl shadow mt-4">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="py-2">N° Chamado</th>
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
                    <td className="py-2">{chamado.id}</td>
                    <td className="py-2">{chamado.titulo}</td>
                    <td className="py-2">{chamado.categoria_nome}</td>
                    <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                    <td className="py-2 text-orange-500">{chamado.prioridade_nome}</td>
                    <td className="py-2">{chamado.usuario?.setor_nome}</td>
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
      {/* Paginação */}
      {chamados.length > itemsPerPage && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(chamados.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
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
        />
      )}
      </section>
  );
}
