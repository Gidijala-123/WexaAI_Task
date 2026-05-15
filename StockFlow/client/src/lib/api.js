const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

async function request(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (res.status === 401 && !path.startsWith('/auth/')) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Session expired. Please sign in again.')
  }
  const data = await res.json()
  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`)
    error.status = res.status
    throw error
  }
  return data
}

export const api = {
  auth: {
    signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  products: {
    list: (search) => request(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    get: (id) => request(`/products/${id}`),
    create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    adjustStock: (id, adjustment) =>
      request(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ adjustment }) }),
  },
  dashboard: {
    get: () => request('/dashboard'),
  },
  settings: {
    get: () => request('/settings'),
    update: (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) }),
  },
}
