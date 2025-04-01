import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { api } from "@/services/api";
import { Edit, Filter, Grid, List, Calendar, LogOut, LayoutList, Settings, User } from "lucide-react";

interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  criado_em: string;
}

export default function ChamadosAnalista() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [filteredChamados, setFilteredChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("todos");
  const router = useRouter();

  useEffect(() => {
    const fetchChamados = async () => {
      const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const envToken = process.env.NEXT_PUBLIC_TOKEN;
      const token = localToken || envToken;

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
        setFilteredChamados(response.data);
      } catch (err) {
        setErro("Erro ao carregar chamados.");
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = chamados.filter((chamado) =>
        chamado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chamado.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chamado.id.toString().includes(searchTerm)
      );
      setFilteredChamados(filtered);
    } else {
      setFilteredChamados(chamados);
    }
  }, [searchTerm, chamados]);

  useEffect(() => {
    if (activeView === "todos") {
      setFilteredChamados(chamados);
    } else if (activeView === "meus") {
      setFilteredChamados(chamados.slice(0, 3));
    } else if (activeView === "desenvolvimento") {
      const filtered = chamados.filter((chamado) =>
        chamado.status?.toLowerCase().includes("desenvolvimento")
      );
      setFilteredChamados(filtered);
    }
  }, [activeView, chamados]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "alta":
        return "text-red-600";
      case "média":
        return "text-orange-500";
      case "baixa":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-200 text-gray-600";

    switch (status.toLowerCase()) {
      case "aberto":
        return "bg-blue-100 text-blue-800";
      case "em andamento":
        return "bg-yellow-100 text-yellow-800";
      case "fechado":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff] text-gray-800">
      <aside className="w-72 bg-white shadow-lg flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 px-4 py-6 text-xl font-bold">
            <img src="/logo.png" alt="Logo Qualiconsig" className="h-10" />
            <span className="text-blue-700">Qualiconsig</span>
          </div>

          <nav className="flex flex-col gap-2 mt-2">
            <button onClick={() => setActiveView("todos")} className={`flex items-center gap-3 p-3 rounded-lg ${activeView === "todos" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
              <LayoutList /> Todos Chamados
            </button>
            <button onClick={() => setActiveView("meus")} className={`flex items-center gap-3 p-3 rounded-lg ${activeView === "meus" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
              <User /> Meus Chamados
            </button>
            <button onClick={() => setActiveView("desenvolvimento")} className={`flex items-center gap-3 p-3 rounded-lg ${activeView === "desenvolvimento" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
              <Settings /> Desenvolvimento
            </button>
          </nav>
        </div>

        <div className="border-t mt-6 pt-4">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-600 hover:text-red-500">
            <LogOut /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">{activeView === "todos" ? "Todos os Chamados" : activeView === "meus" ? "Meus Chamados" : "Chamados - Desenvolvimento"}</h1>
          <p className="text-sm text-gray-600">Olá, Usuário</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Buscar chamado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          <div className="flex gap-2">
            <button className="p-2 bg-white border rounded-lg hover:bg-gray-100"><Filter size={18} /></button>
            <button className="p-2 bg-white border rounded-lg hover:bg-gray-100"><List size={18} /></button>
            <button className="p-2 bg-white border rounded-lg hover:bg-gray-100"><Grid size={18} /></button>
            <button className="p-2 bg-white border rounded-lg hover:bg-gray-100"><Calendar size={18} /></button>
          </div>
        </div>

        <div className="overflow-auto rounded-lg shadow bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Nº Chamado</th>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Prioridade</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredChamados.map((chamado) => (
                <tr key={chamado.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">#{chamado.id}</td>
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900">{chamado.titulo}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">{chamado.descricao}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(chamado.status)}`}>{chamado.status}</span>
                  </td>
                  <td className={`px-4 py-2 ${getPriorityColor(chamado.prioridade)}`}>{chamado.prioridade}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{format(new Date(chamado.criado_em), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredChamados.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-6 text-gray-500">Nenhum chamado encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {erro && <p className="text-red-600 mt-4">{erro}</p>}
        {loading && <p className="text-gray-600 mt-4">Carregando chamados...</p>}
      </main>
    </div>
  );
}
