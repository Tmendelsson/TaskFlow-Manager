import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('tf_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me:       ()     => api.get('/auth/me'),
  logout:   ()     => api.post('/auth/logout'),
};

// ── Projects ────────────────────────────────────────────
export const projectsAPI = {
  list:   ()           => api.get('/projects'),
  get:    (id)         => api.get(`/projects/${id}`),
  create: (data)       => api.post('/projects', data),
  update: (id, data)   => api.put(`/projects/${id}`, data),
  delete: (id)         => api.delete(`/projects/${id}`),
  stats:  (id)         => api.get(`/projects/${id}/stats`),
};

// ── Tasks ───────────────────────────────────────────────
export const tasksAPI = {
  list:         (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  get:          (id)                => api.get(`/tasks/${id}`),
  create:       (projectId, data)   => api.post(`/projects/${projectId}/tasks`, data),
  update:       (id, data)          => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status)        => api.patch(`/tasks/${id}/status`, { status }),
  delete:       (id)                => api.delete(`/tasks/${id}`),
  uploadFile:   (id, formData)      => api.post(`/tasks/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ── Comments ────────────────────────────────────────────
export const commentsAPI = {
  list:   (taskId)       => api.get(`/tasks/${taskId}/comments`),
  create: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  delete: (id)           => api.delete(`/comments/${id}`),
};

// ── Notifications ───────────────────────────────────────
export const notificationsAPI = {
  list:    ()   => api.get('/notifications'),
  markRead:(id) => api.patch(`/notifications/${id}/read`),
  markAll: ()   => api.patch('/notifications/read-all'),
};

// ── Team / Users ────────────────────────────────────────
export const usersAPI = {
  list:   ()           => api.get('/users'),
  invite: (email)      => api.post('/users/invite', { email }),
  update: (id, data)   => api.put(`/users/${id}`, data),
};

export default api;
