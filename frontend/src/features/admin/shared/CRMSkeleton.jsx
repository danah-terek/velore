export default function CRMSkeleton({ rows = 5, compact = false }) {
  return (
    <div
      className={[
        'crm-card rounded-[1.25rem] border border-[rgba(var(--velore-border-soft),0.92)]',
        compact ? 'p-4' : 'p-5 sm:p-6',
      ].join(' ')}
    >
      <div className="animate-pulse space-y-3">
        {!compact ? (
          <>
            <div className="h-5 w-40 rounded-lg bg-[rgba(var(--velore-border-soft),0.95)]" />
            <div className="h-4 w-64 max-w-full rounded-lg bg-[rgba(var(--velore-border-soft),0.85)]" />
          </>
        ) : null}
        <div className={compact ? 'space-y-2' : 'pt-2 space-y-2'}>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={[
                'rounded-xl bg-[rgba(var(--velore-border-soft),0.9)]',
                compact ? 'h-9' : 'h-10',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

