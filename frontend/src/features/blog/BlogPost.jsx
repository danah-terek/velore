// src/pages/BlogPost.jsx
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Calendar, User, Clock, Tag } from 'lucide-react'

const blogPosts = {
  1: {
    id: 1,
    title: "What Type of Glasses Suit Me? A Complete Guide",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200",
    date: "April 10, 2026",
    author: "Sarah Johnson",
    readTime: "5 min read",
    category: "Style Guide",
    relatedPosts: [2, 3],
    content: `
      <p class="mb-4">Finding the perfect pair of glasses can be a transformative experience. Not only do they help you see better, but they also serve as a powerful fashion accessory that can enhance your facial features and express your personality.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Understanding Your Face Shape</h2>
      <p class="mb-4">The key to finding glasses that suit you lies in understanding your face shape. Here's a breakdown of the most common face shapes and the frames that complement them:</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Round Face</h3>
      <p class="mb-4">If you have a round face with soft curves and equal width and length, angular frames are your best friend. Rectangular, square, and geometric frames add definition and structure to your features.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Square Face</h3>
      <p class="mb-4">Square faces feature a strong jawline and broad forehead. Round or oval frames help soften these angular features and create balance.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Oval Face</h3>
      <p class="mb-4">Lucky you! Oval faces are well-proportioned and can pull off almost any frame style. From bold cat-eyes to classic rounds, the world is your oyster.</p>
      
      <h3 class="text-lg font-semibold mt-6 mb-2">Heart Face</h3>
      <p class="mb-4">Heart-shaped faces are wider at the forehead and narrow at the chin. Light-colored or rimless frames work well, as do bottom-heavy frames that add width to the lower part of your face.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Consider Your Lifestyle</h2>
      <p class="mb-4">Beyond aesthetics, think about how you'll use your glasses. Are you a busy professional who needs durable frames? Do you spend hours in front of screens? Your lifestyle should influence your choice of materials and lens coatings.</p>
    `,
  },
  2: {
    id: 2,
    title: "How to Protect Your Eyes from UV Light",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200",
    date: "April 8, 2026",
    author: "Dr. Michael Chen",
    readTime: "4 min read",
    category: "Eye Health",
    relatedPosts: [1, 3],
    content: `
      <p class="mb-4">UV protection isn't just for your skin—your eyes need protection from harmful ultraviolet rays too. Prolonged exposure to UV light can lead to serious eye conditions including cataracts, macular degeneration, and even cancer.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Understanding UV Radiation</h2>
      <p class="mb-4">There are three types of UV radiation: UVA, UVB, and UVC. While UVC is mostly absorbed by the ozone layer, UVA and UVB rays reach the earth's surface and can damage your eyes.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">5 Ways to Protect Your Eyes</h2>
      <ol class="list-decimal pl-5 space-y-2 mb-4">
        <li><strong>Wear 100% UV-blocking sunglasses</strong> - Look for labels that say "100% UV protection" or "UV400"</li>
        <li><strong>Choose wrap-around styles</strong> - These prevent UV rays from entering from the sides</li>
        <li><strong>Don't forget cloudy days</strong> - UV rays penetrate clouds, so wear protection year-round</li>
        <li><strong>Add UV protection to your prescription glasses</strong> - Clear lenses can have UV-blocking coatings</li>
        <li><strong>Wear a wide-brimmed hat</strong> - This provides additional protection for your eyes and face</li>
      </ol>
    `,
  },
  3: {
    id: 3,
    title: "From Lens Tech to Luxury Frames: The Evolution of Eyewear",
    image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200",
    date: "April 5, 2026",
    author: "Emma Rodriguez",
    readTime: "6 min read",
    category: "Industry Trends",
    relatedPosts: [1, 2],
    content: `
      <p class="mb-4">The eyewear industry has come a long way from simple glass lenses held together by wire. Today's glasses are technological marvels that combine cutting-edge materials, precision engineering, and high fashion.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">The Digital Revolution in Lenses</h2>
      <p class="mb-4">Digital free-form technology has transformed how lenses are made. Unlike traditional manufacturing, digital surfacing creates lenses with unprecedented precision, resulting in sharper vision and reduced distortion.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Smart Glasses and AR</h2>
      <p class="mb-4">The integration of augmented reality into eyewear is no longer science fiction. From fitness tracking to real-time translation, smart glasses are becoming increasingly sophisticated while maintaining stylish designs.</p>
      
      <h2 class="text-xl font-semibold mt-8 mb-4">Sustainable Luxury</h2>
      <p class="mb-4">Luxury eyewear brands are embracing sustainability, using eco-friendly materials like bio-acetate, recycled metals, and even ocean plastics to create beautiful frames that are kind to the planet.</p>
    `,
  }
}

export default function BlogPost() {
  const { id } = useParams()
  const post = blogPosts[id]

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Blog post not found</h1>
          <Link to="/blogs" className="text-gray-600 hover:text-gray-900 underline">
            View all blogs
          </Link>
        </div>
      </div>
    )
  }

  // Get related posts
  const relatedPosts = post.relatedPosts?.map(relatedId => blogPosts[relatedId]).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-6 md:px-16 max-w-4xl mx-auto w-full">
            <Link 
              to="/blogs" 
              className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Back to blogs</span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold text-white max-w-3xl">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      <article className="px-6 md:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2"><User size={16} />{post.author}</div>
            <div className="flex items-center gap-2"><Calendar size={16} />{post.date}</div>
            <div className="flex items-center gap-2"><Clock size={16} />{post.readTime}</div>
            <div className="flex items-center gap-2"><Tag size={16} />{post.category}</div>
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Related Posts Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link 
                    key={relatedPost.id}
                    to={`/blogs/${relatedPost.id}`}
                    className="group block"
                  >
                    <div className="aspect-[16/9] rounded-sm overflow-hidden mb-3">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                      <span>{relatedPost.date}</span>
                      <span>•</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors mb-1">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600">By {relatedPost.author}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}