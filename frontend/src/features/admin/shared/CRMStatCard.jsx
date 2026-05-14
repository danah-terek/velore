export default function CRMStatCard({ label, value, hint, icon: Icon, accent = 'teal' }) {
  const accentClass =
    accent === 'sky'
      ? 'bg-[rgba(14,165,233,0.08)] text-sky-800 border border-sky-200/60'
      : accent === 'amber'
        ? 'bg-[rgba(245,158,11,0.09)] text-amber-900 border border-amber-200/60'
        : accent === 'rose'
          ? 'bg-[rgba(244,63,94,0.07)] text-rose-900 border border-rose-200/60'
          : 'bg-[rgba(var(--velore-accent),0.1)] text-[rgb(var(--velore-fg))] border border-[rgba(var(--velore-ring),0.22)]'

  return (
    <div className="crm-card-luxury p-5 sm:p-6 crm-hover-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="crm-eyebrow text-[10px] mb-2">{label}</div>
          <div className="text-2xl sm:text-[1.65rem] font-semibold tracking-tight text-[rgb(var(--velore-fg))] tabular-nums">
            {value}
          </div>
          {hint ? <div className="mt-2 text-xs text-[rgba(var(--velore-fg),0.55)] leading-relaxed">{hint}</div> : null}
        </div>
        {Icon ? (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
            <Icon className="w-5 h-5" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  )
}
