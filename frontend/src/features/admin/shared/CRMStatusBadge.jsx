const TONES = {
  success: {
    background: 'linear-gradient(135deg, #22a55b, #1a8a4a)',
    color: '#fff',
  },
  warning: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fff',
  },
  danger: {
    background: 'linear-gradient(135deg, #e05555, #c0392b)',
    color: '#fff',
  },
  info: {
    background: 'linear-gradient(135deg, #76CDD6, #5bb8c2)',
    color: '#fff',
  },
  shipped: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
  },
  neutral: {
    background: 'rgba(118,205,214,0.12)',
    color: 'rgba(30,29,34,0.65)',
    border: '1px solid rgba(118,205,214,0.25)',
  },
}

export default function CRMStatusBadge({ tone = 'neutral', children }) {
  const theme = TONES[tone] ?? TONES.neutral

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase"
      style={{
        borderRadius: '4px',
        letterSpacing: '0.08em',
        whiteSpace: 'nowrap',
        ...theme,
      }}
    >
      {children}
    </span>
  )
}