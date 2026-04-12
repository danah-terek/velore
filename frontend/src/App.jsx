import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Checkout from './pages/Checkout'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import AIAdvisor from './pages/AIAdvisor'
import Navbar from './components/ui/Navbar'
import About from './pages/About'
import Favorite from './pages/Favorite'
import Footer from './components/ui/Footer'
function App() {
  return (
    <BrowserRouter>       
     <Navbar/>


      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="/favorite" element={<Favorite />} />

        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="/ai-advisor" element={<AIAdvisor />} />

      </Routes>
      <Footer/>
    </BrowserRouter>
  )
}

export default App