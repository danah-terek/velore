import CRMSkeleton from './CRMSkeleton'

export default function CRMLoadingState({ label = 'Loading…' }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-[rgba(var(--velore-ring),0.55)] animate-pulse shrink-0" aria-hidden />
        <div className="text-sm font-medium text-[rgba(var(--velore-fg),0.55)]">{label}</div>
      </div>
      <CRMSkeleton rows={6} />
    </div>
  )
}
