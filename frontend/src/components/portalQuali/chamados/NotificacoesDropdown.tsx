import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificacoes } from "@/hooks/useNotificacoes";

interface Props {
  nomeUsuario: string;
  perfilUsuario: string;
  abrirModalChamadosAnalista: (chamadoId: number, notificacaoId?: number) => void;
  abrirModalChamadosUsuario: (chamadoId: number, notificacaoId?: number) => void;
}

export function NotificacoesDropdown({
  nomeUsuario,
  perfilUsuario,
  abrirModalChamadosAnalista,
  abrirModalChamadosUsuario,
}: Props) {
  const {
    notificacoes,
    marcarNotificacaoComoLida,
    marcarTodasComoLidas,
    abrirNotificacao,
  } = useNotificacoes({
    perfilUsuario,
    abrirModalChamadosAnalista,
    abrirModalChamadosUsuario,
  });

  const notificacoesNaoLidas = notificacoes.filter((n) => !n.visualizado);
  const [mostrar, setMostrar] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = document.getElementById("menu-notificacao");
      const botao = document.getElementById("botao-notificacao");
      if (
        menu &&
        botao &&
        !menu.contains(event.target as Node) &&
        !botao.contains(event.target as Node)
      ) {
        setMostrar(false);
      }
    }

    if (mostrar) {
      document.addEventListener("mousedown", handleClickOutside);
      timeoutRef.current = setTimeout(() => setMostrar(false), 5000);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mostrar]);

  return (
    <div className="relative flex items-center gap-4">
      <button id="botao-notificacao" onClick={() => setMostrar((prev) => !prev)} className="relative">
        <Bell className="w-6 h-6 text-white" />
        {notificacoesNaoLidas.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
            {notificacoesNaoLidas.length}
          </span>
        )}
      </button>

      <p className="text-white">Olá, {nomeUsuario}</p>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            id="menu-notificacao"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white text-black rounded shadow-md z-50 max-h-80 overflow-y-auto scrollbar-hide"
          >
            <style jsx>{`#menu-notificacao::-webkit-scrollbar { display: none; }`}</style>

            <div className="flex items-center justify-between p-4 font-bold border-b">
              <span>Notificações</span>
              {notificacoes.length > 0 && (
                <button onClick={marcarTodasComoLidas} className="text-xs text-blue-600 hover:underline">
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {notificacoes.length === 0 ? (
              <div className="p-4 text-sm">Nenhuma notificação</div>
            ) : (
              notificacoes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    abrirNotificacao(n);
                    setMostrar(false);
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
        )}
      </AnimatePresence>
    </div>
  );
}
