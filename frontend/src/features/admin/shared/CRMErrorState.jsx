import { AlertTriangle } from 'lucide-react'

export default function CRMErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div
      className="p-6 sm:p-8"
      style={{
        background: 'rgba(224,85,85,0.04)',
        border: '1px solid rgba(224,85,85,0.22)',
        borderRadius: '6px',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(224,85,85,0.08)',
            border: '1px solid rgba(224,85,85,0.25)',
            borderRadius: '6px',
          }}
        >
          <AlertTriangle className="w-5 h-5" style={{ color: '#e05555' }} aria-hidden />
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
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 text-xs font-semibold px-4 py-2"
              style={{
                background: '#76CDD6',
                color: '#ffffff',
                border: '1px solid #76CDD6',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5bb8c2')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#76CDD6')}
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}