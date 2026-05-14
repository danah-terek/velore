import { adminApiClient } from './adminApiClient'

export const adminBlogService = {
  async listAll() {
    return adminApiClient.get('/blogs/admin/all')
  },
  async listPublished() {
    return adminApiClient.get('/blogs')
  },
  async create(payload) {
    return adminApiClient.post('/blogs', payload)
  },
  async update(id, payload) {
    return adminApiClient.put(`/blogs/${id}`, payload)
  },
  async remove(id) {
    return adminApiClient.delete(`/blogs/${id}`)
  },
}