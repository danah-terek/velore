// App.jsx - Complete with Contact Modal
import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ui/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Checkout from './pages/Checkout'
import AIAdvisor from './pages/AIAdvisor'
import Navbar from './components/ui/Navbar'
import Favorite from './pages/Favorite'
import Footer from './components/ui/Footer'
import CartSidebar from './components/ui/CartSidebar'
import PaymentSuccess from './pages/PaymentSuccess'
import ContactModal from './components/ui/ContactModal'

// Lazy loaded components
const Blogs = lazy(() => import('./pages/Blogs'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar 
        onCartOpen={() => setCartOpen(true)} 
        onContactOpen={() => setContactOpen(true)}
      />
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      
      <Routes>
        {/* Eager loaded routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />
        
        {/* Lazy loaded routes with Suspense */}
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
    </BrowserRouter>
  )
}

export default App