import CRMSkeleton from './CRMSkeleton'

export default function CRMLoadingState({ label = 'Loading…' }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#76CDD6' }}
          aria-hidden
        />
        <div
          className="text-sm font-medium"
          style={{ color: 'rgba(30,29,34,0.55)' }}
        >
          {label}
        </div>
      </div>
      <CRMSkeleton rows={6} />
    </div>
  )
}