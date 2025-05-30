import { useEffect, useState } from "react";
import { TableOfContents } from "lucide-react";
import { api } from "@/services/api";
import { format } from "date-fns";
import { AbrirChamadoModal } from "@/components/portalQuali/chamados/AbrirChamadoModal";
import { ChamadoModal } from "@/components/portalQuali/chamados/ChamadoModal"; 
import { getStatus, toBase64, getNomeAnalista, Chamado} from "@/utils/chamadoUtils";



export default function ChamadosUsuariosAdmin({ tipo = "meus" }: { tipo: "meus" | "setor" }) {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [abrirModalAberto, setAbrirModalAberto] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMensagem, setToastMensagem] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [categorias, setCategorias] = useState([]);
  const [setores, setSetores] = useState([]);
  const [prioridades, setPrioridades] = useState<{ id: number; nome: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedChamados = chamados.slice(indexOfFirstItem, indexOfLastItem);
  const [nomeUsuario, setNomeUsuario] = useState<string>("Usuário");
  const [isEncerrando, setIsEncerrando] = useState(false);
  const handleTokenError = (error: any) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };
  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await api.get("/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNomeUsuario(response.data.nome);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      handleTokenError(error);
    }
  };
    
  const fetchChamados = async (url: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      setErro(null);
  
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(response.data)) {
        setErro("Dados inválidos retornados pela API.");
        return;
      }

      const ordenado = [...response.data].sort((a, b) => {
        const statusOrder = {
          "Aberto": 0,
          "Em Atendimento": 1,
          "Aguardando Atendimento": 2,
          "Encerrado": 3,
        };

        return statusOrder[getStatus(a).texto] - statusOrder[getStatus(b).texto];
      });

      setChamados(ordenado);
      } catch (error) {
      console.error("Erro ao buscar chamados", error);
      setErro("Erro ao buscar chamados");
      handleTokenError(error);
    } finally {
      setLoading(false);
    }
  };

  const encerrarChamado = async () => {
    if (!chamadoSelecionado || !solucao.trim()) return;
  
    setIsEncerrando(true);
    const token = localStorage.getItem("token");
  
    try {
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
      setModalAberto(false);
  
    } catch (err) {
      setToastMensagem("Erro ao encerrar o chamado.");
      setShowToast(true);
    } finally {
      setIsEncerrando(false);
    }
  };

  const fetchCategorias = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await api.get("/api/chamados/categorias/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
      handleTokenError(error);
    }
  };
  
  const fetchSetores = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await api.get("/api/core/setores/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao buscar setores", error);
      handleTokenError(error);
    }
  };
  const fetchPrioridades = async () => { 
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await api.get("/api/chamados/prioridades/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrioridades(response.data);
      } catch (error) {
        console.error("Erro ao buscar prioridades", error);
        handleTokenError(error);
      }
    };
  
  useEffect(() => {
  const loadAll = async () => {
    await Promise.all([
      fetchUsuario(),
      fetchChamados(tipo === "setor" ? "/api/chamados/meus/" : "/api/chamados/usuario/"),
      fetchCategorias(),
      fetchSetores(),
      fetchPrioridades(),
    ]);
  };
  loadAll();
}, [tipo]);

  
 
  const handleSalvarChamado = async (dados: {
    titulo: string;
    categoria: number;
    prioridade: number;
    descricao: string;
    setor: number;
    anexos: FileList | null;
  }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const arquivosBase64 = dados.anexos
        ? await Promise.all(
            Array.from(dados.anexos).map(async (file) => {
              const conteudo = await toBase64(file);
              return { nome: file.name, conteudo };
            })
          )
        : [];

      const payload = {
        titulo: dados.titulo,
        prioridade: dados.prioridade,
        descricao: dados.descricao,
        categoria: dados.categoria,
        setor: dados.setor,
        arquivos: JSON.stringify(arquivosBase64),
      };

      await api.post("/api/chamados/criar/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToastMensagem("Chamado aberto com sucesso!");
      setShowToast(true); 
      setTimeout(() => {
        setShowToast(false);
      }, 1000);
      setAbrirModalAberto(false);
      fetchChamados("/api/chamados/meus/");
    } catch (error) {
      setToastMensagem("Erro ao abrir chamado.");
      setShowToast(true); 
      console.error(error);
      handleTokenError(error);
    }
  };
  
  const abrirModalChamado = (chamado: Chamado) => {
    setChamadoSelecionado(chamado);
    setSolucao(chamado.solucao || "");
    setComentarios(chamado.comentarios || "");
    setModalAberto(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[#041161]">Chamados</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={() => setAbrirModalAberto(true)}
        >
          Novo Chamado
        </button>
      </div>

      <section className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              <th className="py-2">N° Chamado</th>
              <th className="py-2">Título</th>
              <th className="py-2">Status</th>
              <th className="py-2">Prioridade</th>
              <th className="py-2">Atribuído</th>
              <th className="py-2">Setor</th>
              <th className="py-2">Data</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">Carregando chamados...</td>
                </tr>
              ) : erro ? (
                <tr>
                  <td colSpan={8} className="text-center text-red-500 py-6">{erro}</td>
                </tr>
              ) : paginatedChamados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 py-6">Nenhum chamado encontrado.</td>
                </tr>
              ) : (
                paginatedChamados.map((chamado) => {
                  const status = getStatus(chamado);
                  return (
                    <tr
                    key={chamado.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onDoubleClick={() => abrirModalChamado(chamado)}
                  >
                      <td className="py-2">{chamado.id}</td>
                      <td className="py-2">{chamado.titulo}</td>
                      <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                      <td className="py-2 text-orange-500">{chamado.prioridade_nome || "--"}</td>
                      <td className="py-2">{getNomeAnalista(chamado)}</td>
                      <td className="py-2">{chamado.setor_nome || "--"}</td>
                      <td className="py-2">{format(new Date(chamado.criado_em), "dd/MM/yy")}</td>
                      <td className="py-2">
                        
                        <button
                          className="text-gray-700 hover:text-blue-900 transition-colors"
                          title="Visualizar detalhes"
                          onClick={() => abrirModalChamado(chamado)}
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

      <AbrirChamadoModal
        aberto={abrirModalAberto}
        onClose={() => setAbrirModalAberto(false)}
        onSalvar={handleSalvarChamado}
        categorias={categorias}
        setores={setores}
        prioridades={prioridades}
      />
       
       {chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={() => {}}
          onEncerrar={encerrarChamado}
          podeAtender={false}
          podeEncerrar={["Aberto", "Em Atendimento"].includes(getStatus(chamadoSelecionado).texto)}
          solucao={solucao}
          comentarios={comentarios}
          setSolucao={setSolucao}
          setComentarios={setComentarios}
          anexos={anexos}
          setAnexos={setAnexos}
          isAtendendo={false}
          isEncerrando={isEncerrando}
          modoAdmin={false}
        />
      )}
    </div>
  );
}
