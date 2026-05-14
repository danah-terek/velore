import { Lock } from 'lucide-react'

export default function CRMAccessDenied() {
  return (
    <div className="max-w-3xl">
      <div className="crm-card-luxury p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[rgb(var(--velore-fg))] text-white flex items-center justify-center ring-1 ring-[rgba(var(--velore-border-soft),0.35)] shadow-sm">
            <Lock className="w-5 h-5 opacity-95" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-[rgb(var(--velore-fg))]">Access denied</h2>
            <p className="text-sm text-[rgba(var(--velore-fg),0.62)] mt-1">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

