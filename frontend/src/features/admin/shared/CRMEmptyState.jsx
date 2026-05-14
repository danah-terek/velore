import { Inbox } from 'lucide-react'

export default function CRMEmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="crm-empty-panel p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(var(--velore-accent),0.08)] border border-[rgba(var(--velore-ring),0.18)] text-[rgb(var(--velore-fg))] flex items-center justify-center shrink-0">
          <Inbox className="w-6 h-6 opacity-80" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-[rgb(var(--velore-fg))]">{title}</div>
          {message ? <div className="text-sm text-[rgba(var(--velore-fg),0.58)] mt-1.5 leading-relaxed">{message}</div> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}
