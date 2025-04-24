import React, { ReactNode, useEffect, useState } from "react";
import { LogOut, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import { getPerfilUsuario } from "@/utils/chamadoUtils";
import { api } from "@/services/api"; 
import PerguntasFrequentes from "@/components/PerguntasFrequentes";
import { motion, AnimatePresence } from "framer-motion";
import { ChamadoModal } from "@/components/ChamadoModal";
import { Produtos } from "@/components/Produtos";
import CadastroFuncionario from "@/components/CadastroFuncionario";

interface Notificacao {
  id: number;
  mensagem: string;
  visualizado: boolean;
  criado_em: string;
  chamado_id: number;
}

interface DashboardLayoutProps {
  children: ReactNode;
  nomeUsuario?: string;
  nomeDoSetor?: string;
  activeView?: string;
  setActiveView?: (view: string) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  setChamadoSelecionado?: (chamado: any) => void;
  setModalAberto?: (aberto: boolean) => void;
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  const {
    children,
    nomeUsuario = "Usuário",
    nomeDoSetor = "Setor",
    activeView = "meus",
    setActiveView,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    setChamadoSelecionado: externalSetChamadoSelecionado,
    setModalAberto: externalSetModalAberto,
  } = props;

  const router = useRouter();
  const [sidebarAberto, setSidebarAberto] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<any>(null);
  const [setorUsuario, setSetorUsuario] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [usarProduto, setUsarProduto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null);
  const [quantidadeUsada, setQuantidadeUsada] = useState(1);


  const fetchUsuario = async () => {
    try {
      const { data } = await api.get("/api/usuarios/me/");
      setTipoUsuario(data.tipo || "");
      setIsAdmin(data.is_admin || false);
      setSetorUsuario(data.setor || "");
    } catch (error) {
      console.error("Erro ao buscar dados do usuário", error);
    }
  };
 
  const fetchNotificacoes = async () => {
    try {
      const { data } = await api.get("/api/chamados/notificacoes/");
      setNotificacoes(data);
    } catch (error) {
      console.error("Erro ao buscar notificações", error);
    }
  };

    useEffect(() => {
    fetchUsuario();
    fetchNotificacoes();
  
    const interval = setInterval(fetchNotificacoes, 5000); 
  
    return () => clearInterval(interval); 
  }, []);
  
  const perfilUsuario = getPerfilUsuario({ tipo: tipoUsuario, is_admin: isAdmin });

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
  
    function handleClickOutside(event: MouseEvent) {
      const botao = document.getElementById("botao-notificacao");
      const menu = document.getElementById("menu-notificacao");
  
      if (
        botao && menu && !botao.contains(event.target as Node) && !menu.contains(event.target as Node)
      ) {
        setMostrarNotificacoes(false);
      }
    }
  
    function startAutoClose() {
      timeout = setTimeout(() => {
        setMostrarNotificacoes(false);
      }, 5000); 
    }
  
    if (mostrarNotificacoes) {
      document.addEventListener("mousedown", handleClickOutside);
      startAutoClose();
    }
  
    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mostrarNotificacoes]);
  

  const totalPages = Math.ceil(totalItems / itemsPerPage);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };
  
  
  const marcarNotificacaoComoLida = async (id: number) => {
    try {
      await api.post(`/api/chamados/notificacoes/${id}/visualizar/`);
      setNotificacoes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, visualizado: true } : n
        )
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida", error);
    }
  };
  
  const marcarTodasComoLidas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      await api.post("/api/chamados/notificacoes/marcar-todas/", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setNotificacoes((prev) =>
        prev.map((n) => ({ ...n, visualizado: true }))
      );

      setTimeout(() => {
        setNotificacoes((prev) =>
          prev.filter((n) => !n.visualizado)
        );
      }, 5000); 
      
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas", error);
    }
  };
  
  const abrirModalChamadosUsuario = async (chamadoId: number, notificacaoId?: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const { data } = await api.get(`/api/chamados/${chamadoId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setChamadoSelecionado(data);
      setModalAberto(true);
  
      if (notificacaoId) await marcarNotificacaoComoLida(notificacaoId);
    } catch (error) {
      console.error("Erro ao abrir modal de chamado do USUÁRIO:", error);
    }
  };
  
  const abrirModalChamadosAnalista = async (chamadoId: number, notificacaoId?: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const { data } = await api.get(`/api/usuarios/chamados/${chamadoId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setChamadoSelecionado(data);
      setModalAberto(true);
  
      if (notificacaoId) await marcarNotificacaoComoLida(notificacaoId);
    } catch (error) {
      console.error("Erro ao abrir modal de chamado do ANALISTA:", error);
    }
  };
  
  
  const notificacoesNaoLidas = notificacoes.filter((n) => !n.visualizado);

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
          <button onClick={() => setSidebarAberto(!sidebarAberto)} className="text-gray-600 hover:text-gray-900">
            {sidebarAberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        {sidebarAberto && (

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
                <button
                  onClick={() => setActiveView?.("cadastroFuncionario")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "cadastroFuncionario" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Cadastrar Analista
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
                <button
                  onClick={() => setActiveView?.("cadastroFuncionario")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "cadastroFuncionario" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Cadastrar Usuário
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

                {/* Só mostra para analistas do setor Suporte */}
                {setorUsuario === "Suporte" && (
                  <button
                    onClick={() => setActiveView?.("produtos")}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeView === "produtos" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Produtos
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

      <main className="flex-1 transition-all duration-300">
        <header className="bg-[#00247A] text-white px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
          <img src="/images/Qualiconsig-Logo-branco-1-1024x341.png" alt="Logo Qualiconsig" className="h-15" />
          </div>
          <div className="flex items-center gap-4 relative">
          {/* NOTIFICAÇÕES */}  
            <button
              id="botao-notificacao"
              className="relative"
              onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
            >
              <Bell className="w-6 h-6" />
              {notificacoesNaoLidas.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {notificacoesNaoLidas.length}
                </span>
              )}
            </button>
            <p className="text-white">Olá, {nomeUsuario}</p>
           
            {mostrarNotificacoes && (
              <AnimatePresence>
                <motion.div
                  id="menu-notificacao"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-white text-black rounded shadow-md z-50 max-h-80 overflow-y-auto scrollbar-hide"
                  style={{ 
                    minWidth: "20rem",
                    scrollbarWidth: "none", 
                    msOverflowStyle: "none", 
                  }}
                >
                  <style jsx>{`#menu-notificacao::-webkit-scrollbar {display: none;}`}</style>
                  <div className="flex items-center justify-between p-4 font-bold border-b">
                    <span>Notificações</span>
                    {notificacoes.length > 0 && (
                      <button
                      onClick={async () => {
                        await Promise.all(
                          notificacoesNaoLidas.map(n => marcarNotificacaoComoLida(n.id))
                        );
                      }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  {notificacoes.length === 0 ? (
                    <div className="p-4 text-sm">Nenhuma notificação</div>
                  ) : (
                    notificacoes.map((n, index) => (
                      <div
                        key={index}
                        onClick={async () => {
                          console.log("Clicou na notificação:", n.chamado_id, n.id);
                          console.log("Usuario:", perfilUsuario);
                        
                          if (perfilUsuario === "analista" || perfilUsuario === "analista_admin") {
                            await abrirModalChamadosAnalista(n.chamado_id, n.id);
                          } else {
                            await abrirModalChamadosUsuario(n.chamado_id, n.id);
                          }
                        }}                        
                        className={`flex items-start gap-2 p-4 text-sm border-b cursor-pointer transition-all ${
                          n.visualizado
                            ? "bg-gray-100 text-gray-500"
                            : "bg-white hover:bg-blue-50 text-gray-800 font-semibold"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="break-words">{n.mensagem}</span>
                            {!n.visualizado && (
                              <span className="text-[10px] text-white bg-red-500 px-2 py-0.5 rounded-full ml-2">
                                Nova
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.criado_em).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </header>

        <div className="p-6">
          {activeView === "cadastroFuncionario" ? (
            <CadastroFuncionario />
          ) : activeView === "faq" ? (
            <PerguntasFrequentes />
          ) : activeView === "produtos" ? (
            <Produtos aberto={true} onClose={() => setActiveView?.("meus")} />
          ) : (
            <>
              {React.isValidElement(children)
                ? React.cloneElement(children as React.ReactElement<any>, {
                    refetchNotificacoes: fetchNotificacoes,
                  })
                : children}

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
            </>
          )}
        </div>


        {modalAberto && chamadoSelecionado && (
            <ChamadoModal
            chamado={chamadoSelecionado}
            aberto={modalAberto}
            onClose={() => setModalAberto(false)}
            onAtender={() => {}}
            onEncerrar={() => {}}
            podeAtender={perfilUsuario !== "usuario"}
            podeEncerrar={perfilUsuario !== "usuario"}
            solucao={""}
            comentarios={""}
            setSolucao={() => {}}
            setComentarios={() => {}}
            anexos={null}
            setAnexos={() => {}}
            isAtendendo={false}
            isEncerrando={false}
            modoAdmin={perfilUsuario !== "usuario"}
            usarProduto={usarProduto}
            setUsarProduto={setUsarProduto}
            produtoSelecionado={produtoSelecionado}
            setProdutoSelecionado={setProdutoSelecionado}
            quantidadeUsada={quantidadeUsada}
            setQuantidadeUsada={setQuantidadeUsada}
            />
          )}
      </main>
    </div>
  );
}
