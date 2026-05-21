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

  return (
    <div className="space-y-6">
      <div className="crm-card p-6">
        <h2 className="text-2xl font-semibold mb-1">Legal Pages Editor</h2>
        <p className="text-sm text-gray-500 mb-6">Edit your store's legal pages. Changes appear live immediately.</p>

        {feedback && (
          <div className={`mb-4 px-4 py-3 text-sm rounded-sm ${feedback.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {feedback}
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {PAGES.map(p => (
            <button
              key={p.slug}
              onClick={() => setActive(p.slug)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                active === p.slug ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="crm-input min-h-[400px] font-mono text-sm"
          placeholder="Write your policy content here..."
        />

        <button onClick={save} disabled={saving} className="crm-btn-primary mt-4">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}