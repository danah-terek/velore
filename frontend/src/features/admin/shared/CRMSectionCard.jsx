export default function CRMSectionCard({ title, subtitle, right, children }) {
  return (
    <section className="crm-card-luxury overflow-hidden crm-hover-lift">
      {(title || subtitle || right) && (
        <div className="px-5 sm:px-6 py-4 border-b border-[rgba(var(--velore-border-soft),0.92)] bg-[rgba(var(--velore-pearl),0.55)] flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <div className="text-sm font-semibold text-[rgb(var(--velore-fg))] tracking-tight">{title}</div>
            ) : null}
            {subtitle ? (
              <div className="text-xs text-[rgba(var(--velore-fg),0.55)] mt-1 leading-relaxed">{subtitle}</div>
            ) : null}
          </div>
          {right ? <div className="shrink-0 w-full sm:w-auto">{right}</div> : null}
        </div>
      )}
      <div className="p-5 sm:p-6 bg-[rgba(var(--velore-pearl),0.35)]">{children}</div>
    </section>
  )
}
