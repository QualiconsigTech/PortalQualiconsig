import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/services/api";
import ChamadosUsuarios from "@/components/portalQuali/portalUsuario/usuarios/ChamadosUsuarios";
import ChamadosUsuariosAdmin from "@/components/portalQuali/portalUsuario/usuariosAdmin/ChamadosUsuariosAdmin";
import Qlinks from "@/components/portalQuali/chamados/Qlinks";
import Dashboard from "@/components/portalQuali/chamados/dashboard";
import CadastroFuncionario from "@/components/portalQuali/chamados/CadastroFuncionario";
import PerguntasFrequentes from "@/components/portalQuali/chamados/PerguntasFrequentes";
import Ajuda from "@/components/portalQuali/chamados/Ajuda";
interface PortalUsuarioHomeProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  totalChamados: number;
  setTotalChamados: (total: number) => void;
}

export default function PortalUsuarioHome({
  activeView,
  setActiveView,
}: PortalUsuarioHomeProps) {
  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-gray-600 p-4">Carregando...</p>;

  const renderizarConteudo = () => {
    if (tipoUsuario === "usuario" && isAdmin) {
      switch (activeView) {
        case "dashboard":
          return <Dashboard />;
        case "qlinks":
          return <Qlinks />;
        case "cadastroUsuario":
          return <CadastroFuncionario />;
        case "faq":
          return <PerguntasFrequentes />;
        case "ajuda":
          return <Ajuda />;
        case "analistas":
        return <ChamadosUsuariosAdmin tipo="setor" />;
        case "meus":
          return <ChamadosUsuariosAdmin tipo="meus" />;
        default:
          return <ChamadosUsuariosAdmin tipo="meus" />;
        }
      }

    if (tipoUsuario === "usuario") {
      switch (activeView) {
        case "qlinks":
          return <Qlinks />;
        case "faq":
          return <PerguntasFrequentes />;
        case "ajuda":
          return <Ajuda />;
        case "meus":
        default:
          return <ChamadosUsuarios key={activeView} activeView={activeView}  />;
      }
    }

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#041161] mb-2">Área de Comercial</h1>
        <p className="text-gray-600">Conteúdo exclusivo para o grupo Comercial.</p>
      </div>
    );
  };

  return <div className="p-6">{renderizarConteudo()}</div>;
}