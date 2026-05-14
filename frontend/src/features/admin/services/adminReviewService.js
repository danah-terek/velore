import { adminApiClient } from './adminApiClient'

export const adminReviewService = {
  async listPending() {
    return adminApiClient.get('/reviews/pending')
  },

  async approve({ id }) {
    return adminApiClient.put(`/reviews/${id}/approve`)
  },

  async reject({ id }) {
    return adminApiClient.put(`/reviews/${id}/reject`)
  },

  async delete({ id }) {
    return adminApiClient.delete(`/reviews/${id}`)
  },

  async listApproved() {
    // Public endpoint, but safe to call via admin client as GET doesn't require auth
    return adminApiClient.get('/reviews/approved')
  },
}

