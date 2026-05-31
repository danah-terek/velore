import { useEffect, useMemo, useState } from 'react'
import { X, LogOut, Award, Clock, ChevronDown, ChevronUp, Heart, MessageCircle, Package, Bell, User, ShoppingBag, Star, Gift, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import apiClient from '../../shared/services/apiClient'
import ReviewForm from '../reviews/ReviewForm'
import { resolveImageUrl } from '../../shared/utils/imageUrl'

const TABS = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'loyalty', label: 'Loyalty', icon: Award },
  { id: 'notifications', label: 'Notifications', icon: Bell },
]

const STATUS_STYLES = {
  delivered:  { bg: '#ecfdf5', color: '#065f46', dot: '#10b981', label: 'Delivered' },
  shipped:    { bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6', label: 'Shipped' },
  processing: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b', label: 'Processing' },
  pending:    { bg: '#f8fafc', color: '#475569', dot: '#94a3b8', label: 'Pending' },
  cancelled:  { bg: '#fef2f2', color: '#991b1b', dot: '#ef4444', label: 'Cancelled' },
}

function StatusPill({ status = 'pending' }) {
  const s = STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  )
}

function Avatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '✨'
  return (
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1E1D22] to-[#76CDD6] flex items-center justify-center shadow-md">
        <span className="text-xl font-light text-white tracking-wide">{initials}</span>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
      <div className="flex items-center justify-between mb-1">
        <Icon size={14} className="text-white/50" />
      </div>
      <p className="text-xl font-light text-white tracking-tight">{value}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  )
}

