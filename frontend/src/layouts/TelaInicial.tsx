import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import FinanceiroHome from "@/components/financeiro/FinanceiroHome";
import PortalAnalistaHome from "@/components/portalQuali/analistas/PortalAnalistaHome";
import PortalUsuarioHome from "@/components/portalQuali/usuarios/PortalUsuarioHome";
import Qlinks from "@/components/portalQuali/chamados/Qlinks"
import { NotificacoesDropdown } from "@/components/portalQuali/chamados/NotificacoesDropdown";
import { api } from "@/services/api";
import { Chamado } from "@/utils/chamadoUtils";
import { ChamadoModal } from "@/components/portalQuali/chamados/ChamadoModal";


interface TelaInicialProps {
  nomeUsuario?: string;
}

export default function TelaInicial(props: TelaInicialProps) {

  const [grupos, setGrupos] = useState<string[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");
  const [subView, setSubView] = useState<string>("");
  const [sidebarAberto, setSidebarAberto] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string>("");
  const [nomeUsuario, setNomeUsuario] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [solucao, setSolucao] = useState("");
  const [tokenExpirado, setTokenExpirado] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalChamados, setTotalChamados] = useState(0);


  useEffect(() => {
    const storageGrupos = localStorage.getItem("grupos");
    if (storageGrupos) {
      try {
        const parsed = JSON.parse(storageGrupos);
        const gruposFixos = ["Portal de Chamados", "Qlinks"];
        const completos = [...gruposFixos, ...parsed];
        setGrupos(completos);
        setGrupoSelecionado("Portal de Chamados");
      } catch (error) {
        console.error("Erro ao parsear os grupos:", error);
      }
    }
    const fetchUserType = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token ausente");

        const response = await api.get("/api/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTipoUsuario(response.data.tipo);
        setIsAdmin(response.data.is_admin);
        setNomeUsuario(response.data.nome);
        localStorage.setItem("setor", response.data.setor);

        if (response.data.tipo === "analista" && !response.data.is_admin) {
          setSubView("meus");
        } else {
          setSubView("todos");
        }
      } catch (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
      }
    };

    fetchUserType();
  }, []);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refresh");
    const isAnalistaAdmin = localStorage.getItem("analista_admin") === "true";

    if (isAnalistaAdmin && refreshToken) {
      const renewToken = async () => {
        try {
          const response = await api.post("/api/auth/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          if (newAccessToken) {
            localStorage.setItem("token", newAccessToken);
            console.log("[AUTO REFRESH] Token renovado para analista_admin");
          }
        } catch (error) {
          console.error("[AUTO REFRESH] Erro ao renovar token:", error);
        }
      };

      renewToken();
    }
  }, []);
 
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

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

  useEffect(() => {
  const handleTokenExpired = () => setTokenExpirado(true);
  window.addEventListener("tokenExpired", handleTokenExpired);
  return () => window.removeEventListener("tokenExpired", handleTokenExpired);
}, []);

  const abrirChamadoGenerico = async (chamadoId: number, notificacaoId?: number) => {
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


  const abrirModalChamadosAnalista = (id: number, notificacaoId?: number) =>
    abrirChamadoGenerico(id, notificacaoId);

  const abrirModalChamadosUsuario = (id: number, notificacaoId?: number) =>
    abrirChamadoGenerico(id, notificacaoId);
  
  const subMenusTecnologiaAdmin = [
    "todos",
    "desenvolvimento",
    "dados",
    "suporte",
    "dashboard",
    "cadastroFuncionario"
  ];

  const subMenusTecnologiaAnalista = ["meus", "setor"];
  const subMenusComercialAdmin = [
    "meus",
    "analistas",
    "faq",
    "cadastroUsuario",
    "ajuda",
    "dashboard",
  ];

  const subMenusComercialUsuarios = ["meus", "ajuda", "faq"];

  const subMenusSuporteAnalista = ["meus", "setor", "inventario"];

  const getSubMenus = () => {
    if (grupoSelecionado === "Portal de Chamados") {
      if (tipoUsuario === "analista" && !isAdmin && nomeUsuario && nomeUsuario !== "") {
        // Verifica o setor com base no nome do usuário
        const setor = localStorage.getItem("setor"); // ou use outro estado se tiver
        if (setor === "Suporte") return subMenusSuporteAnalista;
        return subMenusTecnologiaAnalista;
      }
      if (tipoUsuario === "usuario" && !isAdmin) return subMenusComercialUsuarios;
      return isAdmin && tipoUsuario === "analista"
        ? subMenusTecnologiaAdmin
        : subMenusComercialAdmin;
    }
    return [];
  };
  

  const renderConteudo = () => {
    if (grupoSelecionado === "Portal de Chamados") {
      return tipoUsuario === "analista" ? (
        <PortalAnalistaHome
          activeView={subView}
          setActiveView={setSubView}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalChamados={totalChamados}
          setTotalChamados={setTotalChamados}
        />
      ) : (
        <PortalUsuarioHome
          activeView={subView}
          setActiveView={setSubView}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalChamados={totalChamados}
          setTotalChamados={setTotalChamados}
        />
      );
    }

    if (grupoSelecionado === "Financeiro") {
      return <FinanceiroHome />;
    }

    if (grupoSelecionado === "Qlinks") {
      return <Qlinks />;
    }


    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#041161] mb-2">
          Bem-vindo ao Portal Qualiconsig
        </h1>
        <p className="text-gray-600">Selecione uma área no menu lateral para começar.</p>
      </div>
    );
  };
  return (
  <div className="flex min-h-screen bg-[#f9f9fb]">
    {/* Sidebar */}
    <aside
      className={`bg-white shadow flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarAberto ? "w-64" : "w-0 md:w-20"
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        {sidebarAberto && (
          <h1 className="text-xl font-bold text-[#041161] whitespace-nowrap">Portal Qualiconsig</h1>
        )}
        <button
          onClick={() => setSidebarAberto(!sidebarAberto)}
          className="text-gray-600 hover:text-gray-900"
        >
          {sidebarAberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {sidebarAberto && (
        <div className="flex-1 flex flex-col items-center px-6 mt-12">
          <p className="text-sm text-black-500 font-semibold mb-2">MENU</p>
          <nav className="space-y-2 w-full">
            {grupos.map((grupo) => (
              <div key={grupo} className="w-full">
              <button
                onClick={() => setGrupoSelecionado(grupo)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  grupoSelecionado === grupo
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {grupo}
              </button>

                  {/* Submenus dinamicamente */}
                  {grupoSelecionado === grupo && (
                    <div className="pl-4 mt-2 space-y-1">
                      {getSubMenus().map((item) => (
                        <button
                          key={item}
                          onClick={() => setSubView(item)}
                          className={`w-full text-left px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                            subView === item
                              ? "bg-blue-100 text-blue-700"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          {{
                            cadastroFuncionario: "Cadastrar Analista",
                            cadastroUsuario: "Cadastrar Usuário",
                            meus: "Meus Chamados",
                            setor: "Chamados do Setor",
                            faq: "Perguntas Frequentes",
                            ajuda: "Ajuda",
                            analistas: "Analistas",
                            inventario: "Inventário",
                          }[item] || item.charAt(0).toUpperCase() + item.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
            ))}
          </nav>
        </div>
      )}

      {sidebarAberto && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> SAIR
          </button>
        </div>
      )}
    </aside>

    {/* Área principal */}
    <main className="flex-1 transition-all duration-300">
      <header className="bg-[#00247A] text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <img
          src="/images/Qualiconsig-Logo-branco-1-1024x341.png"
          alt="Logo Qualiconsig"
          className="h-15"
        />
      </div>
      <div className="flex items-center gap-4">
            <NotificacoesDropdown
              nomeUsuario={nomeUsuario}
              perfilUsuario={tipoUsuario}
              abrirModalChamadosAnalista={abrirModalChamadosAnalista}
              abrirModalChamadosUsuario={abrirModalChamadosUsuario}
            />
          </div>
    </header>
        {tokenExpirado && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-4">Tempo de acesso expirado</h2>
              <p className="text-sm text-gray-600 mb-6">
                Sua sessão foi encerrada. Por favor, clique em OK para fazer login novamente.
              </p>
              <button
                onClick={() => {
                  setTokenExpirado(false);
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {modalAberto && chamadoSelecionado && (
        <ChamadoModal
          chamado={chamadoSelecionado}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAtender={() => {}}
          onEncerrar={() => {}}
          podeAtender={true} 
          podeEncerrar={chamadoSelecionado.status !== "Encerrado"}
          solucao={solucao}
          comentarios={""}
          setSolucao={setSolucao}
          setComentarios={() => {}}
          anexos={null}
          setAnexos={() => {}}
          isAtendendo={false}
          isEncerrando={false}
          modoAdmin={true}
        />
      )}

      {/* Conteúdo dinâmico */}
      {renderConteudo()}
    </main>
  </div>
);
}
