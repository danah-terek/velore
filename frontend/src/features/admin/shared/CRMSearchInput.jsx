import { Search } from 'lucide-react'

export default function CRMSearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 text-[rgba(var(--velore-fg),0.35)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="crm-input pl-9 pr-3 py-2.5 text-sm"
      />
    </div>
  )
}
