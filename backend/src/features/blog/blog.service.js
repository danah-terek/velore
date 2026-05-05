const prisma = require('../../shared/utils/database')

const blogService = {
  async createBlog(payload) {
    const { title, content, image, author, category, slug, is_published } = payload

    return prisma.blog_posts.create({
      data: {
        title,
        slug,
        content,
        image: image || null,
        author,
        category: category || null,
        is_published: is_published !== undefined ? is_published : false
      }
    })
  },

  async updateBlog(postId, payload) {
    const { title, content, image, author, category, is_published } = payload

    const data = {}
    if (title !== undefined) {
      data.title = title
      data.slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }
    if (content !== undefined) data.content = content
    if (image !== undefined) data.image = image || null
    if (author !== undefined) data.author = author
    if (category !== undefined) data.category = category || null
    if (is_published !== undefined) data.is_published = is_published

    return prisma.blog_posts.update({
      where: { post_id: Number(postId) },
      data
    })
  },

  async deleteBlog(postId) {
    return prisma.blog_posts.delete({
      where: { post_id: Number(postId) }
    })
  },

  async getPublishedBlogs() {
    return prisma.blog_posts.findMany({
      where: { is_published: true },
      orderBy: { published_at: 'desc' }
    })
  },

  async getBlogById(postId) {
    return prisma.blog_posts.findUnique({
      where: { post_id: Number(postId) }
    })
  }
}

module.exports = blogService