import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password) => api.post('/auth/register', { username, password }),
}

export const tasksAPI = {
  getAll:          () => api.get('/api/tasks'),
  create:          (data) => api.post('/api/tasks', data),
  update:          (id, data) => api.patch(`/api/tasks/${id}`, data),
  delete:          (id) => api.delete(`/api/tasks/${id}`),
  deleteCompleted: () => api.delete('/api/tasks/completed'),
}

export const llmAPI = {
  chat:       (messages, model) => api.post('/api/llm', { messages, model }),
  chatVision: (messages, image_base64) => api.post('/api/llm', { messages, image_base64 }),
}

export default api
