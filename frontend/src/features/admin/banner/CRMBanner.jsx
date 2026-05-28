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
    <div className="max-w-4xl mx-auto p-0 space-y-8 bg-white min-h-screen">
      
      {/* Header - Editorial Style */}
      <div className="border-b border-black pb-8">
        <h2 className="text-3xl font-light text-black">Top Banner Editor</h2>
        <p className="text-xs text-gray-500 mt-2 tracking-widest uppercase">
          Manage scrolling announcements.
        </p>
      </div>

      {feedback && (
        <div className={`px-4 py-3 text-[10px] font-bold tracking-[0.2em] uppercase border ${feedback.includes('success') ? 'border-black text-black' : 'border-red-600 text-red-600'}`}>
          {feedback}
        </div>
      )}

      {/* Editor Grid */}
      <div className="space-y-4">
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-black hover:border-gray-500 transition-colors">
            <span className="text-[10px] font-bold text-gray-400 w-8 shrink-0">#{i + 1}</span>
            <input
              value={m.message}
              onChange={e => updateSlot(i, 'message', e.target.value)}
              className="flex-1 border-none focus:ring-0 text-sm font-light text-black placeholder:text-gray-300 outline-none"
              placeholder={`Enter message ${i + 1}...`}
            />
            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
              <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={m.is_active} 
                  onChange={e => updateSlot(i, 'is_active', e.target.checked)}
                  className="accent-black w-4 h-4"
                />
                Active
              </label>
              <button
                type="button"
                onClick={() => deleteSlot(i)}
                className="text-gray-400 hover:text-black transition-colors"
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
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
        >
          <Plus size={14} /> Add Slot
        </button>
        <button 
          onClick={save} 
          disabled={saving} 
          className="text-[10px] font-bold uppercase tracking-[0.2em] bg-black text-white px-8 py-3 hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

    </div>
  )
}