const blogService = require('./blog.service')

const serializeBlog = (blog) => {
  if (!blog) return null;
  return {
    ...blog,
    // Safely convert to string if post_id exists, otherwise default to empty string or fallback id
    post_id: blog.post_id ? blog.post_id.toString() : ''
  }
}

const blogController = {
  async createBlog(req, res) {
    try {
      const { title, content, image, author, category, is_published } = req.body

      if (!title || !content || !author) {
        return res.status(400).json({
          success: false,
          message: 'title, content, and author are required'
        })
      }

      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      const data = await blogService.createBlog({
        title: title.trim(),
        content: content.trim(),
        image,
        author: author.trim(),
        category: category ? category.trim() : null,
        slug,
        is_published
      })

      return res.status(201).json({ success: true, data: serializeBlog(data) })
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
    }
  },

  async updateBlog(req, res) {
    try {
      const data = await blogService.updateBlog(req.params.id, req.body)
      return res.json({ success: true, data: serializeBlog(data) })
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Blog not found' })
      }
      return res.status(400).json({ success: false, error: error.message })
    }
  },

  async deleteBlog(req, res) {
    try {
      await blogService.deleteBlog(req.params.id)
      return res.json({ success: true, message: 'Blog deleted successfully' })
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Blog not found' })
      }
      return res.status(400).json({ success: false, error: error.message })
    }
  },

  async getPublishedBlogs(req, res) {
    try {
      const data = await blogService.getPublishedBlogs()
      return res.json({ success: true, data: data.map(serializeBlog) })
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
    }
  },

  async getAllBlogs(req, res) {
    try {
      const data = await blogService.getAllBlogs()
      return res.json({ success: true, data: data.map(serializeBlog) })
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
    }
  },

  async getBlogById(req, res) {
    try {
      const data = await blogService.getBlogById(req.params.id)
      if (!data) {
        return res.status(404).json({ success: false, message: 'Blog not found' })
      }
      return res.json({ success: true, data: serializeBlog(data) })
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}

module.exports = blogController