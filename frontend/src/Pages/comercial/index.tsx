import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/services/api";

import ChamadosUsuarios from "@/components/chamados/usuarios/ChamadosUsuarios";
import ChamadosUsuariosAdmin from "@/components/chamados/usuariosAdmin/ChamadosUsuariosAdmin";

export default function ComercialPage() {
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const buscarUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const response = await api.get("/api/auth/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTipoUsuario(response.data.tipo);
        setIsAdmin(response.data.is_admin);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
        router.push("/login");
      } finally {
        setCarregando(false);
      }
    };

    buscarUsuario();
  }, []);

  if (carregando) return null;

  if (tipoUsuario !== "usuario") {
    return <p className="text-center text-red-500 mt-10">Acesso restrito à área comercial.</p>;
  }

  return isAdmin ? <ChamadosUsuariosAdmin /> : <ChamadosUsuarios />;
}
