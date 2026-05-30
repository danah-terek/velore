import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Newspaper,
  Package,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react'

import { useAdminAuth } from '../auth/AdminAuthContext'

// ─── palette ───────────────────────────────────────────────────────────────
// #76CDD6  teal accent
// #1E1D22  dark text
// #EFF8FE  light blue background / hover fill
// #FFFFFF  sidebar surface
// ---------------------------------------------------------------------------

const styles = `
  .crm-sidebar {
    background: #ffffff;
    border-right: 1px solid rgba(118,205,214,0.18);
  }

  .crm-sidebar-brand-tile {
    background: #76CDD6;
    border-radius: 10px;
    color: #ffffff;
    transition: transform 0.2s ease;
  }

  .crm-sidebar-brand-tile:hover {
    transform: scale(1.06);
  }

  .crm-nav-item {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border-radius: 8px;
    color: rgba(30,29,34,0.50);
    font-size: 13px;
    font-weight: 400;
    text-decoration: none;
    transition: background 0.16s ease, color 0.16s ease, transform 0.15s ease;
    position: relative;
    width: 100%;
  }

  .crm-nav-item:hover {
    background: #EFF8FE;
    color: #1E1D22;
    transform: translateX(2px);
  }

  .crm-nav-item:hover .crm-nav-icon {
    color: #76CDD6;
    opacity: 1;
  }

  .crm-nav-item-active {
    background: #EFF8FE;
    color: #1E1D22;
    font-weight: 500;
  }

  .crm-nav-item-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 20%;
    height: 60%;
    width: 3px;
    background: #76CDD6;
    border-radius: 0 3px 3px 0;
  }

  .crm-nav-item-active .crm-nav-icon {
    color: #76CDD6;
    opacity: 1;
  }

  .crm-nav-icon {
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    color: rgba(30,29,34,0.40);
    transition: color 0.16s ease, opacity 0.16s ease;
  }

  .crm-logout-btn {
    transition: background 0.16s ease, color 0.16s ease;
  }

  .crm-logout-btn:hover {
    background: #fff0f0 !important;
    color: #e05555 !important;
  }
`

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
      className={({ isActive }) =>
        ['crm-nav-item group', isActive ? 'crm-nav-item-active' : ''].join(' ')
      }
    >
      <Icon className="crm-nav-icon" aria-hidden />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export default function CRMSidebar({ mobileOpen, onClose }) {
  const { admin, logout } = useAdminAuth()
  const role = normalizeRole(admin?.role)
  const isSuper = role === 'super_admin'

  const primary = [
    { to: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard, show: true },
    { to: '/admin/analytics',  label: 'Analytics',   icon: BarChart3,       show: isSuper },
    { to: '/admin/products',   label: 'Products',    icon: Package,         show: true },
    { to: '/admin/orders',     label: 'Orders',      icon: ShoppingCart,    show: true },
    { to: '/admin/customers',  label: 'Customers',   icon: Users,           show: true },
    { to: '/admin/reviews',    label: 'Reviews',     icon: Star,            show: true },
    { to: '/admin/blogs',      label: 'Blogs',       icon: Newspaper,       show: true },
    { to: '/admin/banner',     label: 'Banner',      icon: Megaphone,       show: true },
    { to: '/admin/discounts',  label: 'Discounts',   icon: Tag,             show: true },
    { to: '/admin/staff',      label: 'Staff',       icon: ShieldCheck,     show: isSuper },
    { to: '/admin/legal',      label: 'Legal Pages', icon: ScrollText,      show: isSuper },
  ].filter((x) => x.show)

  const inner = (
    <div className="crm-sidebar flex flex-col h-full min-h-0">

      {/* Brand */}
      <div
        className="px-5 py-5 shrink-0"
        style={{ borderBottom: '1px solid rgba(118,205,214,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div className="crm-sidebar-brand-tile w-10 h-10 flex items-center justify-center font-semibold tracking-tight">
            V
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="font-semibold tracking-tight truncate text-sm"
              style={{ color: '#1E1D22' }}
            >
              Velore CRM
            </div>
            <div
              className="text-[9px] uppercase tracking-[0.16em] truncate font-semibold mt-0.5"
              style={{ color: '#76CDD6' }}
            >
              Operations
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl transition-colors shrink-0"
            style={{ color: 'rgba(30,29,34,0.40)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1E1D22'; e.currentTarget.style.background = '#EFF8FE' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(30,29,34,0.40)'; e.currentTarget.style.background = 'transparent' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* User */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(118,205,214,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
            style={{
              background: '#EFF8FE',
              border: '1.5px solid #76CDD6',
              color: '#76CDD6',
            }}
          >
            {(admin?.email || 'A')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-medium truncate"
              style={{ color: '#1E1D22' }}
            >
              {admin?.email}
            </div>
            <div
              className="text-[10px] capitalize truncate font-medium mt-0.5"
              style={{ color: '#76CDD6' }}
            >
              {role === 'super_admin' ? 'Super Admin' : 'Staff Admin'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 px-3 py-4 space-y-0.5 overflow-y-auto">
        {primary.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            onNavigate={onClose}
          />
        ))}
      </nav>

      {/* Logout */}
      <div
        className="px-3 py-4 shrink-0"
        style={{ borderTop: '1px solid rgba(118,205,214,0.15)' }}
      >
        <button
          type="button"
          onClick={() => { onClose?.(); logout() }}
          className="crm-nav-item crm-logout-btn"
          style={{ color: 'rgba(30,29,34,0.38)' }}
        >
          <LogOut className="crm-nav-icon" aria-hidden />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* inject styles once */}
      <style>{styles}</style>

      {/* Desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-[17.5rem] lg:sticky lg:top-0 lg:h-screen shrink-0"
        style={{
          borderRight: '1px solid rgba(118,205,214,0.18)',
          boxShadow: '4px 0 24px rgba(118,205,214,0.08)',
        }}
      >
        {inner}
      </aside>

      {/* Mobile overlay */}
      <div
        className={[
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-200',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: 'rgba(30,29,34,0.35)' }}
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