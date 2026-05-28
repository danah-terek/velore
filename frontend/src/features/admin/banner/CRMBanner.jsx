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

  const isSuccess = feedback.includes('success')

  return (
    <div className="max-w-4xl mx-auto p-0 space-y-8 min-h-screen" style={{ background: '#EFF8FE' }}>

      {/* Header */}
      <div className="pb-8" style={{ borderBottom: '1px solid rgba(118,205,214,0.30)' }}>
        <h2 className="text-3xl font-light" style={{ color: '#1E1D22' }}>
          Top Banner Editor
        </h2>
        <p
          className="text-xs mt-2 tracking-widest uppercase"
          style={{ color: '#76CDD6' }}
        >
          Manage scrolling announcements.
        </p>
      </div>

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

      {/* Editor Grid */}
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 transition-colors"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(118,205,214,0.22)',
              borderRadius: '4px',
            }}
          >
            <span
              className="text-[10px] font-bold w-8 shrink-0"
              style={{ color: '#76CDD6' }}
            >
              #{i + 1}
            </span>
            <input
              value={m.message}
              onChange={e => updateSlot(i, 'message', e.target.value)}
              className="flex-1 border-none focus:ring-0 text-sm font-light outline-none bg-transparent"
              style={{ color: '#1E1D22' }}
              placeholder={`Enter message ${i + 1}...`}
            />
            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0"
              style={{ borderColor: 'rgba(118,205,214,0.18)' }}
            >
              <label
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                style={{ color: 'rgba(30,29,34,0.55)' }}
              >
                <input
                  type="checkbox"
                  checked={m.is_active}
                  onChange={e => updateSlot(i, 'is_active', e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: '#76CDD6' }}
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => deleteSlot(i)}
                className="transition-colors"
                style={{ color: 'rgba(30,29,34,0.30)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#e05555'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(30,29,34,0.30)'}
                title="Delete this banner"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={addSlot}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 transition-all duration-200"
          style={{
            border: '1px solid #76CDD6',
            color: '#76CDD6',
            background: 'transparent',
            borderRadius: '4px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#76CDD6'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#76CDD6'
          }}
        >
          <Plus size={14} /> Add Slot
        </button>
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
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

    </div>
  )
}