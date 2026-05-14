import { adminApiClient } from './adminApiClient'

export const adminAnalyticsService = {
  async getAnalytics() {
    return adminApiClient.get('/admin/analytics')
  },
}