function OrderItem({ item, order, onReviewClick }) {
  console.log('ITEM:', JSON.stringify(item, null, 2))
  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
{(item.products?.image || item.product_variants?.images?.[0] || item.products?.product_variants?.[0]?.images?.[0] || item.image)
        ? <img src={item.products?.image || item.product_variants?.images?.[0] || item.products?.product_variants?.[0]?.images?.[0] || item.image} alt={item.products?.name || item.name || 'Product'} className="w-12 h-12 rounded-lg object-cover bg-stone-50 flex-shrink-0" loading="lazy" />
        : <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0"><Package size={16} className="text-stone-300" /></div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">
          {item.products?.name || item.name || 'Product'}
        </p>
        <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity || 1}</p>
        {order.status === 'delivered' && !item.reviewed && (
          <button
            onClick={() => onReviewClick(item, order)}
            className="text-xs font-medium text-stone-500 hover:text-stone-700 mt-1 inline-flex items-center gap-1 transition-colors"
          >
            <Star size={10} /> Write a review
          </button>
        )}
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-stone-800">
          ${((item.price || item.products?.price || 0) * (item.quantity || 1)).toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default function ProfileSidebar({ isOpen, onClose, onLogout, onContactOpen, onNotifRead, user: userProp, notifCount = 0 }) {
  const [activeTab, setActiveTab] = useState('account')
  const [orders, setOrders] = useState([])
  const [pointsData, setPointsData] = useState({ currentPoints: 0, transactions: [] })
  const [loading, setLoading] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [selectedReviewTarget, setSelectedReviewTarget] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notifRead, setNotifRead] = useState(false)

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const user = userProp || storedUser

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/orders')
      const list = response?.data || response?.orders || response || []
      setOrders(Array.isArray(list) ? list : [])
    } catch { setOrders([]) } finally { setLoading(false) }
  }

  const loadPoints = async () => {
    try {
      const response = await apiClient.get('/loyalty/points')
      const data = response?.data || response || {}
      setPointsData({
        currentPoints: data.currentPoints || data.current_points || 0,
        transactions: data.transactions || []
      })
    } catch { setPointsData({ currentPoints: 0, transactions: [] }) }
  }

  const loadNotifications = async () => {
    try {
      const response = await apiClient.get('/notifications')
      setNotifications(response?.data || [])
    } catch { setNotifications([]) }
  }

  useEffect(() => {
    if (!isOpen) return
    loadOrders(); loadPoints(); loadNotifications()
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (!isOpen) setNotifRead(false)
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const memberSince = useMemo(
    () => user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A',
    [user]
  )

  const orderStats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.payments?.amount || o.payments?.[0]?.amount || 0), 0)
    return { totalSpent }
  }, [orders])

  const unreadCount = notifCount > 0 && !notifRead ? notifCount : 0

  const handleReviewClick = (item, order) => {
    setSelectedReviewTarget({
      orderId: order.order_id || order.id,
      productId: item.product_id || item.products?.product_id,
      productName: item.products?.name || item.name,
      productImage: item.image || item.products?.image,
    })
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f5f5f4; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 3px; }
      `}</style>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-stone-800 to-stone-900 px-5 pt-8 pb-10 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center"
          >
            <X size={16} className="text-white/60" />
          </button>
          
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} />
            <div>
              <h2 className="text-lg font-light tracking-wide">{user?.name?.split(' ')[0] || 'Guest'}</h2>
              <p className="text-white/40 text-xs mt-0.5">{user?.email || ''}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Member since {memberSince}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            <StatCard icon={ShoppingBag} label="Orders" value={orders.length} />
            <StatCard icon={Gift} label="Points" value={pointsData.currentPoints.toLocaleString()} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 bg-white sticky top-0 z-10 px-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                if (id === 'notifications') { onNotifRead?.(); setNotifRead(true) }
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-all relative ${
                activeTab === id ? 'text-stone-800' : 'text-stone-300 hover:text-stone-500'
              }`}
            >
              <Icon size={14} />
              {label}
              {id === 'notifications' && unreadCount > 0 && (
                <span className="absolute -top-0.5 right-1/4 w-3.5 h-3.5 bg-rose-400 text-white text-[8px] rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {activeTab === id && (
                <div className="absolute bottom-0 left-4 right-4 h-px bg-stone-800 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scroll px-5 py-6 space-y-6">
          
          {/* Account Tab */}
          {activeTab === 'account' && (
            <>
              {/* Quick Actions */}
              <div>
                <h3 className="text-[10px] font-medium text-stone-300 uppercase tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/shop" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all text-xs font-medium text-stone-600">
                    <ShoppingBag size={14} /> Shop
                  </Link>
                  <button onClick={() => { setActiveTab('orders'); }} className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all text-xs font-medium text-stone-600">
                    <Package size={14} /> Track Orders
                  </button>
                  <Link to="/favorite" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all text-xs font-medium text-stone-600">
                    <Heart size={14} /> Wishlist
                  </Link>
                  <button onClick={() => { onContactOpen?.(); onClose(); }} className="flex items-center gap-2 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all text-xs font-medium text-stone-600">
                    <MessageCircle size={14} /> Support
                  </button>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h3 className="text-[10px] font-medium text-stone-300 uppercase tracking-wider mb-3">Account Details</h3>
                <div className="space-y-2 bg-stone-50/50 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">Name</span>
                    <span className="text-xs font-medium text-stone-700">{user?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">Email</span>
                    <span className="text-xs font-medium text-stone-700">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-stone-400">Member since</span>
                    <span className="text-xs font-medium text-stone-700">{memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {orders.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-medium text-stone-300 uppercase tracking-wider mb-3">Recent Orders</h3>
                  <div className="space-y-2">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.order_id || order.id} className="flex items-center justify-between p-3 bg-stone-50/50 rounded-xl">
                        <div>
                          <p className="text-xs font-medium text-stone-700">#{String(order.order_id || order.id).slice(-6)}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {new Date(order.order_date || order.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusPill status={order.status} />
                          <p className="text-xs font-medium text-stone-700 mt-1">
                            ${Number(order.payments?.amount || order.payments?.[0]?.amount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />)}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={40} className="mx-auto text-stone-200 mb-3" />
                <p className="text-stone-400 text-sm font-light">No orders yet</p>
                <Link to="/shop" onClick={onClose} className="inline-block mt-4 px-6 py-2 bg-stone-800 text-white text-xs rounded-full hover:bg-stone-700 transition">
                  Browse collection
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <div key={order.order_id || order.id} className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === index ? null : index)}
                      className="w-full p-4 text-left hover:bg-stone-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-stone-700">
                              #{String(order.order_id || order.id)}
                            </span>
                            <StatusPill status={order.status} />
                          </div>
                          <p className="text-[10px] text-stone-400">
                            {new Date(order.order_date || order.created_at || Date.now()).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-stone-800">
                            ${Number(order.payments?.amount || order.payments?.[0]?.amount || 0).toFixed(2)}
                          </p>
                          {expandedOrder === index ? <ChevronUp size={14} className="text-stone-300 mt-1 mx-auto" /> : <ChevronDown size={14} className="text-stone-300 mt-1 mx-auto" />}
                        </div>
                      </div>
                    </button>

                    {expandedOrder === index && (
                      <div className="border-t border-stone-50 bg-stone-50/30 p-4">
                        <h4 className="text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-2">Items</h4>
                        {(order.items || order.orders_items || []).map((item, idx) => (
                          <OrderItem key={idx} item={item} order={order} onReviewClick={handleReviewClick} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Loyalty Tab */}
          {activeTab === 'loyalty' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Points balance</p>
                    <p className="text-3xl font-light tracking-tight">{pointsData.currentPoints.toLocaleString()}</p>
                    <p className="text-white/30 text-xs mt-1">≈ ${Math.floor(pointsData.currentPoints / 100)} value</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Award size={20} className="text-white/40" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-[11px] text-white/40">Earn 10 points per $100 spent</p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-medium text-stone-300 uppercase tracking-wider mb-3">Points History</h3>
                {pointsData.transactions.length === 0 ? (
                  <div className="text-center py-8 bg-stone-50/50 rounded-xl">
                    <Clock size={28} className="mx-auto text-stone-200 mb-2" />
                    <p className="text-xs text-stone-400 font-light">No points history</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pointsData.transactions.map((tx) => (
                      <div key={tx.transaction_id || `${tx.type}-${tx.created_at}`} className="flex items-center justify-between p-3 bg-stone-50/50 rounded-xl">
                        <div>
                          <p className="text-xs font-medium text-stone-700">
                            {tx.type === 'earn' ? 'Earned' : tx.type === 'redeem' ? 'Redeemed' : 'Transaction'}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {new Date(tx.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`text-xs font-medium ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell size={40} className="mx-auto text-stone-200 mb-3" />
                <p className="text-stone-400 text-sm font-light">All caught up</p>
                <p className="text-xs text-stone-300 mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.notif_id} className="p-3 bg-stone-50/50 rounded-xl hover:bg-stone-50 transition-colors">
                    <p className="text-xs text-stone-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-stone-300 mt-1.5">
                      {new Date(n.sent_at?.replace('Z', '') + 'Z').toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 p-4 bg-white">
          <button
            onClick={() => { onLogout?.(); onClose() }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 rounded-xl transition-all text-xs font-medium text-stone-500 hover:text-stone-700"
          >
            <LogOut size={13} />
            Sign out
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