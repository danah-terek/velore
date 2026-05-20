import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import apiClient from '../../../shared/services/apiClient'

export default function CRMBanner() {
  const [messages, setMessages] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    apiClient.get('/banner/all')
      .then(res => {
        if (res?.data?.length) {
          setMessages(res.data)
        } else {
          setMessages([{ id: null, slot: 1, message: '', is_active: true }])
        }
      })
      .catch(() => setMessages([{ id: null, slot: 1, message: '', is_active: true }]))
  }, [])

  const updateSlot = (index, field, value) => {
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  const addSlot = () => {
    setMessages(prev => [...prev, { id: null, slot: prev.length + 1, message: '', is_active: true }])
  }

  const deleteSlot = async (index) => {
    const msg = messages[index]
    if (msg.id) {
      await apiClient.delete(`/banner/${msg.id}`)
    }
    setMessages(prev => prev.filter((_, i) => i !== index))
  }

  const save = async () => {
    setSaving(true)
    setFeedback('')
    try {
      const cleaned = messages.map((m, i) => ({ ...m, slot: i + 1 }))
      await apiClient.put('/banner', { messages: cleaned })
      const res = await apiClient.get('/banner/all')
      setMessages(res?.data || [])
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
      <div className="crm-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Top Banner Editor</h2>
            <p className="text-sm text-gray-500 mt-1">Manage the scrolling announcement bar. Uncheck Active to hide a message without deleting it.</p>
          </div>
          <button onClick={addSlot} className="crm-btn-secondary flex items-center gap-2">
            <Plus size={16} />
            Add
          </button>
        </div>

        {feedback && (
          <div className={`mb-4 px-4 py-3 text-sm rounded-sm ${feedback.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {feedback}
          </div>
        )}

        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-6">#{i + 1}</span>
              <input
                value={m.message}
                onChange={e => updateSlot(i, 'message', e.target.value)}
                className="crm-input flex-1"
                placeholder={`Message ${i + 1}...`}
              />
              <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={m.is_active} onChange={e => updateSlot(i, 'is_active', e.target.checked)} />
                Active
              </label>
              <button
                type="button"
                onClick={() => deleteSlot(i)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete this banner"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} className="crm-btn-primary mt-6">
          {saving ? 'Saving…' : 'Save Banner'}
        </button>
      </div>
    </div>
  )
}