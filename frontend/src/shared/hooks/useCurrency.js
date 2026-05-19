import { useCallback, useEffect, useState } from 'react'

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'LBP']
export const DEFAULT_CURRENCY = 'USD'
export const CURRENCY_STORAGE_KEY = 'velore_currency'
const RATES_STORAGE_KEY = 'velore_rates'
const RATES_TIMESTAMP_KEY = 'velore_rates_ts'
const CURRENCY_EVENT = 'velore:currency-change'
const CACHE_DURATION = 1000 * 60 * 60

function isSupported(code) {
  return SUPPORTED_CURRENCIES.includes(code)
}

function readCurrency() {
  try {
    const v = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (isSupported(v)) return v
  } catch { }
  return DEFAULT_CURRENCY
}

function writeCurrency(code) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code)
  } catch { }
}

function readCachedRates() {
  try {
    const ts = localStorage.getItem(RATES_TIMESTAMP_KEY)
    if (!ts) return null
    if (Date.now() - Number(ts) > CACHE_DURATION) return null
    const raw = localStorage.getItem(RATES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { }
  return null
}

function writeCachedRates(rates) {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates))
    localStorage.setItem(RATES_TIMESTAMP_KEY, String(Date.now()))
  } catch { }
}

export function setGlobalCurrency(code) {
  const next = isSupported(code) ? code : DEFAULT_CURRENCY
  writeCurrency(next)
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: next }))
}

export default function useCurrency() {
  const [currency, setCurrencyState] = useState(readCurrency)
  const [rates, setRates] = useState(() => readCachedRates() || { USD: 1 })
  const [ratesLoading, setRatesLoading] = useState(false)

  useEffect(() => {
    const cached = readCachedRates()
    if (cached) { setRates(cached); return }
    setRatesLoading(true)
    fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=EUR,GBP,LBP')
      .then(res => res.json())
.then(data => {
        const newRates = { USD: 1, ...data.rates, LBP: 89500 }
        setRates(newRates)
        writeCachedRates(newRates)
      })
      .catch(() => {
        const fallback = { USD: 1, EUR: 0.92, GBP: 0.79, LBP: 89500 }
        setRates(fallback)
      })
      .finally(() => setRatesLoading(false))
  }, [])

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

  const convertPrice = useCallback((usdPrice) => {
    const rate = rates[currency] ?? 1
    return parseFloat((parseFloat(usdPrice) * rate).toFixed(2))
  }, [currency, rates])

  const formatPrice = useCallback((usdPrice) => {
    const converted = convertPrice(usdPrice)
    const symbols = { USD: '$', EUR: '€', GBP: '£' }
    const symbol = symbols[currency] || currency + ' '
    if (currency === 'LBP') return `${Math.round(converted).toLocaleString()} ل.ل`
    return `${symbol}${converted.toFixed(2)}`
  }, [convertPrice, currency])

  return { currency, setCurrency, supported: SUPPORTED_CURRENCIES, convertPrice, formatPrice, ratesLoading }
}