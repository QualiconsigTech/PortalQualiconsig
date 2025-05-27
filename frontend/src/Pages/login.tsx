"use client";

import React, { useState } from "react";
import { Mail, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/router";
import { api } from "@/services/api";
import axios, { AxiosError } from "axios";
import { getPerfilUsuario } from "@/utils/chamadoUtils";


const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors("");

  try {
    const response = await api.post("/api/auth/login/", {
      email,
      password,
    });

    const accessToken = response.data.token.access;
    const refreshToken = response.data.token.refresh;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("refresh", refreshToken);

    if (response.data.primeiro_login) {
      window.location.href = "/alterar-senha";
      return;
    }

    const meResponse = await api.get("/api/auth/me/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userData = meResponse.data;
    const grupos = Array.isArray(userData.grupos) ? userData.grupos : [];

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("grupos", JSON.stringify(grupos));
    const perfil = getPerfilUsuario({
        tipo: userData.tipo,
        is_admin: userData.is_admin,
      });

      if (perfil === "analista_admin") {
        localStorage.setItem("analista_admin", "true");
      } else {
        localStorage.removeItem("analista_admin");
      }

    router.push("/tela-inicial");
  } catch (err) {
      if (axios.isAxiosError(err)) {
        const error = err as AxiosError;

        if (error.response?.status === 401) {
          setErrors("Usuário e/ou senha incorreto(s)");
        } else if (error.message === "Network Error") {
          setErrors("Erro de conexão com o servidor.");
        } else {
          setErrors("Erro inesperado. Tente novamente mais tarde.");
        }

        console.error("[LOGIN] Erro:", error);
      } else {
        console.error("[LOGIN] Erro desconhecido:", err);
        setErrors("Erro inesperado.");
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffafa] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-[#00247A] mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-[#00247A] focus:border-[#00247A] bg-white text-[#010203]`}
                placeholder="Digite seu email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#010203]">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:ring-[#00247A] focus:border-[#00247A] bg-white text-[#010203]`}
                placeholder="Sua senha"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </div>
            </div>
            {errors && <p className="text-red-500 text-xs">{errors}</p>}
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-md bg-[#00247A] hover:bg-[#001b5e]"
          >
            Entrar
          </button>

          
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
