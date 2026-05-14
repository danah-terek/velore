import { AlertTriangle } from 'lucide-react'

export default function CRMUnavailableState({ title = 'Unavailable', message, details }) {
  return (
    <div className="crm-panel-solid p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--velore-fg))] text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[rgb(var(--velore-fg))]">{title}</div>
          {message ? <div className="text-sm text-[rgba(var(--velore-fg),0.62)] mt-1.5 leading-relaxed">{message}</div> : null}
          {details ? (
            <pre className="mt-5 text-xs bg-[rgba(var(--velore-pearl),0.95)] border border-[rgba(var(--velore-border-soft),0.95)] rounded-xl p-4 overflow-x-auto text-[rgba(var(--velore-fg),0.78)] leading-relaxed">
              {details}
            </pre>
          ) : null}
        </div>
      </div>
    </div>
  )
}
