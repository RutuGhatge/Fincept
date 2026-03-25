import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const AUTH_BASE_URL = 'http://localhost:8000/users';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: any) => {
    const response = await axios.post(`${AUTH_BASE_URL}/login`, data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await axios.post(`${AUTH_BASE_URL}/register`, data);
    return response.data;
  }
};

export const portfolioService = {
  getRecommendation: async (data: any) => {
    const response = await api.post('/portfolio/recommend', data);
    return response.data;
  },
  trackPortfolio: async (id: string) => {
    const response = await api.get(`/portfolio/${id}/track`);
    return response.data;
  },
  uploadPortfolio: async (formData: FormData) => {
    const response = await api.post('/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const analysisService = {
  analyzePortfolio: async (data: any) => {
    const response = await api.post('/analysis/analyze', data);
    return response.data;
  },
  assessRisk: async (data: any) => {
    const response = await api.post('/analysis/risk', data);
    return response.data;
  },
};

export const newsService = {
  getNews: async (symbol?: string) => {
    const response = await api.get('/news', { params: { symbol } });
    return response.data;
  },
};

export const jargonService = {
  explainTerm: async (term: string) => {
    const response = await api.get(`/jargon/explain/${term}`);
    return response.data;
  },
};

export default api;
