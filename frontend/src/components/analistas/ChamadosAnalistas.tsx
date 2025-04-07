import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ChamadoModal } from "@/components/ChamadoModal";
import { Chamado, base64ToBlob, getStatus, toBase64 } from "@/utils/chamadoUtils";
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
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [isAtendendo, setIsAtendendo] = useState(false);
  const [isEncerrando, setIsEncerrando] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState<string>("Usuário");
  const [nomeDoSetor, setNomeDoSetor] = useState<string>("Setor");
  const [activeView, setActiveView] = useState("meus");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await api.get("/api/usuarios/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNomeUsuario(response.data.nome);
      setNomeDoSetor(response.data.setor);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  const fetchChamados = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    let url = activeView === "meus" ? "/api/usuarios/chamados/atribuidos/" : "/api/usuarios/chamados/";
    try {
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
    fetchChamados();
  }, [activeView]);

  const atenderChamado = async () => {
    if (!chamadoSelecionado) return;
    setIsAtendendo(true);
    const token = localStorage.getItem("token");
    try {
      await api.post(`/api/usuarios/chamados/${chamadoSelecionado.id}/atender/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      exibirMensagem("Chamado atribuído com sucesso.");
      fetchChamados();
      setModalAberto(false);
    } catch (err) {
      exibirMensagem("Erro ao atender o chamado.");
    } finally {
      setIsAtendendo(false);
    }
  };

  const encerrarChamado = async () => {
    if (!chamadoSelecionado || !solucao.trim()) {
      exibirMensagem("Por favor, preencha a solução.");
      return;
    }
    setIsEncerrando(true);
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

    try {
      await api.post(`/api/usuarios/chamados/${chamadoSelecionado.id}/encerrar/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      exibirMensagem("Chamado encerrado com sucesso.");
      fetchChamados();
      setModalAberto(false);
    } catch (err) {
      exibirMensagem("Erro ao encerrar o chamado.");
    } finally {
      setIsEncerrando(false);
    }
  };

  const exibirMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const chamadosAtuais = chamados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(chamados.length / itemsPerPage);

  const changePage = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <DashboardLayout
      nomeUsuario={nomeUsuario}
      nomeDoSetor={nomeDoSetor}
      activeView={activeView}
      setActiveView={setActiveView}
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
            ) : chamados.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-gray-500 py-6">Nenhum chamado encontrado.</td></tr>
            ) : (
              chamadosAtuais.map((chamado) => {
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
                    <td className="py-2 text-orange-500">{chamado.prioridade}</td>
                    <td className="py-2">{chamado.setor_nome}</td>
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
        {/* Paginação */}
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => changePage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>

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

      {mensagem && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-xl border border-gray-300">
            {mensagem}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
