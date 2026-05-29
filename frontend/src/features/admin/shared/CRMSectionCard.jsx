export default function CRMSectionCard({ title, subtitle, right, children }) {
  return (
    <section
      className="overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(118,205,214,0.25)',
        borderRadius: '6px',
        boxShadow: '0 1px 6px rgba(118,205,214,0.10), 0 1px 2px rgba(30,29,34,0.04)',
      }}
    >
      {(title || subtitle || right) && (
        <div
          className="px-5 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          style={{
            background: '#EFF8FE',
            borderBottom: '1px solid rgba(118,205,214,0.22)',
          }}
        >
          <div className="min-w-0">
            {title ? (
              <div
                className="text-sm font-semibold tracking-tight"
                style={{ color: '#1E1D22' }}
              >
                {title}
              </div>
            ) : null}
            {subtitle ? (
              <div
                className="text-xs mt-1 leading-relaxed font-light"
                style={{ color: 'rgba(30,29,34,0.52)' }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>
          {right ? <div className="shrink-0 w-full sm:w-auto">{right}</div> : null}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  )
}