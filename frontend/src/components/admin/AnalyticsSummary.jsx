import { useMemo } from 'react'

export default function AnalyticsSummary({ orders = [], users = [], products = [] }) {
  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'delivered').length
    const pending = orders.filter((o) => o.status === 'pending').length
    const activeProducts = products.filter((p) => p.is_active).length
    const activeUsers = users.filter((u) => u.is_active).length
    return { delivered, pending, activeProducts, activeUsers }
  }, [orders, users, products])

  const cards = [
    { label: 'Delivered Orders', value: stats.delivered },
    { label: 'Pending Orders', value: stats.pending },
    { label: 'Active Users', value: stats.activeUsers },
    { label: 'Active Products', value: stats.activeProducts }
  ]

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-sm shadow-sm border border-gray-200 p-5">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{card.label}</p>
          <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
