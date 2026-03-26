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
  },
  getProfile: async () => {
    const response = await api.get(`${AUTH_BASE_URL}/me`);
    return response.data;
  }
};

export const portfolioService = {
  getRecommendation: async (data: any) => {
    const response = await api.post('/portfolio/recommend', data);
    return response.data;
  },
  trackPortfolio: async (id: string, userId?: string) => {
    const response = await api.get(`/portfolio/${id}/track`, { params: { user_id: userId || localStorage.getItem('user_id') } });
    return response.data;
  },
  uploadPortfolio: async (formData: FormData) => {
    const response = await api.post('/portfolio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  allocateBudget: async (id: string, data: any) => {
    const response = await api.post(`/portfolio/${id}/allocate`, data);
    return response.data;
  },
  allocateWithGemini: async (id: string, data: any) => {
    const response = await api.post(`/portfolio/${id}/allocate-ai`, data, { params: { user_id: localStorage.getItem('user_id') } });
    return response.data;
  },
  getInsights: async (id: string, userId?: string) => {
    const response = await api.get(`/portfolio/${id}/insights`, { params: { user_id: userId || localStorage.getItem('user_id') } });
    return response.data;
  },
  getMyPortfolio: async (userId: string) => {
    const response = await api.get('/portfolio/me', { params: { user_id: userId } });
    return response.data;
  },
  getPortfolioById: async (portfolioId: string, userId: string) => {
    const response = await api.get(`/portfolio/${portfolioId}`, { params: { user_id: userId } });
    return response.data;
  },
  getUserPortfolios: async (userId: string) => {
    const response = await api.get('/portfolio/', { params: { user_id: userId } });
    return response.data;
  },
  deletePortfolio: async (portfolioId: string, userId: string) => {
    const response = await api.delete(`/portfolio/${portfolioId}`, { params: { user_id: userId } });
    return response.data;
  },
  deletePortfolioFile: async (portfolioId: string, fileId: string, userId: string) => {
    const response = await api.delete(`/portfolio/${portfolioId}/files/${fileId}`, { params: { user_id: userId } });
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
  getNews: async (portfolio?: any) => {
    const response = await api.post('/news/categorize', { portfolio });
    return response.data;
  },
  getEtNews: async (userId?: string, symbols?: string, forceRefresh?: boolean) => {
    const response = await api.get('/news/et-rss', { 
      params: { 
        user_id: userId || localStorage.getItem('user_id'),
        symbols,
        force_refresh: forceRefresh
      } 
    });
    return response.data;
  },
};

export const geopoliticsService = {
  getGeopolitics: async (symbols?: string, forceRefresh?: boolean) => {
    const response = await api.get('/news/geopolitics', {
      params: {
        symbols,
        force_refresh: forceRefresh
      }
    });
    return response.data;
  }
};

export const jargonService = {
  explainTerm: async (term: string) => {
    const response = await api.get(`/jargon/${term}`);
    return response.data;
  },
  getGlossary: async (skip: number = 0, limit: number = 20) => {
    const response = await api.get(`/jargon/glossary?skip=${skip}&limit=${limit}`);
    return response.data;
  }
};

export default api;
