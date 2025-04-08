import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { TableOfContents } from "lucide-react";
import { api } from "@/services/api";
import { format } from "date-fns";
import { AbrirChamadoModal } from "@/components/AbrirChamadoModal";
import { toBase64 } from "@/utils/chamadoUtils";

export default function ChamadosUsuariosAdmin() {
  const [chamados, setChamados] = useState<any[]>([]);
  const [abrirModalAberto, setAbrirModalAberto] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("meus");
  
  const fetchChamados = async (url: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setChamados(response.data);
    } catch (error) {
      console.error("Erro ao buscar chamados", error);
    }
  };
  
  // Quando a tela carregar, busca inicialmente "Meus Chamados"
  useEffect(() => {
    fetchChamados("/api/usuarios/chamados/meus/");
  }, []);
  
  // Quando o botão mudar (meus ou analistas), altera a consulta
  useEffect(() => {
    if (activeView === "meus") {
      fetchChamados("/api/usuarios/chamados/meus/");
    }
    if (activeView === "analistas") {
      fetchChamados("/api/usuarios/chamados/setor/");
    }
  }, [activeView]);
  

  const exibirMensagem = (texto: string) => {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  };

  const handleSalvarChamado = async (dados: {
    titulo: string;
    categoria: string;
    prioridade: string;
    gravidade: string;
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
        categoria_nome: dados.categoria,
        prioridade: dados.prioridade,
        gravidade: dados.gravidade,
        descricao: dados.descricao,
        arquivos: JSON.stringify(arquivosBase64),
      };

      await api.post("/api/usuarios/chamados/", payload, {
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

  return (
    <DashboardLayout isUsuarioAdmin activeView={activeView} setActiveView={setActiveView}>
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
              <th className="py-2">N° Chamado</th>
              <th className="py-2">Titulo</th>
              <th className="py-2">Status</th>
              <th className="py-2">Prioridade</th>
              <th className="py-2">Atribuído</th>
              <th className="py-2">Setor</th>
              <th className="py-2">Data</th>
              <th className="py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {chamados.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  Nenhum chamado encontrado.
                </td>
              </tr>
            ) : (
              chamados.map((chamado) => (
                <tr key={chamado.id} className="border-t hover:bg-gray-50">
                  <td className="py-2">{chamado.id}</td>
                  <td className="py-2">{chamado.titulo}</td>
                  <td className="py-2">{chamado.status ?? "Aberto"}</td>
                  <td className="py-2">{chamado.prioridade}</td>
                  <td className="py-2">{chamado.analista?.nome || "Não atribuído"}</td>
                  <td className="py-2">{chamado.setor?.nome || "--"}</td>
                  <td className="py-2">{format(new Date(chamado.criado_em), "dd/MM/yy")}</td>
                  <td className="py-2">
                    <button
                      onClick={() => {
                        // abrir modal de detalhes (próxima fase)
                      }}
                      className="text-gray-700 hover:text-blue-900 transition-colors"
                      title="Visualizar detalhes"
                    >
                      <TableOfContents size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <AbrirChamadoModal
        aberto={abrirModalAberto}
        onClose={() => setAbrirModalAberto(false)}
        onSalvar={handleSalvarChamado}
      />

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
