import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";

export interface Notificacao {
  id: number;
  mensagem: string;
  visualizado: boolean;
  criado_em: string;
  chamado_id: number;
}

interface UseNotificacoesParams {
  perfilUsuario: string;
  abrirModalChamadosAnalista: (chamadoId: number, notificacaoId?: number) => void;
  abrirModalChamadosUsuario: (chamadoId: number, notificacaoId?: number) => void;
}

export function useNotificacoes({
  perfilUsuario,
  abrirModalChamadosAnalista,
  abrirModalChamadosUsuario,
}: UseNotificacoesParams) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotificacoes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/api/chamados/notificacoes/");
      setNotificacoes(data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        window.dispatchEvent(new Event("tokenExpired"));
      } else {
        console.error("Erro ao buscar notificações", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const marcarNotificacaoComoLida = async (id: number) => {
    try {
      await api.post(`/api/chamados/notificacoes/${id}/visualizar/`);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, visualizado: true } : n))
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida", error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.post("/api/chamados/notificacoes/marcar-todas/");
      setNotificacoes((prev) => prev.map((n) => ({ ...n, visualizado: true })));
    } catch (error) {
      console.error("Erro ao marcar notificações como lidas", error);
    }
  };

  const abrirNotificacao = async (notificacao: Notificacao) => {
    try {
      if (perfilUsuario === "analista" || perfilUsuario === "analista_admin") {
        await abrirModalChamadosAnalista(notificacao.chamado_id, notificacao.id);
      } else {
        await abrirModalChamadosUsuario(notificacao.chamado_id, notificacao.id);
      }
    } catch (err) {
      console.error("Erro ao abrir notificação:", err);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 5000);
    return () => clearInterval(interval);
  }, [fetchNotificacoes]);

  return {
    notificacoes,
    isLoading,
    fetchNotificacoes,
    marcarNotificacaoComoLida,
    marcarTodasComoLidas,
    abrirNotificacao, 
  };
}
