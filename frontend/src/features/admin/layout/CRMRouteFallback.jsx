import CRMSkeleton from '../shared/CRMSkeleton'

export default function CRMRouteFallback() {
  return (
    <div
      className="p-6 sm:p-8"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(118,205,214,0.22)',
        borderRadius: '4px',
      }}
    >
      <div className="flex flex-col gap-1 mb-6">
        <p
          className="text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: '#76CDD6' }}
        >
          Velore CRM
        </p>
        <p
          className="text-sm font-semibold tracking-tight"
          style={{ color: '#1E1D22' }}
        >
          Loading workspace…
        </p>
      </div>
      <CRMSkeleton rows={5} compact />
    </div>
  )
}