export default function CRMSkeleton({ rows = 5, compact = false }) {
  return (
    <div
      className={compact ? 'p-4' : 'p-5 sm:p-6'}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(118,205,214,0.22)',
        borderRadius: '6px',
      }}
    >
      <div className="animate-pulse space-y-3">
        {!compact ? (
          <>
            <div
              className="h-4 w-36 rounded"
              style={{ background: 'rgba(118,205,214,0.18)' }}
            />
            <div
              className="h-3 w-56 max-w-full rounded"
              style={{ background: 'rgba(118,205,214,0.12)' }}
            />
          </>
        ) : null}
        <div className={compact ? 'space-y-2' : 'pt-2 space-y-2'}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={compact ? 'h-9 rounded' : 'h-10 rounded'}
              style={{
                background: 'rgba(118,205,214,0.10)',
                opacity: 1 - i * 0.08,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}