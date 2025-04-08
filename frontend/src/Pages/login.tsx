"use client";

import React, { useState } from 'react';
import { Mail, Eye, EyeOff, Lock } from 'lucide-react';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        email: email,
        password: password
      });

      localStorage.setItem('token', response.data.token.access);
      localStorage.setItem('refresh', response.data.token.refresh);

      
      const meResponse = await axios.get('http://localhost:8000/api/usuarios/me', {
        headers: {
          Authorization: `Bearer ${response.data.token.access}`
        }
      });

      const userData = meResponse.data;

      if (userData.is_admin) {
        if (userData.tipo === "usuario") {
          window.location.href = '/usuarioadmin';
        } else if (userData.tipo === "analista") {
          window.location.href = '/analistasadmin';
        }
      } else {
        if (userData.tipo === "usuario") {
          window.location.href = '/usuariosadmin';
        } else if (userData.tipo === "analista") {
          window.location.href = '/analistas';
        }
      }
      
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.detail ?? "Erro desconhecido");
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
                  errors ? 'border-red-500' : 'border-gray-300'
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
                  errors ? 'border-red-500' : 'border-gray-300'
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
          <div className="text-center">
            {errors && <span className="text-red-500 text-sm">{errors}</span>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
