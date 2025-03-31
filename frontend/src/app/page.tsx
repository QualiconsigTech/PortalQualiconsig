"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    const url = 'http://127.0.0.1:8000/api/auth/login/'
    const response = await axios.post(url, {
        "email": email,
        "password": password,
    });

    console.log(response);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-stone-50 rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite seu email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite sua senha"
            />
          </div>
          <div className="flex justify-between items-center">
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Entrar
          </button>
          <div className="text-center">
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              Registrar-se
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;