import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'

function normalizeRole(role) {
  if (!role) return null
  if (role === 'admin') return 'staff_admin'
  return role
}

function NavItem({ to, icon: Icon, label, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={() => onNavigate?.()}
      className={({ isActive }) => ['crm-nav-item group', isActive ? 'crm-nav-item-active' : ''].join(' ')}
    >
      <Icon className="crm-nav-icon opacity-90 group-hover:opacity-100" aria-hidden />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export default function CRMSidebar({ mobileOpen, onClose }) {
  const { admin, logout } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const primary = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, show: isSuper },
    { to: '/admin/products', label: 'Products', icon: Package, show: true },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes, show: true },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, show: true },
    { to: '/admin/customers', label: 'Customers', icon: Users, show: true },
    { to: '/admin/reviews', label: 'Reviews', icon: Star, show: true },
    { to: '/admin/blogs', label: 'Blogs', icon: Newspaper, show: true },
    { to: '/admin/discounts', label: 'Discounts', icon: Tag, show: true },
    { to: '/admin/staff', label: 'Staff', icon: ShieldCheck, show: isSuper },
    { to: '/admin/settings', label: 'Settings', icon: Settings, show: isSuper },
  ].filter((x) => x.show)

  const inner = (
    <div className="crm-sidebar flex flex-col h-full min-h-0">
      <div className="px-5 py-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="crm-sidebar-brand-tile w-11 h-11 flex items-center justify-center text-white font-semibold tracking-tight">
            V
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-semibold tracking-tight truncate">Velore CRM</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-[0.16em] truncate font-medium">
              Operations
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/[0.08] ring-1 ring-white/[0.12] text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {(admin?.email || 'A')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm text-white font-medium truncate">{admin?.email}</div>
            <div className="text-[11px] text-slate-400 capitalize truncate font-medium">
              {role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 px-3 py-4 space-y-1 overflow-y-auto">
        {primary.map((item) => (
          <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onNavigate={onClose} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06] shrink-0">
        <button
          type="button"
          onClick={() => {
            onClose?.()
            logout()
          }}
          className="w-full crm-nav-item text-slate-300 hover:text-white hover:bg-white/[0.07]"
        >
          <LogOut className="crm-nav-icon" aria-hidden />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-[17.5rem] lg:sticky lg:top-0 lg:h-screen shrink-0 border-r border-white/[0.06] shadow-[8px_0_32px_rgba(0,0,0,0.14)]">
        {inner}
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
        <div
          className={[
            'absolute left-0 top-0 h-full w-[min(19rem,88vw)] max-w-full shadow-2xl transform transition-transform duration-200 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          {inner}
        </div>
      </div>
    </>
  )
}
