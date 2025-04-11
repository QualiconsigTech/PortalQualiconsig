import { useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/services/api";
import { TableOfContents } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { ChamadoModal } from "@/components/ChamadoModal";
import { Chamado, getStatus } from "@/utils/chamadoUtils";

export default function ChamadosAnalistasAdmin() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedChamados = chamados.slice(indexOfFirstItem, indexOfLastItem);
  const [activeView, setActiveView] = useState("todos");

  const buscarChamados = async (rota: string) => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const response = await api.get(rota, {
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
    handleFiltro("todos");
  }, []);
  const handleFiltro = (filtro: string) => {
    setActiveView(filtro);
    if (filtro === "todos") {
      buscarChamados("/api/usuarios/chamados/admin/");
    } else {
      buscarChamados(`/api/usuarios/chamados/admin/${filtro}/`);
    }
  };

  const exibirMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  };
 
  const changePage = (page: number) => {
    setCurrentPage(page);
  };
  return (
    <DashboardLayout 
    isAdmin 
    activeView={activeView} 
    setActiveView={handleFiltro} 
    totalItems={chamados.length} 
    itemsPerPage={itemsPerPage}             
    onPageChange={(page) => setCurrentPage(page)}
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
                    <td className="py-2">{chamado.titulo}</td>
                    <td className="py-2">{chamado.categoria_nome}</td>
                    <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                    <td className="py-2 text-orange-500">{chamado.prioridade_nome}</td>
                    <td className="py-2">{chamado.setor_nome}</td>
                    <td className="py-2">{chamado.analista ? chamado.analista.nome : "Não atribuído"}</td>
                    <td className="py-2">{chamado.usuario ? chamado.usuario.nome : "Não informado"}</td>
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
    </DashboardLayout>
  );
}
