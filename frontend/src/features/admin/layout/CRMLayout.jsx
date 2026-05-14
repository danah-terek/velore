import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CRMSidebar from './CRMSidebar'
import CRMTopbar from './CRMTopbar'
import CRMRouteFallback from './CRMRouteFallback'

export default function CRMLayout() {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="crm-shell min-h-screen">
      <div className="flex">
        <CRMSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col crm-main">
          <CRMTopbar pathname={location.pathname} onOpenNav={() => setMobileNavOpen(true)} />
          <main className="crm-page px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-1">
            <Suspense fallback={<CRMRouteFallback />}>
              <div key={location.pathname} className="crm-page-enter">
                <Outlet />
              </div>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
