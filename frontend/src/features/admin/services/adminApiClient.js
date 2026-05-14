import axios from 'axios'

const ADMIN_TOKEN_KEY = 'admin_token'

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
}

export const adminApiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY)
      localStorage.removeItem('velore_admin_user')
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)

export function unwrapData(payload) {
  // Common contracts:
  // 1) { success, message, data }
  // 2) { success, message, data: [...], pagination, errors }
  if (!payload || typeof payload !== 'object') return payload
  if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data
  return payload
}

