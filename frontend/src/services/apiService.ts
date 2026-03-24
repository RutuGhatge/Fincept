import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const portfolioService = {
  getRecommendation: async (data: any) => {
    const response = await api.post('/portfolio/recommend', data);
    return response.data;
  },
  trackPortfolio: async (id: string) => {
    const response = await api.get(`/portfolio/${id}/track`);
    return response.data;
  },
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
