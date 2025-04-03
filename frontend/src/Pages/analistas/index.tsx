import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { api } from "@/services/api";
import { LogOut, LayoutList, TableOfContents } from "lucide-react";
import { Rethink_Sans } from "next/font/google";


interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  gravidade: string;
  criado_em: string;
  categoria_nome: string;
  setor_nome: string;
  usuario: {
    id: number;
    nome: string;
  };
  analista: {
    id: number;
    nome: string;
  } | null;
  encerrado_em: string | null;
  solucao?: string;
  comentarios?: string;
  arquivos?: string;

}

export default function ChamadosAnalista() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("meus");
  const [nomeDoSetor, setNomeDoSetor] = useState<string>("Setor");
  const [nomeUsuario, setNomeUsuario] = useState<string>("");
  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null);
  const [isAtendendo, setIsAtendendo] = useState(false);
  const [isEncerrando, setIsEncerrando] = useState(false);
  const router = useRouter();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [solucao, setSolucao] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);

  


   useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const fetchSetor = async () => {
        try {
          const response = await api.get("/api/usuarios/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data?.setor) {
            setNomeDoSetor(response.data.setor);
            setNomeUsuario(response.data.nome);
          }
        } catch (error) {
          console.error("Erro ao buscar setor:", error);
        }
      };
  
      fetchSetor();
    }, []);
  
    useEffect(() => {
      const fetchChamados = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
    
        setLoading(true);
        let url = "";
    
        if (activeView === "meus") {
          url = "/api/usuarios/chamados/atribuidos/";
        } else if (activeView === "setor") {
          url = "/api/usuarios/chamados/";
        }
    
        try {
          const response = await api.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setChamados(response.data);
        } catch (err) {
          setErro("Erro ao carregar chamados.");
        } finally {
          setLoading(false);
        }
      };
    
      fetchChamados();
    }, [router, activeView]);
    

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleOpenModal = (chamado: Chamado) => {
    setChamadoSelecionado(chamado);
    setSolucao(chamado.solucao || "");
    setComentarios(chamado.comentarios || "");
    setAnexos(null); 
    setModalAberto(true);
  };

  const handleCloseModal = () => {
    setModalAberto(false);
    setChamadoSelecionado(null);
  };

  const getStatus = (chamado: Chamado) => {
    if (!chamado.analista) {
      return { texto: "Aberto", cor: "text-green-600" };
    }
    if (chamado.analista && !chamado.encerrado_em) {
      return { texto: "Em Atendimento", cor: "text-yellow-500" };
    }
    if (chamado.analista && chamado.encerrado_em) {
      return { texto: "Encerrado", cor: "text-black" };
    }
    return { texto: "Desconhecido", cor: "text-gray-500" };
  };
  
  const atenderChamado = async () => {
      if (!chamadoSelecionado) return;
      setIsAtendendo(true);
      const token = localStorage.getItem("token");
  
      try {
        await api.post(`/api/usuarios/chamados/${chamadoSelecionado.id}/atender/`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        exibirMensagem("Chamado atribuído com sucesso.");
        handleCloseModal();
        router.reload();
      } catch (err) {
        exibirMensagem("Erro ao atender o chamado.");
        console.error(err);
      } finally {
        setIsAtendendo(false);
      }
    };
  
    const encerrarChamado = async () => {
      if (!chamadoSelecionado) return;
    
      if (!solucao.trim()) {
        exibirMensagem("Por favor, preencha a solução antes de encerrar o chamado.");
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
        arquivos: JSON.stringify(base64Arquivos), // <- muito importante!
      };

    
      try {
        await api.post(
          `/api/usuarios/chamados/${chamadoSelecionado.id}/encerrar/`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        exibirMensagem("Chamado encerrado com sucesso.");
        handleCloseModal();
        router.reload();
      } catch (err) {
        exibirMensagem("Erro ao encerrar o chamado.");
        console.error(err);
      } finally {
        setIsEncerrando(false);
      }
    };
    
    const toBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // isso já inclui o `data:<tipo>;base64,...`
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    };
    
    const base64ToBlob = (base64: string, contentType = "application/octet-stream") => {
      const byteCharacters = atob(base64);
      const byteArrays = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays[i] = byteCharacters.charCodeAt(i);
      }
      return new Blob([byteArrays], { type: contentType });
    };
    
      const exibirMensagem = (texto: string) => {
      setMensagem(texto);
    
      setTimeout(() => {
        setMensagem(null);
        handleCloseModal(); 
      }, 4000); 
    };

    const statusSelecionado = chamadoSelecionado ? getStatus(chamadoSelecionado) : null;
    const podeAtender = statusSelecionado?.texto === "Aberto";
    const podeEncerrar = statusSelecionado?.texto === "Aberto" || statusSelecionado?.texto === "Em Atendimento";
   

  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      <aside className="w-64 bg-white shadow flex flex-col">
          {/* TOPO - Logo e Título */}
          <div className="px-10 pt-12 pb-2">
            <h1 className="text-xl font-bold text-[#041161]">Portal Qualiconsig</h1>
          </div>

          {/* Conteúdo central alinhado com o conteúdo da tabela */}
          <div className="flex-1 flex flex-col items-center px-6 mt-12">
            <p className="text-sm text-black-500 font-semibold mb-2">MENU</p>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveView("meus")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === "meus" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                Meus Chamados
              </button>

              {nomeDoSetor && (
                <button
                  onClick={() => setActiveView("setor")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === "setor" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {nomeDoSetor}
                </button>
              )}
            </nav>
          </div>

          {/* Rodapé - Botão de sair */}
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} /> SAIR
            </button>
          </div>
        </aside>




      <main className="flex-1 p-6">
          <header className="bg-[#00247A] text-white px-6 py-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <img 
                src="/images/Qualiconsig-Logo-branco-1-1024x341.png"
                alt="Logo Qualiconsig" 
                className="h-15"
              />
            </div>

            <div>
            <p className="text-white">Olá, {nomeUsuario}</p>
            </div>
          </header>

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
                <tr><td colSpan={4} className="py-6 text-center">Carregando chamados...</td></tr>
              ) : erro ? (
                <tr><td colSpan={4} className="py-6 text-center text-red-500">{erro}</td></tr>
              ) : chamados.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-500">Nenhum chamado encontrado.</td></tr>
              ) : (
                chamados.map((chamado) => {
                  const status = getStatus(chamado);
                  return (
                    <tr key={chamado.id} className="border-t hover:bg-gray-50 cursor-pointer" onDoubleClick={() => handleOpenModal(chamado)}>
                      <td className="py-2">{chamado.titulo}</td>
                      <td className="py-2">{chamado.categoria_nome}</td>
                      <td className={`py-2 font-semibold ${status.cor}`}>{status.texto}</td>
                      <td className="py-2 text-orange-500">{chamado.prioridade}</td>
                      <td className="py-2">{chamado.setor_nome}</td>
                      <td>{format(new Date(chamado.criado_em), "dd/MM/yy")}</td>
                      <td className="py-2">
                          <button
                            onClick={() => handleOpenModal(chamado)}
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
              <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                   <h2 className="text-xl font-bold">Detalhes do Chamado</h2>
                   <button onClick={handleCloseModal} className="text-gray-600 hover:text-red-600">✕</button>
                 </div>
   
                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <div><strong>Título:</strong> {chamadoSelecionado.titulo}</div>
                   <div><strong>Nº Chamado:</strong> #{chamadoSelecionado.id}</div>
                   <div><strong>Categoria:</strong> {chamadoSelecionado.categoria_nome}</div>
                   <div><strong>Data de abertura:</strong> {format(new Date(chamadoSelecionado.criado_em), "dd/MM/yyyy")}</div>
                   <div><strong>Status:</strong> {getStatus(chamadoSelecionado).texto}</div>
                   <div><strong>Usuário:</strong> {chamadoSelecionado.usuario.nome || "não informado"}</div>
                   <div><strong>Prioridade:</strong> {chamadoSelecionado.prioridade}</div>
                   <div><strong>Gravidade:</strong> {chamadoSelecionado.gravidade}</div>
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Descrição:</label>
                   <textarea value={chamadoSelecionado.descricao} readOnly className="w-full border rounded p-2 bg-gray-100" rows={3} />
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Solução:</label>
                   <textarea value={solucao} onChange={(e) => setSolucao(e.target.value)} readOnly={statusSelecionado?.texto === "Encerrado"} className="w-full border rounded p-2 bg-gray-100"
/>
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Comentários:</label>
                   <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} readOnly={statusSelecionado?.texto === "Encerrado"} className="w-full border rounded p-2 bg-gray-100"
/>
                 </div>
                 <div className="mb-4">
                  <label className="block font-semibold mb-1">Arquivos Anexados:</label>

                  {/* Exibição de arquivos já anexados */}
                  {(() => {
                    let arquivos: { nome: string; conteudo: string }[] = [];

                    if (chamadoSelecionado.arquivos) {
                      try {
                        // Se for string, tenta fazer o parse
                        if (typeof chamadoSelecionado.arquivos === "string") {
                          arquivos = JSON.parse(chamadoSelecionado.arquivos);
                        } else if (Array.isArray(chamadoSelecionado.arquivos)) {
                          arquivos = chamadoSelecionado.arquivos;
                        }
                      } catch (e) {
                        return (
                          <p className="text-sm text-red-600">Erro ao carregar arquivos anexados</p>
                        );
                      }
                    }

                    if (arquivos.length === 0) {
                      return (
                        <p className="text-sm text-gray-500">Nenhum arquivo anexado.</p>
                      );
                    }

                    return (
                      <div className="text-sm text-gray-600 mb-2">
                        Arquivos já anexados:
                        <br />
                        {arquivos.map((arquivo, idx) => {
                          const [meta, base64Content] = arquivo.conteudo.split(",");
                          const mime = meta?.split(":")[1]?.split(";")[0] || "application/octet-stream";
                          return (
                            <a
                              key={idx}
                              href="#"
                              onClick={() => {
                                const blob = base64ToBlob(base64Content, mime);
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = arquivo.nome;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="text-blue-600 hover:underline block"
                            >
                              📎 Baixar {arquivo.nome}
                            </a>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <input
                    type="file"
                    multiple
                    className="w-full mt-2"
                    onChange={(e) => setAnexos(e.target.files)}
                    disabled={getStatus(chamadoSelecionado).texto === "Encerrado"}
                  />
                </div>




   
                 <div className="flex justify-end gap-2">
                    {podeAtender && (
                      <button
                        onClick={atenderChamado}
                        disabled={isAtendendo || isEncerrando}
                        className={`px-6 py-2 rounded text-white ${isAtendendo ? "bg-blue-400" : "bg-blue-800 hover:bg-blue-900"}`}
                      >
                        {isAtendendo ? "Atendendo..." : "Atender"}
                      </button>
                    )}
                    {podeEncerrar && (
                      <button
                        onClick={encerrarChamado}
                        disabled={isEncerrando || isAtendendo}
                        className={`px-6 py-2 rounded text-white ${isEncerrando ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
                      >
                        {isEncerrando ? "Encerrando..." : "Encerrar"}
                      </button>
                    )}
                  </div>
               </div>
             </div>
           )}
           {mensagem && (
              <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white text-gray-800 px-6 py-3 rounded-lg shadow-xl border border-gray-300">
                  {mensagem}
                </div>
              </div>
            )}
         </main>
       </div>
     );
}