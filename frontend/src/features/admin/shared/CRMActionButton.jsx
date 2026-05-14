export default function CRMActionButton({ tone = 'primary', disabled, type = 'button', children, ...props }) {
  const cls =
    tone === 'secondary'
      ? 'crm-btn-secondary'
      : tone === 'danger'
        ? 'crm-btn-danger'
        : 'crm-btn-primary'

  return (
    <button
      type={type}
      disabled={disabled}
      className={[cls, disabled ? 'opacity-45 cursor-not-allowed' : ''].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
