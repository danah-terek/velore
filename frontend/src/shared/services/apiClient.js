import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000
})

// Request interceptor - attach token
apiClient.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const cfg = error.config || {}

    if (status === 401) {
      const path = (cfg.url || '').split('?')[0]
      const isLoginAttempt = path === '/admin/login' || path === '/auth/login'
      if (isLoginAttempt) {
        return Promise.reject(error.response?.data || error)
      }
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('guestCart')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default apiClient
