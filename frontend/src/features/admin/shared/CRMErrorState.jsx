import { AlertTriangle } from 'lucide-react'

export default function CRMErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="crm-panel-solid p-6 sm:p-8 border-rose-200/80 bg-rose-50/35">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200/90 text-rose-700 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[rgb(var(--velore-fg))]">{title}</div>
          {message ? <div className="text-sm text-[rgba(var(--velore-fg),0.68)] mt-1.5 leading-relaxed">{message}</div> : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-5 crm-btn-primary"
            >
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
