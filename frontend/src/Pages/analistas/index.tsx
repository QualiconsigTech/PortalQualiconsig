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
  setor_nome : string;
  usuario: {
    id: number;
    nome: string;
  };
  analista: {
    id: number;
    nome: string;
  } | null;
  encerrado_em: string | null;

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
  const router = useRouter();

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
        try {
          const response = await api.get("/api/usuarios/chamados/", {
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
    }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  const handleOpenModal = (chamado: Chamado) => {
    setChamadoSelecionado(chamado);
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
             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
               <div className="bg-white w-[90%] max-w-4xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
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
                   <div><strong>Usuário:</strong> {chamadoSelecionado.usuario.nome}</div>
                   <div><strong>Prioridade:</strong> {chamadoSelecionado.prioridade}</div>
                   <div><strong>Gravidade:</strong> {chamadoSelecionado.gravidade}</div>
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Descrição:</label>
                   <textarea value={chamadoSelecionado.descricao} readOnly className="w-full border rounded p-2 bg-gray-100" rows={3} />
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Solução:</label>
                   <textarea className="w-full border rounded p-2" rows={3} />
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Comentários:</label>
                   <textarea className="w-full border rounded p-2" rows={2} />
                 </div>
   
                 <div className="mb-4">
                   <label className="block font-semibold mb-1">Arquivos Anexados:</label>
                   <input type="file" multiple className="w-full" />
                 </div>
   
                 <div className="flex justify-end gap-2">
                   <button className="bg-blue-800 text-white px-6 py-2 rounded hover:bg-blue-900">Atender</button>
                   <button className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">Encerrar</button>
                 </div>
               </div>
             </div>
           )}
         </main>
       </div>
     );
}