import { adminApiClient } from './adminApiClient'

export const adminDashboardService = {
  async getDashboard() {
    return adminApiClient.get('/admin/dashboard')
  },
}

