import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LogOut } from "lucide-react";


interface TelaInicialProps {}

export const TelaInicial = ({}: TelaInicialProps) => {
  const router = useRouter();
  const [grupos, setGrupos] = useState<string[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>("");

  const secoes: Record<string, string> = {
    Tecnologia: "/tecnologia",
    Comercial: "/comercial",
    Financeiro: "/financeiro",
    Marketing: "/marketing",
    Diretoria: "/diretoria",
  };

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
  }, []);

  const handleAcesso = () => {
    const rota = secoes[grupoSelecionado];
    if (rota) {
      router.push(rota);
    } else {
      alert(`Nenhuma rota configurada para o grupo: ${grupoSelecionado}`);
    }
  };
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("grupos");
  window.location.href = "/login";
};


  return (
    <div className="flex min-h-screen bg-[#f9f9fb]">
      {/* Sidebar */}
      <aside className="bg-white shadow w-64 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#041161] mb-6">Portal Qualiconsig</h2>
          <p className="text-sm text-black-500 font-semibold mb-2">MENU</p>
          <nav className="space-y-2">
            {grupos.map((grupo) => (
              <button
                key={grupo}
                onClick={() => setGrupoSelecionado(grupo)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  grupoSelecionado === grupo
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {grupo}
              </button>
            ))}
          </nav>
        </div>
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            SAIR
          </button>
        </div>
      </aside>

      {/* Área principal */}
      <main className="flex-1">
        <header className="bg-[#00247A] text-white px-6 py-4 flex justify-between items-center shadow-md">
          <img
            src="/images/Qualiconsig-Logo-branco-1-1024x341.png"
            alt="Logo Qualiconsig"
            className="h-10"
          />
          <p className="text-white">Olá, teste</p>
        </header>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-[#041161] mb-2">
            Bem-vindo ao Portal Qualiconsig
          </h1>
          <p className="text-gray-600 mb-6">Selecione a seção que deseja acessar:</p>

          <button
            onClick={handleAcesso}
            className="bg-[#00247A] text-white px-8 py-3 rounded-md hover:bg-[#001b5e] font-semibold"
          >
            Acessar {grupoSelecionado}
          </button>
        </div>
      </main>
    </div>
  );
};
