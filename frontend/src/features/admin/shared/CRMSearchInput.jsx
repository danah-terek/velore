import { Search } from 'lucide-react'

export default function CRMSearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search
        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'rgba(30,29,34,0.35)' }}
        aria-hidden
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2.5 text-sm"
        style={{
          border: '1px solid rgba(118,205,214,0.30)',
          borderRadius: '4px',
          background: '#ffffff',
          color: '#1E1D22',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#76CDD6')}
        onBlur={(e) => (e.target.style.borderColor = 'rgba(118,205,214,0.30)')}
      />
    </div>
  )
}