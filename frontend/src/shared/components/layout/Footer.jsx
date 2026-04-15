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
            <div className="border-t border-gray-200 pt-6 mb-6">

                {/* Mobile layout — stacked */}
                <div className="flex flex-col items-center gap-4 md:hidden">
                    <div className="flex gap-4 text-gray-700">
                        {/* social icons here */}
                    </div>
                    <div className="flex gap-4 items-center">
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

                {/* Desktop layout — side by side with centered payment */}
                <div className="relative hidden md:flex items-center justify-between">
                    <div className="flex gap-4 text-gray-700">
                        {/* social icons here */}
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