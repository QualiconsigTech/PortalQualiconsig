import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/services/api";

interface PerfilUsuario {
  id: number;
  nome: string;
  tipo: string;
  is_admin: boolean;
  setor: string;
}

export function useDashboardLogic() {
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [perfilUsuario, setPerfilUsuario] = useState<PerfilUsuario | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const res = await api.get("/api/auth/me/");
        setPerfilUsuario(res.data);
        setTipoUsuario(res.data.tipo);
        setIsAdmin(res.data.is_admin || false);
      } catch (error) {
        console.error("Erro ao buscar perfil", error);
        router.push("/login");
      }
    }

    fetchPerfil();
  }, []);

  return {
    tipoUsuario,
    isAdmin,
    perfilUsuario,
  };
}
