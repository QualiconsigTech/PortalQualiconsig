import React, { ReactNode, useState } from "react";
import { LogOut, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import Relatorios from "@/components/financeiro/relatorios";

interface DashboardLayoutProps {
  children: ReactNode;
  nomeUsuario?: string;
}

export default function DashboardLayout({ children, nomeUsuario = "Usuário" }: DashboardLayoutProps) {
  const router = useRouter();
  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [sidebarAberto, setSidebarAberto] = useState(true);
  const [activeView, setActiveView] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  

  const renderActiveView = () => {
    switch (activeView) {
      case "Omie":
        return <Relatorios />;
      default:
        return (
          <div className="text-gray-600 text-sm">
            <h2 className="text-xl font-bold mb-2">{activeView}</h2>
            <p>Este conteúdo está em construção.</p>
          </div>
        );
    }
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
            <h1 className="text-xl font-bold text-[#041161] whitespace-nowrap">Financeiro QualiBank</h1>
          )}
          <button onClick={() => setSidebarAberto(!sidebarAberto)} className="text-gray-600 hover:text-gray-900">
            {sidebarAberto ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {sidebarAberto && (
          <div className="flex-1 flex flex-col items-center px-6 mt-12">
            <p className="text-sm text-black-500 font-semibold mb-2">MENU</p>
            <nav className="space-y-2 w-full">
              {[
                { label: "Relatórios", key: "Omie" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveView(item.key)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.key ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
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

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        <header className="bg-[#00247A] text-white px-6 py-4 flex justify-between items-center shadow">
          <div className="flex items-center gap-3">
          <img src="/images/Qualiconsig-Logo-branco-1-1024x341.png" alt="Logo Qualiconsig" className="h-15" />
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              id="botao-notificacao"
              className="relative"
              onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
            >
              <Bell className="w-6 h-6" />
            </button>
            <p className="text-white">Olá, {nomeUsuario}</p>
          </div>
        </header>

        <main className="p-6 overflow-y-auto">
        {activeView ? renderActiveView() : children}
        </main>
      </div>
    </div>
  );
}
