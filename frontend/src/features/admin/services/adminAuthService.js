import { adminApiClient } from './adminApiClient'

export const adminAuthService = {
  async login({ email, password }) {
    const res = await adminApiClient.post('/admin/login', { email, password })
    // backend returns { success, message, data: { admin, token } }
    const payload = res?.data
    const token = payload?.token
    const admin = payload?.admin
    if (!token || !admin) {
      throw new Error('Invalid login response from server')
    }
    return { token, admin }
  },
}

