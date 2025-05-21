"use client";

import React, { useState } from "react";
import axios from "axios";

const AlterarSenhaPage: React.FC = () => {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:8000/api/auth/alterar-senha/",
        {
          nova_senha: novaSenha,
          confirmar_senha: confirmarSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensagem("Senha alterada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      setErro(err.response?.data?.erro ?? "Erro ao alterar a senha.");
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
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Digite a nova senha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Confirme a nova senha"
            />
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
