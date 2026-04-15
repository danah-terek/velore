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
import { FavoritesProvider, useFavorites } from './context/FavoritesContext'

const Blogs = lazy(() => import('./pages/Blogs'))
const BlogPost = lazy(() => import('./pages/BlogPost'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

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
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/favorite" element={<Favorite />} />

          <Route path="/product/:id" element={<ProductDetail />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/blogs" element={
            <Suspense fallback={<PageLoader />}><Blogs /></Suspense>
          } />
          <Route path="/blogs/:id" element={
            <Suspense fallback={<PageLoader />}><BlogPost /></Suspense>
          } />
        </Routes>

        <Footer />
      </FavoritesProvider>
    </BrowserRouter>
  )
}

export default App