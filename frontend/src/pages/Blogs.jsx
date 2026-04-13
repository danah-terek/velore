// src/pages/Blogs.jsx
import { Link } from 'react-router-dom'

const allBlogs = [
  { 
    id: 1, 
    title: "What Type of Glasses Suit Me? A Complete Guide", 
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600", 
    date: "April 10, 2026", 
    readTime: "5 min read", 
    author: "Sarah Johnson" 
  },
  { 
    id: 2, 
    title: "How to Protect Your Eyes from UV Light", 
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600", 
    date: "April 8, 2026", 
    readTime: "4 min read", 
    author: "Dr. Michael Chen" 
  },
  { 
    id: 3, 
    title: "From Lens Tech to Luxury Frames: The Evolution of Eyewear", 
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600", 
    date: "April 5, 2026", 
    readTime: "6 min read", 
    author: "Emma Rodriguez" 
  },
]

export default function Blogs() {
  return (
    <div className="min-h-screen bg-white">
      <section className="px-6 md:px-16 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Velore Journal
          </h1>
          <p className="text-gray-600 text-lg">
            Insights on eyewear trends, eye health, and style inspiration
          </p>
        </div>
      </section>

      <section className="px-6 md:px-16 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allBlogs.map(blog => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="group">
              <div className="aspect-[4/3] rounded-sm overflow-hidden mb-4">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span>{blog.date}</span>
                <span>•</span>
                <span>{blog.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-2">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-600">By {blog.author}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}