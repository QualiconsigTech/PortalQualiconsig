import { useEffect, useState } from "react";
import ChamadosAnalistasAdmin from "@/components/chamados/analistasAdmin/ChamadosAnalistasAdmin";
import ChamadosAnalistas from "@/components/chamados/analistas/ChamadosAnalistas";
import { api } from "@/services/api";
import { useRouter } from "next/router";

export default function TecnologiaHome() {
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

  if (loading) return <p className="p-6">Carregando...</p>;

  if (tipoUsuario === "analista" && isAdmin) {
    return <ChamadosAnalistasAdmin />;
  }

  if (tipoUsuario === "analista") {
    return <ChamadosAnalistas />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Área de Tecnologia</h1>
      <p>Conteúdo exclusivo para o grupo de Tecnologia.</p>
    </div>
  );
}
