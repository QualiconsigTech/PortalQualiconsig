import { ReactNode, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { getPerfilUsuario } from "@/utils/chamadoUtils";
import { api } from "@/services/api"; 


interface DashboardLayoutProps {
  children: ReactNode;
  nomeUsuario?: string;
  nomeDoSetor?: string;
  activeView?: string;
  setActiveView?: (view: string) => void;
  totalItems?: number;            
  itemsPerPage?: number;           
  onPageChange?: (page: number) => void;
  
}

export default function DashboardLayout({
  children,
  nomeUsuario = "Usuário",
  nomeDoSetor = "Setor",
  activeView = "meus",
  setActiveView,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  // Novo: estados locais para o tipo e admin
    const [tipoUsuario, setTipoUsuario] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
    // Novo: buscar o usuário na primeira montagem
    useEffect(() => {
      async function fetchUsuario() {
        try {
          const { data } = await api.get("/api/usuarios/me/");
          setTipoUsuario(data.tipo || "");
          setIsAdmin(data.is_admin || false);
        } catch (error) {
          console.error("Erro ao buscar dados do usuário", error);
        }
      }
  
      fetchUsuario();
    }, []);
  
    const perfilUsuario = getPerfilUsuario({ tipo: tipoUsuario, is_admin: isAdmin });
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
 
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page); 

   
  };
  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      <aside className="w-64 bg-white shadow flex flex-col">
        <div className="px-10 pt-12 pb-2">
          <h1 className="text-xl font-bold text-[#041161]">Portal Qualiconsig</h1>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 mt-12">
          <p className="text-sm text-black-500 font-semibold mb-2">MENU</p>

          <nav className="space-y-2">
            {/* MENU PARA ANALISTA ADMIN */}
            {perfilUsuario === "analista_admin" && (
              <>
                <button
                  onClick={() => setActiveView?.("todos")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "todos" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Todos Chamados
                </button>
                <button
                  onClick={() => setActiveView?.("desenvolvimento")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "desenvolvimento" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Desenvolvimento
                </button>
                <button
                  onClick={() => setActiveView?.("dados")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "dados" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Dados
                </button>
                <button
                  onClick={() => setActiveView?.("suporte")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "suporte" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Suporte
                </button>
              </>
            )}
            {/* MENU PARA USUÁRIO ADMIN */}
            {perfilUsuario === "usuario_admin" && (
              <>
                <button
                  onClick={() => setActiveView?.("meus")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "meus" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Meus Chamados
                </button>
                <button
                  onClick={() => setActiveView?.("analistas")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "analistas" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Analistas
                </button>
                <button
                  onClick={() => setActiveView?.("faq")}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700"
                >
                  Perguntas Frequentes
                </button>
              </>
            )}

            {/* MENU PARA ANALISTA COMUM */}
            {perfilUsuario === "analista" && (
              <>
                <button
                  onClick={() => setActiveView?.("meus")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "meus" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Meus Chamados
                </button>                
                {nomeDoSetor && (
                  <button
                    onClick={() => setActiveView?.("setor")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === "setor" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {nomeDoSetor}
                  </button>
                )}
              </>
            )}
            {/* MENU PARA USUÁRIO COMUM */}
            {perfilUsuario === "usuario" && (
                  <>
                    <button
                      onClick={() => setActiveView?.("meus")}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeView === "meus" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Meus Chamados
                    </button>
                    <button
                      onClick={() => setActiveView?.("faq")}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeView === "faq" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Perguntas Frequentes
                    </button>
                  </>
                )}
          </nav>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> SAIR
          </button>
        </div>
      </aside>

      <main className="flex-1">
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

        <div className="p-6">
          {children}

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
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
        </div>
      </main>
    </div>
  );
}

