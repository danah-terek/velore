import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
})

function isAdminRequest(config) {
  const raw = config.url || ''
  const path = raw.split('?')[0]
  const method = (config.method || 'get').toLowerCase()

  if (path.startsWith('/admin/') && path !== '/admin/login') return true
  if (path === '/banner' && method === 'put') return true
  if (path === '/reviews/pending') return true
  if (method === 'put' && /^\/reviews\/[^/]+\/(approve|reject)$/.test(path)) return true
  if (path.startsWith('/blogs') && ['post', 'put', 'patch', 'delete'].includes(method)) return true

  return false
}

apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')
    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    const token = isAdminRequest(config) ? (adminToken || userToken) : (userToken || adminToken)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const cfg = error.config || {}
    const adminRequest = isAdminRequest(cfg)

    if (status === 401) {
      const path = (cfg.url || '').split('?')[0]
      const isLoginAttempt = path === '/admin/login' || path === '/auth/login'
      if (isLoginAttempt) {
        return Promise.reject(error.response?.data || error)
      }
      if (adminRequest) {
        sessionStorage.removeItem('admin_token')
        sessionStorage.removeItem('velore_admin_user')
        if (!window.location.pathname.startsWith('/admin/login')) {
          window.location.href = '/admin/login'
        }
      } else {
        localStorage.removeItem('token')
        sessionStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('guestCart')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default apiClient