export default function CRMStatusBadge({ tone = 'neutral', children }) {
  const cls =
    tone === 'success'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-900 border-amber-200/75'
        : tone === 'danger'
          ? 'bg-rose-50 text-rose-800 border-rose-200/80'
          : 'bg-[rgba(var(--velore-pearl),0.95)] text-[rgba(var(--velore-fg),0.78)] border-[rgba(var(--velore-border-soft),0.95)]'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${cls}`}
    >
      {children}
    </span>
  )
}
