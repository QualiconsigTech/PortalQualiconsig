'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,} from 'recharts';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
type Setor = {
  setor__nome: string;
  total: number;
};

type Categoria = {
  categoria__nome: string;
  total: number;
};

const Dashboard = () => {
  const [periodo, setPeriodo] = useState('mensal');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [totalChamados, setTotalChamados] = useState(0);
  const [chamadosAbertos, setChamadosAbertos] = useState(0);
  const [chamadosEmAtendimento, setChamadosEmAtendimento] = useState(0);
  const [chamadosEncerrados, setChamadosEncerrados] = useState(0);
  const [chamadosPorSetor, setChamadosPorSetor] = useState<Setor[]>([]);
  const [topUsuario, setTopUsuario] = useState<any>(null);
  const [topSetor, setTopSetor] = useState<any>(null);
  const [evolucaoChamados, setEvolucaoChamados] = useState([]);
  const [categoriaChamados, setCategoriaChamados] = useState<any>(null);
  const [visualizacao, setVisualizacao] = useState<'todos' | 'dados' | 'graficos'>('todos');


  function getInicioEFimDoPeriodo(periodo: string): { inicio?: string; fim?: string } {
    const hoje = new Date();
    const dataInicio = new Date(hoje);
    const dataFim = new Date(hoje);
  
    if (periodo === 'personalizado' && dataInicio && dataFim) {
      return {
        inicio: format(dataInicio, 'yyyy-MM-dd'),
        fim: format(dataFim, 'yyyy-MM-dd'),
      };
    }
  
    switch (periodo) {
      case 'diario':
        break;
      case 'semanal':
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mensal':
        dataInicio.setMonth(dataInicio.getMonth() - 1);
        break;
      case 'trimestral':
        dataInicio.setMonth(dataInicio.getMonth() - 3);
        break;
      case 'semestral':
        dataInicio.setMonth(dataInicio.getMonth() - 6);
        break;
      case 'anual':
        dataInicio.setFullYear(dataInicio.getFullYear() - 1);
        break;
    }
  
    return {
      inicio: format(dataInicio, 'yyyy-MM-dd'),
      fim: format(dataFim, 'yyyy-MM-dd'),
    };
  }
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { inicio, fim } = getInicioEFimDoPeriodo(periodo);
        const params: any = {};
        if (inicio && fim) {
          params.data_inicio = inicio;
          params.data_fim = fim;
        }

        const totalRes = await api.get('/api/chamados/dashboard/chamados-total/', { params });
        setTotalChamados(totalRes.data.total_chamados || 0);

        const abertosRes = await api.get('/api/chamados/dashboard/chamados-abertos/', { params });
        setChamadosAbertos(abertosRes.data.total_abertos || 0);

        const atendimentoRes = await api.get('/api/chamados/dashboard/chamados-em-atendimento/', { params });
        setChamadosEmAtendimento(atendimentoRes.data.total_em_atendimento || 0);

        const encerradosRes = await api.get('/api/chamados/dashboard/chamados-encerrados/', { params });
        setChamadosEncerrados(encerradosRes.data.total_encerrados || 0);

        const setorRes = await api.get('/api/chamados/dashboard/chamados-por-setor/', { params });
        setChamadosPorSetor(setorRes.data.chamados_por_setor || []);

        const usuarioRes = await api.get('/api/chamados/dashboard/top-usuario/', { params });
        setTopUsuario(usuarioRes.data.top_usuario || null);

        const setorTopRes = await api.get('/api/chamados/dashboard/top-setor/', { params });
        setTopSetor(setorTopRes.data.top_setor || null);

        const evolucaoRes = await api.get('/api/chamados/dashboard/evolucao-chamados/', { params });
        setEvolucaoChamados(evolucaoRes.data || []);

        const categoriaRes = await api.get('/api/chamados/dashboard/chamados-por-categoria/', { params });
        setCategoriaChamados(categoriaRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar métricas do dashboard:', error);
      }
    };

    fetchData();
  }, [periodo, dataInicio, dataFim]);
  return (
    <>
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Dashboard de Chamados</h2>

      <div className="flex justify-end gap-4 mb-6">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={visualizacao}
            onChange={(e) => setVisualizacao(e.target.value as 'todos' | 'dados' | 'graficos')}
          >
            <option value="todos">Todos</option>
            <option value="dados">Apenas Dados</option>
            <option value="graficos">Apenas Gráficos</option>
          </select>
  
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
            <option value="personalizado">Personalizado</option>
          </select>
          </div>
          {periodo === 'personalizado' && (
       <div className="flex gap-4 items-center mb-6">
         <DatePicker
            selected={dataInicio}
            onChange={(date) => setDataInicio(date)}
            selectsStart
            startDate={dataInicio}
            endDate={dataFim}
            placeholderText="Data Início"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
          />
          <DatePicker
            selected={dataFim}
            onChange={(date) => setDataFim(date)}
            selectsEnd
            startDate={dataInicio}
            endDate={dataFim}
            minDate={dataInicio ?? undefined}
            placeholderText="Data Fim"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm"
          />
        </div>
      )}
  
       {/* DADOS */}
        {(visualizacao === 'todos' || visualizacao === 'dados') && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              {[
                {
                  title: 'Total de chamados',
                  value: totalChamados,
                  color: 'text-blue-600',
                },
                {
                  title: 'Chamados em aberto',
                  value: chamadosAbertos,
                  color: 'text-yellow-500',
                },
                {
                  title: 'Em atendimento',
                  value: chamadosEmAtendimento,
                  color: 'text-orange-500',
                },
                {
                  title: 'Encerrados',
                  value: chamadosEncerrados,
                  color: 'text-green-600',
                },
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-sm text-gray-500 font-medium mb-1">{item.title}</h3>
                  <p className={`text-4xl font-extrabold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-sm text-gray-500 font-medium mb-1">Setor com mais chamados</h3>
                <p className="text-xl font-semibold text-gray-800">{topSetor?.setor__nome || '---'}</p>
                <p className="text-2xl font-bold text-blue-600">{topSetor?.total || 0}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-sm text-gray-500 font-medium mb-1">Usuário que mais abre chamados</h3>
                <p className="text-xl font-semibold text-gray-800">{topUsuario?.usuario__nome || '---'}</p>
                <p className="text-2xl font-bold text-blue-600">{topUsuario?.qtd || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Chamados por Setor</h3>
              <ul className="divide-y divide-gray-200">
                {chamadosPorSetor.map((item, index) => (
                  <li key={index} className="flex justify-between py-2">
                    <span className="text-gray-800">{item.setor__nome}</span>
                    <span className="font-semibold">{item.total}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Chamados por Categoria</h3>
              <ul className="divide-y divide-gray-200">
                {Array.isArray(categoriaChamados) &&
                  categoriaChamados.map((item, index) => (
                    <li key={index} className="flex justify-between py-2">
                      <span className="text-gray-800">{item.categoria__nome}</span>
                      <span className="font-semibold">{item.total}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}

  
        {/* GRÁFICOS */}
        {(visualizacao === 'todos' || visualizacao === 'graficos') && (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Gráfico de Chamados por Setor</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chamadosPorSetor}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="setor__nome" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Gráfico de Chamados por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoriaChamados}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria__nome" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Evolução de Chamados</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolucaoChamados}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      </div>
    </>
  );
};
export default Dashboard;
