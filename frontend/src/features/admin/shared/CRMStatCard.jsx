const ACCENT = {
  teal: {
    wrap:  { background: 'rgba(118,205,214,0.10)', border: '1px solid rgba(118,205,214,0.28)' },
    icon:  { color: '#76CDD6' },
  },
  sky: {
    wrap:  { background: 'rgba(14,165,233,0.08)',  border: '1px solid rgba(14,165,233,0.22)' },
    icon:  { color: '#0ea5e9' },
  },
  amber: {
    wrap:  { background: 'rgba(245,158,11,0.09)',  border: '1px solid rgba(245,158,11,0.25)' },
    icon:  { color: '#d97706' },
  },
  rose: {
    wrap:  { background: 'rgba(244,63,94,0.07)',   border: '1px solid rgba(244,63,94,0.22)' },
    icon:  { color: '#f43f5e' },
  },
}

const CARD_BASE = {
  background: '#ffffff',
  border: '1px solid rgba(118,205,214,0.25)',
  borderRadius: '6px',
  boxShadow: '0 1px 6px rgba(118,205,214,0.10), 0 1px 2px rgba(30,29,34,0.04)',
  transition: 'box-shadow 0.18s ease, transform 0.18s ease',
}

const CARD_HOVER = {
  boxShadow: '0 4px 16px rgba(118,205,214,0.18), 0 2px 6px rgba(30,29,34,0.06)',
  transform: 'translateY(-2px)',
}

export default function CRMStatCard({ label, value, hint, icon: Icon, accent = 'teal' }) {
  const theme = ACCENT[accent] ?? ACCENT.teal

  return (
    <div
      className="p-5 sm:p-6"
      style={CARD_BASE}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, { ...CARD_BASE, ...CARD_HOVER })}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, CARD_BASE)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Eyebrow label */}
          <div
            className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
            style={{ color: '#76CDD6' }}
          >
            {label}
          </div>

          {/* Value */}
          <div
            className="text-2xl sm:text-[1.65rem] font-semibold tracking-tight tabular-nums"
            style={{ color: '#1E1D22' }}
          >
            {value}
          </div>

          {/* Hint */}
          {hint ? (
            <div
              className="mt-2 text-xs leading-relaxed font-light"
              style={{ color: 'rgba(30,29,34,0.55)' }}
            >
              {hint}
            </div>
          ) : null}
        </div>

        {/* Icon */}
        {Icon ? (
          <div
            className="w-11 h-11 rounded flex items-center justify-center shrink-0"
            style={theme.wrap}
          >
            <Icon className="w-5 h-5" style={theme.icon} aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  )
}