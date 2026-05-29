import { Inbox } from 'lucide-react'

export default function CRMEmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div
      className="p-6 sm:p-8"
      style={{
        background: '#EFF8FE',
        border: '1px solid rgba(118,205,214,0.22)',
        borderRadius: '6px',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div
          className="w-11 h-11 flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(118,205,214,0.12)',
            border: '1px solid rgba(118,205,214,0.28)',
            borderRadius: '6px',
          }}
        >
          <Inbox className="w-5 h-5" style={{ color: '#76CDD6' }} aria-hidden />
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
              style={{ color: 'rgba(30,29,34,0.55)' }}
            >
              {message}
            </div>
          ) : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  )
}