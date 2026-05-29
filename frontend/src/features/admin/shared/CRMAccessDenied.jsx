import { Lock } from 'lucide-react'

export default function CRMAccessDenied() {
  return (
    <div className="max-w-3xl">
      <div
        className="p-6 sm:p-8"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.28)',
          borderRadius: '6px',
          boxShadow: '0 1px 6px rgba(118,205,214,0.10), 0 1px 2px rgba(30,29,34,0.04)',
        }}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded flex items-center justify-center"
            style={{
              background: 'rgba(118,205,214,0.10)',
              border: '1px solid rgba(118,205,214,0.28)',
            }}
          >
            <Lock className="w-5 h-5" style={{ color: '#76CDD6' }} />
          </div>

          {/* Text */}
          <div className="min-w-0 pt-0.5">
            <h2
              className="text-base font-semibold tracking-tight"
              style={{ color: '#1E1D22' }}
            >
              Access denied
            </h2>
            <p
              className="text-sm mt-1 font-light leading-relaxed"
              style={{ color: 'rgba(30,29,34,0.55)' }}
            >
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}