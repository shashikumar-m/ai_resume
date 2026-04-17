const BASE = 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const authAPI = {
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

export const historyAPI = {
  save: (type, title, summary, score, data) =>
    request('/history', { method: 'POST', body: JSON.stringify({ type, title, summary, score, data }) }),

  getAll: (type) =>
    request(`/history${type ? `?type=${type}` : ''}`),

  getOne: (id) => request(`/history/${id}`),

  delete: (id) => request(`/history/${id}`, { method: 'DELETE' }),

  clearType: (type) => request(`/history?type=${type}`, { method: 'DELETE' }),
}
