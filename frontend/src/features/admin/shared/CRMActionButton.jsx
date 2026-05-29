const STYLES = {
  primary: {
    base: {
      background: '#76CDD6',
      color: '#ffffff',
      border: '1px solid #76CDD6',
    },
    hover: {
      background: '#5bb8c2',
      color: '#ffffff',
      border: '1px solid #5bb8c2',
    },
  },
  secondary: {
    base: {
      background: 'transparent',
      color: '#76CDD6',
      border: '1.5px solid #76CDD6',
    },
    hover: {
      background: '#76CDD6',
      color: '#ffffff',
      border: '1.5px solid #76CDD6',
    },
  },
  danger: {
    base: {
      background: 'transparent',
      color: '#e05555',
      border: '1.5px solid rgba(224,85,85,0.45)',
    },
    hover: {
      background: 'rgba(224,85,85,0.08)',
      color: '#c0392b',
      border: '1.5px solid #e05555',
    },
  },
}

const SHARED = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '5px 14px',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.02em',
  borderRadius: '4px',
  lineHeight: '1.5',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
}

export default function CRMActionButton({ tone = 'primary', disabled, type = 'button', children, ...props }) {
  const theme = STYLES[tone] ?? STYLES.primary

  const handleMouseEnter = (e) => {
    if (disabled) return
    Object.assign(e.currentTarget.style, theme.hover)
  }

  const handleMouseLeave = (e) => {
    if (disabled) return
    Object.assign(e.currentTarget.style, theme.base)
  }

  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...SHARED,
        ...theme.base,
        ...(disabled ? { opacity: 0.45, cursor: 'not-allowed' } : { cursor: 'pointer' }),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  )
}