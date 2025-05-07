import axios from 'axios';

// Crie uma instância do axios com a URL base da sua API
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || process.env.NEXT_PUBLIC_TOKEN;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      // Dispara evento para que o layout trate
      window.dispatchEvent(new Event('tokenExpired'));
    }

    return Promise.reject(error);
  }
);



// Serviços específicos para chamados
export const chamadosService = {
  // Obter todos os chamados
  getAll: () => api.get('usuarios/chamados/'),
  
  // Obter chamados por setor
  getBySetor: (setor: string) => api.get(`usuarios/chamados/setor/${setor}/`),
  
  // Obter um chamado específico
  getById: (id: number) => api.get(`usuarios/chamados/${id}/`),
  
  // Criar um novo chamado
  create: (data: any) => api.post('usuarios/chamados/', data),
  
  // Atualizar um chamado
  update: (id: number, data: any) => api.put(`usuarios/chamados/${id}/`, data),
  
  // Atualizar parcialmente um chamado
  patch: (id: number, data: any) => api.patch(`usuarios/chamados/${id}/`, data),
  
  // Excluir um chamado
  delete: (id: number) => api.delete(`usuarios/chamados/${id}/`),
};