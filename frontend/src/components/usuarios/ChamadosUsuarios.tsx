import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { TableOfContents } from "lucide-react";
import { api } from "@/services/api";
import { format } from "date-fns";
import { AbrirChamadoModal } from "@/components/AbrirChamadoModal";
import { ChamadoModal } from "@/components/ChamadoModal";
import { getStatus, toBase64 } from "@/utils/chamadoUtils";
import { Chamado } from "@/types/Chamado";

export default function ChamadosUsuarios() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [abrirModalAberto, setAbrirModalAberto] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [categorias, setCategorias] = useState([]);
  const [setores, setSetores] = useState([])
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedChamados = chamados.slice(indexOfFirstItem, indexOfLastItem);

  const fetchChamados = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      setErro(null);

      const response = await api.get("/api/usuarios/chamados/meus/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const ordenado = [...response.data].sort((a, b) => {
        const statusOrder = { "Aberto": 1, "Em Atendimento": 2, "Encerrado": 3 };
        return statusOrder[getStatus(a).texto] - statusOrder[getStatus(b).texto];
      });

      setChamados(ordenado);
    } catch (error) {
      console.error("Erro ao buscar chamados", error);
      setErro("Erro ao buscar chamados");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await api.get("/api/usuarios/categorias/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias", error);
    }
  };

    const fetchSetores = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await api.get("/api/usuarios/setores/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSetores(response.data);
      } catch (error) {
        console.error("Erro ao buscar setores", error);
      }
    };

  useEffect(() => {
    fetchChamados();
    fetchCategorias();
    fetchSetores();
  }, []);

  const exibirMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  };

  const handleSalvarChamado = async (dados: {
    titulo: string;
    categoria: string;
    prioridade: string;
    setor: number;
    descricao: string;
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

      exibirMensagem("Chamado aberto com sucesso!");
      setAbrirModalAberto(false);
      fetchChamados();
    } catch (error) {
      exibirMensagem("Erro ao abrir chamado.");
      console.error(error);
    }
  };

  const abrirModalChamado = (chamado: Chamado) => {
    setChamadoSelecionado(chamado);
    setSolucao(chamado.solucao || "");
    setComentarios(chamado.comentarios || "");
    setModalAberto(true);
  };

  return (
    <DashboardLayout
      totalItems={chamados.length} 
      itemsPerPage={itemsPerPage}             
      onPageChange={(page) => setCurrentPage(page)} 
      >
      {/* Botão Novo Chamado */}
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
              <th className="py-2">Nº Chamado</th>
              <th className="py-2">Título</th>
              <th className="py-2">Status</th>
              <th className="py-2">Prioridade</th>
              <th className="py-2">Data</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6">Carregando chamados...</td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan={6} className="text-center text-red-500 py-6">{erro}</td>
              </tr>
            ) : paginatedChamados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-6">Nenhum chamado encontrado.</td>
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
                    <td className="py-2 text-orange-500">{chamado.prioridade}</td>
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

      <AbrirChamadoModal
        aberto={abrirModalAberto}
        onClose={() => setAbrirModalAberto(false)}
        onSalvar={handleSalvarChamado}
        categorias={categorias}
        setores={setores}
      />

      {chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={() => {}}
          onEncerrar={() => {}}
          podeAtender={false}
          podeEncerrar={false}
          solucao={solucao}
          comentarios={comentarios}
          setSolucao={setSolucao}
          setComentarios={setComentarios}
          anexos={anexos}
          setAnexos={setAnexos}
          isAtendendo={false}
          isEncerrando={false}
          modoAdmin={false}
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
