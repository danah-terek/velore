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
    <>
      <style>{`
        @keyframes scanLine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes borderPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.8; }
        }
      `}</style>

      <div
        style={{
          background: '#111827',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Bottom accent border */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #76CDD6, rgba(255,255,255,0.3), #76CDD6, transparent)',
          animation: 'borderPulse 3s ease-in-out infinite',
        }} />

        {/* Top accent border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #76CDD6, rgba(255,255,255,0.3), #76CDD6, transparent)',
          animation: 'borderPulse 3s ease-in-out infinite',
          animationDelay: '1.5s',
        }} />

        {/* Scan line sweep */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '25%',
          background: 'linear-gradient(90deg, transparent, rgba(118,205,214,0.08), transparent)',
          animation: 'scanLine 4s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            zIndex: 2,
          }}
        >
          <span style={{
            fontFamily: "'Lato', 'Helvetica Neue', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#ffffff',
            textShadow: '0 0 16px rgba(118,205,214,0.4), 0 2px 8px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}>
            {messages[current]?.message}
          </span>
        </div>
      </div>
    </>
  )
}