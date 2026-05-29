import { useEffect, useState } from 'react'
import apiClient from '../../../shared/services/apiClient'

const PAGES = [
  { slug: 'refund-policy', label: 'Refund Policy' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-of-service', label: 'Terms of Service' },
  { slug: 'shipping-policy', label: 'Shipping Policy' },
]

export default function CRMLegal() {
  const [active, setActive] = useState('refund-policy')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    apiClient.get(`/legal/${active}`)
      .then(res => setContent(res?.data?.content || ''))
      .catch(() => setContent(''))
  }, [active])

  const save = async () => {
    setSaving(true)
    setFeedback('')
    try {
      await apiClient.put(`/legal/${active}`, { content })
      setFeedback('Saved successfully!')
    } catch (err) {
      setFeedback(err?.message || 'Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const isSuccess = feedback.includes('success')

  return (
    <div className="space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <span
          className="text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: '#76CDD6' }}
        >
          Legal
        </span>
        <h1 className="text-4xl font-light mt-2" style={{ color: '#1E1D22' }}>
          Legal Pages Editor
        </h1>
        <p className="text-sm mt-1 font-light" style={{ color: 'rgba(30,29,34,0.50)' }}>
          Edit your store's legal pages. Changes appear live immediately.
        </p>
      </div>

      {/* Editor Card */}
      <div
        className="p-6 sm:p-8 space-y-6"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(118,205,214,0.22)',
          borderRadius: '4px',
        }}
      >

        {/* Feedback */}
        {feedback && (
          <div
            className="px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{
              border: `1px solid ${isSuccess ? '#76CDD6' : '#e05555'}`,
              color: isSuccess ? '#76CDD6' : '#e05555',
              background: isSuccess ? 'rgba(118,205,214,0.06)' : 'rgba(224,85,85,0.05)',
              borderRadius: '4px',
            }}
          >
            {feedback}
          </div>
        )}

        {/* Page Tabs */}
        <div className="flex gap-2 flex-wrap">
          {PAGES.map(p => (
            <button
              key={p.slug}
              onClick={() => setActive(p.slug)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-200"
              style={{
                borderRadius: '4px',
                border: active === p.slug ? 'none' : '1px solid rgba(118,205,214,0.30)',
                background: active === p.slug
                  ? '#76CDD6'
                  : 'transparent',
                color: active === p.slug ? '#ffffff' : 'rgba(30,29,34,0.55)',
              }}
              onMouseEnter={e => {
                if (active !== p.slug) {
                  e.currentTarget.style.background = '#EFF8FE'
                  e.currentTarget.style.color = '#1E1D22'
                }
              }}
              onMouseLeave={e => {
                if (active !== p.slug) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(30,29,34,0.55)'
                }
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your policy content here..."
          className="w-full font-mono text-sm outline-none transition-colors duration-150"
          style={{
            minHeight: '400px',
            padding: '12px 14px',
            border: '1px solid rgba(118,205,214,0.30)',
            borderRadius: '4px',
            background: '#EFF8FE',
            color: '#1E1D22',
            resize: 'vertical',
          }}
          onFocus={e => e.target.style.borderColor = '#76CDD6'}
          onBlur={e => e.target.style.borderColor = 'rgba(118,205,214,0.30)'}
        />

        {/* Save Button */}
        <button
          onClick={save}
          disabled={saving}
          className="text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3 transition-all duration-200 disabled:opacity-50"
          style={{
            background: '#76CDD6',
            color: '#ffffff',
            border: '1px solid #76CDD6',
            borderRadius: '4px',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#5bb8c2' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#76CDD6' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

      </div>
    </div>
  )
}