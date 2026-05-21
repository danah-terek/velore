import { useState, useEffect } from 'react'
import apiClient from '../shared/services/apiClient'

export default function PolicyPlaceholder({ title }) {
  const [content, setContent] = useState('')
  const slug = title.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    apiClient.get(`/legal/${slug}`)
      .then(res => setContent(res?.data?.content || 'This page is being updated.'))
      .catch(() => setContent('This page is being updated.'))
  }, [slug])

  return (
    <div className="px-6 md:px-16 py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">{title}</h1>
      <div className="prose prose-gray max-w-none text-sm leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  )
}