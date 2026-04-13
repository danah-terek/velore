import { Link } from 'react-router-dom'
import heroImg from "../assets/photoshoot.png"
import Testimonials from "../components/eyewear/Testimonials"
import EyewearCard from '../components/eyewear/EyewearCard'
import sketchImage from '../assets/Veloresketch.jpeg'
export default function Home() {

  return (
    <div>

      {/* HERO SECTION */}
      <section className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden -mt-20">

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />

        <img
          src="https://images.unsplash.com/photo-1731983061288-a851eb9c9cb7?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGdsYXNzZXMlMjBtb2RlbHxlbnwwfHwwfHx8MA%3D%3D"
          alt="Eyewear"
          className="w-full h-full object-cover object-[center_25%]"
        />

        {/* Text */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 pb-0">
          <h1 className="text-3xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-md">
            Eyewear that fits you before you buy
          </h1>
          <p className="text-white/70 text-sm md:text-base mb-8 max-w-sm">
            Discover frames crafted for your unique face shape
          </p>
          <div className="flex gap-3">
            <Link to="/shop" className="bg-white text-gray-900 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 transition">
              Shop now
            </Link>
            <Link to="/ai-advisor" className="border border-white text-white px-5 py-2.5 text-sm font-medium hover:bg-white hover:text-gray-900 transition">
              Try Virtual Try-On
            </Link>
          </div>
        </div>

      </section>



      {/* NEW COLLECTION SECTION */}
      <section className="px-6 md:px-16 py-12">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-1">New collection</h2>
          <Link to="/shop" className="text-xs text-gray-400 hover:text-black tracking-widest uppercase flex items-center gap-1 transition-colors w-fit">
            view all <span className="text-base">→</span>
          </Link>
        </div>

        {/* Mobile — horizontal scroll */}
        <div className="flex md:hidden gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "MIU MIU Eyewear logo-print glasses", price: 264, description: "Contemporary eyewear crafted with...", colors: ['#8B0000', '#1E3A8A', '#6B0F1A'] },
            { image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Quill Round Tortoise Glasses for Women", price: 80, description: "Sleek, modern sunglasses featuring a...", colors: ['#8B0000', '#2F4F4F', '#6B0F1A'] },
            { image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Semi-rimless rectangular eyeglasses.", price: 45, description: "Refined silhouette with a clean top line...", colors: ['#000000'] },
          ].map((product, index) => (
            <div key={index} className="w-[45vw] flex-shrink-0">
              <EyewearCard {...product} />
            </div>
          ))}
        </div>

        {/* Desktop — 4 cards per row, wraps to new line */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {[
            { image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400", name: "MIU MIU Eyewear logo-print glasses", price: 264, description: "Contemporary eyewear crafted with...", colors: ['#8B0000', '#1E3A8A', '#6B0F1A'] },
            { image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Quill Round Tortoise Glasses for Women", price: 80, description: "Sleek, modern sunglasses featuring a...", colors: ['#8B0000', '#2F4F4F', '#6B0F1A'] },
            { image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Semi-rimless rectangular eyeglasses.", price: 45, description: "Refined silhouette with a clean top line...", colors: ['#000000'] },
            { image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400", name: "Quill Round Tortoise Glasses for Women", price: 80, description: "Sleek, modern sunglasses featuring a...", colors: ['#8B0000', '#2F4F4F', '#6B0F1A'] },
            { image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=400", name: "Semi-rimless rectangular eyeglasses.", price: 45, description: "Refined silhouette with a clean top line...", colors: ['#000000'] },

          ].map((product, index) => (
            <EyewearCard key={index} {...product} />
          ))}
        </div>

      </section>
      <div >

        {/* AI ASSISTANT SECTION */}
        <section className="px-6 md:px-16 py-16 bg-white">

          <div className="flex flex-col md:flex-row items-center justify-between gap-16">

            {/* Left — text + button */}
            <div className="max-w-md text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-8">
                Hello, this is your AI assistant say
              </h2>
              <Link
                to="/ai-advisor"
                className="inline-block bg-gray-900 text-white text-sm px-8 py-4 hover:bg-gray-700 transition-colors"
              >
                Chat with VELORE-AI!
              </Link>
            </div>

            {/* Right — phone mockup */}
            <div className="flex gap-6 items-end justify-center mr-0 md:mr-16">
              {/* Back phone */}
              <div className="w-24 md:w-44 h-44 md:h-80 border-4 border-gray-300 rounded-3xl bg-white opacity-50 -mb-4" />
              {/* Front phone */}
              <div className="w-28 md:w-52 h-52 md:h-96 border-4 border-gray-900 rounded-3xl bg-white flex flex-col">
                <div className="w-12 md:w-16 h-1.5 bg-gray-900 rounded-full mx-auto mt-4" />
              </div>
            </div>

          </div>
        </section>







      </div>

      <Testimonials />


      {/* About us */}
      <section id="about-us" className="px-6 md:px-16 py-16 scroll-mt-20">
  <h2 className="text-2xl font-semibold mb-8">About us</h2>

        <div className="flex flex-row items-center gap-6 md:gap-16">

          {/* Text block */}
          <div className="flex flex-col items-center flex-1">
            <h2 className="text-6xl md:text-8xl font-bold text-black leading-none mb-4">
              20+
            </h2>
            <p className="text-xs md:text-sm leading-relaxed text-gray-600 text-center">
              years of experience, Velore has been dedicated to selecting only the finest
              quality products for our customers. Our journey began with a simple mission: to
              bring craftsmanship, durability, and timeless style together under one roof.
            </p>
          </div>

          {/* Sketch image */}
          <div className="flex-1">
            <img
              src={sketchImage}
              alt="Eyewear design sketches"
              className="w-full h-auto object-contain"
            />
          </div>

        </div>
      </section>


      {/* LATEST NEWS SECTION */}
      <section id="latest-news" className="px-6 md:px-16 py-16 scroll-mt-20">
        <h2 className="text-2xl font-semibold mb-8">Latest news</h2>

        {/* Mobile — horizontal scroll */}
        <div className="flex md:hidden gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: 1, image: "https://www.warbyparker.com/learn/wp-content/uploads/2025/03/nose-bridge-types.jpg", title: "What are type of glasses that suit me" },
            { id: 2, image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600", title: "How to protect eyes from UV light" },
            { id: 3, image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600", title: "From lens tech to luxury frames" },
          ].map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="min-w-[70vw] flex-shrink-0 relative group overflow-hidden rounded-sm">
              <img src={blog.image} alt={blog.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop — 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {[
            { id: 1, image: "https://www.warbyparker.com/learn/wp-content/uploads/2025/03/nose-bridge-types.jpg", title: "What are type of glasses that suit me" },
            { id: 2, image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600", title: "How to protect eyes from UV light" },
            { id: 3, image: "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600", title: "From lens tech to luxury frames" },
          ].map((blog) => (
            <Link key={blog.id} to={`/blogs/${blog.id}`} className="relative group overflow-hidden rounded-sm">
              <img src={blog.image} alt={blog.title} className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm font-medium">{blog.title}</p>
              </div>
            </Link>
          ))}
        </div>

      </section>


    </div>
  );
}