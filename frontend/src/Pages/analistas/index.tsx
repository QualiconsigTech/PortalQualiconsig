import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { api } from "@/services/api";
import { LogOut, LayoutList } from "lucide-react";
import { Rethink_Sans } from "next/font/google";


interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  criado_em: string;
  categoria: string;
  setor: string;
}

const formatDate = (date: string) => {
  if (!date || date === "N/A") return "N/A"
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR"), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }
}

export default function ChamadosAnalista() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchChamados = async () => {
      const token = localStorage.getItem("token") || process.env.NEXT_PUBLIC_TOKEN;
      if (!token) return router.push("/login");

      try {
        const { data } = await api.get("/api/usuarios/chamados/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChamados(data);
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

  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      <aside className="w-64 bg-white shadow-md p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#010203] mb-6">Quali<span className="text-gray-800">Consig</span></h1>
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg bg-[#eceeff] text-[#4f46e5]">
              <LayoutList size={18} /> Meus Chamados
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-blue-500">
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="dd/mm/aaaa"
            className="border px-3 py-2 rounded-md shadow-sm text-sm"
          />
        </header>

        <section className="bg-white p-6 rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th className="py-2">N° Chamado</th>
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
                chamados.map((chamado) => (
                  <tr key={chamado.id} className="border-t">
                    <td className="py-2">{chamado.titulo}</td>
                    <td className="py-2">{chamado.categoria}</td>
                    <td className="py-2">aberto</td>
                    <td className="py-2 text-orange-500">Pendente</td>
                    <td className="py-2">{chamado.setor}</td>
                    <td>{format(new Date(chamado.criado_em), "dd/MM/yy")}</td>
                    <td className="py-2">atender</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
