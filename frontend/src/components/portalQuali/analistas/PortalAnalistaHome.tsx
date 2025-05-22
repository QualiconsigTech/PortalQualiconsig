import { useEffect, useState } from "react";
import ChamadosAnalistasAdmin from "@/components/portalQuali/portalAnalista/analistasAdmin/ChamadosAnalistasAdmin";
import ChamadosAnalistas from "@/components/portalQuali/portalAnalista/analistas/ChamadosAnalistas";
import Qlinks from "@/components/portalQuali/chamados/Qlinks";
import Dashboard from "@/components/portalQuali/chamados/dashboard";
import CadastroFuncionario from "@/components/portalQuali/chamados/CadastroFuncionario";
import { api } from "@/services/api";
import { useRouter } from "next/router";
import { ChamadoModal } from "@/components/portalQuali/chamados/ChamadoModal";
import { NotificacoesDropdown } from "@/components/portalQuali/chamados/NotificacoesDropdown";
import { Chamado } from "@/utils/chamadoUtils";

interface PortalAnalistaHomeProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalChamados: number;
  setTotalChamados: (total: number) => void;
}
export default function PortalAnalistaHome({
  activeView,
  setActiveView,
}: PortalAnalistaHomeProps) {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [nomeUsuario, setNomeUsuario] = useState<string>("Usuário");
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");

  const redirecionarParaLogin = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return redirecionarParaLogin();

    try {
      const { data } = await api.get("/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNomeUsuario(data.nome);
      setTipoUsuario(data.tipo);
      setIsAdmin(data.is_admin);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        redirecionarParaLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  const abrirModalChamado = async (chamadoId: number, notificacaoId?: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await api.get(`/api/chamados/${chamadoId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setChamadoSelecionado(data);
      setSolucao(data.solucao || "");
      setModalAberto(true);

      if (notificacaoId) {
        await api.post(`/api/chamados/notificacoes/${notificacaoId}/visualizar/`);
      }
    } catch (error) {
      console.error("Erro ao abrir chamado:", error);
    }
  };

  if (loading) return <p className="text-gray-600 p-4">Carregando...</p>;

  const renderizarConteudo = () => {
  if (tipoUsuario === "analista" && isAdmin) {
    switch (activeView) {
      case "todos":
      case "desenvolvimento":
      case "dados":
      case "suporte":
        return (
            <ChamadosAnalistasAdmin activeView={activeView} setActiveView={setActiveView} />
          );
      case "qlinks":
        return <Qlinks />;
      case "dashboard":
        return <Dashboard />;
      case "cadastroFuncionario":
        return <CadastroFuncionario />;
      default:
        return <p className="text-gray-600">Selecione uma opção do menu.</p>;
    }
  }

  if (tipoUsuario === "analista") {
      switch (activeView) {
        case "meus":
        case "setor":
            return <ChamadosAnalistas key={activeView} activeView={activeView} />;
        case "qlinks":
          return <Qlinks />;
        default:
          return <p className="text-gray-600">Você não tem permissão para visualizar esta seção.</p>;
      }
    }

    return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold text-[#041161] mb-2">Área de Tecnologia</h1>
      <p className="text-gray-600">Conteúdo exclusivo para o grupo de Tecnologia.</p>
    </div>
  );
};

  return (
    <div className="p-6">
      {renderizarConteudo()}

      {modalAberto && chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={() => {}}
          onEncerrar={() => {}}
          podeAtender={tipoUsuario !== "usuario"}
          podeEncerrar={
            tipoUsuario !== "usuario" &&
            chamadoSelecionado.status !== "Encerrado"
          }
          solucao={solucao}
          setSolucao={setSolucao}
          comentarios=""
          setComentarios={() => {}}
          anexos={null}
          setAnexos={() => {}}
          isAtendendo={false}
          isEncerrando={false}
          modoAdmin={tipoUsuario !== "usuario"}
        />
      )}
    </div>
  );
}
