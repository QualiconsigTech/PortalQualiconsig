import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";

interface DashboardLayoutProps {
  children: ReactNode;
  nomeUsuario?: string;
  nomeDoSetor?: string;
  activeView?: string;
  setActiveView?: (view: string) => void;
}

export default function DashboardLayout({
  children,
  nomeUsuario = "Usuário",
  nomeDoSetor = "Setor",
  activeView = "meus",
  setActiveView,
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
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
            <button
              onClick={() => setActiveView?.("meus")}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === "meus"
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              Meus Chamados
            </button>

            {nomeDoSetor && (
              <button
                onClick={() => setActiveView?.("setor")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === "setor"
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {nomeDoSetor}
              </button>
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

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
