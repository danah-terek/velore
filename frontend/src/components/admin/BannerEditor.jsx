import { useEffect, useState } from 'react'
import apiClient from '../../shared/services/apiClient'

const EMPTY = [
  { slot: 1, message: '', is_active: true },
  { slot: 2, message: '', is_active: true },
  { slot: 3, message: '', is_active: true },
  { slot: 4, message: '', is_active: true },
]

export default function BannerEditor() {
  const [messages, setMessages] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    apiClient.get('/banner')
      .then(res => {
        if (res?.data?.length) {
          const merged = EMPTY.map(e => {
            const existing = res.data.find(d => d.slot === e.slot)
            return existing || e
          })
          setMessages(merged)
        }
      })
      .catch(() => {})
  }, [])

  const updateSlot = (slot, field, value) => {
    setMessages(prev => prev.map(m => m.slot === slot ? { ...m, [field]: value } : m))
  }

  const save = async () => {
    setSaving(true)
    setFeedback('')
    try {
      await apiClient.put('/banner', { messages })
      setFeedback('Banner updated successfully!')
    } catch (err) {
      setFeedback(err?.message || 'Failed to save')
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Top Banner Editor</h2>
        <p className="text-sm text-gray-500 mb-6">Edit the scrolling announcement bar (up to 4 messages). Leave empty to hide a slot.</p>

        {feedback && (
          <div className={`mb-4 px-4 py-3 text-sm rounded-sm ${feedback.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {feedback}
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={m.slot} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
              <input
                value={m.message}
                onChange={e => updateSlot(m.slot, 'message', e.target.value)}
                placeholder={`Message ${i + 1}...`}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
              />
              <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.is_active}
                  onChange={e => updateSlot(m.slot, 'is_active', e.target.checked)}
                />
                Active
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="mt-6 bg-gray-900 text-white hover:bg-gray-700 px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Banner'}
        </button>
      </div>
    </div>
  )
}