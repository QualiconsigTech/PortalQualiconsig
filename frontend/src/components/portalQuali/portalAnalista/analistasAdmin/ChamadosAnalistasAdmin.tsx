import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { api } from "@/services/api";
import { TableOfContents } from "lucide-react";
import { ChamadoModal } from "@/components/portalQuali/chamados/ChamadoModal";
import { Chamado, getStatus } from "@/utils/chamadoUtils";
import { useDashboardLogic } from "@/hooks/useDashboardLogic";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function ChamadosAnalistasAdmin({ activeView, setActiveView }: Props) {
  const router = useRouter();
  const { perfilUsuario, tipoUsuario } = useDashboardLogic();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [nomeUsuario, setNomeUsuario] = useState<string>("Usuário");
  const redirecionarParaLogin = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return redirecionarParaLogin();
    try {
      await api.get("/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      } catch (error: any) {
      if (error?.response?.status === 401) {
        redirecionarParaLogin();
      } else {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    }
  };

  const buscarChamados = async (rota: string) => {
  const token = localStorage.getItem("token");
  if (!token) return redirecionarParaLogin();
  setLoading(true);
  try {
    const response = await api.get(rota, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let chamadosRecebidos = response.data;

    
    if (activeView === "todos") {
      chamadosRecebidos = chamadosRecebidos.filter(
        (chamado: Chamado) => getStatus(chamado).texto === "Aberto"
      );
    }

    const ordenado = [...chamadosRecebidos].sort((a, b) => {
      const statusOrder = {
        "Aberto": 0,
        "Em Atendimento": 1,
        "Aguardando Atendimento": 2,
        "Encerrado": 3,
      };

      return (
        statusOrder[getStatus(a).texto] - statusOrder[getStatus(b).texto]
      );
    });

    setChamados(ordenado);
  } catch (err: any) {
    if (err?.response?.status === 401) {
      redirecionarParaLogin();
    } else {
      setErro("Erro ao carregar chamados.");
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUsuario();
  }, []);

  useEffect(() => {
    if (activeView) {
      const rota =
        activeView === "todos"
          ? "/api/chamados/analista/admin/"
          : `/api/chamados/analista/admin/${activeView}/`;
      buscarChamados(rota);
    }
  }, [activeView]);

  const chamadosFiltrados = chamados.filter((chamado) => {
    const texto = filtro.toLowerCase();
    const status = getStatus(chamado).texto.toLowerCase();

    return (
      String(chamado.id).includes(texto) ||
      chamado.titulo?.toLowerCase().includes(texto) ||
      chamado.categoria_nome?.toLowerCase().includes(texto) ||
      chamado.prioridade_nome?.toLowerCase().includes(texto) ||
      chamado.usuario?.setor_nome?.toLowerCase().includes(texto) ||
      status.includes(texto) ||
      format(new Date(chamado.criado_em), "dd/MM/yy").includes(texto)
    );
  });

  const paginatedChamados = chamadosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const exibirMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  };
 
  const changePage = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold text-[#041161] mb-4">Chamados - Tecnologia</h1>
      <div className="mb-6 max-w-md relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Filtrar chamados por qualquer campo..."
        value={filtro}
        onChange={(e) => {
          setFiltro(e.target.value);
          setCurrentPage(1);
        }}
        className="pl-10 pr-4 py-2 border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
      />
    </div>
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
              <th className="py-2">Analista Atribuído</th>
              <th className="py-2">Usuário Atribuído</th>
              <th className="py-2">Data de Criação</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-6">Carregando chamados...</td></tr>
            ) : erro ? (
              <tr><td colSpan={9} className="text-center text-red-500 py-6">{erro}</td></tr>
            ) : paginatedChamados.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-500 py-6">Nenhum chamado encontrado.</td></tr>
            ) : (
              paginatedChamados.map((chamado) => {
                const status = getStatus(chamado);
                return (
                  <tr key={chamado.id} className="border-t hover:bg-gray-50 cursor-pointer" onDoubleClick={() => {
                    setChamadoSelecionado(chamado);
                    setSolucao(chamado.solucao || "");
                    setComentarios(chamado.comentarios || "");
                    setModalAberto(true);
                  }}>
                    <td className="py-2">{chamado.id}</td>
                    <td className="py-2">{chamado.titulo}</td>
                    <td className="py-2">{chamado.categoria_nome}</td>
                    <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                    <td className="py-2 text-orange-500">{chamado.prioridade_nome}</td>
                    <td className="py-2">{chamado.setor_nome}</td>
                    <td className="py-2">{chamado.analista?.nome || "Não atribuído"}</td>
                    <td className="py-2">{chamado.usuario?.nome || "Não informado"}</td>
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
      {chamadosFiltrados.length > itemsPerPage && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(chamadosFiltrados.length / itemsPerPage) }).map((_, index) => (
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

      {modalAberto && chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={() => {}}
          onEncerrar={() => {}}
          podeAtender={false}
          podeEncerrar={false}
          solucao={solucao}
          setSolucao={setSolucao}
          comentarios={comentarios}
          setComentarios={setComentarios}
          anexos={anexos}
          setAnexos={setAnexos}
          isAtendendo={false}
          isEncerrando={false}
          modoAdmin={true}
        />
      )}

      {mensagem && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-xl border border-gray-300">
            {mensagem}
          </div>
        </div>
      )}
     </section>
  );
}
