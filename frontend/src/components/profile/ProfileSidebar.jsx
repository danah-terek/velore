import { useEffect, useMemo, useState } from 'react'
import { X, LogOut, Award, Clock, ChevronDown, ChevronUp, Heart, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../shared/services/apiClient'
import ReviewForm from '../reviews/ReviewForm'

export default function ProfileSidebar({ isOpen, onClose, onLogout, onContactOpen, user: userProp }) {
  const [activeTab, setActiveTab] = useState('account')
  const [orders, setOrders] = useState([])
  const [pointsData, setPointsData] = useState({ currentPoints: 0, transactions: [] })
  const [loading, setLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [selectedReviewTarget, setSelectedReviewTarget] = useState(null)

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const user = userProp || storedUser

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/orders')
      const list = response?.data || response?.orders || response || []
      setOrders(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Failed to fetch orders', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const loadPoints = async () => {
    try {
      const response = await apiClient.get('/loyalty/points')
      const data = response?.data || response || {}
      setPointsData({
        currentPoints: data.currentPoints || data.current_points || 0,
        transactions: data.transactions || []
      })
    } catch (error) {
      console.error('Failed to fetch loyalty points', error)
      setPointsData({ currentPoints: 0, transactions: [] })
    }
  }

  useEffect(() => {
    if (!isOpen) return
    loadOrders()
    loadPoints()
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const memberSince = useMemo(
    () => (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'),
    [user]
  )

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] md:max-w-[450px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors duration-300">
            <X size={22} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                activeTab === 'account' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Account Info
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                activeTab === 'loyalty' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Loyalty Points
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                activeTab === 'orders' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Orders
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === 'account' ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Member Since</p>
                <p className="text-sm font-medium text-gray-900">{memberSince}</p>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/favorite"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors duration-300"
                >
                  <Heart size={15} />
                  Wishlist
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (onContactOpen) onContactOpen()
                    onClose()
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors duration-300 text-left bg-transparent border-none cursor-pointer p-0"
                >
                  <MessageCircle size={15} />
                  Contact support
                </button>
              </div>
            </div>
          ) : activeTab === 'loyalty' ? (
            <div className="space-y-5">
              <div className="bg-gray-900 text-white p-5 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={14} />
                  <p className="text-xs uppercase tracking-[2px]">Current Balance</p>
                </div>
                <p className="text-3xl font-bold">{pointsData.currentPoints}</p>
                <p className="text-xs text-white/70 mt-2">Earn +10 points per $100 spent on completed orders</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-gray-700" />
                  <p className="text-sm font-medium text-gray-900">Points History</p>
                </div>
                <div className="space-y-2">
                  {pointsData.transactions.length === 0 ? (
                    <p className="text-sm text-gray-500">No points history yet.</p>
                  ) : (
                    pointsData.transactions.map((tx) => (
                      <div key={tx.transaction_id || `${tx.type}-${tx.created_at}`} className="border border-gray-200 p-3 rounded-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{tx.type || 'transaction'}</p>
                          <p className="text-sm font-medium text-gray-900">{tx.points > 0 ? '+' : ''}{tx.points} pts</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{new Date(tx.created_at || Date.now()).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            loading ? (
              <div className="text-sm text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div key={order.order_id || order.id} className="border border-gray-200 p-4">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Order #{String(order.order_id || order.id)}</p>
                        <p className="text-sm text-gray-600">Date: {new Date(order.order_date || order.created_at || order.createdAt || Date.now()).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Status: {order.status || 'pending'}</p>
                        <p className="text-sm text-gray-600">Total: ${Number(order.total || order.total_price || order.amount || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">Points earned: +{Math.floor(Number(order.total || order.total_price || order.amount || 0) / 100) * 10}</p>
                      </div>
                      {expandedOrder === index ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>

                    {expandedOrder === index && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        {(order.items || order.orders_items || []).length === 0 ? (
                          <p className="text-xs text-gray-500">No order item details available.</p>
                        ) : (
                          (order.items || order.orders_items || []).map((item) => (
                            <div key={item.order_item_id || item.product_id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <img src={item.image || item.products?.image || item.products?.product_variants?.[0]?.images?.[0] || 'https://via.placeholder.com/40'} alt={item.products?.name || item.name || 'Product'} className="w-10 h-10 rounded-sm object-cover bg-gray-100" />
                                <div>
                                  <p className="text-sm text-gray-900">{item.products?.name || item.name || 'Product'}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                                </div>
                              </div>
                              {(order.status === 'delivered' && !item.reviewed) && (
                                <button
                                  onClick={() => setSelectedReviewTarget({
                                    orderId: order.order_id || order.id,
                                    productId: item.product_id || item.products?.product_id,
                                    productName: item.products?.name || item.name,
                                    productImage: item.image || item.products?.image || item.products?.product_variants?.[0]?.images?.[0]
                                  })}
                                  className="bg-gray-900 text-white px-3 py-1.5 text-sm font-medium transition-colors duration-300 hover:bg-gray-700"
                                >
                                  Write Review
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div className="px-6 py-5 border-t border-gray-200">
          <button
            onClick={() => { if (onLogout) onLogout(); onClose() }}
            className="w-full py-3 border border-gray-900 text-gray-900 text-sm font-medium transition-colors duration-300 hover:bg-gray-900 hover:text-white flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      <ReviewForm
        isOpen={Boolean(selectedReviewTarget)}
        orderId={selectedReviewTarget?.orderId}
        productId={selectedReviewTarget?.productId}
        productName={selectedReviewTarget?.productName}
        productImage={selectedReviewTarget?.productImage}
        onClose={() => setSelectedReviewTarget(null)}
        onSuccess={loadOrders}
      />
    </>
  )
}
