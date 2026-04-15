// src/App.jsx - Updated for new feature-based structure
import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout Components (from shared/)
import { Navbar, Footer, ScrollToTop } from './shared/components/layout'
import { ContactModal } from './shared/components/ui'

// Feature Components (from features/)
import { Home } from './features/home'
import { Shop } from './features/shop'
import { ProductDetail } from './features/product'
import { Login, Signup } from './features/auth'
import { CartSidebar } from './features/cart'
import { Checkout, PaymentSuccess } from './features/checkout'
import { AIAdvisor } from './features/ai-advisor'
import { Favorite } from './features/favorite'

// Context
import { FavoritesProvider, useFavorites } from './shared/contexts'

// Lazy loaded features
const Blogs = lazy(() => import('./features/blog/Blogs'))
const BlogPost = lazy(() => import('./features/blog/BlogPost'))

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

// Toast notification for favorites
function Toast() {
  const { toast } = useFavorites()
  if (!toast) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg animate-fade-in-up">
      ❤️ {toast}
    </div>
  )
}

function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <BrowserRouter>
      <FavoritesProvider>
        <ScrollToTop />
        <Navbar
          onCartOpen={() => setCartOpen(true)}
          onContactOpen={() => setContactOpen(true)}
        />
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        <Toast />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/favorite" element={<Favorite />} />
          
          {/* Lazy Loaded Routes */}
          <Route path="/blogs" element={
            <Suspense fallback={<PageLoader />}>
              <Blogs />
            </Suspense>
          } />
          <Route path="/blogs/:id" element={
            <Suspense fallback={<PageLoader />}>
              <BlogPost />
            </Suspense>
          } />
        </Routes>

        <Footer />
      </FavoritesProvider>
    </BrowserRouter>
  )
}

export default App