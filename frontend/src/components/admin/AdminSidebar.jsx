import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileText,
  Users,
  Box,
  BarChart3,
  ScrollText,
  UserCog,
  LogOut
} from 'lucide-react'

const superAdminMenu = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'staff', label: 'Manage Staff', icon: UserCog },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'reviews', label: 'Reviews', icon: ClipboardList },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
]

const adminMenu = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products', icon: Box },
  { id: 'reviews', label: 'Reviews', icon: ClipboardList },
  { id: 'blogs', label: 'Blogs', icon: FileText },
  { id: 'customers', label: 'Customers', icon: Users }
]

export function getMenuByRole(role) {
  if (role === 'super_admin') return superAdminMenu
  return adminMenu
}

export default function AdminSidebar({ role, activeTab, onChange, onLogout }) {
  const menu = getMenuByRole(role)

  return (
    <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-sm shadow-sm border border-gray-200 p-4 h-fit md:sticky md:top-6">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 px-2">Admin</p>
      <nav className="space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-300 rounded-sm text-left ${
                active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
            </button>
          )
        })}
      </nav>
      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      )}
    </aside>
  )
}
