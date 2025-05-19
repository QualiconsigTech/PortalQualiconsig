import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/services/api";

import ChamadosUsuarios from "@/components/chamados/usuarios/ChamadosUsuarios";
import ChamadosUsuariosAdmin from "@/components/chamados/usuariosAdmin/ChamadosUsuariosAdmin";

export default function ComercialHome() {

  const router = useRouter();
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const redirecionarParaLogin = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchUsuario = async () => {
    const token = localStorage.getItem("token");
    if (!token) return redirecionarParaLogin();

    try {
      const { data } = await api.get("/api/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTipoUsuario(data.tipo);
      setIsAdmin(data.is_admin);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        redirecionarParaLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  if (loading) return <p className="text-gray-600 p-4">Carregando...</p>;

  if (tipoUsuario === "usuario" && isAdmin) {
    return (
      <div className="p-6">
        <ChamadosUsuariosAdmin />
      </div>
    );
  }

  if (tipoUsuario === "usuario") {
    return (
      <div className="p-6">
        <ChamadosUsuarios />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#041161] mb-2">Área de Tecnologia</h1>
      <p className="text-gray-600">Conteúdo exclusivo para o grupo de Tecnologia.</p>
    </div>
  );
}