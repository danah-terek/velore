export default function CRMPageHeader({ title, subtitle, right }) {
  return (
    <div
      className="mb-6 lg:mb-8 pb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}
    >
      <div className="min-w-0">
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase block"
          style={{ color: '#76CDD6' }}
        >
          {title}
        </span>
        <h2
          className="text-2xl sm:text-3xl font-light mt-1.5 tracking-tight"
          style={{ color: '#1E1D22' }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            className="text-sm mt-1 font-light max-w-2xl leading-relaxed"
            style={{ color: 'rgba(30,29,34,0.50)' }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {right ? <div className="shrink-0 flex flex-wrap gap-2">{right}</div> : null}
    </div>
  )
}