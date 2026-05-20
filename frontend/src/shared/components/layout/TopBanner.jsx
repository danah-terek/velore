import { useEffect, useState } from 'react'
import apiClient from '../../services/apiClient'

export default function TopBanner() {
  const [messages, setMessages] = useState([])
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    apiClient.get('/banner')
      .then(res => {
        const active = (res?.data || []).filter(m => m.is_active && m.message.trim())
        setMessages(active)
      })
      .catch(() => setMessages([]))
  }, [])

  useEffect(() => {
    if (messages.length <= 1) return
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % messages.length)
        setVisible(true)
      }, 800)
    }, 5000)
    return () => clearInterval(timer)
  }, [messages.length])

  if (!messages.length) return null

  return (
    <div className="bg-gray-900 text-white h-9 flex items-center justify-center">
      <span
        className={`text-xs tracking-wide transition-opacity duration-700 ease-in-out ${
          visible ? 'opacity-90' : 'opacity-0'
        }`}
      >
        {messages[current]?.message}
      </span>
    </div>
  )
}