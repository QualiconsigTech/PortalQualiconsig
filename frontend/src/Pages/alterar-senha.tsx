import React, { useState } from "react";
import axios from "axios";
import { api } from "@/services/api";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";

const AlterarSenhaPage: React.FC = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setMensagem("");
  setErro("");

  if (novaSenha !== confirmarSenha) {
    setErro("As senhas não coincidem.");
    return;
  }

  try {
    await api.put("/api/auth/alterar-senha/", {
      nova_senha: novaSenha,
      confirmar_senha: confirmarSenha,
    });

    setMensagem("Senha alterada com sucesso!");
    setNovaSenha("");
    setConfirmarSenha("");

    setTimeout(() => {
        router.push("/login");
      }, 1500);
  } catch (error: any) {
    console.error("Erro ao alterar senha:", error);
    setErro("Erro ao alterar senha.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffafa] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-[#00247A] mb-6">
          Alterar Senha
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Digite a nova senha"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((prev) => !prev)}
                className="absolute right-2 top-2.5 text-gray-500"
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md pr-10"
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar((prev) => !prev)}
                className="absolute right-2 top-2.5 text-gray-500"
              >
                {mostrarConfirmar ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          {mensagem && <p className="text-green-600 text-sm">{mensagem}</p>}

          <button
            type="submit"
            className="w-full text-white py-2 rounded-md bg-[#00247A] hover:bg-[#001b5e]"
          >
            Alterar Senha
          </button>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenhaPage;
