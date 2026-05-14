import { adminApiClient } from './adminApiClient'

export const adminStaffService = {
  async list() {
    return adminApiClient.get('/admin/staff')
  },
  async create({ email, password, name, role }) {
    return adminApiClient.post('/admin/staff', { email, password, name, role })
  },
  async update(id, data) {
    return adminApiClient.patch(`/admin/staff/${id}`, data)
  },
  async remove(id) {
    return adminApiClient.delete(`/admin/staff/${id}`)
  },
  async getById(id) {
    return adminApiClient.get(`/admin/staff/${id}`)
  },
  async getRoles() {
    return adminApiClient.get('/admin/staff/roles')
  }
}