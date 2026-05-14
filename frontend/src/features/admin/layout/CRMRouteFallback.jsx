import CRMSkeleton from '../shared/CRMSkeleton'

export default function CRMRouteFallback() {
  return (
    <div className="crm-route-fallback rounded-[1.35rem] border border-[rgba(var(--velore-border-soft),0.95)] bg-[rgb(var(--velore-pearl))] p-6 sm:p-8 shadow-[0_18px_52px_rgba(17,24,39,0.06)]">
      <div className="flex flex-col gap-1 mb-6">
        <p className="crm-eyebrow">Velore CRM</p>
        <p className="text-sm font-semibold text-[rgb(var(--velore-fg))] tracking-tight">Loading workspace…</p>
      </div>
      <CRMSkeleton rows={5} compact />
    </div>
  )
}
