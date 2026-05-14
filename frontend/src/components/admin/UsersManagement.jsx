import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get('/admin/users?page=1&limit=100')
        setUsers(response?.data || [])
      } catch (error) {
        console.error('Failed to fetch users', error)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Name', 'Email', 'Loyalty Points', 'Total Orders', 'Join Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelected(user)}
                className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3">{user.name || '-'}</td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.loyalty_points || 0}</td>
                <td className="px-4 py-3">{user.orders_count || 0}</td>
                <td className="px-4 py-3">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Order History for {selected.name || selected.email}</h4>
          {(selected.orders || []).length === 0 ? (
            <p className="text-sm text-gray-500">No orders found for this user.</p>
          ) : (
            <div className="space-y-2">
              {selected.orders.map((order) => (
                <div key={order.order_id || order.id} className="border border-gray-200 p-3 rounded-sm text-sm">
                  #{order.order_id || order.id} · {order.status} · ${Number(order.total || order.amount || 0).toFixed(2)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
