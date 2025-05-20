import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import FinanceiroHome from "@/components/financeiro/FinanceiroHome";
import TecnologiaHome from "@/components/tecnologia/TecnologiaHome";
import ComercialHome from "@/components/comercial/ComercialHome";
import { api } from "@/services/api";
interface TelaInicialProps {
  nomeUsuario?: string;
}

export default function TelaInicial(props: TelaInicialProps) {

  const {nomeUsuario = "Usuario"} = props;
  const [grupos, setGrupos] = useState<string[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");
  const [subView, setSubView] = useState<string>("");
  const [sidebarAberto, setSidebarAberto] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const storageGrupos = localStorage.getItem("grupos");
    if (storageGrupos) {
      try {
        const parsed = JSON.parse(storageGrupos);
        setGrupos(parsed);
        if (parsed.length > 0) setGrupoSelecionado(parsed[0]);
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

        // Subview padrão
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
 
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("grupos");
    window.location.href = "/login";
  };

  
  const subMenusTecnologiaAdmin = [
    "todos",
    "desenvolvimento",
    "dados",
    "suporte",
    "qlinks",
    "dashboard",
    "cadastroFuncionario"
  ];

  const subMenusTecnologiaAnalista = ["meus", "setor", "qlinks"];
  const subMenusComercialAdmin = [
    "meus",
    "analistas",
    "faq",
    "cadastroUsuario",
    "ajuda",
    "qlinks",
    "dashboard",
  ];

  const subMenusComercialUsuarios = ["meus", "qlinks", "ajuda", "faq"];


  const getSubMenus = () => { if (grupoSelecionado === "Tecnologia") {
      if (tipoUsuario === "analista" && !isAdmin) return subMenusTecnologiaAnalista;
      return subMenusTecnologiaAdmin;
    }

    if (grupoSelecionado === "Comercial") {
      if (tipoUsuario === "usuario" && !isAdmin) return subMenusComercialUsuarios;
      return subMenusComercialAdmin;
    }

    return [];
  };

  const renderConteudo = () => {
    if (grupoSelecionado === "Tecnologia") {
      return <TecnologiaHome activeView={subView} setActiveView={setSubView} />;
    }

    if (grupoSelecionado === "Financeiro") {
      return <FinanceiroHome />;
    }

    if (grupoSelecionado === "Comercial") {
      return <ComercialHome activeView={subView} setActiveView={setSubView} />;
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
              {/* Submenus Tecnologia */}
                  {grupoSelecionado === "Tecnologia" && grupo === "Tecnologia" && (
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
                          {item === "cadastroFuncionario"
                            ? "Cadastrar Analista"
                            : item === "meus"
                            ? "Meus Chamados"
                            : item === "setor"
                            ? "Chamados do Setor"
                            : item.charAt(0).toUpperCase() + item.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Submenus Comercial */}
                  {grupoSelecionado === "Comercial" && grupo === "Comercial" && (
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
                          {item === "cadastroUsuario"
                            ? "Cadastrar Usuário"
                            : item === "meus"
                            ? "Meus Chamados"
                            : item === "faq"
                            ? "Perguntas Frequentes"
                            : item === "ajuda"
                            ? "Ajuda"
                            : item === "analistas"
                            ? "Analistas"
                            : item.charAt(0).toUpperCase() + item.slice(1)}
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
        <p className="text-white">Olá, {nomeUsuario}</p>
      </header>

      {/* Conteúdo dinâmico */}
      {renderConteudo()}
    </main>
  </div>
);
}
