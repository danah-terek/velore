import { Link } from 'react-router-dom'
import logo from '../../assets/logoEye-blue.png'

export default function Footer() {
    return (
        <footer className="border-t border-gray-200 pt-10 pb-6 px-6 bg-white">

            {/* MOBILE layout — hidden on md and above */}
            <div className="md:hidden mb-10">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Velore Eyewear" className="w-32" />
                </div>
                <div className="flex justify-between mb-6">
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/shop?type=bestsellers" className="hover:text-black">Bestsellers</Link></li>
                            <li><Link to="/shop?type=limited" className="hover:text-black">Limited Collection</Link></li>
                            <li><Link to="/shop" className="hover:text-black">Shop All</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/about" className="hover:text-black">Our Story</Link></li>
                            <li><Link to="/contact" className="hover:text-black">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="w-full">
                    <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Subscribe to our newsletter</h4>
                    <div className="flex flex-col gap-2">
                        <input type="email" placeholder="Enter Your Email" className="border border-gray-300 px-4 py-2 text-sm outline-none w-full" />
                        <button className="border border-gray-800 text-xs tracking-widest uppercase py-2 hover:bg-black hover:text-white transition-colors">Subscribe</button>
                    </div>
                </div>
            </div>

            {/* DESKTOP layout — hidden below md */}
            <div className="hidden md:flex justify-between items-start gap-10 mb-10">
                <div className="flex gap-16">
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Shop</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/shop?type=bestsellers" className="hover:text-black">Bestsellers</Link></li>
                            <li><Link to="/shop?type=limited" className="hover:text-black">Limited Collection</Link></li>
                            <li><Link to="/shop" className="hover:text-black">Shop All</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li><Link to="/about" className="hover:text-black">Our Story</Link></li>
                            <li><Link to="/contact" className="hover:text-black">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <img src={logo} alt="Velore Eyewear" className="w-36" />
                </div>
                <div className="max-w-xs w-full">
                    <h4 className="text-xs font-semibold tracking-widest uppercase mb-4">Subscribe to our newsletter</h4>
                    <div className="flex flex-col gap-2">
                        <input type="email" placeholder="Enter Your Email" className="border border-gray-300 px-4 py-2 text-sm outline-none w-full" />
                        <button className="border border-gray-800 text-xs tracking-widest uppercase py-2 hover:bg-black hover:text-white transition-colors">Subscribe</button>
                    </div>
                </div>
            </div>

            {/* Middle section */}
            <div className="relative flex items-center justify-between border-t border-gray-200 pt-6 mb-6">
                <div className="flex gap-4 text-gray-700">
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.013 15.259 0 12 0z" />
                            <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324A6.162 6.162 0 0 0 12 5.838zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                        </svg>
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22.676 0H1.324C.593 0 0 .593 0 1.324v21.352C0 23.408.593 24 1.324 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.592 1.323-1.324V1.324C24 .593 23.408 0 22.676 0" />
                        </svg>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-black">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                    </a>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex gap-4 items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/PayPal_Logo_Icon_2014.svg" alt="PayPal" className="h-6" />
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                    <select className="border border-gray-300 px-2 py-1 text-sm outline-none">
                        <option>United States (USD $)</option>
                        <option>Lebanon (LBP)</option>
                    </select>
                    <select className="border border-gray-300 px-2 py-1 text-sm outline-none">
                        <option>English</option>
                        <option>Arabic</option>
                    </select>
                </div>
            </div>

            {/* Bottom section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500">
                <p>© 2026 Velore</p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link to="/refund-policy" className="hover:text-black">Refund Policy</Link>
                    <Link to="/privacy-policy" className="hover:text-black">Privacy Policy</Link>
                    <Link to="/terms-of-service" className="hover:text-black">Terms Of Service</Link>
                    <Link to="/shipping-policy" className="hover:text-black">Shipping Policy</Link>
                </div>
            </div>

        </footer>
    )
}