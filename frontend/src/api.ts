import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxy to backend via Vite config
});

// Repositories (Mapping from Projects)
export const fetchRepositories = () => api.get('/projects');
export const fetchRepository = (id: string) => api.get(`/projects/${id}`);

// Tasks (usado no Painel para atividade recente)
export const fetchTasks = () => api.get('/tasks');

// AI Assistant
export const analyzeRepository = (repoId: string, query: string) =>
  api.post('/ai/analyze', { repoId, query });

// Dashboard
export const fetchDashboardSummary = () => api.get('/dashboard/summary');
export const fetchTasksByStatus = () => api.get('/dashboard/tasks-by-status');
export const fetchUpcomingDeadlines = () => api.get('/dashboard/upcoming-deadlines');

// Integration
export const triggerGitHubSync = () => api.post('/integration/sync');
export const fetchIntegrationStatus = () => api.get('/integration/status');
export const fetchSyncHistory = (limit = 10) =>
  api.get('/integration/history', { params: { limit } });
