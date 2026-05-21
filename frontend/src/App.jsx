import { lazy, Suspense, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { Footer, Navbar, ScrollToTop } from './shared/components/layout'
import { FavoritesProvider, useFavorites } from './shared/contexts'
import { AIAdvisorChat } from './features/ai-advisor'

import TryOn from "./features/tryon/TryOn";
import TopBanner from './shared/components/layout/TopBanner'

const Home = lazy(() => import('./features/home/Home'))
const Shop = lazy(() => import('./features/shop/Shop'))
const ProductDetail = lazy(() => import('./features/product/ProductDetail'))
const Login = lazy(() => import('./features/auth/Login'))
const Signup = lazy(() => import('./features/auth/Signup'))
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./features/auth/ResetPassword'))
const Checkout = lazy(() => import('./features/checkout/Checkout'))
const PaymentSuccess = lazy(() => import('./features/checkout/PaymentSuccess'))
const Favorite = lazy(() => import('./features/favorite/Favorite'))
const Blogs = lazy(() => import('./features/blog/Blogs'))
const BlogPost = lazy(() => import('./features/blog/BlogPost'))

const About = lazy(() => import('./pages/About'))
const PolicyPlaceholder = lazy(() => import('./pages/PolicyPlaceholder'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Profile = lazy(() => import('./pages/Profile'))

const AdminApp = lazy(() => import('./features/admin/AdminApp'))

const CartSidebar = lazy(() => import('./features/cart/CartSidebar'))
const ContactModal = lazy(() => import('./shared/components/ui/ContactModal'))
const CookieBanner = lazy(() => import('./shared/components/ui/CookieBanner'))

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="v-card-luxury px-6 py-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[rgba(var(--velore-border),0.9)] border-t-[rgba(var(--velore-fg),0.9)] animate-spin" />
        <div className="text-sm text-[rgba(var(--velore-fg),0.75)]">{label}</div>
      </div>
    </div>
  )
}

function RouteTransition({ children }) {
  const location = useLocation()
  const key = useMemo(() => location.pathname, [location.pathname])
  return (
    <div key={key} className="v-route-enter">
      {children}
    </div>
  )
}

function Toast() {
  const { toast } = useFavorites()
  if (!toast) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg">
      {toast}
    </div>
  )
}

function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <TopBanner />
      <Navbar onCartOpen={() => setCartOpen(true)} onContactOpen={() => setContactOpen(true)} />

      <Suspense fallback={null}>
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <CookieBanner />
      </Suspense>

      <AIAdvisorChat />
      <Toast />

      <main className="min-h-[60vh]">
        <Suspense fallback={<PageLoader />}>
          <RouteTransition>
            <Outlet />
          </RouteTransition>
        </Suspense>
      </main>

      <Footer onContactOpen={() => setContactOpen(true)} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <ScrollToTop />
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<PageLoader label="Loading admin…" />}>
                <AdminApp />
              </Suspense>
            }
          />

          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="products" element={<Navigate to="/shop" replace />} />
            <Route path="product/:id" element={<ProductDetail />} />

            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/:id" element={<BlogPost />} />

            <Route path="about" element={<About />} />

            <Route path="favorite" element={<Favorite />} />
            <Route path="favorites" element={<Navigate to="/favorite" replace />} />

            <Route path="profile" element={<Profile />} />

            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="register" element={<Navigate to="/signup" replace />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            <Route path="checkout" element={<Checkout />} />
            <Route path="payment-success" element={<PaymentSuccess />} />

            <Route path="refund-policy" element={<PolicyPlaceholder title="Refund Policy" />} />
            <Route path="privacy-policy" element={<PolicyPlaceholder title="Privacy Policy" />} />
            <Route path="terms-of-service" element={<PolicyPlaceholder title="Terms of Service" />} />
            <Route path="shipping-policy" element={<PolicyPlaceholder title="Shipping Policy" />} />
            <Route path="/try-on" element={<TryOn />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  )
}