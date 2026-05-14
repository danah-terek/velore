import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import useCurrency from '../../hooks/useCurrency'

const LABELS = {
  USD: 'United States Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  LBP: 'Lebanese Pound',
}

export default function CurrencyMenu({
  ariaLabel = 'Select currency',
  align = 'right',
  triggerClassName = '',
  menuClassName = '',
}) {
  const { currency, setCurrency, supported } = useCurrency()
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const [open, setOpen] = useState(false)

  const currentLabel = useMemo(() => LABELS[currency] || currency, [currency])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (e) => {
      const root = rootRef.current
      if (!root) return
      if (!root.contains(e.target)) setOpen(false)
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus?.()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const side = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        className={[
          'v-currency-trigger',
          'v-motion',
          'focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--velore-ring),0.16)]',
          triggerClassName,
        ].join(' ')}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : 'false'}
        title={`${currency} — ${currentLabel}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tabular-nums">{currency}</span>
        <ChevronDown size={16} aria-hidden="true" className={open ? 'rotate-180 v-motion' : 'v-motion'} />
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute top-full mt-2 z-[60]',
            side,
            'min-w-[240px]',
            'v-popover v-popover-anim',
            'p-1',
            menuClassName,
          ].join(' ')}
          style={{ maxWidth: 'calc(100vw - 24px)' }}
        >
          {supported.map((code) => {
            const selected = code === currency
            return (
              <button
                key={code}
                type="button"
                role="menuitem"
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left v-menu-item focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(var(--velore-ring),0.16)]"
                aria-current={selected ? 'true' : 'false'}
                aria-pressed={selected ? 'true' : 'false'}
                onClick={() => {
                  setCurrency(code)
                  setOpen(false)
                  buttonRef.current?.focus?.()
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{code}</div>
                  <div className="text-xs text-gray-600 truncate">{LABELS[code] || code}</div>
                </div>
                {selected && <Check size={18} className="text-[rgb(var(--velore-accent))]" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

