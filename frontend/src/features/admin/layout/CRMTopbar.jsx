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
    <header className="crm-topbar sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenNav}
            className="lg:hidden shrink-0 p-2.5 rounded-xl border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgba(var(--velore-pearl),0.9)] text-[rgb(var(--velore-fg))] hover:bg-[rgba(var(--velore-accent),0.06)] transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="crm-eyebrow text-[10px] mb-0.5">Velore CRM</p>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[rgb(var(--velore-fg))] truncate">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56 md:w-64 lg:w-72">
            <Search className="w-4 h-4 text-[rgba(var(--velore-fg),0.38)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
            <input
              readOnly
              disabled
              placeholder="Search CRM…"
              title="Global CRM search is not connected yet"
              aria-label="Search CRM (coming soon)"
              className="crm-input pl-9 text-[rgba(var(--velore-fg),0.45)] cursor-not-allowed bg-[rgba(var(--velore-pearl),0.65)]"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-[rgba(var(--velore-fg),0.5)] tabular-nums whitespace-nowrap px-1">
            {dateLabel}
          </div>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase bg-[rgba(var(--velore-accent),0.12)] text-[rgb(var(--velore-fg))] border border-[rgba(var(--velore-ring),0.22)]">
              {roleLabel}
            </span>
            <span className="hidden sm:inline-flex max-w-[200px] lg:max-w-[260px] truncate items-center rounded-full px-3 py-1.5 text-[11px] font-medium bg-[rgba(var(--velore-pearl),0.95)] text-[rgba(var(--velore-fg),0.78)] border border-[rgba(var(--velore-border-soft),0.95)]">
              {admin?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
