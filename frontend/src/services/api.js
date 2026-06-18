import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://aicte-batch-1-resume-builder.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 / token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: (token) => api.post('/api/auth/refresh', { refresh_token: token }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getGoogleUrl: () => api.get('/api/auth/google'),
}

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  getMe: () => api.get('/api/users/me'),
  updateMe: (data) => api.put('/api/users/me', data),
  uploadAvatar: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  changePassword: (data) => api.post('/api/users/me/change-password', data),
  // Admin
  listUsers: (skip = 0, limit = 50) => api.get('/api/users/', { params: { skip, limit } }),
  getUserStats: () => api.get('/api/users/stats'),
  deactivateUser: (id) => api.delete(`/api/users/${id}`),
}

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getAdminOverview: () => api.get('/api/dashboard/admin/overview'),
}

// ── Resumes ───────────────────────────────────────────
export const resumesAPI = {
  list: () => api.get('/api/resumes/'),
  create: (data) => api.post('/api/resumes/', data),
  get: (id) => api.get(`/api/resumes/${id}`),
  update: (id, data) => api.put(`/api/resumes/${id}`, data),
  delete: (id) => api.delete(`/api/resumes/${id}`),
  download: (id, template) =>
    api.get(`/api/resumes/${id}/download`, {
      params: { template },
      responseType: 'blob',
    }),
  generateAI: (data) => api.post('/api/resumes/ai/generate', data),
  rewriteAI: (id, targetRole) =>
    api.post(`/api/resumes/${id}/ai/rewrite`, null, { params: { target_role: targetRole } }),
  getVersions: (id) => api.get(`/api/resumes/${id}/versions`),
  setPrimary: (id) => api.post(`/api/resumes/${id}/set-primary`),
}

// ── ATS ───────────────────────────────────────────────
export const atsAPI = {
  analyze: (file, resumeId) => {
    const form = new FormData()
    form.append('file', file)
    if (resumeId) form.append('resume_id', resumeId)
    return api.post('/api/ats/analyze', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  match: (data) => api.post('/api/ats/match', data),
  getReports: () => api.get('/api/ats/reports'),
  getReport: (id) => api.get(`/api/ats/reports/${id}`),
}

// ── Cover Letters ─────────────────────────────────────
export const coverLetterAPI = {
  generate: (data) => api.post('/api/cover-letters/generate', data),
  list: () => api.get('/api/cover-letters/'),
  get: (id) => api.get(`/api/cover-letters/${id}`),
  download: (id) =>
    api.get(`/api/cover-letters/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/api/cover-letters/${id}`),
}

// ── Portfolio ─────────────────────────────────────────
export const portfolioAPI = {
  generate: (data) => api.post('/api/portfolio/generate', data),
  list: () => api.get('/api/portfolio/'),
  get: (id) => api.get(`/api/portfolio/${id}`),
  update: (id, data) => api.put(`/api/portfolio/${id}`, data),
  togglePublish: (id) => api.post(`/api/portfolio/${id}/publish`),
  download: (id) =>
    api.get(`/api/portfolio/${id}/download`, { responseType: 'blob' }),
  preview: (id) =>
    api.get(`/api/portfolio/${id}/preview`, { responseType: 'text' }),
  delete: (id) => api.delete(`/api/portfolio/${id}`),
}

// ── Interview ─────────────────────────────────────────
export const interviewAPI = {
  generate: (data) => api.post('/api/interview/generate', data),
  listSessions: () => api.get('/api/interview/sessions'),
  getSession: (id) => api.get(`/api/interview/sessions/${id}`),
  deleteSession: (id) => api.delete(`/api/interview/sessions/${id}`),
}

// ── Chat ──────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post('/api/chat/message', data),
  listChats: () => api.get('/api/chat/histories'),
  getChat: (id) => api.get(`/api/chat/histories/${id}`),
  deleteChat: (id) => api.delete(`/api/chat/histories/${id}`),
}

// ── Templates ─────────────────────────────────────────
export const templatesAPI = {
  list: (category) => api.get('/api/templates/', { params: { category } }),
  get: (id) => api.get(`/api/templates/${id}`),
}

// ── Subscription ──────────────────────────────────────
export const subscriptionAPI = {
  getPlans: () => api.get('/api/subscription/plans'),
  getMy: () => api.get('/api/subscription/me'),
  upgrade: (data) => api.post('/api/subscription/upgrade', data),
}
