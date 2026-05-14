import { useCallback, useEffect, useState } from 'react'

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'LBP']
export const DEFAULT_CURRENCY = 'USD'
export const CURRENCY_STORAGE_KEY = 'velore_currency'
const CURRENCY_EVENT = 'velore:currency-change'

function isSupported(code) {
  return SUPPORTED_CURRENCIES.includes(code)
}

function readCurrency() {
  try {
    const v = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (isSupported(v)) return v
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY
}

function writeCurrency(code) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code)
  } catch {
    // ignore
  }
}

export function setGlobalCurrency(code) {
  const next = isSupported(code) ? code : DEFAULT_CURRENCY
  writeCurrency(next)
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: next }))
}

export default function useCurrency() {
  const [currency, setCurrencyState] = useState(readCurrency)

  const setCurrency = useCallback((code) => {
    setGlobalCurrency(code)
  }, [])

  useEffect(() => {
    const onCustom = (e) => {
      const next = e?.detail
      if (isSupported(next)) setCurrencyState(next)
    }
    const onStorage = (e) => {
      if (e.key !== CURRENCY_STORAGE_KEY) return
      if (isSupported(e.newValue)) setCurrencyState(e.newValue)
    }

    window.addEventListener(CURRENCY_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(CURRENCY_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return { currency, setCurrency, supported: SUPPORTED_CURRENCIES }
}

