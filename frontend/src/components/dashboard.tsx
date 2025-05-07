'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api'; // ✅ Importação direta da API

type Setor = {
  setor__nome: string;
  total: number;
};

const Dashboard = () => {
  const [periodo, setPeriodo] = useState('mensal');
  const [totalChamados, setTotalChamados] = useState(0);
  const [chamadosPorSetor, setChamadosPorSetor] = useState<Setor[]>([]);
  const [topUsuario, setTopUsuario] = useState<any>(null);
  const [topSetor, setTopSetor] = useState<any>(null);

  function getInicioEFimDoPeriodo(periodo: string): { inicio: string; fim: string } {
    const hoje = new Date();
    const fim = hoje.toISOString().split('T')[0];
    const data = new Date(hoje);

    switch (periodo) {
      case 'semanal':
        data.setDate(data.getDate() - 7);
        break;
      case 'mensal':
        data.setMonth(data.getMonth() - 1);
        break;
      case 'trimestral':
        data.setMonth(data.getMonth() - 3);
        break;
      case 'semestral':
        data.setMonth(data.getMonth() - 6);
        break;
      case 'anual':
        data.setFullYear(data.getFullYear() - 1);
        break;
    }

    const inicio = data.toISOString().split('T')[0];
    return { inicio, fim };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { inicio, fim } = getInicioEFimDoPeriodo(periodo);

        const totalRes = await api.get('/api/dashboard/chamados-total/', { params: { inicio, fim } });
        setTotalChamados(totalRes.data.total_chamados || 0);

        const setorRes = await api.get('/api/dashboard/chamados-por-setor/', { params: { inicio, fim } });
        setChamadosPorSetor(setorRes.data.chamados_por_setor || []);

        const usuarioRes = await api.get('/api/dashboard/top-usuario/', { params: { inicio, fim } });
        setTopUsuario(usuarioRes.data.top_usuario || null);

        const setorTopRes = await api.get('/api/dashboard/top-setor/', { params: { inicio, fim } });
        setTopSetor(setorTopRes.data.top_setor || null);
      } catch (error) {
        console.error('Erro ao carregar métricas do dashboard:', error);
      }
    };

    fetchData();
  }, [periodo]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard de Chamados</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-600">Total de chamados</h3>
          <p className="text-3xl font-bold text-blue-600">{totalChamados}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-600">Setor com mais chamados</h3>
          <p className="text-lg font-medium">{topSetor?.setor__nome || '---'}</p>
          <p className="text-xl font-bold text-blue-600">{topSetor?.total || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-600">Usuário que mais abre chamados</h3>
          <p className="text-lg font-medium">{topUsuario?.usuario__nome || '---'}</p>
          <p className="text-xl font-bold text-blue-600">{topUsuario?.qtd || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm text-gray-600">Período</h3>
          <select
            className="mt-2 p-2 border rounded w-full"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Chamados por Setor</h3>
        <ul className="divide-y divide-gray-200">
          {chamadosPorSetor.map((item, index) => (
            <li key={index} className="flex justify-between py-2">
              <span className="text-gray-800">{item.setor__nome}</span>
              <span className="font-semibold">{item.total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
