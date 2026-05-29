import { useMemo } from 'react'
import { Menu, Search } from 'lucide-react'
import { useAdminAuth } from '../auth/AdminAuthContext'

function titleFromPath(pathname) {
  const map = {
    '/admin/dashboard': 'Dashboard',
    '/admin/analytics': 'Analytics',
    '/admin/products': 'Products',
    '/admin/products/new': 'Add product',
    '/admin/inventory': 'Inventory',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/reviews': 'Reviews',
    '/admin/blogs': 'Blogs',
    '/admin/staff': 'Staff',
    '/admin/settings': 'Settings',
  }
  if (map[pathname]) return map[pathname]
  if (pathname?.startsWith('/admin/products/') && pathname.endsWith('/edit')) return 'Edit product'
  return 'Velore CRM'
}

export default function CRMTopbar({ pathname, onOpenNav }) {
  const { admin } = useAdminAuth()
  const title = useMemo(() => titleFromPath(pathname), [pathname])
  const roleLabel = admin?.role === 'super_admin' ? 'Super Admin' : 'Staff Admin'

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(118,205,214,0.20)',
        boxShadow: '0 2px 16px rgba(118,205,214,0.08)',
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Left — hamburger + title */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenNav}
            className="lg:hidden shrink-0 p-2.5 transition-colors"
            style={{
              border: '1px solid rgba(118,205,214,0.30)',
              borderRadius: '4px',
              background: '#EFF8FE',
              color: '#1E1D22',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(118,205,214,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = '#EFF8FE'}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-bold tracking-[0.3em] uppercase mb-0.5"
              style={{ color: '#76CDD6' }}
            >
              Velore CRM
            </p>
            <h1
              className="text-lg sm:text-xl font-semibold tracking-tight truncate"
              style={{ color: '#1E1D22' }}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Right — search, date, badges */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">

          {/* Search
          <div className="relative w-full sm:w-56 md:w-64 lg:w-72">
            <Search
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(118,205,214,0.60)' }}
              aria-hidden
            />
            {/* <input
              readOnly
              
              placeholder="Search CRM…"
              title="Global CRM search is not connected yet"
              aria-label="Search CRM (coming soon)"
              className="w-full"
              style={{
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                fontSize: '13px',
                border: '1px solid rgba(118,205,214,0.25)',
                borderRadius: '4px',
                background: '#EFF8FE',
                color: 'rgba(30,29,34,0.40)',
                cursor: 'not-allowed',
                outline: 'none',
              }}
          //   /> */}

          {/* Date */}
          <div
            className="hidden md:flex items-center gap-2 text-xs tabular-nums whitespace-nowrap px-1"
            style={{ color: 'rgba(30,29,34,0.40)' }}
          >
            {dateLabel}
          </div>

          {/* Role + email badges */}
          <div className="flex items-center gap-2 justify-end flex-wrap">
            <span
              className="inline-flex items-center px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] uppercase"
              style={{
                background: '#76CDD6',
                color: '#ffffff',
                borderRadius: '4px',
              }}
            >
              {roleLabel}
            </span>
            <span
              className="hidden sm:inline-flex max-w-[200px] lg:max-w-[260px] truncate items-center px-3 py-1.5 text-[11px] font-medium"
              style={{
                background: '#EFF8FE',
                color: 'rgba(30,29,34,0.60)',
                border: '1px solid rgba(118,205,214,0.25)',
                borderRadius: '4px',
              }}
            >
              {admin?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}