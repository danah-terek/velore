import { AlertTriangle } from 'lucide-react'

export default function CRMUnavailableState({ title = 'Unavailable', message, details }) {
  return (
    <div
      className="p-6 sm:p-8"
      style={{
        background: 'rgba(245,158,11,0.04)',
        border: '1px solid rgba(245,158,11,0.22)',
        borderRadius: '6px',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(245,158,11,0.10)',
            border: '1px solid rgba(245,158,11,0.28)',
            borderRadius: '6px',
          }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: '#d97706' }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div
            className="text-sm font-semibold"
            style={{ color: '#1E1D22' }}
          >
            {title}
          </div>
          {message ? (
            <div
              className="text-sm mt-1.5 leading-relaxed font-light"
              style={{ color: 'rgba(30,29,34,0.65)' }}
            >
              {message}
            </div>
          ) : null}
          {details ? (
            <pre
              className="mt-4 text-xs overflow-x-auto leading-relaxed"
              style={{
                background: 'rgba(118,205,214,0.06)',
                border: '1px solid rgba(118,205,214,0.22)',
                borderRadius: '4px',
                padding: '12px 14px',
                color: 'rgba(30,29,34,0.72)',
                fontFamily: 'monospace',
              }}
            >
              {details}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  )
}