const DEFAULT_API_BASE = 'http://localhost:3000/api/v1'

export function getBackendOrigin() {
  const base = import.meta.env.VITE_API_URL || DEFAULT_API_BASE
  try {
    return new URL(base).origin
  } catch {
    return 'http://localhost:3000'
  }
}

export function resolveImageUrl(path) {
  if (!path || typeof path !== 'string') return null
  const p = path.trim()
  if (!p) return null

  if (p.startsWith('http://') || p.startsWith('https://')) return p

  if (p.startsWith('/uploads')) {
    return `${getBackendOrigin()}${p.startsWith('/') ? '' : '/'}${p}`
  }

  if (p.startsWith('/assets/') || p.startsWith('/')) return p

  return null
}
