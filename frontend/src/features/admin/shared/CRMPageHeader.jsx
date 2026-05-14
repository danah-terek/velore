export default function CRMPageHeader({ title, subtitle, right }) {
  return (
    <div className="mb-6 lg:mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[rgb(var(--velore-fg))]">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-[rgba(var(--velore-fg),0.62)] mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0 flex flex-wrap gap-2">{right}</div> : null}
    </div>
  )
}
